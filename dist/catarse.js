"use strict";

window.c = (function () {
    return {
        models: {},
        root: {},
        vms: {},
        admin: {},
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
        selfOrEmpty = function selfOrEmpty(obj) {
        var emptyState = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

        return obj ? obj : emptyState;
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
            m.redraw();
        } : m.redraw;

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
        projectStateTextClass = function projectStateTextClass(state) {
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

    setMomentifyLocale();
    closeFlash();
    closeModal();

    return {
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
        selfOrEmpty: selfOrEmpty,
        scrollTo: scrollTo,
        projectStateTextClass: projectStateTextClass
    };
})(window.m, window.moment, window.I18n);
'use strict';

window.c.models = (function (m) {
    var contributionDetail = m.postgrest.model('contribution_details'),
        projectDetail = m.postgrest.model('project_details'),
        userDetail = m.postgrest.model('user_details'),
        balance = m.postgrest.model('balances'),
        balanceTransaction = m.postgrest.model('balance_transactions'),
        balanceTransfer = m.postgrest.model('balance_transfers'),
        user = m.postgrest.model('users'),
        bankAccount = m.postgrest.model('bank_accounts'),
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
        projectAccount = m.postgrest.model('project_accounts'),
        projectAccountError = m.postgrest.model('project_account_errors'),
        projectTransfer = m.postgrest.model('project_transfers'),
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
        balance: balance,
        balanceTransaction: balanceTransaction,
        balanceTransfer: balanceTransfer,
        bankAccount: bankAccount,
        user: user,
        rewardDetail: rewardDetail,
        contributions: contributions,
        teamTotal: teamTotal,
        teamMember: teamMember,
        project: project,
        projectAccount: projectAccount,
        projectAccountError: projectAccountError,
        projectTransfer: projectTransfer,
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

window.c.root.Flex = (function (m, c, h, models) {
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
                state: 'eq',
                recommended: 'eq'
            }),
                statsLoader = m.postgrest.loaderWithToken(models.statistic.getRowOptions());

            flexVM.mode('flex').state('online').recommended(true);

            var projectsLoader = m.postgrest.loader(models.project.getPageOptions(flexVM.parameters()));

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

window.c.root.Insights = (function (m, c, h, models, _, I18n) {
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
                loader = m.postgrest.loaderWithToken;

            filtersVM.project_id(args.root.getAttribute('data-id'));

            var l = loader(models.projectDetail.getRowOptions(filtersVM.parameters()));
            l.load().then(projectDetails);

            var lContributionsPerDay = loader(models.projectContributionsPerDay.getRowOptions(filtersVM.parameters()));
            lContributionsPerDay.load().then(contributionsPerDay);

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

            var lContributionsPerLocation = loader(models.projectContributionsPerLocation.getRowOptions(filtersVM.parameters()));
            lContributionsPerLocation.load().then(buildPerLocationTable);

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

            var lContributionsPerRef = loader(models.projectContributionsPerRef.getRowOptions(filtersVM.parameters()));
            lContributionsPerRef.load().then(buildPerRefTable);

            var explanationModeComponent = function explanationModeComponent(projectMode) {
                var modes = {
                    'aon': c.AonAdminProjectDetailsExplanation,
                    'flex': c.FlexAdminProjectDetailsExplanation
                };

                return modes[projectMode];
            };

            return {
                l: l,
                lContributionsPerRef: lContributionsPerRef,
                lContributionsPerLocation: lContributionsPerLocation,
                lContributionsPerDay: lContributionsPerDay,
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
                project: m.prop(project)
            }) : '', m('.w-container', [project.state == 'successful' ? m.component(c.ProjectSuccessfulOnboard, { project: project }) : m('.w-row.u-marginbottom-40', [m('.w-col.w-col-2'), m('.w-col.w-col-8.dashboard-header.u-text-center', [m('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10', I18n.t('campaign_title', I18nScope())), m('p.' + project.state + '-project-text.fontsize-small.lineheight-loose', [project.mode === 'flex' && _.isNull(project.expires_at) && project.state !== 'draft' ? m('span', [I18n.t('finish_explanation', I18nScope()), m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/206507863-Catarse-flex-Principais-perguntas-e-respostas-"][target="_blank"]', I18n.t('know_more', I18nScope()))]) : m.trust(I18n.t('campaign.' + project.mode + '.' + project.state, I18nScope({ username: project.user.name, expires_at: h.momentify(project.zone_expires_at), sent_to_analysis_at: h.momentify(project.sent_to_analysis_at) })))])]), m('.w-col.w-col-2')])]), project.is_published ? [m('.divider'), m('.w-section.section-one-column.section.bg-gray.before-footer', [m('.w-container', [m.component(c.ProjectDataStats, { project: project }), m('.w-row', [m('.w-col.w-col-12.u-text-center', {
                style: {
                    'min-height': '300px'
                }
            }, [!ctrl.lContributionsPerDay() ? m.component(c.ProjectDataChart, {
                collection: ctrl.contributionsPerDay,
                label: I18n.t('amount_per_day_label', I18nScope()),
                dataKey: 'total_amount',
                xAxis: function xAxis(item) {
                    return h.momentify(item.paid_at);
                }
            }) : h.loader()])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', {
                style: {
                    'min-height': '300px'
                }
            }, [!ctrl.lContributionsPerDay() ? m.component(c.ProjectDataChart, {
                collection: ctrl.contributionsPerDay,
                label: I18n.t('contributions_per_day_label', I18nScope()),
                dataKey: 'total',
                xAxis: function xAxis(item) {
                    return h.momentify(item.paid_at);
                }
            }) : h.loader()])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m('.project-contributions-per-ref', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', [I18n.t('ref_origin_title', I18nScope()), h.newFeatureBadge(), tooltip('span.fontsize-smallest.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary')]), !ctrl.lContributionsPerRef() ? m.component(c.ProjectDataTable, {
                table: ctrl.contributionsPerRefTable,
                defaultSortIndex: -2
            }) : h.loader()])])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m('.project-contributions-per-ref', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', I18n.t('location_origin_title', I18nScope())), !ctrl.lContributionsPerLocation() ? m.component(c.ProjectDataTable, {
                table: ctrl.contributionsPerLocationTable,
                defaultSortIndex: -2
            }) : h.loader()])])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m.component(c.ProjectReminderCount, {
                resource: project
            })])])])])] : ''] : h.loader());
        }
    };
})(window.m, window.c, window.c.h, window.c.models, window._, window.I18n);
'use strict';

window.c.root.Jobs = (function (m, I18n, h) {
    var I18nScope = _.partial(h.i18nScope, 'pages.jobs');

    return {
        view: function view(ctrl, args) {

            return [m('.w-section.hero-jobs.hero-medium', [m('.w-containe.u-text-center', [m('img.icon-hero[src="/assets/logo-white.png"]'), m('.u-text-center.u-marginbottom-20.fontsize-largest', I18n.t('title', I18nScope()))])]), m('.w-section.section', [m('.w-container.u-margintop-40', [m('.w-row', [m('.w-col.w-col-8.w-col-push-2.u-text-center', [m('.fontsize-large.u-marginbottom-30', I18n.t('info', I18nScope())), m('a[href="/projects/new"].w-button.btn.btn-large.btn-inline', I18n.t('cta', I18nScope()))])])])])];
        }
    };
})(window.m, window.I18n, window.c.h);
'use strict';

window.c.root.LiveStatistics = (function (m, models, h, _, JSON) {
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
/**
 * window.c.root.ProjectsDashboard component
 * A root component to manage projects
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsDashboard">
 */
'use strict';

window.c.root.ProjectsDashboard = (function (m, c, h, _, vms) {
    return {

        controller: function controller(args) {
            return vms.project(args.project_id, args.project_user_id);
        },

        view: function view(ctrl) {
            var project = ctrl.projectDetails;
            return project().is_owner_or_admin ? m.component(c.ProjectDashboardMenu, { project: project }) : '';
        }
    };
})(window.m, window.c, window.c.h, window._, window.c.vms);
/**
 * window.c.root.ProjectsExplore component
 * A root component to show projects according to user defined filters
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsExplore">
 */
'use strict';

window.c.root.ProjectsExplore = (function (m, c, h, _, moment) {
    return {

        controller: function controller() {
            var filters = m.postgrest.filtersVM,
                follow = c.models.categoryFollower,
                filtersMap = c.vms.projectFilters(),
                categoryCollection = m.prop([]),

            // Fake projects object to be able to render page while loadding (in case of search)
            projects = m.prop({ collection: m.prop([]), isLoading: function isLoading() {
                    return true;
                }, isLastPage: function isLastPage() {
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
                    var byCategory = filters({
                        state_order: 'gte',
                        category_id: 'eq'
                    }).state_order('published');

                    return route && route[1] && filtersMap[route[1]] || cat && { title: cat.name, filter: byCategory.category_id(cat.id) };
                },
                    filter = filterFromRoute() || filtersMap.recommended,
                    search = h.paramByName('pg_search'),
                    searchProjects = function searchProjects() {
                    var l = m.postgrest.loaderWithToken(c.models.projectSearch.postOptions({ query: search })),
                        page = { // We build an object with the same interface as paginationVM
                        collection: m.prop([]),
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
                    var pages = m.postgrest.paginationVM(c.models.project);
                    pages.firstPage(filter.filter.order({
                        open_for_contributions: 'desc',
                        state_order: 'asc',
                        state: 'desc',
                        recommended: 'desc',
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
                route ? toggleCategories(false) : toggleCategories(true);
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
            return [m('.w-section.hero-search', [m('.w-container.u-marginbottom-10', [m('.u-text-center.u-marginbottom-40', [m('a#explore-open.link-hidden-white.fontweight-light.fontsize-larger[href="javascript:void(0);"]', { onclick: function onclick() {
                    return ctrl.toggleCategories.toggle();
                } }, ['Explore projetos incríveis ', m('span#explore-btn.fa.fa-angle-down' + (ctrl.toggleCategories() ? '.opened' : ''), '')])]), m('#categories.category-slider' + (ctrl.toggleCategories() ? '.opened' : ''), [m('.w-row', [_.map(ctrl.categories(), function (category) {
                return m.component(c.CategoryButton, { category: category });
            })]), m('.w-row.u-marginbottom-30', [_.map(ctrl.filtersMap, function (filter, href) {
                return m.component(c.FilterButton, { title: filter.title, href: href });
            })])])])]), m('.w-section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-6.w-col-small-7.w-col-tiny-7', [m('.fontsize-larger', ctrl.title())])])])]),

            // _.isObject(ctrl.category()) ? m('.w-col.w-col-6.w-col-small-5.w-col-tiny-5', [
            //     m('.w-row', [
            //         m('.w-col.w-col-8.w-hidden-small.w-hidden-tiny.w-clearfix', [
            //             m('.following.fontsize-small.fontcolor-secondary.u-right', `${ctrl.category().followers} seguidores`)
            //         ]),
            //         m('.w-col.w-col-4.w-col-small-12.w-col-tiny-12', [
            //             ctrl.category().following ?
            //                 m('a.btn.btn-medium.btn-terciary.unfollow-btn[href=\'#\']', {onclick: ctrl.unFollowCategory(ctrl.category().id)}, 'Deixar de seguir') :
            //                 m('a.btn.btn-medium.follow-btn[href=\'#\']', {onclick: ctrl.followCategory(ctrl.category().id)}, 'Seguir')
            //         ])
            //     ])
            // ]) : ''

            m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-row', _.map(ctrl.projects().collection(), function (project) {
                return m.component(c.ProjectCard, { project: project, ref: 'ctrse_explore' });
            })), ctrl.projects().isLoading() ? h.loader() : ''])])]), m('.w-section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-5'), m('.w-col.w-col-2', [ctrl.projects().isLastPage() || ctrl.projects().isLoading() || _.isEmpty(ctrl.projects().collection()) ? '' : m('a.btn.btn-medium.btn-terciary[href=\'#loadMore\']', { onclick: function onclick() {
                    ctrl.projects().nextPage();return false;
                } }, 'Carregar mais')]), m('.w-col.w-col-5')])])])];
        }
    };
})(window.m, window.c, window.c.h, window._, window.moment);
'use strict';

window.c.root.ProjectsHome = (function (m, c, moment, h, _) {
    var I18nScope = _.partial(h.i18nScope, 'projects.home');

    return {
        controller: function controller() {
            var sample6 = _.partial(_.sample, _, 6),
                loader = m.postgrest.loader,
                project = c.models.project,
                filters = c.vms.projectFilters();

            var collections = _.map(['recommended'], function (name) {
                var f = filters[name],
                    cLoader = loader(project.getPageOptions(f.filter.parameters())),
                    collection = m.prop([]);

                cLoader.load().then(_.compose(collection, sample6));

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
            return [m('.w-section.hero-full.hero-2016', [m('.w-container.u-text-center', [m('.fontsize-megajumbo.u-marginbottom-60.fontweight-semibold.fontcolor-negative', I18n.t('title', I18nScope())), m('a[href="http://2015.catarse.me/"].btn.btn-large.u-marginbottom-10.btn-inline', I18n.t('cta', I18nScope()))])]), _.map(ctrl.collections, function (collection) {
                return m.component(c.ProjectRow, {
                    collection: collection,
                    ref: 'home_' + collection.hash
                });
            })];
        }
    };
})(window.m, window.c, window.moment, window.c.h, window._);
'use strict';

window.c.root.ProjectsShow = (function (m, c, _, h, vms) {
    return {
        controller: function controller(args) {
            return vms.project(args.project_id, args.project_user_id);
        },

        view: function view(ctrl) {
            var project = ctrl.projectDetails;

            return m('.project-show', [m.component(c.ProjectHeader, {
                project: project,
                userDetails: ctrl.userDetails
            }), m.component(c.ProjectTabs, {
                project: project,
                rewardDetails: ctrl.rewardDetails
            }), m.component(c.ProjectMain, {
                project: project,
                rewardDetails: ctrl.rewardDetails
            }), project() && project().is_owner_or_admin ? m.component(c.ProjectDashboardMenu, {
                project: project
            }) : '']);
        }
    };
})(window.m, window.c, window._, window.c.h, window.c.vms);
'use strict';

window.c.root.Start = (function (m, c, h, models, I18n) {
    var I18nScope = _.partial(h.i18nScope, 'pages.start');

    return {
        controller: function controller() {
            var stats = m.prop([]),
                categories = m.prop([]),
                selectedPane = m.prop(0),
                selectedCategory = m.prop([]),
                featuredProjects = m.prop([]),
                selectedCategoryIdx = m.prop(-1),
                startvm = c.vms.start(I18n),
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
                loader = m.postgrest.loader,
                statsLoader = loader(models.statistic.getRowOptions()),
                loadCategories = function loadCategories() {
                return c.models.category.getPage(filters({}).order({
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

            return [m('.w-section.hero-full.hero-start', [m('.w-container.u-text-center', [m('.fontsize-megajumbo.fontweight-semibold.u-marginbottom-40', I18n.t('slogan', I18nScope())), m('.w-row.u-marginbottom-40', [m('.w-col.w-col-4.w-col-push-4', [m('a.btn.btn-large.u-marginbottom-10[href="#start-form"]', {
                config: h.scrollTo()
            }, I18n.t('submit', I18nScope()))])]), m('.w-row', _.isEmpty(stats) ? '' : [m('.w-col.w-col-4', [m('.fontsize-largest.lineheight-loose', h.formatNumber(stats.total_contributors, 0, 3)), m('p.fontsize-small.start-stats', I18n.t('header.people', I18nScope()))]), m('.w-col.w-col-4', [m('.fontsize-largest.lineheight-loose', stats.total_contributed.toString().slice(0, 2) + ' milhões'), m('p.fontsize-small.start-stats', I18n.t('header.money', I18nScope()))]), m('.w-col.w-col-4', [m('.fontsize-largest.lineheight-loose', h.formatNumber(stats.total_projects_success, 0, 3)), m('p.fontsize-small.start-stats', I18n.t('header.success', I18nScope()))])])])]), m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-10.w-col-push-1.u-text-center', [m('.fontsize-larger.u-marginbottom-10.fontweight-semibold', I18n.t('page-title', I18nScope())), m('.fontsize-small', I18n.t('page-subtitle', I18nScope()))])]), m('.w-clearfix.how-row', [m('.w-hidden-small.w-hidden-tiny.how-col-01', [m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.1', I18nScope())), m('.fontsize-base', I18n.t('banner.2', I18nScope()))]), m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.3', I18nScope())), m('.fontsize-base', I18n.t('banner.4', I18nScope()))])]), m('.how-col-02'), m('.how-col-03', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.5', I18nScope())), m('.fontsize-base', I18n.t('banner.6', I18nScope())), m('.fontweight-semibold.fontsize-large.u-margintop-30', I18n.t('banner.7', I18nScope())), m('.fontsize-base', I18n.t('banner.8', I18nScope()))]), m('.w-hidden-main.w-hidden-medium.how-col-01', [m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.1', I18nScope())), m('.fontsize-base', I18n.t('banner.2', I18nScope()))]), m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.3', I18nScope())), m('.fontsize-base', I18n.t('banner.4', I18nScope()))])])])])]), m('.w-section.divider'), m('.w-section.section-large', [m('.w-container.u-text-center.u-marginbottom-60', [m('div', [m('span.fontsize-largest.fontweight-semibold', I18n.t('features.title', I18nScope()))]), m('.w-hidden-small.w-hidden-tiny.fontsize-large.u-marginbottom-20', I18n.t('features.subtitle', I18nScope())), m('.w-hidden-main.w-hidden-medium.u-margintop-30', [m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_1', I18nScope())), m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_2', I18nScope())), m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_3', I18nScope())), m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_4', I18nScope())), m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_5', I18nScope()))])]), m('.w-container', [m('.w-tabs.w-hidden-small.w-hidden-tiny', [m('.w-tab-menu.w-col.w-col-4', _.map(ctrl.paneImages, function (pane, idx) {
                return m('btn.w-tab-link.w-inline-block.tab-list-item' + (idx === ctrl.selectedPane() ? '.selected' : ''), {
                    onclick: ctrl.selectPane(idx)
                }, pane.label);
            })), m('.w-tab-content.w-col.w-col-8', _.map(ctrl.paneImages, function (pane, idx) {
                return m('.w-tab-pane', [m('img[src="' + pane.src + '"].pane-image' + (idx === ctrl.selectedPane() ? '.selected' : ''))]);
            }))])])]), m('.w-section.section-large.bg-blue-one', [m('.w-container.u-text-center', [m('.fontsize-larger.lineheight-tight.fontcolor-negative.u-marginbottom-20', [I18n.t('video.title', I18nScope()), m('br'), I18n.t('video.subtitle', I18nScope())]), m.component(c.YoutubeLightbox, {
                src: I18n.t('video.src', I18nScope())
            })])]), m('.w-hidden-small.w-hidden-tiny.section-categories', [m('.w-container', [m('.u-text-center', [m('.w-row', [m('.w-col.w-col-10.w-col-push-1', [m('.fontsize-large.u-marginbottom-40.fontcolor-negative', I18n.t('categories.title', I18nScope()))])])]), m('.w-tabs', [m('.w-tab-menu.u-text-center', _.map(ctrl.categories(), function (category) {
                return m('a.w-tab-link.w-inline-block.btn-category.small.btn-inline' + (ctrl.selectedCategoryIdx() === category.id ? '.w--current' : ''), {
                    onclick: ctrl.selectCategory(category)
                }, [m('div', category.name)]);
            })), m('.w-tab-content.u-margintop-40', [m('.w-tab-pane.w--tab-active', [m('.w-row', ctrl.selectedCategoryIdx() !== -1 ? _.map(ctrl.selectedCategory(), function (category) {
                return [m('.w-col.w-col-5', [m('.fontsize-jumbo.u-marginbottom-20', category.name), m('a.w-button.btn.btn-medium.btn-inline.btn-dark[href="#start-form"]', {
                    config: h.scrollTo()
                }, I18n.t('submit', I18nScope()))]), m('.w-col.w-col-7', [m('.fontsize-megajumbo.fontcolor-negative', 'R$ ' + (category.total_successful_value ? h.formatNumber(category.total_successful_value, 2, 3) : '...')), m('.fontsize-large.u-marginbottom-20', 'Doados para projetos'), m('.fontsize-megajumbo.fontcolor-negative', category.successful_projects ? category.successful_projects : '...'), m('.fontsize-large.u-marginbottom-30', 'Projetos financiados'), !_.isEmpty(ctrl.featuredProjects()) ? _.map(ctrl.featuredProjects(), function (project) {
                    return !_.isUndefined(project) ? m('.w-row.u-marginbottom-10', [m('.w-col.w-col-1', [m('img.user-avatar[src="' + h.useAvatarOrDefault(project.userThumb) + '"]')]), m('.w-col.w-col-11', [m('.fontsize-base.fontweight-semibold', project.user.name), m('.fontsize-smallest', [I18n.t('categories.pledged', I18nScope({ pledged: h.formatNumber(project.pledged), contributors: project.total_contributors })), m('a.link-hidden[href="/' + project.permalink + '"]', project.name)])])]) : m('.fontsize-base', I18n.t('categories.loading_featured', I18nScope()));
                }) : ''])];
            }) : '')])])])])]), m.component(c.Slider, {
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
            }))])]), m('#start-form.w-section.section-large.u-text-center.bg-purple.before-footer', [m('.w-container', [m('.fontsize-jumbo.fontcolor-negative.u-marginbottom-60', 'Crie o seu rascunho gratuitamente!'), m('form[action="/pt/projects"][method="POST"].w-row.w-form', [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.fontsize-larger.fontcolor-negative.u-marginbottom-10', I18n.t('form.title', I18nScope())), m('input[name="utf8"][type="hidden"][value="✓"]'), m('input[name="authenticity_token"][type="hidden"][value="' + h.authenticityToken() + '"]'), m('input.w-input.text-field.medium.u-marginbottom-30[type="text"]', { name: 'project[name]' }), m('.fontsize-larger.fontcolor-negative.u-marginbottom-10', 'na categoria'), m('select.w-select.text-field.medium.u-marginbottom-40', { name: 'project[category_id]' }, [m('option[value=""]', I18n.t('form.select_default', I18nScope())), _.map(ctrl.categories(), function (category) {
                return m('option[value="' + category.id + '"]', category.name);
            })])]), m('.w-col.w-col-2'), m('.w-row.u-marginbottom-80', [m('.w-col.w-col-4.w-col-push-4.u-margintop-40', [m('input[type="submit"][value="' + I18n.t('form.submit', I18nScope()) + '"].w-button.btn.btn-large')])])])])])];
        }
    };
})(window.m, window.c, window.c.h, window.c.models, window.I18n);
'use strict';

window.c.root.Team = (function (m, c) {
    return {
        view: function view() {
            return m('#static-team-app', [m.component(c.TeamTotal), m.component(c.TeamMembers)]);
        }
    };
})(window.m, window.c);
/**
 * window.c.root.Balance component
 * A root component to show user balance and transactions
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="UsersBalance" data-parameters="{'user_id': 10}">
 */
'use strict';

window.c.root.UsersBalance = (function (m, _, c, models) {
    return {
        controller: function controller(args) {
            var userIdVM = m.postgrest.filtersVM({ user_id: 'eq' });

            userIdVM.user_id(args.user_id);

            // Handles with user balance request data
            var balanceManager = (function () {
                var collection = m.prop([{ amount: 0, user_id: args.user_id }]),
                    load = function load() {
                    models.balance.getRowWithToken(userIdVM.parameters()).then(collection);
                };

                return {
                    collection: collection,
                    load: load
                };
            })(),

            // Handles with user balance transactions list data
            balanceTransactionManager = (function () {
                var listVM = m.postgrest.paginationVM(models.balanceTransaction, 'created_at.desc'),
                    load = function load() {
                    listVM.firstPage(userIdVM.parameters());
                };

                return {
                    load: load,
                    list: listVM
                };
            })(),

            // Handles with bank account to check
            bankAccountManager = (function () {
                var collection = m.prop([]),
                    loader = (function () {
                    return m.postgrest.loaderWithToken(models.bankAccount.getRowOptions(userIdVM.parameters()));
                })(),
                    load = function load() {
                    loader.load().then(collection);
                };

                return {
                    collection: collection,
                    load: load,
                    loader: loader
                };
            })();

            return {
                bankAccountManager: bankAccountManager,
                balanceManager: balanceManager,
                balanceTransactionManager: balanceTransactionManager
            };
        },
        view: function view(ctrl, args) {
            var opts = _.extend({}, args, ctrl);
            return m('#balance-area', [m.component(c.UserBalance, opts), m('.divider'), m.component(c.UserBalanceTransactions, opts), m('.u-marginbottom-40'), m('.w-section.section.card-terciary.before-footer')]);
        }
    };
})(window.m, window._, window.c, window.c.models);
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
                if (h.authenticityToken()) {
                    xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
                }
            };

            var reload = _.compose(builder.model.getRowWithToken, h.idVM.id(item[builder.updateKey]).parameters),
                l = m.prop(false);

            var reloadItem = function reloadItem(data) {
                reload().then(updateItem);
            };

            var requestError = function requestError(err) {
                l(false);
                complete(true);
                error(true);
            };

            var updateItem = function updateItem(res) {
                _.extend(item, res[0]);
                complete(true);
                error(false);
            };

            var submit = function submit() {
                l(true);
                m.request(builder.requestOptions).then(reloadItem, requestError);
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
                isFinalLap = function isFinalLap() {
                // @TODO: use 8 days because timezone on js
                return !_.isNull(project.expires_at) && moment().add(8, 'days') >= moment(project.zone_expires_at);
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
                if (h.authenticityToken()) {
                    xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
                }
            };

            var l = m.postgrest.loader(_.extend({}, { data: data }, builder.requestOptions)),
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
            return m('.w-row.admin-user', [m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [m('img.user-avatar[src="' + h.useAvatarOrDefault(user.profile_img_thumbnail) + '"]')]), m('.w-col.w-col-9.w-col-small-9', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [m('a.alt-link[target="_blank"][href="/users/' + user.id + '/edit"]', user.name || user.email)]), m('.fontsize-smallest', 'Usuário: ' + user.id), m('.fontsize-smallest.fontcolor-secondary', 'Email: ' + user.email), args.additional_data])]);
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
'use strict';

window.c.Dropdown = (function (m, h, _) {
    return {
        view: function view(ctrl, args) {
            return m('select' + args.classes + '[id="' + args.id + '"]', {
                onchange: m.withAttr('value', args.valueProp),
                value: args.valueProp()
            }, _.map(args.options, function (data) {
                return m('option[value="' + data.value + '"]', data.option);
            }));
        }
    };
})(window.m, window.c.h, window._);
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

window.c.FilterDropdown = (function (m, c, _) {
    return {
        view: function view(ctrl, args) {
            return m('.w-col.w-col-3.w-col-small-6', [m('label.fontsize-smaller[for="' + args.index + '"]', args.label), m.component(c.Dropdown, {
                id: args.index,
                classes: '.w-select.text-field.positive',
                valueProp: args.vm,
                options: args.options
            })]);
        }
    };
})(window.m, window.c, window._);
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
            return m('.card.qa-card.u-marginbottom-20.u-radius.btn-terciary', [m('.fontsize-base', {
                onclick: ctrl.showAnswer.toggle
            }, args.question), ctrl.showAnswer() ? m('p.u-margintop-20.fontsize-small', m.trust(args.answer)) : '']);
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

window.c.ModalBox = (function (m, c, _) {
    return {
        view: function view(ctrl, args) {
            return m('.modal-backdrop', [m('.modal-dialog-outer', [m('.modal-dialog-inner.modal-dialog-small', [m('a.w-inline-block.modal-close.fa.fa-close.fa-lg[href="js:void(0);"]', {
                onclick: args.displayModal.toggle
            }), m.component(c[args.content[0]], args.content[1])])])]);
        }
    };
})(window.m, window.c, window._);
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
            var project = args.project() || {},
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
            }, [m('p.fontsize-base', [m('strong', 'O projeto')]), m('.fontsize-base[itemprop="about"]', m.trust(h.selfOrEmpty(project.about_html, '...'))), project.budget ? [m('p.fontsize-base.fontweight-semibold', 'Orçamento'), m('p.fontsize-base', m.trust(project.budget))] : '']), m('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', !_.isEmpty(args.rewardDetails()) ? [m('.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Recompensas'), m.component(c.ProjectRewardList, {
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
            }), m('.card-project-description.alt', [m('.fontweight-semibold.u-text-center-small-only.lineheight-tight.u-marginbottom-10.fontsize-base', [m('a.link-hidden[href="' + link + '"]', project.project_name)]), m('.w-hidden-small.w-hidden-tiny.fontsize-smallest.fontcolor-secondary.u-marginbottom-20', I18n.t('by', I18nScope()) + ' ' + project.owner_name), m('.w-hidden-small.w-hidden-tiny.fontcolor-secondary.fontsize-smaller', [m('a.link-hidden[href="' + link + '"]', project.headline)])]), m('.w-hidden-small.w-hidden-tiny.card-project-author.altt', [m('.fontsize-smallest.fontcolor-secondary', [m('span.fa.fa-map-marker.fa-1', ' '), ' ' + (project.city_name ? project.city_name : '') + ', ' + (project.state_acronym ? project.state_acronym : '')])]), m('.card-project-meter.' + project.state, [_.contains(['successful', 'failed', 'waiting_funds'], project.state) ? m('div', I18n.t('display_status.' + project.state, I18nScope())) : m('.meter', [m('.meter-fill', {
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
            var project = args.project();
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
            return m('#project_contributions.content.w-col.w-col-12', [args.project().is_owner_or_admin ? m('.w-row.u-marginbottom-20', [m('.w-col.w-col-1', [m('input[checked="checked"][id="contribution_state_available_to_count"][name="waiting_payment"][type="radio"][value="available_to_count"]', {
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

window.c.ProjectDashboardMenu = (function (m, _, h, I18n) {
    var I18nScope = _.partial(h.i18nScope, 'projects.dashboard_nav');

    return {
        controller: function controller(args) {
            var body = document.getElementsByTagName('body')[0],
                editLinksToggle = h.toggleProp(true, false),
                bodyToggleForNav = h.toggleProp('body-project open', 'body-project closed');

            if (args.project().is_published) {
                editLinksToggle.toggle(false);
            }

            return {
                body: body,
                editLinksToggle: editLinksToggle,
                bodyToggleForNav: bodyToggleForNav
            };
        },
        view: function view(ctrl, args) {
            var project = args.project(),
                projectRoute = '/projects/' + project.id,
                editRoute = projectRoute + '/edit',
                editLinkClass = 'dashboard-nav-link-left ' + (project.is_published ? 'indent' : '');
            var optionalOpt = project.mode === 'flex' ? m('span.fontsize-smallest.fontcolor-secondary', ' (opcional)') : '';

            ctrl.body.className = ctrl.bodyToggleForNav();

            return m('#project-nav', [m('.project-nav-wrapper', [m('nav.w-section.dashboard-nav.side', [m('a#dashboard_preview_link.w-inline-block.dashboard-project-name[href="' + (project.is_published ? '/' + project.permalink : editRoute + '#preview') + '"]', [m('img.thumb-project-dashboard[src="' + (_.isNull(project.large_image) ? '/assets/thumb-project.png' : project.large_image) + '"][width="114"]'), m('.fontcolor-negative.lineheight-tight.fontsize-small', project.name), m('img.u-margintop-10[src="/assets/catarse_bootstrap/badge-' + project.mode + '-h.png"][width=80]')]), m('#info-links', [m('a#dashboard_home_link[class="dashboard-nav-link-left ' + (h.locationActionMatch('insights') ? 'selected' : '') + '"][href="' + projectRoute + '/insights"]', [m('span.fa.fa-bar-chart.fa-lg.fa-fw'), I18n.t('start_tab', I18nScope())]), project.is_published ? [m('a#dashboard_reports_link.dashboard-nav-link-left[href="' + editRoute + '#reports' + '"]', [m('span.fa.fa.fa-table.fa-lg.fa-fw'), I18n.t('reports_tab', I18nScope())]), m('a#dashboard_reports_link.dashboard-nav-link-left.u-marginbottom-30[href="' + editRoute + '#posts' + '"]', [m('span.fa.fa-bullhorn.fa-fw.fa-lg'), I18n.t('posts_tab', I18nScope()), m('span.badge', project.posts_count)])] : '']), m('.edit-project-div', [!project.is_published ? '' : m('button#toggle-edit-menu.dashboard-nav-link-left', {
                onclick: ctrl.editLinksToggle.toggle
            }, [m('span.fa.fa-pencil.fa-fw.fa-lg'), I18n.t('edit_project', I18nScope())]), ctrl.editLinksToggle() ? m('#edit-menu-items', [m('#dashboard-links', [!project.is_published || project.is_admin_role ? [m('a#basics_link[class="' + editLinkClass + '"][href="' + editRoute + '#basics' + '"]', 'Básico'), m('a#goal_link[class="' + editLinkClass + '"][href="' + editRoute + '#goal' + '"]', 'Financiamento')] : '', m('a#description_link[class="' + editLinkClass + '"][href="' + editRoute + '#description' + '"]', 'Descrição'), m('a#video_link[class="' + editLinkClass + '"][href="' + editRoute + '#video' + '"]', ['Vídeo', optionalOpt]), m('a#budget_link[class="' + editLinkClass + '"][href="' + editRoute + '#budget' + '"]', ['Orçamento', optionalOpt]), m('a#card_link[class="' + editLinkClass + '"][href="' + editRoute + '#card' + '"]', 'Card do projeto'), m('a#dashboard_reward_link[class="' + editLinkClass + '"][href="' + editRoute + '#reward' + '"]', ['Recompensas', optionalOpt]), m('a#dashboard_user_about_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_about' + '"]', 'Sobre você'), project.mode === 'flex' || project.is_published || project.state === 'approved' || project.is_admin_role ? [m('a#dashboard_user_settings_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_settings' + '"]', 'Conta')] : '', !project.is_published ? [m('a#dashboard_preview_link[class="' + editLinkClass + '"][href="' + editRoute + '#preview' + '"]', [m('span.fa.fa-fw.fa-eye.fa-lg'), ' Preview'])] : ''])]) : '', !project.is_published ? [m('.btn-send-draft-fixed', project.mode === 'aon' ? [project.state === 'draft' ? m('a.btn.btn-medium[href="/projects/' + project.id + '/send_to_analysis"]', I18n.t('send', I18nScope())) : '', project.state === 'approved' ? m('a.btn.btn-medium[href="/projects/' + project.id + '/publish"]', [I18n.t('publish', I18nScope()), m.trust('&nbsp;&nbsp;'), m('span.fa.fa-chevron-right')]) : ''] : [project.state === 'draft' ? m('a.btn.btn-medium[href="/projects/' + project.id + '/edit#preview"]', [I18n.t('publish', I18nScope()), m.trust('&nbsp;&nbsp;'), m('span.fa.fa-chevron-right')]) : ''])] : [project.mode === 'flex' ? [m('.btn-send-draft-fixed', _.isNull(project.expires_at) ? m('a.w-button.btn.btn-medium.btn-secondary-dark[href="/projects/' + project.id + '/edit#announce_expiration"]', I18n.t('announce_expiration', I18nScope())) : '')] : '']])])]), m('a.btn-dashboard href="js:void(0);"', {
                onclick: ctrl.bodyToggleForNav.toggle
            }, [m('span.fa.fa-bars.fa-lg')])]);
        }
    };
})(window.m, window._, window.c.h, window.I18n);
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
 * window.c.ProjectDataStats component
 * render a row with project stats info like:
 * state / total_contributions / total_pledged / elapsed | remaning time
 *
 * Example:
 * m.component(c.ProjectDataStats, {project: project})
 **/
'use strict';

window.c.ProjectDataStats = (function (m, models, h, _) {
    return {
        controller: function controller(args) {
            return {};
        },
        view: function view(ctrl, args) {
            var project = args.project,
                progress = project.progress.toFixed(2),
                statusTextObj = h.projectStateTextClass(project.state),
                remainingTextObj = h.translatedTime(project.remaining_time),
                elapsedTextObj = h.translatedTime(project.elapsed_time);

            return m('.w-row.u-marginbottom-40', [m('.w-col.w-col-3.u-text-center-small-only', [m('.fontsize-small.fontweight-semibold.u-marginbottom-20', [m('span.fontcolor-secondary', 'Status: '), m('span', { 'class': statusTextObj.cssClass }, statusTextObj.text)])]), m('.w-col.w-col-9', [m('.w-row.u-text-center', [m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [m('.fontweight-semibold.fontsize-large.lineheight-tight', progress + '%'), m('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'financiado')]), m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [m('.fontweight-semibold.fontsize-large.lineheight-tight', 'R$ ' + h.formatNumber(project.pledged, 2)), m('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'levantados')]), m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [m('.fontweight-semibold.fontsize-large.lineheight-tight', project.total_contributions), m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'apoios')]), m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [_.isNull(project.expires_at) ? [m('.fontweight-semibold.fontsize-large.lineheight-tight', elapsedTextObj.total + ' ' + elapsedTextObj.unit), m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'iniciado há')] : [m('.fontweight-semibold.fontsize-large.lineheight-tight', '' + remainingTextObj.total), m('.fontcolor-secondary.lineheight-tighter.fontsize-small', remainingTextObj.unit + ' ' + (remainingTextObj.total > 0 ? 'restantes' : 'restante'))]])])])]);
        }
    };
})(window.m, window.c.models, window.c.h, window._);
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

window.c.ProjectHeader = (function (m, c, h, _) {
    return {
        view: function view(ctrl, args) {
            var project = args.project;

            if (_.isUndefined(project())) {
                project = m.prop({});
            }

            return m('#project-header', [m('.w-section.section-product.' + project().mode), m('.w-section.page-header.u-text-center', [m('.w-container', [m('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', h.selfOrEmpty(project().name)), m('h2.fontsize-base.lineheight-looser[itemprop="author"]', project().user ? ['por ', project().user.name] : '')])]), m('.w-section.project-main', [m('.w-container', [m('.w-row.project-main', [m('.w-col.w-col-8.project-highlight', m.component(c.ProjectHighlight, {
                project: project
            })), m('.w-col.w-col-4', m.component(c.ProjectSidebar, {
                project: project,
                userDetails: args.userDetails
            }))])])])]);
        }
    };
})(window.m, window.c, window.c.h, window._);
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
            var project = args.project,
                address = project().address || { state_acronym: '', city: '' };

            return m('#project-highlight', [project().video_embed_url ? m('.w-embed.w-video.project-video', {
                style: 'min-height: 240px;'
            }, [m('iframe.embedly-embed[itemprop="video"][src="' + project().video_embed_url + '"][frameborder="0"][allowFullScreen]')]) : m('.project-image', {
                style: 'background-image:url(' + project().original_image + ');'
            }), m('.project-blurb', project().headline), m('.u-text-center-small-only.u-marginbottom-30', [!_.isNull(address) ? m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light.u-marginbottom-10[href="/pt/explore?pg_search=' + address.state_acronym + '"]', [m('span.fa.fa-map-marker'), ' ' + address.city + ', ' + address.state_acronym]) : '', m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light[href="/pt/explore#by_category_id/' + project.category_id + '"]', [m('span.fa.fa-tag'), ' ', project().category_name]), m('button#share-box.btn.btn-small.btn-terciary.btn-inline', {
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

            h.redrawHashChange();

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
        view: function view(ctrl, args) {
            var project = args.project(),
                mode = project.mode,
                modeImgSrc = mode === 'aon' ? '/assets/aon-badge.png' : '/assets/flex-badge.png',
                modeTitle = mode === 'aon' ? 'Campanha Tudo-ou-nada ' : 'Campanha Flexível ',
                goal = _.isNull(project.goal) ? 'não definida' : h.formatNumber(project.goal),
                tooltip = function tooltip(el) {
                return m.component(c.Tooltip, {
                    el: el,
                    text: mode === 'aon' ? 'Somente receberá os recursos se atingir ou ultrapassar a meta até o dia ' + h.momentify(project.zone_expires_at, 'DD/MM/YYYY') + '.' : 'O realizador receberá todos os recursos quando encerrar a campanha, mesmo que não tenha atingido esta meta.',
                    width: 280
                });
            };

            return m('#' + mode + '.w-row', [m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [!_.isEmpty(project) ? m('img[src="' + modeImgSrc + '"][width=\'30\']') : '']), m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [m('.fontsize-smaller.fontweight-semibold', 'Meta R$ ' + h.selfOrEmpty(goal, '--')), m('.w-inline-block.fontsize-smallest._w-inline-block', [!_.isEmpty(project) ? modeTitle : '', tooltip('span.w-inline-block.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary')])])]);
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
                storeReminderName = 'remind_' + project().id,
                l = m.prop(false),
                popNotification = m.prop(false),
                submitReminder = function submitReminder() {
                if (!h.getUser()) {
                    h.storeAction(storeReminderName, submitReminder);
                    return h.navigateToDevise();
                }
                var loaderOpts = project().in_reminder ? models.projectReminder.deleteOptions(filterVM.parameters()) : models.projectReminder.postOptions({
                    project_id: project().id
                });
                l = m.postgrest.loaderWithToken(loaderOpts);

                l.load().then(function () {
                    project().in_reminder = !project().in_reminder;

                    if (project().in_reminder) {
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
            filterVM.project_id(project().id);

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

            return m('#project-reminder' + mainClass, [m('button[class="' + buttonClass + ' ' + (project().in_reminder ? 'link-hidden-success' : 'fontcolor-secondary') + ' fontweight-semibold"]', {
                onclick: ctrl.submitReminder
            }, [ctrl.l() ? 'aguarde ...' : m('span.fa.fa-clock-o', [m('span' + (hideTextOnMobile ? '.w-hidden-medium' : ''), project().in_reminder ? ' Lembrete ativo' : ' Lembrar-me')])]), ctrl.popNotification() ? m.component(c.PopNotification, {
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

            if (collection.loader() || collection.collection().length > 0) {
                return m(wrapper, [m('.w-container', [!_.isUndefined(collection.title) || !_.isUndefined(collection.hash) ? m('.w-row.u-marginbottom-30', [m('.w-col.w-col-10.w-col-small-6.w-col-tiny-6', [m('.fontsize-large.lineheight-looser', collection.title)]), m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m('a.btn.btn-small.btn-terciary[href="/pt/explore?ref=' + ref + '#' + collection.hash + '"]', 'Ver todos')])]) : '', collection.loader() ? h.loader() : m('.w-row', _.map(collection.collection(), function (project) {
                    return m.component(c.ProjectCard, {
                        project: project,
                        ref: ref
                    });
                }))])]);
            } else {
                return m('div');
            }
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
            }, 'Fechar'), m('.fontsize-small.fontweight-semibold.u-marginbottom-30', 'Compartilhe este projeto')]), m('.w-widget.w-widget-facebook.w-hidden-small.w-hidden-tiny.share-block', [m('iframe[allowtransparency="true"][width="150px"][height="22px"][frameborder="0"][scrolling="no"][src="https://www.facebook.com/v2.0/plugins/share_button.php?app_id=173747042661491&channel=https%3A%2F%2Fs-static.ak.facebook.com%2Fconnect%2Fxd_arbiter%2F44OwK74u0Ie.js%3Fversion%3D41%23cb%3Df7d9b900c%26domain%3Dwww.catarse.me%26origin%3Dhttps%253A%252F%252Fwww.catarse.me%252Ff4b3ad0c8%26relation%3Dparent.parent&container_width=0&href=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project().permalink + '%3Fref%3Dfacebook&layout=button_count&locale=pt_BR&sdk=joey"]')]), m('.w-widget.w-widget-twitter.w-hidden-small.w-hidden-tiny.share-block', [m('iframe[allowtransparency="true"][width="120px"][height="22px"][frameborder="0"][scrolling="no"][src="//platform.twitter.com/widgets/tweet_button.8d007ddfc184e6776be76fe9e5e52d69.en.html#_=1442425984936&count=horizontal&dnt=false&id=twitter-widget-1&lang=en&original_referer=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project().permalink + '&size=m&text=Confira%20o%20projeto%20' + args.project().name + '%20no%20%40catarse&type=share&url=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project().permalink + '%3Fref%3Dtwitter&via=catarse"]')]), m('a.w-hidden-small.widget-embed.w-hidden-tiny.fontsize-small.link-hidden.fontcolor-secondary[href="js:void(0);"]', {
                onclick: ctrl.displayEmbed.toggle
            }, '< embed >'), ctrl.displayEmbed() ? m('.embed-expanded.u-margintop-30', [m('.fontsize-small.fontweight-semibold.u-marginbottom-20', 'Insira um widget em seu site'), m('.w-form', [m('input.w-input[type="text"][value="<iframe frameborder="0" height="314px" src="https://www.catarse.me/pt/projects/' + args.project().id + '/embed" width="300px" scrolling="no"></iframe>"]')]), m('.card-embed', [m('iframe[frameborder="0"][height="350px"][src="/projects/' + args.project().id + '/embed"][width="300px"][scrolling="no"]')])]) : '', m('a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-fb.u-marginbottom-20[href="http://www.facebook.com/sharer/sharer.php?u=https://www.catarse.me/' + args.project().permalink + '?ref=facebook&title=' + args.project().name + '"][target="_blank"]', [m('span.fa.fa-facebook'), ' Compartilhe']), m('a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-tweet.u-marginbottom-20[href="http://twitter.com/?status=Acabei de apoiar o projeto ' + args.project().name + ' htts://www.catarse.me/' + args.project().permalink + '?ref=twitterr"][target="_blank"]', [m('span.fa.fa-twitter'), ' Tweet'])]);
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

                return states[project().state] ? 'card u-radius zindex-10 ' + states[project().state] : '';
            },
                displayStatusText = function displayStatusText() {
                var states = {
                    'approved': I18n.t('display_status.approved', I18nScope()),
                    'online': h.existy(project().zone_expires_at) ? I18n.t('display_status.online', I18nScope({ date: h.momentify(project().zone_expires_at) })) : '',
                    'failed': I18n.t('display_status.failed', I18nScope({ date: h.momentify(project().zone_expires_at), goal: project().goal })),
                    'rejected': I18n.t('display_status.rejected', I18nScope()),
                    'in_analysis': I18n.t('display_status.in_analysis', I18nScope()),
                    'successful': I18n.t('display_status.successful', I18nScope({ date: h.momentify(project().zone_expires_at) })),
                    'waiting_funds': I18n.t('display_status.waiting_funds', I18nScope()),
                    'draft': I18n.t('display_status.draft', I18nScope())
                };

                return states[project().state];
            };

            return {
                animateProgress: animateProgress,
                displayCardClass: displayCardClass,
                displayStatusText: displayStatusText
            };
        },

        view: function view(ctrl, args) {
            var project = args.project,
                elapsed = project().elapsed_time,
                remaining = project().remaining_time;

            return m('#project-sidebar.aside', [m('.project-stats', [m('.project-stats-inner', [m('.project-stats-info', [m('.u-marginbottom-20', [m('#pledged.fontsize-largest.fontweight-semibold.u-text-center-small-only', 'R$ ' + (project().pledged ? h.formatNumber(project().pledged) : '0')), m('.fontsize-small.u-text-center-small-only', [I18n.t('contributors_call', I18nScope()), m('span#contributors.fontweight-semibold', I18n.t('contributors_count', I18nScope({ count: project().total_contributors }))), !project().expires_at && elapsed ? ' em ' + I18n.t('datetime.distance_in_words.x_' + elapsed.unit, { count: elapsed.total }, I18nScope()) : ''])]), m('.meter', [m('#progressBar.meter-fill', {
                style: {
                    width: project().progress + '%'
                }
            })]), m('.w-row.u-margintop-10', [m('.w-col.w-col-5.w-col-small-6.w-col-tiny-6', [m('.fontsize-small.fontweight-semibold.lineheight-tighter', (project().progress ? parseInt(project().progress) : '0') + '%')]), m('.w-col.w-col-7.w-col-small-6.w-col-tiny-6.w-clearfix', [m('.u-right.fontsize-small.lineheight-tighter', remaining && remaining.total ? [m('span.fontweight-semibold', remaining.total), I18n.t('remaining_time.' + remaining.unit, I18nScope({ count: remaining.total }))] : '')])])]), m('.w-row', [m.component(c.ProjectMode, {
                project: project
            })])]), project().open_for_contributions ? m('a#contribute_project_form.btn.btn-large.u-marginbottom-20[href="/projects/' + project().id + '/contributions/new"]', I18n.t('submit', I18nScope())) : '', project().open_for_contributions ? m.component(c.ProjectReminder, {
                project: project,
                type: 'link'
            }) : '', m('div[class="fontsize-smaller u-marginbottom-30 ' + ctrl.displayCardClass() + '"]', ctrl.displayStatusText())]), m('.user-c', m.component(c.ProjectUserCard, {
                userDetails: args.userDetails
            }))]);
        }
    };
})(window.m, window.c.h, window.c, window._, window.I18n);
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
'use strict';

window.c.ProjectSuccessfulOnboardConfirmAccountAccept = (function (m, c, h, _) {
    return {
        view: function view(ctrl, args) {
            return m('.w-row.bank-transfer-answer', [m('.w-col.w-col-3'), m('.w-col.w-col-6', [m('.w-form.bank-transfer-confirm.card.u-radius', [m('form', [m('a.w-inline-block.u-right.btn.btn-terciary.btn-no-border.btn-inline.fa.fa-close', { href: 'js:void(0);', onclick: args.changeToAction('start') }), m('label.field-label.fontweight-semibold.u-marginbottom-20', 'Tem certeza?'), m('.fontsize-smaller.u-marginbottom-30', 'Qualquer informação errada nesse momento pode atrasar o repasse dos recursos!'), m('.w-row', [m('.w-col.w-col-4'), m('.w-col.w-col-4', [!args.acceptAccountLoader() ? m('a.w-button.btn.btn-medium', {
                href: 'js:void(0);',
                onclick: args.acceptAccount
            }, 'Confirmar') : h.loader()]), m('.w-col.w-col-4')])])])]), m('.w-col.w-col-3')]);
        }
    };
})(window.m, window.c, window.c.h, window._);
/**
 * window.c.ProjectSuccessfulOnboardConfirmAccountActions component
 * render actions to handle with acceptation or decline current bank data
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardConfirmAccountActions, {
 *    projectAccount: projectAccount,
 *    changeToAction: ctrl.changeToAction //provided by ProjectSuccessfulOnboardConfirmAccount controller
 * })
 **/
'use strict';

window.c.ProjectSuccessfulOnboardConfirmAccountActions = (function (m, c, h, _) {
    return {
        view: function view(ctrl, args) {
            return m('.w-row.bank-transfer-answer', [m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6.w-hidden-small.w-hidden-tiny'), m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [m('a.btn.btn-large', { href: 'js:void(0);', onclick: args.changeToAction('accept') }, 'Sim')]), m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6', [m('a.btn.btn-large.btn-terciary', { href: 'js:void(0);', onclick: args.changeToAction('error') }, 'Não')]), m('.w-col.w-col-3.w-col-small-6.w-col-tiny-6.w-hidden-small.w-hidden-tiny')]);
        }
    };
})(window.m, window.c, window.c.h, window._);
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
'use strict';

window.c.ProjectSuccessfulOnboardConfirmAccountError = (function (m, c, h, _) {
    return {
        controller: function controller(args) {
            return {
                errorReasonM: m.prop('')
            };
        },
        view: function view(ctrl, args) {
            return m('.w-row.bank-transfer-answer', [m('.w-col.w-col-3'), m('.w-col.w-col-6', [m('.w-form.bank-transfer-problem.card.u-radius', [m('form', [m('a.w-inline-block.u-right.btn.btn-terciary.btn-no-border.btn-inline.fa.fa-close', { href: 'js:void(0);', onclick: args.changeToAction('start') }), m('label.field-label.fontweight-semibold.u-marginbottom-20', 'O que está errado com seus dados?'), m('textarea.w-input.text-field', {
                placeholder: 'Nos ajude dizendo o que precisa ser ajustado! Isso vai facilitar o nosso trabalho e poupar seu tempo.',
                onchange: m.withAttr('value', ctrl.errorReasonM)
            }), m('.w-row', [m('.w-col.w-col-4'), m('.w-col.w-col-4', [m('a.w-button.btn.btn-medium', {
                href: 'js:void(0);',
                onclick: args.addErrorReason(ctrl.errorReasonM)
            }, 'Enviar')]), m('.w-col.w-col-4')])])])]), m('.w-col.w-col-3')]);
        }
    };
})(window.m, window.c, window.c.h, window._);
/**
 * window.c.ProjectSuccessfulOnboardConfirmAccount component
 * render project account data to confirm or add error
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardConfirmAccount, {projectAccount: projectAccount})
 **/

'use strict';

window.c.ProjectSuccessfulOnboardConfirmAccount = (function (m, c, h, _) {
    return {
        controller: function controller(args) {
            var actionStages = {
                'start': 'ProjectSuccessfulOnboardConfirmAccountActions',
                'error': 'ProjectSuccessfulOnboardConfirmAccountError',
                'accept': 'ProjectSuccessfulOnboardConfirmAccountAccept' },
                actionStage = m.prop(actionStages['start']),
                changeToAction = function changeToAction(stage) {
                return function () {
                    actionStage(actionStages[stage]);

                    return void 0;
                };
            };

            return {
                changeToAction: changeToAction,
                actionStage: actionStage
            };
        },
        view: function view(ctrl, args) {
            var projectAccount = args.projectAccount,
                actionStage = ctrl.actionStage,
                personKind = projectAccount.owner_document.length > 14 ? 'Jurídica' : 'Física';

            return m('.w-container.u-marginbottom-40', [m('.u-text-center', [m('.fontsize-large.fontweight-semibold.u-marginbottom-30', 'Os seus dados estão corretos?')]), m('.w-row.u-marginbottom-40', [m('.w-col.w-col-6', [m('.fontsize-base.u-marginbottom-30.card.card-terciary', [m('div', [m('span.fontcolor-secondary', 'Pessoa: '), personKind]), m('div', [m('span.fontcolor-secondary', 'Nome completo do titular: '), projectAccount.owner_name]), m('div', [m('span.fontcolor-secondary', 'CPF do titular da conta bancária: '), projectAccount.owner_document]), m('div', [m('span.fontcolor-secondary', 'Banco: '), projectAccount.bank_name]), m('div', [m('span.fontcolor-secondary', 'Agência: '), '' + projectAccount.agency + (_.isEmpty(projectAccount.agency_digit) ? '' : '-' + projectAccount.agency_digit)]), m('div', [m('span.fontcolor-secondary', 'Conta Corrente: '), projectAccount.account + '-' + projectAccount.account_digit])])]), m('.w-col.w-col-6', [m('.fontsize-base.u-marginbottom-30.card.card-terciary', [m('div', [m('span.fontcolor-secondary', 'Endereço: '), projectAccount.address_street + ', ' + projectAccount.address_number + ' ' + (!_.isNull(projectAccount.address_complement) ? ', ' + projectAccount.address_complement : '')]), m('div', [m('span.fontcolor-secondary', 'Bairro: '), projectAccount.address_neighbourhood]), m('div', [m('span.fontcolor-secondary', 'Cidade: '), projectAccount.address_city]), m('div', [m('span.fontcolor-secondary', 'Estado: '), projectAccount.address_state]), m('div', [m('span.fontcolor-secondary', 'CEP: '), projectAccount.address_zip_code])])])]), m.component(c[actionStage()], {
                projectAccount: projectAccount,
                changeToAction: ctrl.changeToAction,
                addErrorReason: args.addErrorReason,
                acceptAccount: args.acceptAccount,
                acceptAccountLoader: args.acceptAccountLoader
            })]);
        }
    };
})(window.m, window.c, window.c.h, window._);
/**
 * window.c.ProjectSuccessfulOnboardErrorAccount component
 * render message about error on account
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardErrorAccount, {
 *     projectTransfer: projectTransfer,
 *     setStage: setStage // setStage is defined on ProjectSuccessfulOnboard component
 * })
 **/

'use strict';

window.c.ProjectSuccessfulOnboardErrorAccount = (function (m, c, h) {
    return {
        view: function view(ctrl, args) {
            var projectTransfer = args.projectTransfer,
                projectAccount = args.projectAccount;

            return m('.w-container', [m('.w-row.u-marginbottom-40', [m('.w-col.w-col-3'), m('.w-col.w-col-6', [m('.u-text-center', [m('img.u-marginbottom-20', { src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56c350fabfc50aef5095c67d_transfer-pending-icon.png', width: 94 }), m('.fontsize-large.fontweight-semibold.u-marginbottom-20', 'Transferência bancária pendente'), m('.fontsize-base.u-marginbottom-30', ['Seus dados bancários estavam com alguma informação errada e já fomos notificados sobre esse problema! Fique de olho no ', m('span.fontweight-semibold', projectAccount.user_email), ' , pois vamos resolver esse problema via email!'])])]), m('.w-col.w-col-3')])]);
        }
    };
})(window.m, window.c, window.c.h);
/**
 * window.c.ProjectSuccessfulOnboardFinished component
 * render finished message
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardFinished, {
 *     projectTransfer: projectTransfer,
 *     setStage: setStage // setStage is defined on ProjectSuccessfulOnboard component
 * })
 **/

'use strict';

window.c.ProjectSuccessfulOnboardFinished = (function (m, c, h) {
    return {
        view: function view(ctrl, args) {
            var projectTransfer = args.projectTransfer;

            return m('.w-container', [m('.w-row.u-marginbottom-40', [m('.w-col.w-col-3'), m('.w-col.w-col-6', [m('.u-text-center', [m('img.u-marginbottom-20', { src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56c3511ee7d136a016bc34fa_succesful-icon.png', width: 94 }), m('.fontsize-large.fontweight-semibold.u-marginbottom-20', 'Boa sorte no seu projeto!'), m('.fontsize-base.u-marginbottom-30', ['Trabalhe sempre o relacionamento com seus apoiadores! Mantenha eles informados do andamento do seu projeto. Não deixe de olhar a seção de pós-projeto do Guia dos Realizadores!'])])]), m('.w-col.w-col-3')])]);
        }
    };
})(window.m, window.c, window.c.h);
/**
 * window.c.ProjectSuccessfulOnboardPendingTransfer component
 * render message about pending transfer
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardPendingTransfer, {
 *     projectTransfer: projectTransfer,
 *     setStage: setStage // setStage is defined on ProjectSuccessfulOnboard component
 * })
 **/

'use strict';

window.c.ProjectSuccessfulOnboardPendingTransfer = (function (m, c, h) {
    return {
        view: function view(ctrl, args) {
            var projectTransfer = args.projectTransfer,
                projectAccount = args.projectAccount;

            return m('.w-container', [m('.w-row.u-marginbottom-40', [m('.w-col.w-col-3'), m('.w-col.w-col-6', [m('.u-text-center', [m('img.u-marginbottom-20', { src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56c350c5e7d136a016bc34a4_transfer-ok-icon.png', width: 94 }), m('.fontsize-large.fontweight-semibold.u-marginbottom-20', 'Transferência bancária em andamento'), m('.fontsize-base.u-marginbottom-30', ['Até o dia ' + projectAccount.transfer_limit_date + ', R$' + h.formatNumber(projectTransfer.total_amount, 2) + ' (taxas já descontadas) estarão em sua conta Banco ' + projectAccount.bank_name + ', Agência:' + projectAccount.agency + (_.isEmpty(projectAccount.agency_digit) ? '' : '-' + projectAccount.agency_digit) + ', Conta:' + projectAccount.account + '-' + projectAccount.account_digit + '. Fique atento no email ' + projectAccount.user_email + ' , pois nossa equipe pode entrar em contato com você se ocorrer algum problema com o banco!'])])]), m('.w-col.w-col-3')])]);
        }
    };
})(window.m, window.c, window.c.h);
/**
 * window.c.ProjectSuccessfulOnboardStart component
 * render congratulations message when project is successful and 
 * button to confirm the bank data
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardStart, {
 *     projectTransfer: projectTransfer,
 *     setStage: setStage // setStage is defined on ProjectSuccessfulOnboard component
 * })
 **/

'use strict';

window.c.ProjectSuccessfulOnboardStart = (function (m, c, h) {
    return {
        view: function view(ctrl, args) {
            var projectTransfer = args.projectTransfer;

            return m('.w-container', [m('.w-row.u-marginbottom-40', [m('.w-col.w-col-3'), m('.w-col.w-col-6', [m('.u-text-center', [m('img.u-marginbottom-20', { src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56c3508dbfc50aef5095c66a_finish-icon.png', width: 94 }), m('.fontsize-large.fontweight-semibold.u-marginbottom-20', 'Parabéns!'), m('.fontsize-base.u-marginbottom-30', ['Seu projeto foi finalizado com sucesso e você tem ', m('span.fontweight-semibold', 'R$' + h.formatNumber(projectTransfer.total_amount, 2) + ' '), 'para receber (taxas já descontadas)! Para efetuarmos a transferência, precisamos que você nos confirme seus dados bancários.']), m('a.btn.btn-large.btn-inline', { href: 'js:void(0);', onclick: args.setStage('confirm_account') }, 'Confirmar dados bancários')])]), m('.w-col.w-col-3')])]);
        }
    };
})(window.m, window.c, window.c.h);
/**
 * window.c.ProjectSuccessfulOnboard component
 * render first interaction of successful project onboarding
 * used when project is successful and wants to confirm bank data and request transfer
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboard, {project: project})
 **/

'use strict';

window.c.ProjectSuccessfulOnboard = (function (m, c, models, h, _) {
    return {
        controller: function controller(args) {
            var projectIdVM = m.postgrest.filtersVM({ project_id: 'eq' }),
                projectAccounts = m.prop([]),
                projectTransfers = m.prop([]),
                onboardStages = {
                'start': 'ProjectSuccessfulOnboardStart',
                'confirm_account': 'ProjectSuccessfulOnboardConfirmAccount',
                'error_account': 'ProjectSuccessfulOnboardErrorAccount',
                'pending_transfer': 'ProjectSuccessfulOnboardPendingTransfer',
                'finished': 'ProjectSuccessfulOnboardFinished'
            },
                currentStage = m.prop(onboardStages['start']),
                loader = m.postgrest.loaderWithToken,
                declineAccountLoader = function declineAccountLoader(errorMsg) {
                var pa = _.first(projectAccounts());

                return m.postgrest.loaderWithToken(models.projectAccountError.postOptions({
                    project_id: args.project.id,
                    reason: errorMsg
                }));
            },
                acceptAccountLoader = m.postgrest.loaderWithToken(models.projectAccount.postOptions({
                project_id: args.project.id
            }));

            projectIdVM.project_id(args.project.id);

            var lProjectAccount = loader(models.projectAccount.getRowOptions(projectIdVM.parameters()));
            lProjectAccount.load().then(function (data) {
                projectAccounts(data);
                loadCurrentStage();
            });

            var lProjectTransfer = loader(models.projectTransfer.getRowOptions(projectIdVM.parameters()));
            lProjectTransfer.load().then(projectTransfers);

            var setStage = function setStage(stage) {
                return function () {
                    currentStage(onboardStages[stage]);

                    return currentStage();
                };
            },
                loadCurrentStage = function loadCurrentStage() {
                if (!lProjectAccount()) {
                    var pa = _.first(projectAccounts());

                    if (_.isNull(pa.error_reason) && _.isNull(pa.transfer_state)) {
                        return setStage('start')();
                    } else if (!_.isNull(pa.error_reason)) {
                        return setStage('error_account')();
                    } else if (!_.isNull(pa.transfer_state)) {
                        return setStage('pending_transfer')();
                    }
                }

                return void 0;
            },

            // TODO: need to add an error validation to not null
            addErrorReason = function addErrorReason(errorProp) {
                return function () {
                    var fn = declineAccountLoader(errorProp());
                    fn.load().then(function () {
                        setStage('error_account')();
                    });

                    return void 0;
                };
            },
                acceptAccount = function acceptAccount() {
                acceptAccountLoader.load().then(function () {
                    setStage('pending_transfer')();
                });

                return void 0;
            };

            return {
                projectAccounts: projectAccounts,
                projectTransfers: projectTransfers,
                lProjectAccount: lProjectAccount,
                lProjectTransfer: lProjectTransfer,
                setStage: setStage,
                currentStage: currentStage,
                addErrorReason: addErrorReason,
                acceptAccount: acceptAccount,
                acceptAccountLoader: acceptAccountLoader,
                declineAccountLoader: declineAccountLoader,
                loadCurrentStage: loadCurrentStage
            };
        },

        view: function view(ctrl, args) {
            var projectAccount = _.first(ctrl.projectAccounts()),
                projectTransfer = _.first(ctrl.projectTransfers()),
                lpa = ctrl.lProjectAccount,
                lpt = ctrl.lProjectTransfer;

            return m('.w-section.section', [!lpa() && !lpt() ? m.component(c[ctrl.currentStage()], {
                projectTransfer: projectTransfer,
                projectAccount: projectAccount,
                setStage: ctrl.setStage,
                addErrorReason: ctrl.addErrorReason,
                acceptAccount: ctrl.acceptAccount,
                acceptAccountLoader: ctrl.acceptAccountLoader
            }) : h.loader()]);
        }
    };
})(window.m, window.c, window.c.models, window.c.h, window._);
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

            var mainClass = !ctrl.isFixed() || project().is_owner_or_admin ? '.w-section.project-nav' : '.w-section.project-nav.project-nav-fixed';

            return m('nav-wrapper', project() ? [m(mainClass, {
                config: ctrl.navDisplay
            }, [m('.w-container', [m('.w-row', [m('.w-col.w-col-8', [!_.isEmpty(rewards()) ? m('a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf ' + (h.hashMatch('#rewards') ? 'selected' : '') + '"][href="#rewards"]', {
                style: 'float: left;'
            }, 'Recompensas') : m('a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf ' + (h.hashMatch('#contribution_suggestions') ? 'selected' : '') + '"][href="#contribution_suggestions"]', {
                style: 'float: left;'
            }, 'Valores Sugeridos'), m('a[id="about-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#about') || h.hashMatch('') ? 'selected' : '') + ' "][href="#about"]', {
                style: 'float: left;'
            }, 'Sobre'), m('a[id="posts-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#posts') ? 'selected' : '') + '"][href="#posts"]', {
                style: 'float: left;'
            }, ['Novidades ', m('span.badge', project() ? project().posts_count : '')]), m('a[id="contributions-link"][class="w-hidden-small w-hidden-tiny dashboard-nav-link mf ' + (h.hashMatch('#contributions') ? 'selected' : '') + '"][href="#contributions"]', {
                style: 'float: left;'
            }, ['Apoios ', m('span.badge.w-hidden-small.w-hidden-tiny', project() ? project().total_contributions : '-')]), m('a[id="comments-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#comments') ? 'selected' : '') + '"][href="#comments"]', {
                style: 'float: left;'
            }, ['Comentários ', project() ? m('fb:comments-count[href="http://www.catarse.me/' + project().permalink + '"][class="badge project-fb-comment w-hidden-small w-hidden-tiny"][style="display: inline"]', m.trust('&nbsp;')) : '-'])]), project() ? m('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', project().open_for_contributions ? [m('.w-row.project-nav-back-button', [m('.w-col.w-col-6.w-col-medium-8', [m('a.w-button.btn[href="/projects/' + project().id + '/contributions/new"]', 'Apoiar ‍este projeto')]), m('.w-col.w-col-6.w-col-medium-4', [m.component(c.ProjectReminder, { project: project, type: 'button', hideTextOnMobile: true })])])] : '') : ''])])]), ctrl.isFixed() && !project().is_owner_or_admin ? m('.w-section.project-nav') : ''] : '');
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
            var interval = undefined;
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
                startSliderTimer = function startSliderTimer() {
                interval = setInterval(function () {
                    incrementSlide();
                    m.redraw();
                }, 6500);
            },
                resetSliderTimer = function resetSliderTimer() {
                clearInterval(interval);
                startSliderTimer();
            },
                config = function config(el, isInitialized, context) {
                if (!isInitialized) {
                    translationSize(Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
                    m.redraw();
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
            var sliderClick = function sliderClick(fn, param) {
                fn(param);
                ctrl.resetSliderTimer();
            };

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
                    return sliderClick(ctrl.decrementSlide);
                }
            }, [m('.w-icon-slider-left.fa.fa-lg.fa-angle-left.fontcolor-terciary')]), m('#slide-next.w-slider-arrow-right.w-hidden-small.w-hidden-tiny', {
                onclick: function onclick() {
                    return sliderClick(ctrl.incrementSlide);
                }
            }, [m('.w-icon-slider-right.fa.fa-lg.fa-angle-right.fontcolor-terciary')]), m('.w-slider-nav.w-slider-nav-invert.w-round.slide-nav', _(args.slides.length).times(function (idx) {
                return m('.slide-bullet.w-slider-dot' + (ctrl.selectedSlideIdx() === idx ? '.w-active' : ''), {
                    onclick: function onclick() {
                        return sliderClick(ctrl.selectedSlideIdx, idx);
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

window.c.UserBalanceRequestModalContent = (function (m, h, _, models, I18n) {
    var I18nScope = _.partial(h.i18nScope, 'users.balance');

    return {
        controller: function controller(args) {
            var vm = m.postgrest.filtersVM({ user_id: 'eq' }),
                balance = args.balance,
                loaderOpts = models.balanceTransfer.postOptions({
                user_id: balance.user_id }),
                requestLoader = m.postgrest.loaderWithToken(loaderOpts),
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

            return ctrl.loadBankA() ? h.loader() : m('div', _.map(ctrl.bankAccounts(), function (item) {
                return [m('.modal-dialog-header', [m('.fontsize-large.u-text-center', I18n.t('withdraw', I18nScope()))]), ctrl.displayDone() ? m('.modal-dialog-content.u-text-center', [m('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'), m('p.fontsize-large', I18n.t('sucess_message', I18nScope()))]) : m('.modal-dialog-content', [m('.fontsize-base.u-marginbottom-20', [m('span.fontweight-semibold', 'Valor:'), m.trust('&nbsp;'), m('span.text-success', 'R$ ' + h.formatNumber(balance.amount, 2, 3))]), m('.fontsize-base.u-marginbottom-10', [m('span', { style: { 'font-weight': ' 600' } }, I18n.t('bank.account', I18nScope()))]), m('.fontsize-small.u-marginbottom-10', [m('div', [m('span.fontcolor-secondary', I18n.t('bank.name', I18nScope())), m.trust('&nbsp;'), item.owner_name]), m('div', [m('span.fontcolor-secondary', I18n.t('bank.cpf_cnpj', I18nScope())), m.trust('&nbsp;'), item.owner_document]), m('div', [m('span.fontcolor-secondary', I18n.t('bank.bank_name', I18nScope())), m.trust('&nbsp;'), item.bank_name]), m('div', [m('span.fontcolor-secondary', I18n.t('bank.agency', I18nScope())), m.trust('&nbsp;'), item.agency + '-' + item.agency_digit]), m('div', [m('span.fontcolor-secondary', I18n.t('bank.account', I18nScope())), m.trust('&nbsp;'), item.account + '-' + item.account_digit])])]), !ctrl.displayDone() ? m('.modal-dialog-nav-bottom', [m('.w-row', [m('.w-col.w-col-3'), m('.w-col.w-col-6', [ctrl.requestLoader() ? h.loader() : m('a.btn.btn-large.btn-request-fund[href="js:void(0);"]', { onclick: ctrl.requestFund }, 'Solicitar saque')]), m('.w-col.w-col-3')])]) : ''];
            }));
        }
    };
})(window.m, window.c.h, window._, window.c.models, window.I18n);
'use strict';

window.c.UserBalanceTransactionRow = (function (m, h) {
    var I18nScope = _.partial(h.i18nScope, 'users.balance');

    return {
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

            return m('div[class=\'balance-card ' + (ctrl.expanded() ? 'card-detailed-open' : '') + '\']', m('.w-clearfix.card.card-clickable', [m('.w-row', [m('.w-col.w-col-2.w-col-tiny-2', [m('.fontsize-small.lineheight-tightest', createdAt.format('D MMM')), m('.fontsize-smallest.fontcolor-terciary', createdAt.format('YYYY'))]), m('.w-col.w-col-10.w-col-tiny-10', [m('.w-row', [m('.w-col.w-col-4', [m('div', [m('span.fontsize-smaller.fontcolor-secondary', I18n.t('debit', I18nScope())), m.trust('&nbsp;'), m('span.fontsize-base.text-error', 'R$ ' + h.formatNumber(Math.abs(item.debit), 2, 3))])]), m('.w-col.w-col-4', [m('div', [m('span.fontsize-smaller.fontcolor-secondary', I18n.t('credit', I18nScope())), m.trust('&nbsp;'), m('span.fontsize-base.text-success', 'R$ ' + h.formatNumber(item.credit, 2, 3))])]), m('.w-col.w-col-4', [m('div', [m('span.fontsize-smaller.fontcolor-secondary', I18n.t('totals', I18nScope())), m.trust('&nbsp;'), m('span.fontsize-base', 'R$ ' + h.formatNumber(item.total_amount, 2, 3))])])])])]), m('a.w-inline-block.arrow-admin.' + (ctrl.expanded() ? 'arrow-admin-opened' : '') + '.fa.fa-chevron-down.fontcolor-secondary[href="js:(void(0));"]', { onclick: ctrl.expanded.toggle })]), ctrl.expanded() ? m('.card', _.map(item.source, function (transaction) {
                var pos = transaction.amount >= 0;

                return m('div', [m('.w-row.fontsize-small.u-marginbottom-10', [m('.w-col.w-col-2', [m('.text-' + (pos ? 'success' : 'error'), (pos ? '+' : '-') + ' R$ ' + h.formatNumber(Math.abs(transaction.amount), 2, 3))]), m('.w-col.w-col-10', [m('div', transaction.event_name + ' ' + transaction.origin_object.name)])]), m('.divider.u-marginbottom-10')]);
            })) : '');
        }
    };
})(window.m, window.c.h);
'use strict';

window.c.UserBalanceTransactions = (function (m, h, models, _) {
    return {
        controller: function controller(args) {
            args.balanceTransactionManager.load();

            return {
                list: args.balanceTransactionManager.list
            };
        },
        view: function view(ctrl, args) {
            var list = ctrl.list;

            return m('.w-section.section.card-terciary.before-footer.balance-transactions-area', [m('.w-container', _.map(list.collection(), function (item, index) {
                return m.component(c.UserBalanceTransactionRow, { item: item, index: index });
            })), m('.container', [m('.w-row.u-margintop-40', [m('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
                onclick: list.nextPage
            }, 'Carregar mais') : h.loader()])])])]);
        }
    };
})(window.m, window.c.h, window.c.models, window._);
/**
 * window.c.UserBalance component
 * Render the current user total balance and request fund action
 *
 * Example:
 * m.component(c.UserBalance, {
 *     user_id: 123,
 * })
 */
'use strict';

window.c.UserBalance = (function (m, h, _, models, c) {
    var I18nScope = _.partial(h.i18nScope, 'users.balance');

    return {
        controller: function controller(args) {
            var displayModal = h.toggleProp(false, true);

            args.balanceManager.load();

            return {
                userBalances: args.balanceManager.collection,
                displayModal: displayModal
            };
        },
        view: function view(ctrl, args) {
            var balance = _.first(ctrl.userBalances()),
                balanceRequestModalC = ['UserBalanceRequestModalContent', _.extend({}, { balance: balance }, args)];

            return m('.w-section.section.user-balance-section', [ctrl.displayModal() ? m.component(c.ModalBox, {
                displayModal: ctrl.displayModal,
                content: balanceRequestModalC
            }) : '', m('.w-container', [m('.w-row', [m('.w-col.w-col-8.u-text-center-small-only.u-marginbottom-20', [m('.fontsize-larger', [I18n.t('totals', I18nScope()), m('span.text-success', 'R$ ' + h.formatNumber(balance.amount, 2, 3))])]), m('.w-col.w-col-4', [m('a[class="r-fund-btn w-button btn btn-medium u-marginbottom-10 ' + (balance.amount <= 0 ? 'btn-inactive' : '') + '"][href="js:void(0);"]', { onclick: balance.amount > 0 ? ctrl.displayModal.toggle : 'js:void(0);' }, I18n.t('withdraw_cta', I18nScope()))])])])]);
        }
    };
})(window.m, window.c.h, window._, window.c.models, window.c);
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
        controller: function controller(args) {
            var player = undefined;
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
            return m('#youtube-lightbox', [m('a#youtube-play.w-lightbox.w-inline-block.fa.fa-play-circle.fontcolor-negative.fa-5x[href=\'javascript:void(0);\']', {
                onclick: ctrl.showLightbox.toggle
            }), m('#lightbox.w-lightbox-backdrop[style="display:' + (ctrl.showLightbox() ? 'block' : 'none') + '"]', [m('.w-lightbox-container', [m('.w-lightbox-content', [m('.w-lightbox-view', [m('.w-lightbox-frame', [m('figure.w-lightbox-figure', [m('img.w-lightbox-img.w-lightbox-image[src=\'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22940%22%20height=%22528%22/%3E\']'), m('#ytvideo.embedly-embed.w-lightbox-embed', { config: ctrl.setYoutube })])])]), m('.w-lightbox-spinner.w-lightbox-hide'), m('.w-lightbox-control.w-lightbox-left.w-lightbox-inactive'), m('.w-lightbox-control.w-lightbox-right.w-lightbox-inactive'), m('#youtube-close.w-lightbox-control.w-lightbox-close', { onclick: ctrl.closeVideo })]), m('.w-lightbox-strip')])])]);
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
'use strict';

window.c.vms.projectFilters = (function (m, h, moment) {
    return function () {
        var filters = m.postgrest.filtersVM,
            nearMe = filters({
            near_me: 'eq',
            open_for_contributions: 'eq'
        }).open_for_contributions('true').near_me(true),
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
'use strict';

window.c.vms.project = (function (m, h, _, models) {
    return function (project_id, project_user_id) {
        var vm = m.postgrest.filtersVM({
            project_id: 'eq'
        }),
            idVM = h.idVM,
            projectDetails = m.prop([]),
            userDetails = m.prop([]),
            rewardDetails = m.prop([]);

        vm.project_id(project_id);
        idVM.id(project_user_id);

        var lProject = m.postgrest.loaderWithToken(models.projectDetail.getRowOptions(vm.parameters())),
            lUser = m.postgrest.loaderWithToken(models.userDetail.getRowOptions(idVM.parameters())),
            lReward = m.postgrest.loaderWithToken(models.rewardDetail.getPageOptions(vm.parameters())),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImMuanMiLCJoLmpzIiwibW9kZWxzLmpzIiwiZmxleC5qcyIsImluc2lnaHRzLmpzIiwiam9icy5qcyIsImxpdmUtc3RhdGlzdGljcy5qcyIsInByb2plY3RzLWRhc2hib2FyZC5qcyIsInByb2plY3RzLWV4cGxvcmUuanMiLCJwcm9qZWN0cy1ob21lLmpzIiwicHJvamVjdHMtc2hvdy5qcyIsInN0YXJ0LmpzIiwidGVhbS5qcyIsInVzZXJzLWJhbGFuY2UuanMiLCJhZG1pbi1jb250cmlidXRpb24tZGV0YWlsLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLWl0ZW0uanMiLCJhZG1pbi1jb250cmlidXRpb24tdXNlci5qcyIsImFkbWluLWNvbnRyaWJ1dGlvbi5qcyIsImFkbWluLWV4dGVybmFsLWFjdGlvbi5qcyIsImFkbWluLWZpbHRlci5qcyIsImFkbWluLWlucHV0LWFjdGlvbi5qcyIsImFkbWluLWl0ZW0uanMiLCJhZG1pbi1saXN0LmpzIiwiYWRtaW4tbm90aWZpY2F0aW9uLWhpc3RvcnkuanMiLCJhZG1pbi1wcm9qZWN0LWRldGFpbHMtY2FyZC5qcyIsImFkbWluLXByb2plY3QuanMiLCJhZG1pbi1yYWRpby1hY3Rpb24uanMiLCJhZG1pbi1yZXNldC1wYXNzd29yZC5qcyIsImFkbWluLXJld2FyZC5qcyIsImFkbWluLXRyYW5zYWN0aW9uLWhpc3RvcnkuanMiLCJhZG1pbi10cmFuc2FjdGlvbi5qcyIsImFkbWluLXVzZXItZGV0YWlsLmpzIiwiYWRtaW4tdXNlci1pdGVtLmpzIiwiYWRtaW4tdXNlci5qcyIsImNhdGVnb3J5LWJ1dHRvbi5qcyIsImRyb3Bkb3duLmpzIiwiZmlsdGVyLWJ1dHRvbi5qcyIsImZpbHRlci1kYXRlLXJhbmdlLmpzIiwiZmlsdGVyLWRyb3Bkb3duLmpzIiwiZmlsdGVyLW1haW4uanMiLCJmaWx0ZXItbnVtYmVyLXJhbmdlLmpzIiwibGFuZGluZy1xYS5qcyIsImxhbmRpbmctc2lnbnVwLmpzIiwibW9kYWwtYm94LmpzIiwicGF5bWVudC1zdGF0dXMuanMiLCJwb3Atbm90aWZpY2F0aW9uLmpzIiwicHJvamVjdC1hYm91dC5qcyIsInByb2plY3QtY2FyZC5qcyIsInByb2plY3QtY29tbWVudHMuanMiLCJwcm9qZWN0LWNvbnRyaWJ1dGlvbnMuanMiLCJwcm9qZWN0LWRhc2hib2FyZC1tZW51LmpzIiwicHJvamVjdC1kYXRhLWNoYXJ0LmpzIiwicHJvamVjdC1kYXRhLXN0YXRzLmpzIiwicHJvamVjdC1kYXRhLXRhYmxlLmpzIiwicHJvamVjdC1oZWFkZXIuanMiLCJwcm9qZWN0LWhpZ2hsaWdodC5qcyIsInByb2plY3QtbWFpbi5qcyIsInByb2plY3QtbW9kZS5qcyIsInByb2plY3QtcG9zdHMuanMiLCJwcm9qZWN0LXJlbWluZGVyLWNvdW50LmpzIiwicHJvamVjdC1yZW1pbmRlci5qcyIsInByb2plY3QtcmV3YXJkLWxpc3QuanMiLCJwcm9qZWN0LXJvdy5qcyIsInByb2plY3Qtc2hhcmUtYm94LmpzIiwicHJvamVjdC1zaWRlYmFyLmpzIiwicHJvamVjdC1zdWNjZXNzZnVsLW9uYm9hcmQtY29uZmlybS1hY2NvdW50LWFjY2VwdC5qcyIsInByb2plY3Qtc3VjY2Vzc2Z1bC1vbmJvYXJkLWNvbmZpcm0tYWNjb3VudC1hY3Rpb25zLmpzIiwicHJvamVjdC1zdWNjZXNzZnVsLW9uYm9hcmQtY29uZmlybS1hY2NvdW50LWVycm9yLmpzIiwicHJvamVjdC1zdWNjZXNzZnVsLW9uYm9hcmQtY29uZmlybS1hY2NvdW50LmpzIiwicHJvamVjdC1zdWNjZXNzZnVsLW9uYm9hcmQtZXJyb3ItYWNjb3VudC5qcyIsInByb2plY3Qtc3VjY2Vzc2Z1bC1vbmJvYXJkLWZpbmlzaGVkLmpzIiwicHJvamVjdC1zdWNjZXNzZnVsLW9uYm9hcmQtcGVuZGluZy10cmFuc2Zlci5qcyIsInByb2plY3Qtc3VjY2Vzc2Z1bC1vbmJvYXJkLXN0YXJ0LmpzIiwicHJvamVjdC1zdWNjZXNzZnVsLW9uYm9hcmQuanMiLCJwcm9qZWN0LXN1Z2dlc3RlZC1jb250cmlidXRpb25zLmpzIiwicHJvamVjdC10YWJzLmpzIiwicHJvamVjdC11c2VyLWNhcmQuanMiLCJzbGlkZXIuanMiLCJ0ZWFtLW1lbWJlcnMuanMiLCJ0ZWFtLXRvdGFsLmpzIiwidG9vbHRpcC5qcyIsInVzZXItYmFsYW5jZS1yZXF1ZXN0LW1vZGFsLWNvbnRlbnQuanMiLCJ1c2VyLWJhbGFuY2UtdHJhbnNhY3Rpb24tcm93LmpzIiwidXNlci1iYWxhbmNlLXRyYW5zYWN0aW9ucy5qcyIsInVzZXItYmFsYW5jZS5qcyIsInVzZXItY2FyZC5qcyIsInlvdXR1YmUtbGlnaHRib3guanMiLCJhZG1pbi9jb250cmlidXRpb25zLmpzIiwiYWRtaW4vdXNlcnMuanMiLCJ2bXMvcHJvamVjdC1maWx0ZXJzLmpzIiwidm1zL3Byb2plY3QuanMiLCJ2bXMvc3RhcnQuanMiLCJhZG1pbi9jb250cmlidXRpb25zL2NvbnRyaWJ1dGlvbi1maWx0ZXItdm0uanMiLCJhZG1pbi9jb250cmlidXRpb25zL2NvbnRyaWJ1dGlvbi1saXN0LXZtLmpzIiwiYWRtaW4vdXNlcnMvdXNlci1maWx0ZXItdm0uanMiLCJhZG1pbi91c2Vycy91c2VyLWxpc3Qtdm0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNLENBQUMsQ0FBQyxHQUFJLENBQUEsWUFBTTtBQUNkLFdBQU87QUFDSCxjQUFNLEVBQUUsRUFBRTtBQUNWLFlBQUksRUFBRSxFQUFFO0FBQ1IsV0FBRyxFQUFFLEVBQUU7QUFDUCxhQUFLLEVBQUUsRUFBRTtBQUNULFNBQUMsRUFBRSxFQUFFO0tBQ1IsQ0FBQztDQUNMLENBQUEsRUFBRSxBQUFDLENBQUM7OztBQ1JMLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBSzs7O0FBRy9CLFFBQU0sU0FBUyxHQUFHLFNBQVosU0FBUyxDQUFJLEdBQUcsRUFBSztBQUFFLGVBQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtB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QyxlQUFlLENBQUMsUUFBUSxHQUFHLFlBQVc7QUFDckMsWUFBSSxNQUFNLEdBQUcsYUFBYSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO0FBQ2pELGVBQU8sTUFBTSxJQUFJLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQztLQUMzRCxDQUFDOztBQUVGLFdBQU8sRUFBRSxDQUFDO0NBQ2IsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEFBQUMsQ0FBQzs7O0FDMUJ2QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxNQUFNLEVBQUU7QUFDN0MsV0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxFQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUMsQ0FBQyxDQUFDO0NBQ3RGLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEFBQUMsQ0FBQyIsImZpbGUiOiJjYXRhcnNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsid2luZG93LmMgPSAoKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIG1vZGVsczoge30sXG4gICAgICAgIHJvb3Q6IHt9LFxuICAgICAgICB2bXM6IHt9LFxuICAgICAgICBhZG1pbjoge30sXG4gICAgICAgIGg6IHt9XG4gICAgfTtcbn0oKSk7XG4iLCJ3aW5kb3cuYy5oID0gKChtLCBtb21lbnQsIEkxOG4pID0+IHtcbiAgICAvL0RhdGUgSGVscGVyc1xuXG4gICAgY29uc3QgaGFzaE1hdGNoID0gKHN0cikgPT4geyByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhhc2ggPT09IHN0cjsgfSxcbiAgICAgICAgcGFyYW1CeU5hbWUgPSAobmFtZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgbm9ybWFsTmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW10vLCAnXFxcXFsnKS5yZXBsYWNlKC9bXFxdXS8sICdcXFxcXScpLFxuICAgICAgICAgICAgICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnW1xcXFw/Jl0nICsgbm9ybWFsTmFtZSArICc9KFteJiNdKiknKSxcbiAgICAgICAgICAgICAgICByZXN1bHRzID0gcmVnZXguZXhlYyhsb2NhdGlvbi5zZWFyY2gpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHMgPT09IG51bGwgPyAnJyA6IGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzFdLnJlcGxhY2UoL1xcKy9nLCAnICcpKTtcbiAgICAgICAgfSxcblx0XHRzZWxmT3JFbXB0eSA9IChvYmosIGVtcHR5U3RhdGUgPSAnJykgPT4ge1xuICAgIHJldHVybiBvYmogPyBvYmogOiBlbXB0eVN0YXRlO1xuXHRcdH0sXG4gICAgICAgIHNldE1vbWVudGlmeUxvY2FsZSA9ICgpID0+IHtcbiAgICAgICAgICAgIG1vbWVudC5sb2NhbGUoJ3B0Jywge1xuICAgICAgICAgICAgICAgICAgICBtb250aHNTaG9ydDogJ2phbl9mZXZfbWFyX2Ficl9tYWlfanVuX2p1bF9hZ29fc2V0X291dF9ub3ZfZGV6Jy5zcGxpdCgnXycpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGV4aXN0eSA9ICh4KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geCAhPSBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vbWVudGlmeSA9IChkYXRlLCBmb3JtYXQpID0+IHtcbiAgICAgICAgICAgIGZvcm1hdCA9IGZvcm1hdCB8fCAnREQvTU0vWVlZWSc7XG4gICAgICAgICAgICByZXR1cm4gZGF0ZSA/IG1vbWVudChkYXRlKS5sb2NhbGUoJ3B0JykuZm9ybWF0KGZvcm1hdCkgOiAnbm8gZGF0ZSc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RvcmVBY3Rpb24gPSAoYWN0aW9uKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXNlc3Npb25TdG9yYWdlLmdldEl0ZW0oYWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKGFjdGlvbiwgYWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjYWxsU3RvcmVkQWN0aW9uID0gKGFjdGlvbiwgZnVuYykgPT4ge1xuICAgICAgICAgICAgaWYgKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oYWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIGZ1bmMuY2FsbCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKGFjdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzY3VzcyA9IChwYWdlLCBpZGVudGlmaWVyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkID0gZG9jdW1lbnQsXG4gICAgICAgICAgICAgICAgcyA9IGQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgICAgICB3aW5kb3cuZGlzcXVzX2NvbmZpZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFnZS51cmwgPSBwYWdlO1xuICAgICAgICAgICAgICAgIHRoaXMucGFnZS5pZGVudGlmaWVyID0gaWRlbnRpZmllcjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzLnNyYyA9ICcvL2NhdGFyc2VmbGV4LmRpc3F1cy5jb20vZW1iZWQuanMnO1xuICAgICAgICAgICAgcy5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGltZXN0YW1wJywgK25ldyBEYXRlKCkpO1xuICAgICAgICAgICAgKGQuaGVhZCB8fCBkLmJvZHkpLmFwcGVuZENoaWxkKHMpO1xuICAgICAgICAgICAgcmV0dXJuIG0oJycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vbWVudEZyb21TdHJpbmcgPSAoZGF0ZSwgZm9ybWF0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBldXJvcGVhbiA9IG1vbWVudChkYXRlLCBmb3JtYXQgfHwgJ0REL01NL1lZWVknKTtcbiAgICAgICAgICAgIHJldHVybiBldXJvcGVhbi5pc1ZhbGlkKCkgPyBldXJvcGVhbiA6IG1vbWVudChkYXRlKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0cmFuc2xhdGVkVGltZVVuaXRzID0ge1xuICAgICAgICAgICAgZGF5czogJ2RpYXMnLFxuICAgICAgICAgICAgbWludXRlczogJ21pbnV0b3MnLFxuICAgICAgICAgICAgaG91cnM6ICdob3JhcycsXG4gICAgICAgICAgICBzZWNvbmRzOiAnc2VndW5kb3MnXG4gICAgICAgIH0sXG4gICAgICAgIC8vT2JqZWN0IG1hbmlwdWxhdGlvbiBoZWxwZXJzXG4gICAgICAgIHRyYW5zbGF0ZWRUaW1lID0gKHRpbWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zbGF0ZWRUaW1lID0gdHJhbnNsYXRlZFRpbWVVbml0cyxcbiAgICAgICAgICAgICAgICB1bml0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9qVW5pdCA9IHRyYW5zbGF0ZWRUaW1lW3RpbWUudW5pdCB8fCAnc2Vjb25kcyddO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAodGltZS50b3RhbCA8PSAxKSA/IHByb2pVbml0LnNsaWNlKDAsIC0xKSA6IHByb2pVbml0O1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdW5pdDogdW5pdCgpLFxuICAgICAgICAgICAgICAgIHRvdGFsOiB0aW1lLnRvdGFsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vTnVtYmVyIGZvcm1hdHRpbmcgaGVscGVyc1xuICAgICAgICBnZW5lcmF0ZUZvcm1hdE51bWJlciA9IChzLCBjKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKG51bWJlciwgbiwgeCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghXy5pc051bWJlcihudW1iZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHJlID0gJ1xcXFxkKD89KFxcXFxkeycgKyAoeCB8fCAzKSArICd9KSsnICsgKG4gPiAwID8gJ1xcXFxEJyA6ICckJykgKyAnKScsXG4gICAgICAgICAgICAgICAgICAgIG51bSA9IG51bWJlci50b0ZpeGVkKE1hdGgubWF4KDAsIH5+bikpO1xuICAgICAgICAgICAgICAgIHJldHVybiAoYyA/IG51bS5yZXBsYWNlKCcuJywgYykgOiBudW0pLnJlcGxhY2UobmV3IFJlZ0V4cChyZSwgJ2cnKSwgJyQmJyArIChzIHx8ICcsJykpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgZm9ybWF0TnVtYmVyID0gZ2VuZXJhdGVGb3JtYXROdW1iZXIoJy4nLCAnLCcpLFxuXG4gICAgICAgIHRvZ2dsZVByb3AgPSAoZGVmYXVsdFN0YXRlLCBhbHRlcm5hdGVTdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcCA9IG0ucHJvcChkZWZhdWx0U3RhdGUpO1xuICAgICAgICAgICAgcC50b2dnbGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHAoKChwKCkgPT09IGFsdGVybmF0ZVN0YXRlKSA/IGRlZmF1bHRTdGF0ZSA6IGFsdGVybmF0ZVN0YXRlKSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgfSxcblxuICAgICAgICBpZFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgIGlkOiAnZXEnXG4gICAgICAgIH0pLFxuXG4gICAgICAgIGdldFVzZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKSxcbiAgICAgICAgICAgICAgICBkYXRhID0gXy5maXJzdChib2R5KS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXNlcicpO1xuICAgICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGxvY2F0aW9uQWN0aW9uTWF0Y2ggPSAoYWN0aW9uKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhY3QgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5zbGljZSgtMSlbMF07XG4gICAgICAgICAgICByZXR1cm4gYWN0aW9uID09PSBhY3Q7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXNlQXZhdGFyT3JEZWZhdWx0ID0gKGF2YXRhclBhdGgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhdmF0YXJQYXRoIHx8ICcvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL3VzZXIuanBnJztcbiAgICAgICAgfSxcblxuICAgICAgICAvL1RlbXBsYXRlc1xuICAgICAgICBsb2FkZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW50b3AtMzAgdS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgbSgnaW1nW2FsdD1cIkxvYWRlclwiXVtzcmM9XCJodHRwczovL3MzLmFtYXpvbmF3cy5jb20vY2F0YXJzZS5maWxlcy9sb2FkZXIuZ2lmXCJdJylcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5ld0ZlYXR1cmVCYWRnZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCdzcGFuLmJhZGdlLmJhZGdlLXN1Y2Nlc3MubWFyZ2luLXNpZGUtNScsIEkxOG4udCgncHJvamVjdHMubmV3X2ZlYXR1cmVfYmFkZ2UnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmJQYXJzZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRyeVBhcnNlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5GQi5YRkJNTC5wYXJzZSgpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5zZXRUaW1lb3V0KHRyeVBhcnNlLCA1MDApOyAvL3VzZSB0aW1lb3V0IHRvIHdhaXQgYXN5bmMgb2YgZmFjZWJvb2tcbiAgICAgICAgfSxcblxuICAgICAgICBwbHVyYWxpemUgPSAoY291bnQsIHMsIHApID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoY291bnQgPiAxID8gY291bnQgKyBwIDogY291bnQgKyBzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaW1wbGVGb3JtYXQgPSAoc3RyID0gJycpID0+IHtcbiAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXHJcXG4/LywgJ1xcbicpO1xuICAgICAgICAgICAgaWYgKHN0ci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcblxcbisvZywgJzwvcD48cD4nKTtcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxuL2csICc8YnIgLz4nKTtcbiAgICAgICAgICAgICAgICBzdHIgPSAnPHA+JyArIHN0ciArICc8L3A+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmV3YXJkU291bGRPdXQgPSAocmV3YXJkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgPiAwID9cbiAgICAgICAgICAgICAgICAocmV3YXJkLnBhaWRfY291bnQgKyByZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50ID49IHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMpIDogZmFsc2UpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJld2FyZFJlbWFuaW5nID0gKHJld2FyZCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgLSAocmV3YXJkLnBhaWRfY291bnQgKyByZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBwYXJzZVVybCA9IChocmVmKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgbC5ocmVmID0gaHJlZjtcbiAgICAgICAgICAgIHJldHVybiBsO1xuICAgICAgICB9LFxuXG4gICAgICAgIFVJSGVscGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCAmJiAkKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5VSUhlbHBlci5zZXR1cFJlc3BvbnNpdmVJZnJhbWVzKCQoZWwpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvQW5jaG9yID0gKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChoYXNoID09PSBlbC5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVsLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZhbGlkYXRlRW1haWwgPSAoZW1haWwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlID0gL14oKFtePD4oKVtcXF1cXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXC4sOzpcXHNAXFxcIl0rKSopfChcXFwiLitcXFwiKSlAKChbXjw+KClbXFxdXFwuLDs6XFxzQFxcXCJdK1xcLikrW148PigpW1xcXVxcLiw7Olxcc0BcXFwiXXsyLH0pJC9pO1xuICAgICAgICAgICAgcmV0dXJuIHJlLnRlc3QoZW1haWwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5hdmlnYXRlVG9EZXZpc2UgPSAoKSA9PiB7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvcHQvbG9naW4nO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGN1bXVsYXRpdmVPZmZzZXQgPSAoZWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHRvcCA9IDAsIGxlZnQgPSAwO1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIHRvcCArPSBlbGVtZW50Lm9mZnNldFRvcCAgfHwgMDtcbiAgICAgICAgICAgICAgICBsZWZ0ICs9IGVsZW1lbnQub2Zmc2V0TGVmdCB8fCAwO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50Lm9mZnNldFBhcmVudDtcbiAgICAgICAgICAgIH0gd2hpbGUgKGVsZW1lbnQpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xvc2VNb2RhbCA9ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ21vZGFsLWNsb3NlJylbMF07XG4gICAgICAgICAgICBpZiAoXy5pc0VsZW1lbnQoZWwpKXtcbiAgICAgICAgICAgICAgICBlbC5vbmNsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWwtYmFja2Ryb3AnKVswXS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsb3NlRmxhc2ggPSAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdpY29uLWNsb3NlJylbMF07XG4gICAgICAgICAgICBpZiAoXy5pc0VsZW1lbnQoZWwpKXtcbiAgICAgICAgICAgICAgICBlbC5vbmNsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgZWwucGFyZW50RWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBpMThuU2NvcGUgPSAoc2NvcGUsIG9iaikgPT4ge1xuICAgICAgICAgICAgb2JqID0gb2JqIHx8IHt9O1xuICAgICAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBvYmosIHtzY29wZTogc2NvcGV9KTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWRyYXdIYXNoQ2hhbmdlID0gKGJlZm9yZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2FsbGJhY2sgPSBfLmlzRnVuY3Rpb24oYmVmb3JlKSA/XG4gICAgICAgICAgICAgICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBiZWZvcmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICB9IDogbS5yZWRyYXc7XG5cbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhdXRoZW50aWNpdHlUb2tlbiA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1ldGEgPSBfLmZpcnN0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tuYW1lPWNzcmYtdG9rZW5dJykpO1xuICAgICAgICAgICAgcmV0dXJuIG1ldGEgPyBtZXRhLmNvbnRlbnQgOiB1bmRlZmluZWQ7XG4gICAgICAgIH0sXG4gICAgICAgIGFuaW1hdGVTY3JvbGxUbyA9IChlbCkgPT4ge1xuICAgICAgICAgICAgbGV0IHNjcm9sbGVkID0gd2luZG93LnNjcm9sbFk7XG5cbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IGN1bXVsYXRpdmVPZmZzZXQoZWwpLnRvcCxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbiA9IDMwMCxcbiAgICAgICAgICAgICAgICBkRnJhbWUgPSAob2Zmc2V0IC0gc2Nyb2xsZWQpIC8gZHVyYXRpb24sXG4gICAgICAgICAgICAgICAgLy9FYXNlSW5PdXRDdWJpYyBlYXNpbmcgZnVuY3Rpb24uIFdlJ2xsIGFic3RyYWN0IGFsbCBhbmltYXRpb24gZnVucyBsYXRlci5cbiAgICAgICAgICAgICAgICBlYXNlZCA9ICh0KSA9PiB0IDwgLjUgPyA0ICogdCAqIHQgKiB0IDogKHQgLSAxKSAqICgyICogdCAtIDIpICogKDIgKiB0IC0gMikgKyAxLFxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbiA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBvcyA9IGVhc2VkKHNjcm9sbGVkIC8gb2Zmc2V0KSAqIHNjcm9sbGVkO1xuXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCBwb3MpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzY3JvbGxlZCA+PSBvZmZzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoYW5pbWF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbGVkID0gc2Nyb2xsZWQgKyBkRnJhbWU7XG4gICAgICAgICAgICAgICAgfSwgMSk7XG4gICAgICAgIH0sXG4gICAgICAgIHNjcm9sbFRvID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2V0VHJpZ2dlciA9IChlbCwgYW5jaG9ySWQpID0+IHtcbiAgICAgICAgICAgICAgICBlbC5vbmNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhbmNob3JFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFuY2hvcklkKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc0VsZW1lbnQoYW5jaG9yRWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlU2Nyb2xsVG8oYW5jaG9yRWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRyaWdnZXIoZWwsIGVsLmhhc2guc2xpY2UoMSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgcHJvamVjdFN0YXRlVGV4dENsYXNzID0gKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGF0dXNUZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBvbmxpbmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC1zdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdOTyBBUidcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ0ZJTkFOQ0lBRE8nXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGZhaWxlZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LWVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdOw4NPIEZJTkFOQ0lBRE8nXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHdhaXRpbmdfZnVuZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC13YWl0aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdBR1VBUkRBTkRPJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZWplY3RlZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LWVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdSRUNVU0FETydcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZHJhZnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdSQVNDVU5ITydcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgaW5fYW5hbHlzaXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdFTSBBTsOBTElTRSdcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgYXBwcm92ZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC1zdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdBUFJPVkFETydcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBzdGF0dXNUZXh0W3N0YXRlXTtcbiAgICAgICAgfTtcblxuICAgIHNldE1vbWVudGlmeUxvY2FsZSgpO1xuICAgIGNsb3NlRmxhc2goKTtcbiAgICBjbG9zZU1vZGFsKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhdXRoZW50aWNpdHlUb2tlbjogYXV0aGVudGljaXR5VG9rZW4sXG4gICAgICAgIGN1bXVsYXRpdmVPZmZzZXQ6IGN1bXVsYXRpdmVPZmZzZXQsXG4gICAgICAgIGRpc2N1c3M6IGRpc2N1c3MsXG4gICAgICAgIGV4aXN0eTogZXhpc3R5LFxuICAgICAgICB2YWxpZGF0ZUVtYWlsOiB2YWxpZGF0ZUVtYWlsLFxuICAgICAgICBtb21lbnRpZnk6IG1vbWVudGlmeSxcbiAgICAgICAgbW9tZW50RnJvbVN0cmluZzogbW9tZW50RnJvbVN0cmluZyxcbiAgICAgICAgZm9ybWF0TnVtYmVyOiBmb3JtYXROdW1iZXIsXG4gICAgICAgIGlkVk06IGlkVk0sXG4gICAgICAgIGdldFVzZXI6IGdldFVzZXIsXG4gICAgICAgIHRvZ2dsZVByb3A6IHRvZ2dsZVByb3AsXG4gICAgICAgIGxvYWRlcjogbG9hZGVyLFxuICAgICAgICBuZXdGZWF0dXJlQmFkZ2U6IG5ld0ZlYXR1cmVCYWRnZSxcbiAgICAgICAgZmJQYXJzZTogZmJQYXJzZSxcbiAgICAgICAgcGx1cmFsaXplOiBwbHVyYWxpemUsXG4gICAgICAgIHNpbXBsZUZvcm1hdDogc2ltcGxlRm9ybWF0LFxuICAgICAgICB0cmFuc2xhdGVkVGltZTogdHJhbnNsYXRlZFRpbWUsXG4gICAgICAgIHJld2FyZFNvdWxkT3V0OiByZXdhcmRTb3VsZE91dCxcbiAgICAgICAgcmV3YXJkUmVtYW5pbmc6IHJld2FyZFJlbWFuaW5nLFxuICAgICAgICBwYXJzZVVybDogcGFyc2VVcmwsXG4gICAgICAgIGhhc2hNYXRjaDogaGFzaE1hdGNoLFxuICAgICAgICByZWRyYXdIYXNoQ2hhbmdlOiByZWRyYXdIYXNoQ2hhbmdlLFxuICAgICAgICB1c2VBdmF0YXJPckRlZmF1bHQ6IHVzZUF2YXRhck9yRGVmYXVsdCxcbiAgICAgICAgbG9jYXRpb25BY3Rpb25NYXRjaDogbG9jYXRpb25BY3Rpb25NYXRjaCxcbiAgICAgICAgbmF2aWdhdGVUb0RldmlzZTogbmF2aWdhdGVUb0RldmlzZSxcbiAgICAgICAgc3RvcmVBY3Rpb246IHN0b3JlQWN0aW9uLFxuICAgICAgICBjYWxsU3RvcmVkQWN0aW9uOiBjYWxsU3RvcmVkQWN0aW9uLFxuICAgICAgICBVSUhlbHBlcjogVUlIZWxwZXIsXG4gICAgICAgIHRvQW5jaG9yOiB0b0FuY2hvcixcbiAgICAgICAgcGFyYW1CeU5hbWU6IHBhcmFtQnlOYW1lLFxuICAgICAgICBpMThuU2NvcGU6IGkxOG5TY29wZSxcbiAgICAgICAgc2VsZk9yRW1wdHk6IHNlbGZPckVtcHR5LFxuICAgICAgICBzY3JvbGxUbzogc2Nyb2xsVG8sXG4gICAgICAgIHByb2plY3RTdGF0ZVRleHRDbGFzczogcHJvamVjdFN0YXRlVGV4dENsYXNzXG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5tb21lbnQsIHdpbmRvdy5JMThuKSk7XG4iLCJ3aW5kb3cuYy5tb2RlbHMgPSAoZnVuY3Rpb24obSkge1xuICAgIHZhciBjb250cmlidXRpb25EZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgnY29udHJpYnV0aW9uX2RldGFpbHMnKSxcbiAgICAgICAgcHJvamVjdERldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2RldGFpbHMnKSxcbiAgICAgICAgdXNlckRldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCd1c2VyX2RldGFpbHMnKSxcbiAgICAgICAgYmFsYW5jZSA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdiYWxhbmNlcycpLFxuICAgICAgICBiYWxhbmNlVHJhbnNhY3Rpb24gPSBtLnBvc3RncmVzdC5tb2RlbCgnYmFsYW5jZV90cmFuc2FjdGlvbnMnKSxcbiAgICAgICAgYmFsYW5jZVRyYW5zZmVyID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2JhbGFuY2VfdHJhbnNmZXJzJyksXG4gICAgICAgIHVzZXIgPSBtLnBvc3RncmVzdC5tb2RlbCgndXNlcnMnKSxcbiAgICAgICAgYmFua0FjY291bnQgPSBtLnBvc3RncmVzdC5tb2RlbCgnYmFua19hY2NvdW50cycpLFxuICAgICAgICByZXdhcmREZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgncmV3YXJkX2RldGFpbHMnKSxcbiAgICAgICAgcHJvamVjdFJlbWluZGVyID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfcmVtaW5kZXJzJyksXG4gICAgICAgIGNvbnRyaWJ1dGlvbnMgPSBtLnBvc3RncmVzdC5tb2RlbCgnY29udHJpYnV0aW9ucycpLFxuICAgICAgICB0ZWFtVG90YWwgPSBtLnBvc3RncmVzdC5tb2RlbCgndGVhbV90b3RhbHMnKSxcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbiA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2NvbnRyaWJ1dGlvbnMnKSxcbiAgICAgICAgcHJvamVjdFBvc3REZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9wb3N0c19kZXRhaWxzJyksXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb25zUGVyRGF5ID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9uc19wZXJfZGF5JyksXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb24gPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zX3Blcl9sb2NhdGlvbicpLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlclJlZiA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2NvbnRyaWJ1dGlvbnNfcGVyX3JlZicpLFxuICAgICAgICBwcm9qZWN0ID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RzJyksXG4gICAgICAgIHByb2plY3RBY2NvdW50ID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfYWNjb3VudHMnKSxcbiAgICAgICAgcHJvamVjdEFjY291bnRFcnJvciA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2FjY291bnRfZXJyb3JzJyksXG4gICAgICAgIHByb2plY3RUcmFuc2ZlciA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X3RyYW5zZmVycycpLFxuICAgICAgICBwcm9qZWN0U2VhcmNoID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3JwYy9wcm9qZWN0X3NlYXJjaCcpLFxuICAgICAgICBjYXRlZ29yeSA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjYXRlZ29yaWVzJyksXG4gICAgICAgIGNhdGVnb3J5VG90YWxzID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NhdGVnb3J5X3RvdGFscycpLFxuICAgICAgICBjYXRlZ29yeUZvbGxvd2VyID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NhdGVnb3J5X2ZvbGxvd2VycycpLFxuICAgICAgICB0ZWFtTWVtYmVyID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3RlYW1fbWVtYmVycycpLFxuICAgICAgICBub3RpZmljYXRpb24gPSBtLnBvc3RncmVzdC5tb2RlbCgnbm90aWZpY2F0aW9ucycpLFxuICAgICAgICBzdGF0aXN0aWMgPSBtLnBvc3RncmVzdC5tb2RlbCgnc3RhdGlzdGljcycpO1xuXG4gICAgdGVhbU1lbWJlci5wYWdlU2l6ZSg0MCk7XG4gICAgcmV3YXJkRGV0YWlsLnBhZ2VTaXplKGZhbHNlKTtcbiAgICBwcm9qZWN0LnBhZ2VTaXplKDMwKTtcbiAgICBjYXRlZ29yeS5wYWdlU2l6ZSg1MCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cmlidXRpb25EZXRhaWw6IGNvbnRyaWJ1dGlvbkRldGFpbCxcbiAgICAgICAgcHJvamVjdERldGFpbDogcHJvamVjdERldGFpbCxcbiAgICAgICAgdXNlckRldGFpbDogdXNlckRldGFpbCxcbiAgICAgICAgYmFsYW5jZTogYmFsYW5jZSxcbiAgICAgICAgYmFsYW5jZVRyYW5zYWN0aW9uOiBiYWxhbmNlVHJhbnNhY3Rpb24sXG4gICAgICAgIGJhbGFuY2VUcmFuc2ZlcjogYmFsYW5jZVRyYW5zZmVyLFxuICAgICAgICBiYW5rQWNjb3VudDogYmFua0FjY291bnQsXG4gICAgICAgIHVzZXI6IHVzZXIsXG4gICAgICAgIHJld2FyZERldGFpbDogcmV3YXJkRGV0YWlsLFxuICAgICAgICBjb250cmlidXRpb25zOiBjb250cmlidXRpb25zLFxuICAgICAgICB0ZWFtVG90YWw6IHRlYW1Ub3RhbCxcbiAgICAgICAgdGVhbU1lbWJlcjogdGVhbU1lbWJlcixcbiAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgcHJvamVjdEFjY291bnQ6IHByb2plY3RBY2NvdW50LFxuICAgICAgICBwcm9qZWN0QWNjb3VudEVycm9yOiBwcm9qZWN0QWNjb3VudEVycm9yLFxuICAgICAgICBwcm9qZWN0VHJhbnNmZXI6IHByb2plY3RUcmFuc2ZlcixcbiAgICAgICAgcHJvamVjdFNlYXJjaDogcHJvamVjdFNlYXJjaCxcbiAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5LFxuICAgICAgICBjYXRlZ29yeVRvdGFsczogY2F0ZWdvcnlUb3RhbHMsXG4gICAgICAgIGNhdGVnb3J5Rm9sbG93ZXI6IGNhdGVnb3J5Rm9sbG93ZXIsXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb25zUGVyRGF5OiBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheSxcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbjogcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbixcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJSZWY6IHByb2plY3RDb250cmlidXRpb25zUGVyUmVmLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uOiBwcm9qZWN0Q29udHJpYnV0aW9uLFxuICAgICAgICBwcm9qZWN0UG9zdERldGFpbDogcHJvamVjdFBvc3REZXRhaWwsXG4gICAgICAgIHByb2plY3RSZW1pbmRlcjogcHJvamVjdFJlbWluZGVyLFxuICAgICAgICBub3RpZmljYXRpb246IG5vdGlmaWNhdGlvbixcbiAgICAgICAgc3RhdGlzdGljOiBzdGF0aXN0aWNcbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMucm9vdC5GbGV4ID0gKGZ1bmN0aW9uKG0sIGMsIGgsIG1vZGVscykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIHByb2plY3RzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBsID0gbS5wcm9wKCksXG4gICAgICAgICAgICAgICAgc2FtcGxlMyA9IF8ucGFydGlhbChfLnNhbXBsZSwgXywgMyksXG4gICAgICAgICAgICAgICAgYnVpbGRlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgY3VzdG9tQWN0aW9uOiAnLy9jYXRhcnNlLnVzNS5saXN0LW1hbmFnZS5jb20vc3Vic2NyaWJlL3Bvc3Q/dT1lYmZjZDBkMTZkYmIwMDAxYTBiZWEzNjM5JmFtcDtpZD04YTRjMWEzM2NlJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYWRkRGlzcXVzID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaC5kaXNjdXNzKCdodHRwczovL2NhdGFyc2UubWUvZmxleCcsICdmbGV4X3BhZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZmxleFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogJ2VxJyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdlcScsXG4gICAgICAgICAgICAgICAgICAgIHJlY29tbWVuZGVkOiAnZXEnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgc3RhdHNMb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnN0YXRpc3RpYy5nZXRSb3dPcHRpb25zKCkpO1xuXG4gICAgICAgICAgICBmbGV4Vk0ubW9kZSgnZmxleCcpLnN0YXRlKCdvbmxpbmUnKS5yZWNvbW1lbmRlZCh0cnVlKTtcblxuICAgICAgICAgICAgY29uc3QgcHJvamVjdHNMb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXIobW9kZWxzLnByb2plY3QuZ2V0UGFnZU9wdGlvbnMoZmxleFZNLnBhcmFtZXRlcnMoKSkpO1xuXG4gICAgICAgICAgICBzdGF0c0xvYWRlci5sb2FkKCkudGhlbihzdGF0cyk7XG5cbiAgICAgICAgICAgIHByb2plY3RzTG9hZGVyLmxvYWQoKS50aGVuKF8uY29tcG9zZShwcm9qZWN0cywgc2FtcGxlMykpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGFkZERpc3F1czogYWRkRGlzcXVzLFxuICAgICAgICAgICAgICAgIGJ1aWxkZXI6IGJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgc3RhdHNMb2FkZXI6IHN0YXRzTG9hZGVyLFxuICAgICAgICAgICAgICAgIHN0YXRzOiBzdGF0cyxcbiAgICAgICAgICAgICAgICBwcm9qZWN0c0xvYWRlcjogcHJvamVjdHNMb2FkZXIsXG4gICAgICAgICAgICAgICAgcHJvamVjdHM6IHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyOiBwcm9qZWN0c0xvYWRlcixcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogcHJvamVjdHNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICBsZXQgc3RhdHMgPSBfLmZpcnN0KGN0cmwuc3RhdHMoKSk7XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uaGVyby1mdWxsLmhlcm8temVsbycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcubG9nby1mbGV4LWhvbWVbc3JjPVxcJy9hc3NldHMvbG9nby1mbGV4LnBuZ1xcJ11bd2lkdGg9XFwnMzU5XFwnXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS02MC53LWNvbC1wdXNoLTIudy1jb2wtOCcsICdWYW1vcyBjb25zdHJ1aXIgdW1hIG5vdmEgbW9kYWxpZGFkZSBkZSBjcm93ZGZ1bmRpbmcgcGFyYSBvIENhdGFyc2UhICBKdW50ZS1zZSBhIG7Ds3MsIGluc2NyZXZhIHNldSBlbWFpbCEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdTaWdudXAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRlcjogY3RybC5idWlsZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VzdC51LW1hcmdpbnRvcC00MC51LXRleHQtY2VudGVyJywgJ1ByYSBxdWVtIHNlcsOhPycpLCBtKCcuZm9udHNpemUtYmFzZS51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTYwJywgJ0luaWNpYXJlbW9zIGEgZmFzZSBkZSB0ZXN0ZXMgY29tIGNhdGVnb3JpYXMgZGUgcHJvamV0b3MgZXNwZWPDrWZpY2FzJyksIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZ1tzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NjBlMzkzYTAxYjY2ZTI1MGFjYTY3Y2JfaWNvbi16ZWxvLWNvbS5wbmdcXCddW3dpZHRoPVxcJzIxMFxcJ10nKSwgbSgnLmZvbnRzaXplLWxhcmdlc3QubGluZWhlaWdodC1sb29zZScsICdDYXVzYXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCdwLmZvbnRzaXplLWJhc2UnLCAnRmxleGliaWxpZGFkZSBwYXJhIGNhdXNhcyBkZSBpbXBhY3RvISBFc3RhcmVtb3MgYWJlcnRvcyBhIGNhbXBhbmhhcyBkZSBvcmdhbml6YcOnw7VlcyBvdSBwZXNzb2FzIGbDrXNpY2FzIHBhcmEgYXJyZWNhZGHDp8OjbyBkZSByZWN1cnNvcyBwYXJhIGNhdXNhcyBwZXNzb2FpcywgcHJvamV0b3MgYXNzaXN0ZW5jaWFsaXN0YXMsIHNhw7pkZSwgYWp1ZGFzIGh1bWFuaXTDoXJpYXMsIHByb3Rlw6fDo28gYW9zIGFuaW1haXMsIGVtcHJlZW5kZWRvcmlzbW8gc29jaW9hbWJpZW50YWwsIGF0aXZpc21vIG91IHF1YWxxdWVyIGNvaXNhIHF1ZSB1bmEgYXMgcGVzc29hcyBwYXJhIGZhemVyIG8gYmVtLicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZ1tzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NjBlMzkyOWEwZGFlYTIzMGE1ZjEyY2RfaWNvbi16ZWxvLXBlc3NvYWwucG5nXFwnXVt3aWR0aD1cXCcyMTBcXCddJyksIG0oJy5mb250c2l6ZS1sYXJnZXN0LmxpbmVoZWlnaHQtbG9vc2UnLCAnVmFxdWluaGFzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgncC5mb250c2l6ZS1iYXNlJywgJ0NhbXBhbmhhcyBzaW1wbGVzIHF1ZSBwcmVjaXNhbSBkZSBmbGV4aWJpbGlkYWRlIHBhcmEgYXJyZWNhZGFyIGRpbmhlaXJvIGNvbSBwZXNzb2FzIHByw7N4aW1hcy4gRXN0YXJlbW9zIGFiZXJ0b3MgYSB1bWEgdmFyaWVkYWRlIGRlIGNhbXBhbmhhcyBwZXNzb2FpcyBxdWUgcG9kZW0gaXIgZGVzZGUgY29icmlyIGN1c3RvcyBkZSBlc3R1ZG9zIGEgYWp1ZGFyIHF1ZW0gcHJlY2lzYSBkZSB0cmF0YW1lbnRvIG3DqWRpY28uIERlIGp1bnRhciBhIGdyYW5hIHBhcmEgZmF6ZXIgYXF1ZWxhIGZlc3RhIGEgY29tcHJhciBwcmVzZW50ZXMgcGFyYSBhbGd1w6ltIGNvbSBhIGFqdWRhIGRhIGdhbGVyYS4gJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1zZWN0aW9uLnNlY3Rpb24uYmctZ3JlZW5saW1lLmZvbnRjb2xvci1uZWdhdGl2ZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VzdC51LW1hcmdpbnRvcC00MC51LW1hcmdpbmJvdHRvbS02MC51LXRleHQtY2VudGVyJywgJ0NvbW8gZnVuY2lvbmFyw6E/JyksIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5YzU3OGIyODQ0OTNlMmE0MjhhX3plbG8tbW9uZXkucG5nXFwnXVt3aWR0aD1cXCcxODBcXCddJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAudS10ZXh0LWNlbnRlci5mb250d2VpZ2h0LXNlbWlib2xkJywgJ0ZpcXVlIGNvbSBxdWFudG8gYXJyZWNhZGFyJyksIG0oJ3AudS10ZXh0LWNlbnRlci5mb250c2l6ZS1iYXNlJywgJ08gZmxleCDDqSBwYXJhIGltcHVsc2lvbmFyIGNhbXBhbmhhcyBvbmRlIHRvZG8gZGluaGVpcm8gw6kgYmVtIHZpbmRvISBWb2PDqiBmaWNhIGNvbSB0dWRvIHF1ZSBjb25zZWd1aXIgYXJyZWNhZGFyLicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZ1tzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NjBlMzlkMzdjMDEzZDRhM2VlNjg3ZDJfaWNvbi1yZXdhcmQucG5nXFwnXVt3aWR0aD1cXCcxODBcXCddJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAudS10ZXh0LWNlbnRlci5mb250d2VpZ2h0LXNlbWlib2xkJywgJ07Do28gcHJlY2lzYSBkZSByZWNvbXBlbnNhcycpLCBtKCdwLnUtdGV4dC1jZW50ZXIuZm9udHNpemUtYmFzZScsICdObyBmbGV4IG9mZXJlY2VyIHJlY29tcGVuc2FzIMOpIG9wY2lvbmFsLiBWb2PDqiBlc2NvbGhlIHNlIG9mZXJlY8OqLWxhcyBmYXogc2VudGlkbyBwYXJhIG8gc2V1IHByb2pldG8gZSBjYW1wYW5oYS4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2MGUzOWZiMDFiNjZlMjUwYWNhNjdlM19pY29uLWN1cmFkLnBuZ1xcJ11bd2lkdGg9XFwnMTgwXFwnXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwLnUtdGV4dC1jZW50ZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsICdWb2PDqiBtZXNtbyBwdWJsaWNhIHNldSBwcm9qZXRvJyksIG0oJ3AudS10ZXh0LWNlbnRlci5mb250c2l6ZS1iYXNlJywgJ1RvZG9zIG9zIHByb2pldG9zIGluc2NyaXRvcyBubyBmbGV4IGVudHJhbSBubyBhci4gQWdpbGlkYWRlIGUgZmFjaWxpZGFkZSBwYXJhIHZvY8OqIGNhcHRhciByZWN1cnNvcyBhdHJhdsOpcyBkYSBpbnRlcm5ldC4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5ZTc3YzAxM2Q0YTNlZTY4N2Q0X2ljb24tdGltZS5wbmdcXCddW3dpZHRoPVxcJzE4MFxcJ10nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC51LXRleHQtY2VudGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnRW5jZXJyZSBhIGNhbXBhbmhhIHF1YW5kbyBxdWlzZXInKSwgbSgncC51LXRleHQtY2VudGVyLmZvbnRzaXplLWJhc2UnLCAnTsOjbyBow6EgbGltaXRlIGRlIHRlbXBvIGRlIGNhcHRhw6fDo28uIFZvY8OqIGVzY29saGUgIHF1YW5kbyBlbmNlcnJhciBzdWEgY2FtcGFuaGEgZSByZWNlYmVyIG9zIHZhbG9yZXMgYXJyZWNhZGFkb3MuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1lZGl0YWJsZS5mb250c2l6ZS1sYXJnZXIudS1tYXJnaW50b3AtNDAudS1tYXJnaW4tYm90dG9tLTQwLnUtdGV4dC1jZW50ZXInLCAnQ29uaGXDp2EgYWxndW5zIGRvcyBwcmltZWlyb3MgcHJvamV0b3MgZmxleCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwucHJvamVjdHNMb2FkZXIoKSA/IGgubG9hZGVyKCkgOiBtLmNvbXBvbmVudChjLlByb2plY3RSb3csIHtjb2xsZWN0aW9uOiBjdHJsLnByb2plY3RzLCByZWY6ICdjdHJzZV9mbGV4Jywgd3JhcHBlcjogJy53LXJvdy51LW1hcmdpbnRvcC00MCd9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uZGl2aWRlcicpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTYwLnUtbWFyZ2ludG9wLTQwJywgJ0TDunZpZGFzJyksIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiAnUXVhaXMgc8OjbyBhcyB0YXhhcyBkYSBtb2RhbGlkYWRlIGZsZXjDrXZlbD8gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdDb21vIG5vIENhdGFyc2UsIGVudmlhciB1bSBwcm9qZXRvIG7Do28gY3VzdGEgbmFkYSEgRXN0YW1vcyBlc3R1ZGFuZG8gb3DDp8O1ZXMgcGFyYSBlbnRlbmRlciBxdWFsIHNlcsOhIGEgdGF4YSBjb2JyYWRhIG5vIHNlcnZpw6dvIENhdGFyc2UgZmxleC4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdEZSBvbmRlIHZlbSBvIGRpbmhlaXJvIGRvIG1ldSBwcm9qZXRvPycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiAnRmFtw61saWEsIGFtaWdvcywgZsOjcyBlIG1lbWJyb3MgZGUgY29tdW5pZGFkZXMgcXVlIHZvY8OqIGZheiBwYXJ0ZSBzw6NvIHNldXMgbWFpb3JlcyBjb2xhYm9yYWRvcmVzLiBTw6NvIGVsZXMgcXVlIGlyw6NvIGRpdnVsZ2FyIHN1YSBjYW1wYW5oYSBwYXJhIGFzIHBlc3NvYXMgcXVlIGVsZXMgY29uaGVjZW0sIGUgYXNzaW0gbyBjw61yY3VsbyBkZSBhcG9pYWRvcmVzIHZhaSBhdW1lbnRhbmRvIGUgYSBzdWEgY2FtcGFuaGEgZ2FuaGEgZm9yw6dhLidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogJ1F1YWwgYSBkaWZlcmVuw6dhIGVudHJlIG8gZmxleMOtdmVsIGUgbyBcInR1ZG8gb3UgbmFkYVwiPycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiAnQXR1YWxtZW50ZSBvIENhdGFyc2UgdXRpbGl6YSBhcGVuYXMgbyBtb2RlbG8gXCJ0dWRvIG91IG5hZGFcIiwgb25kZSB2b2PDqiBzw7MgZmljYSBjb20gbyBkaW5oZWlybyBzZSBiYXRlciBhIG1ldGEgZGUgYXJyZWNhZGHDp8OjbyBkZW50cm8gZG8gcHJhem8gZGEgY2FtcGFuaGEuIE8gbW9kZWxvIGZsZXjDrXZlbCDDqSBkaWZlcmVudGUgcG9pcyBwZXJtaXRlIHF1ZSBvIHJlYWxpemFkb3IgZmlxdWUgY29tIG8gcXVlIGFycmVjYWRhciwgaW5kZXBlbmRlbnRlIGRlIGF0aW5naXIgb3UgbsOjbyBhIG1ldGEgZG8gcHJvamV0byBubyBwcmF6byBkYSBjYW1wYW5oYS4gTsOjbyBoYXZlcsOhIGxpbWl0ZSBkZSB0ZW1wbyBwYXJhIGFzIGNhbXBhbmhhcy4gTm9zc28gc2lzdGVtYSBmbGV4w612ZWwgc2Vyw6EgYWxnbyBub3ZvIGVtIHJlbGHDp8OjbyBhb3MgbW9kZWxvcyBxdWUgZXhpc3RlbSBhdHVhbG1lbnRlIG5vIG1lcmNhZG8uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdQb3NzbyBpbnNjcmV2ZXIgcHJvamV0b3MgcGFyYSBhIG1vZGFsaWRhZGUgZmxleMOtdmVsIGrDoT8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogJ1BvciBlbnF1YW50byBuw6NvLiBBIG1vZGFsaWRhZGUgZmxleCBzZXLDoSB0ZXN0YWRhIGNvbSBhbGd1bnMgcHJvamV0b3MgZXNwZWPDrWZpY29zLiBJbnNjcmV2YSBzZXUgZW1haWwgZSBwYXJ0aWNpcGUgZGEgY29udmVyc2EgbmVzc2EgcMOhZ2luYSBwYXJhIHJlY2ViZXIgaW5mb3JtYcOnw7VlcywgbWF0ZXJpYWlzLCBhY29tcGFuaGFyIHByb2pldG9zIGVtIHRlc3RlIGUgc2FiZXIgY29tIGFudGVjZWTDqm5jaWEgYSBkYXRhIGRlIGxhbsOnYW1lbnRvIGRvIGZsZXguJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiAnUG9yIHF1w6ogdm9jw6pzIHF1ZXJlbSBmYXplciBvIENhdGFyc2UgZmxleD8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogJ0FjcmVkaXRhbW9zIHF1ZSBvIGFtYmllbnRlIGRvIGNyb3dkZnVuZGluZyBicmFzaWxlaXJvIGFpbmRhIHRlbSBlc3Bhw6dvIHBhcmEgbXVpdGFzIGHDp8O1ZXMsIHRlc3RlcyBlIGV4cGVyaW1lbnRhw6fDtWVzIHBhcmEgZW50ZW5kZXIgZGUgZmF0byBvIHF1ZSBhcyBwZXNzb2FzIHByZWNpc2FtLiBTb25oYW1vcyBjb20gdG9ybmFyIG8gZmluYW5jaWFtZW50byBjb2xldGl2byB1bSBow6FiaXRvIG5vIEJyYXNpbC4gTyBDYXRhcnNlIGZsZXggw6kgbWFpcyB1bSBwYXNzbyBuZXNzYSBkaXJlw6fDo28uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiAnUXVhbmRvIHZvY8OqcyBpcsOjbyBsYW7Dp2FyIG8gQ2F0YXJzZSBmbGV4PycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiAnQWluZGEgbsOjbyBzYWJlbW9zIHF1YW5kbyBhYnJpcmVtb3MgbyBmbGV4IHBhcmEgbyBww7pibGljby4gSXJlbW9zIHByaW1laXJhbWVudGUgcGFzc2FyIHBvciB1bSBwZXLDrW9kbyBkZSB0ZXN0ZXMgZSBkZXBvaXMgZXN0YWJlbGVjZXIgdW1hIGRhdGEgZGUgbGFuw6dhbWVudG8uIFNlIHZvY8OqIGRlc2VqYSBhY29tcGFuaGFyIGUgcmVjZWJlciBub3TDrWNpYXMgc29icmUgZXNzYSBjYW1pbmhhZGEsIGluc2NyZXZhIHNldSBlbWFpbCBuZXNzYSBww6FnaW5hLidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24tbGFyZ2UudS10ZXh0LWNlbnRlci5iZy1wdXJwbGUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIuZm9udGNvbG9yLW5lZ2F0aXZlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0JywgJ0ZpcXVlIHBvciBkZW50cm8hJyksIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTYwJywgJ1JlY2ViYSBub3TDrWNpYXMgZSBhY29tcGFuaGUgYSBldm9sdcOnw6NvIGRvIENhdGFyc2UgZmxleCcpLCBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1NpZ251cCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRlcjogY3RybC5idWlsZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1zZWN0aW9uLnNlY3Rpb24tb25lLWNvbHVtbi5iZy1jYXRhcnNlLXplbG8uc2VjdGlvbi1sYXJnZVtzdHlsZT1cIm1pbi1oZWlnaHQ6IDUwdmg7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZWRpdGFibGUudS1tYXJnaW5ib3R0b20tNDAuZm9udHNpemUtbGFyZ2VyLmxpbmVoZWlnaHQtdGlnaHQuZm9udGNvbG9yLW5lZ2F0aXZlJywgJ08gZmxleCDDqSB1bSBleHBlcmltZW50byBlIGluaWNpYXRpdmEgZG8gQ2F0YXJzZSwgbWFpb3IgcGxhdGFmb3JtYSBkZSBjcm93ZGZ1bmRpbmcgZG8gQnJhc2lsLicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LXRleHQtY2VudGVyJywgKGN0cmwuc3RhdHNMb2FkZXIoKSkgPyBoLmxvYWRlcigpIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1iby50ZXh0LXN1Y2Nlc3MubGluZWhlaWdodC1sb29zZScsIGguZm9ybWF0TnVtYmVyKHN0YXRzLnRvdGFsX2NvbnRyaWJ1dG9ycywgMCwgMykpLCBtKCdwLnN0YXJ0LXN0YXRzLmZvbnRzaXplLWJhc2UuZm9udGNvbG9yLW5lZ2F0aXZlJywgJ1Blc3NvYXMgamEgYXBvaWFyYW0gcGVsbyBtZW5vcyAwMSBwcm9qZXRvIG5vIENhdGFyc2UnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtanVtYm8udGV4dC1zdWNjZXNzLmxpbmVoZWlnaHQtbG9vc2UnLCBoLmZvcm1hdE51bWJlcihzdGF0cy50b3RhbF9wcm9qZWN0c19zdWNjZXNzLCAwLCAzKSksIG0oJ3Auc3RhcnQtc3RhdHMuZm9udHNpemUtYmFzZS5mb250Y29sb3ItbmVnYXRpdmUnLCAnUHJvamV0b3MgamEgZm9yYW0gZmluYW5jaWFkb3Mgbm/CoENhdGFyc2UnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtanVtYm8udGV4dC1zdWNjZXNzLmxpbmVoZWlnaHQtbG9vc2UnLCBzdGF0cy50b3RhbF9jb250cmlidXRlZC50b1N0cmluZygpLnNsaWNlKDAsIDIpICsgJyBtaWxow7VlcycpLCBtKCdwLnN0YXJ0LXN0YXRzLmZvbnRzaXplLWJhc2UuZm9udGNvbG9yLW5lZ2F0aXZlJywgJ0ZvcmFtIGludmVzdGlkb3MgZW0gaWRlaWFzIHB1YmxpY2FkYXMgbm8gQ2F0YXJzZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24uYmctYmx1ZS1vbmUuZm9udGNvbG9yLW5lZ2F0aXZlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ1JlY29tZW5kZSBvIENhdGFyc2UgZmxleCBwYXJhIGFtaWdvcyEgJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNi53LXN1Yi1jb2wtbWlkZGxlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcuaWNvbi1zaGFyZS1tb2JpbGVbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTNhM2Y2NmUwNWViNjE0NDE3MWQ4ZWRiX2ZhY2Vib29rLXh4bC5wbmdcXCddJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLnctYnV0dG9uLmJ0bi5idG4tbGFyZ2UuYnRuLWZiW2hyZWY9XCJodHRwOi8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIvc2hhcmVyLnBocD91PWh0dHBzOi8vd3d3LmNhdGFyc2UubWUvZmxleD9yZWY9ZmFjZWJvb2smdGl0bGU9JyArIGVuY29kZVVSSUNvbXBvbmVudCgnQ29uaGXDp2EgbyBub3ZvIENhdGFyc2UgRmxleCEnKSArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0NvbXBhcnRpbGhhcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy5pY29uLXNoYXJlLW1vYmlsZVtzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81M2EzZjY1MTA1ZWI2MTQ0MTcxZDhlZGFfdHdpdHRlci0yNTYucG5nXFwnXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS53LWJ1dHRvbi5idG4uYnRuLWxhcmdlLmJ0bi10d2VldFtocmVmPVwiaHR0cDovL3R3aXR0ZXIuY29tLz9zdGF0dXM9JyArIGVuY29kZVVSSUNvbXBvbmVudCgnVmFtb3MgY29uc3RydWlyIHVtYSBub3ZhIG1vZGFsaWRhZGUgZGUgY3Jvd2RmdW5kaW5nIHBhcmEgbyBDYXRhcnNlISBKdW50ZS1zZSBhIG7Ds3MsIGluc2NyZXZhIHNldSBlbWFpbCEnKSArICdodHRwczovL3d3dy5jYXRhcnNlLm1lL2ZsZXg/cmVmPXR3aXR0ZXJcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1R1aXRhcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1zZWN0aW9uLnNlY3Rpb24tbGFyZ2UuYmctZ3JlZW5saW1lJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNwYXJ0aWNpcGUtZG8tZGViYXRlLnUtdGV4dC1jZW50ZXInLCB7Y29uZmlnOiBoLnRvQW5jaG9yKCl9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2gxLmZvbnRzaXplLWxhcmdlc3QuZm9udGNvbG9yLW5lZ2F0aXZlJywnQ29uc3RydWEgbyBmbGV4IGNvbm9zY28nKSwgbSgnLmZvbnRzaXplLWJhc2UudS1tYXJnaW5ib3R0b20tNjAuZm9udGNvbG9yLW5lZ2F0aXZlJywgJ0luaWNpZSB1bWEgY29udmVyc2EsIHBlcmd1bnRlLCBjb21lbnRlLCBjcml0aXF1ZSBlIGZhw6dhIHN1Z2VzdMO1ZXMhJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjZGlzcXVzX3RocmVhZC5jYXJkLnUtcmFkaXVzW3N0eWxlPVwibWluLWhlaWdodDogNTB2aDtcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC5hZGREaXNxdXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLnJvb3QuSW5zaWdodHMgPSAoKG0sIGMsIGgsIG1vZGVscywgXywgSTE4bikgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3Byb2plY3RzLmluc2lnaHRzJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IGZpbHRlcnNWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBpbnNpZ2h0c1ZNID0gYy5JbnNpZ2h0c1ZNLFxuICAgICAgICAgICAgICAgIHByb2plY3REZXRhaWxzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb25zUGVyRGF5ID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb25zUGVyTG9jYXRpb24gPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIGxvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbjtcblxuICAgICAgICAgICAgZmlsdGVyc1ZNLnByb2plY3RfaWQoYXJncy5yb290LmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpKTtcblxuICAgICAgICAgICAgY29uc3QgbCA9IGxvYWRlcihtb2RlbHMucHJvamVjdERldGFpbC5nZXRSb3dPcHRpb25zKGZpbHRlcnNWTS5wYXJhbWV0ZXJzKCkpKTtcbiAgICAgICAgICAgIGwubG9hZCgpLnRoZW4ocHJvamVjdERldGFpbHMpO1xuXG4gICAgICAgICAgICBjb25zdCBsQ29udHJpYnV0aW9uc1BlckRheSA9IGxvYWRlcihtb2RlbHMucHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXkuZ2V0Um93T3B0aW9ucyhmaWx0ZXJzVk0ucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICBsQ29udHJpYnV0aW9uc1BlckRheS5sb2FkKCkudGhlbihjb250cmlidXRpb25zUGVyRGF5KTtcblxuICAgICAgICAgICAgbGV0IGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvblRhYmxlID0gW1snRXN0YWRvJywgJ0Fwb2lvcycsICdSJCBhcG9pYWRvcyAoJSBkbyB0b3RhbCknXV07XG4gICAgICAgICAgICBjb25zdCBidWlsZFBlckxvY2F0aW9uVGFibGUgPSAoY29udHJpYnV0aW9ucykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAoIV8uaXNFbXB0eShjb250cmlidXRpb25zKSkgPyBfLm1hcChfLmZpcnN0KGNvbnRyaWJ1dGlvbnMpLnNvdXJjZSwgKGNvbnRyaWJ1dGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29sdW1uID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgY29sdW1uLnB1c2goY29udHJpYnV0aW9uLnN0YXRlX2Fjcm9ueW0gfHwgJ091dHJvL290aGVyJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKGNvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uLnB1c2goW2NvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRlZCxbLy9BZGRpbmcgcm93IHdpdGggY3VzdG9tIGNvbXBhcmF0b3IgPT4gcmVhZCBwcm9qZWN0LWRhdGEtdGFibGUgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIG0oYGlucHV0W3R5cGU9XCJoaWRkZW5cIl1bdmFsdWU9XCIke2NvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRlZH1cImApLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1IkICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWQsIDIsIDMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgJyAoJyArIGNvbnRyaWJ1dGlvbi50b3RhbF9vbl9wZXJjZW50YWdlLnRvRml4ZWQoMikgKyAnJSknKVxuICAgICAgICAgICAgICAgICAgICBdXSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZS5wdXNoKGNvbHVtbik7XG4gICAgICAgICAgICAgICAgfSkgOiBbXTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGxDb250cmlidXRpb25zUGVyTG9jYXRpb24gPSBsb2FkZXIobW9kZWxzLnByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb24uZ2V0Um93T3B0aW9ucyhmaWx0ZXJzVk0ucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICBsQ29udHJpYnV0aW9uc1BlckxvY2F0aW9uLmxvYWQoKS50aGVuKGJ1aWxkUGVyTG9jYXRpb25UYWJsZSk7XG5cbiAgICAgICAgICAgIGxldCBjb250cmlidXRpb25zUGVyUmVmVGFibGUgPSBbW1xuICAgICAgICAgICAgICAgIEkxOG4udCgncmVmX3RhYmxlLmhlYWRlci5vcmlnaW4nLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgSTE4bi50KCdyZWZfdGFibGUuaGVhZGVyLmNvbnRyaWJ1dGlvbnMnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgSTE4bi50KCdyZWZfdGFibGUuaGVhZGVyLmFtb3VudCcsIEkxOG5TY29wZSgpKVxuICAgICAgICAgICAgXV07XG4gICAgICAgICAgICBjb25zdCBidWlsZFBlclJlZlRhYmxlID0gKGNvbnRyaWJ1dGlvbnMpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCFfLmlzRW1wdHkoY29udHJpYnV0aW9ucykpID8gXy5tYXAoXy5maXJzdChjb250cmlidXRpb25zKS5zb3VyY2UsIChjb250cmlidXRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmUgPSAvKGN0cnNlX1thLXpdKikvLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGVzdCA9IHJlLmV4ZWMoY29udHJpYnV0aW9uLnJlZmVycmFsX2xpbmspO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb2x1bW4gPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGVzdCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb24ucmVmZXJyYWxfbGluayA9IHRlc3RbMF07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb2x1bW4ucHVzaChjb250cmlidXRpb24ucmVmZXJyYWxfbGluayA/IEkxOG4udCgncmVmZXJyYWwuJyArIGNvbnRyaWJ1dGlvbi5yZWZlcnJhbF9saW5rLCBJMThuU2NvcGUoe2RlZmF1bHRWYWx1ZTogY29udHJpYnV0aW9uLnJlZmVycmFsX2xpbmt9KSkgOiBJMThuLnQoJ3JlZmVycmFsLm90aGVycycsIEkxOG5TY29wZSgpKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKGNvbnRyaWJ1dGlvbi50b3RhbCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKFtjb250cmlidXRpb24udG90YWxfYW1vdW50LFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oYGlucHV0W3R5cGU9XCJoaWRkZW5cIl1bdmFsdWU9XCIke2NvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRlZH1cImApLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1IkICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24udG90YWxfYW1vdW50LCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsICcgKCcgKyBjb250cmlidXRpb24udG90YWxfb25fcGVyY2VudGFnZS50b0ZpeGVkKDIpICsgJyUpJylcbiAgICAgICAgICAgICAgICAgICAgXV0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29udHJpYnV0aW9uc1BlclJlZlRhYmxlLnB1c2goY29sdW1uKTtcbiAgICAgICAgICAgICAgICB9KSA6IFtdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgbENvbnRyaWJ1dGlvbnNQZXJSZWYgPSBsb2FkZXIobW9kZWxzLnByb2plY3RDb250cmlidXRpb25zUGVyUmVmLmdldFJvd09wdGlvbnMoZmlsdGVyc1ZNLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgbENvbnRyaWJ1dGlvbnNQZXJSZWYubG9hZCgpLnRoZW4oYnVpbGRQZXJSZWZUYWJsZSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGV4cGxhbmF0aW9uTW9kZUNvbXBvbmVudCA9IChwcm9qZWN0TW9kZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vZGVzID0ge1xuICAgICAgICAgICAgICAgICAgICAnYW9uJzogYy5Bb25BZG1pblByb2plY3REZXRhaWxzRXhwbGFuYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICdmbGV4JzogYy5GbGV4QWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBtb2Rlc1twcm9qZWN0TW9kZV07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGw6IGwsXG4gICAgICAgICAgICAgICAgbENvbnRyaWJ1dGlvbnNQZXJSZWY6IGxDb250cmlidXRpb25zUGVyUmVmLFxuICAgICAgICAgICAgICAgIGxDb250cmlidXRpb25zUGVyTG9jYXRpb246IGxDb250cmlidXRpb25zUGVyTG9jYXRpb24sXG4gICAgICAgICAgICAgICAgbENvbnRyaWJ1dGlvbnNQZXJEYXk6IGxDb250cmlidXRpb25zUGVyRGF5LFxuICAgICAgICAgICAgICAgIGZpbHRlcnNWTTogZmlsdGVyc1ZNLFxuICAgICAgICAgICAgICAgIHByb2plY3REZXRhaWxzOiBwcm9qZWN0RGV0YWlscyxcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb25zUGVyRGF5OiBjb250cmlidXRpb25zUGVyRGF5LFxuICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvblRhYmxlOiBjb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZSxcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb25zUGVyUmVmVGFibGU6IGNvbnRyaWJ1dGlvbnNQZXJSZWZUYWJsZSxcbiAgICAgICAgICAgICAgICBleHBsYW5hdGlvbk1vZGVDb21wb25lbnQ6IGV4cGxhbmF0aW9uTW9kZUNvbXBvbmVudFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBfLmZpcnN0KGN0cmwucHJvamVjdERldGFpbHMoKSksXG4gICAgICAgICAgICAgICAgICB0b29sdGlwID0gKGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuVG9vbHRpcCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBlbDogZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJbmZvcm1hIGRlIG9uZGUgdmllcmFtIG9zIGFwb2lvcyBkZSBzZXUgcHJvamV0by4gU2FpYmEgY29tbyB1c2FyIGVzc2EgdGFiZWxhIGUgcGxhbmVqYXIgbWVsaG9yIHN1YXMgYcOnw7VlcyBkZSBjb211bmljYcOnw6NvICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhW2hyZWY9XCIke0kxOG4udCgncmVmX3RhYmxlLmhlbHBfdXJsJywgSTE4blNjb3BlKCkpfVwiXVt0YXJnZXQ9J19ibGFuayddYCwgJ2FxdWkuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDM4MFxuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LWluc2lnaHRzJywgIWN0cmwubCgpID8gW1xuICAgICAgICAgICAgICAgIChwcm9qZWN0LmlzX293bmVyX29yX2FkbWluID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0RGFzaGJvYXJkTWVudSwge1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBtLnByb3AocHJvamVjdClcbiAgICAgICAgICAgICAgICB9KSA6ICcnKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIChwcm9qZWN0LnN0YXRlID09ICdzdWNjZXNzZnVsJyA/IG0uY29tcG9uZW50KGMuUHJvamVjdFN1Y2Nlc3NmdWxPbmJvYXJkLCB7cHJvamVjdDogcHJvamVjdH0pXG4gICAgICAgICAgICAgICAgICAgICA6IG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LmRhc2hib2FyZC1oZWFkZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2VyLmxpbmVoZWlnaHQtbG9vc2VyLnUtbWFyZ2luYm90dG9tLTEwJywgSTE4bi50KCdjYW1wYWlnbl90aXRsZScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AuJyArIHByb2plY3Quc3RhdGUgKyAnLXByb2plY3QtdGV4dC5mb250c2l6ZS1zbWFsbC5saW5laGVpZ2h0LWxvb3NlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5tb2RlID09PSAnZmxleCcgJiYgXy5pc051bGwocHJvamVjdC5leHBpcmVzX2F0KSAmJiBwcm9qZWN0LnN0YXRlICE9PSAnZHJhZnQnID8gbSgnc3BhbicsIFtJMThuLnQoJ2ZpbmlzaF9leHBsYW5hdGlvbicsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDY1MDc4NjMtQ2F0YXJzZS1mbGV4LVByaW5jaXBhaXMtcGVyZ3VudGFzLWUtcmVzcG9zdGFzLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBJMThuLnQoJ2tub3dfbW9yZScsIEkxOG5TY29wZSgpKSldKSA6IG0udHJ1c3QoSTE4bi50KGBjYW1wYWlnbi4ke3Byb2plY3QubW9kZX0uJHtwcm9qZWN0LnN0YXRlfWAsIEkxOG5TY29wZSh7dXNlcm5hbWU6IHByb2plY3QudXNlci5uYW1lLCBleHBpcmVzX2F0OiBoLm1vbWVudGlmeShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCksIHNlbnRfdG9fYW5hbHlzaXNfYXQ6IGgubW9tZW50aWZ5KHByb2plY3Quc2VudF90b19hbmFseXNpc19hdCl9KSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKVxuICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIF0pLCAocHJvamVjdC5pc19wdWJsaXNoZWQpID8gW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZGl2aWRlcicpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24tb25lLWNvbHVtbi5zZWN0aW9uLmJnLWdyYXkuYmVmb3JlLWZvb3RlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3REYXRhU3RhdHMsIHtwcm9qZWN0OiBwcm9qZWN0fSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21pbi1oZWlnaHQnOiAnMzAwcHgnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFjdHJsLmxDb250cmlidXRpb25zUGVyRGF5KCkgPyBtLmNvbXBvbmVudChjLlByb2plY3REYXRhQ2hhcnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJEYXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IEkxOG4udCgnYW1vdW50X3Blcl9kYXlfbGFiZWwnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YUtleTogJ3RvdGFsX2Ftb3VudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeEF4aXM6IChpdGVtKSA9PiBoLm1vbWVudGlmeShpdGVtLnBhaWRfYXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSA6IGgubG9hZGVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21pbi1oZWlnaHQnOiAnMzAwcHgnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFjdHJsLmxDb250cmlidXRpb25zUGVyRGF5KCkgPyBtLmNvbXBvbmVudChjLlByb2plY3REYXRhQ2hhcnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJEYXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IEkxOG4udCgnY29udHJpYnV0aW9uc19wZXJfZGF5X2xhYmVsJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFLZXk6ICd0b3RhbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeEF4aXM6IChpdGVtKSA9PiBoLm1vbWVudGlmeShpdGVtLnBhaWRfYXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSA6IGgubG9hZGVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LWNvbnRyaWJ1dGlvbnMtcGVyLXJlZicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJMThuLnQoJ3JlZl9vcmlnaW5fdGl0bGUnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgubmV3RmVhdHVyZUJhZGdlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXAoJ3NwYW4uZm9udHNpemUtc21hbGxlc3QudG9vbHRpcC13cmFwcGVyLmZhLmZhLXF1ZXN0aW9uLWNpcmNsZS5mb250Y29sb3Itc2Vjb25kYXJ5JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhY3RybC5sQ29udHJpYnV0aW9uc1BlclJlZigpID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0RGF0YVRhYmxlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhYmxlOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJSZWZUYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFNvcnRJbmRleDogLTJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSA6IGgubG9hZGVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1jb250cmlidXRpb25zLXBlci1yZWYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlcicsIEkxOG4udCgnbG9jYXRpb25fb3JpZ2luX3RpdGxlJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhY3RybC5sQ29udHJpYnV0aW9uc1BlckxvY2F0aW9uKCkgPyBtLmNvbXBvbmVudChjLlByb2plY3REYXRhVGFibGUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFibGU6IGN0cmwuY29udHJpYnV0aW9uc1BlckxvY2F0aW9uVGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRTb3J0SW5kZXg6IC0yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmVtaW5kZXJDb3VudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdIDogJydcbiAgICAgICAgICAgIF0gOiBoLmxvYWRlcigpKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuXywgd2luZG93LkkxOG4pKTtcbiIsIndpbmRvdy5jLnJvb3QuSm9icyA9ICgobSwgSTE4biwgaCkgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3BhZ2VzLmpvYnMnKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG5cbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5oZXJvLWpvYnMuaGVyby1tZWRpdW0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lLnUtdGV4dC1jZW50ZXInLFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy5pY29uLWhlcm9bc3JjPVwiL2Fzc2V0cy9sb2dvLXdoaXRlLnBuZ1wiXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAuZm9udHNpemUtbGFyZ2VzdCcsIEkxOG4udCgndGl0bGUnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS1tYXJnaW50b3AtNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtcHVzaC0yLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsIEkxOG4udCgnaW5mbycsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaHJlZj1cIi9wcm9qZWN0cy9uZXdcIl0udy1idXR0b24uYnRuLmJ0bi1sYXJnZS5idG4taW5saW5lJywgSTE4bi50KCdjdGEnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LkkxOG4sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLnJvb3QuTGl2ZVN0YXRpc3RpY3MgPSAoKG0sIG1vZGVscywgaCwgXywgSlNPTikgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzID0ge30pID0+IHtcbiAgICAgICAgICAgIGxldCBwYWdlU3RhdGlzdGljcyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uRGF0YSA9IG0ucHJvcCh7fSk7XG5cbiAgICAgICAgICAgIG1vZGVscy5zdGF0aXN0aWMuZ2V0Um93KCkudGhlbihwYWdlU3RhdGlzdGljcyk7XG4gICAgICAgICAgICAvLyBhcmdzLnNvY2tldCBpcyBhIHNvY2tldCBwcm92aWRlZCBieSBzb2NrZXQuaW9cbiAgICAgICAgICAgIC8vIGNhbiBzZWUgdGhlcmUgaHR0cHM6Ly9naXRodWIuY29tL2NhdGFyc2UvY2F0YXJzZS1saXZlL2Jsb2IvbWFzdGVyL3B1YmxpYy9pbmRleC5qcyNMOFxuICAgICAgICAgICAgaWYgKGFyZ3Muc29ja2V0ICYmIF8uaXNGdW5jdGlvbihhcmdzLnNvY2tldC5vbikpIHtcbiAgICAgICAgICAgICAgICBhcmdzLnNvY2tldC5vbignbmV3X3BhaWRfY29udHJpYnV0aW9ucycsIChtc2cpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uRGF0YShKU09OLnBhcnNlKG1zZy5wYXlsb2FkKSk7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVscy5zdGF0aXN0aWMuZ2V0Um93KCkudGhlbihwYWdlU3RhdGlzdGljcyk7XG4gICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcGFnZVN0YXRpc3RpY3M6IHBhZ2VTdGF0aXN0aWNzLFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkRhdGE6IG5vdGlmaWNhdGlvbkRhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICBsZXQgZGF0YSA9IGN0cmwubm90aWZpY2F0aW9uRGF0YSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctc2VjdGlvbi5iZy1zdGF0cy5zZWN0aW9uLm1pbi1oZWlnaHQtMTAwJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgXy5tYXAoY3RybC5wYWdlU3RhdGlzdGljcygpLCAoc3RhdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW20oJ2ltZy51LW1hcmdpbmJvdHRvbS02MFtzcmM9XCJodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU1YWRhNWRkMTFiMzZhNTI2MTZkOTdkZl9zeW1ib2wtY2F0YXJzZS5wbmdcIl0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3ItbmVnYXRpdmUudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLW1lZ2FqdW1iby5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1IkICcgKyBoLmZvcm1hdE51bWJlcihzdGF0LnRvdGFsX2NvbnRyaWJ1dGVkLCAyLCAzKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlJywgJ0RvYWRvcyBwYXJhIHByb2pldG9zIHB1YmxpY2Fkb3MgcG9yIGFxdWknKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udHdlaWdodC1zZW1pYm9sZCcsIHN0YXQudG90YWxfY29udHJpYnV0b3JzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UnLCAnUGVzc29hcyBqw6EgYXBvaWFyYW0gcGVsbyBtZW5vcyAxIHByb2pldG8gbm8gQ2F0YXJzZScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIH0pKSwgKCFfLmlzRW1wdHkoZGF0YSkgPyBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLnUtcmFkaXVzLnUtbWFyZ2luYm90dG9tLTYwLm1lZGl1bScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi51LXJvdW5kW3NyYz1cIicgKyBoLnVzZUF2YXRhck9yRGVmYXVsdChkYXRhLnVzZXJfaW1hZ2UpICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtc21hbGwtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBkYXRhLnVzZXJfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnUtdGV4dC1jZW50ZXIuZm9udHNpemUtYmFzZS51LW1hcmdpbnRvcC0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsICdhY2Fib3UgZGUgYXBvaWFyIG8nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QudS1yYWRpdXNbc3JjPVwiJyArIGRhdGEucHJvamVjdF9pbWFnZSArICdcIl1bd2lkdGg9XCI3NVwiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtc21hbGwtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBkYXRhLnByb2plY3RfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlci5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC5mb250Y29sb3ItbmVnYXRpdmUnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW4uZm9udGNvbG9yLW5lZ2F0aXZlW2hyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vY2F0YXJzZVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWdpdGh1YicsICcuJyksICcgT3BlbiBTb3VyY2UgY29tIG9yZ3VsaG8hICdcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93Ll8sIHdpbmRvdy5KU09OKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLnJvb3QuUHJvamVjdHNEYXNoYm9hcmQgY29tcG9uZW50XG4gKiBBIHJvb3QgY29tcG9uZW50IHRvIG1hbmFnZSBwcm9qZWN0c1xuICpcbiAqIEV4YW1wbGU6XG4gKiBUbyBtb3VudCB0aGlzIGNvbXBvbmVudCBqdXN0IGNyZWF0ZSBhIERPTSBlbGVtZW50IGxpa2U6XG4gKiA8ZGl2IGRhdGEtbWl0aHJpbD1cIlByb2plY3RzRGFzaGJvYXJkXCI+XG4gKi9cbndpbmRvdy5jLnJvb3QuUHJvamVjdHNEYXNoYm9hcmQgPSAoKG0sIGMsIGgsIF8sIHZtcykgPT4ge1xuICAgIHJldHVybiB7XG5cbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB2bXMucHJvamVjdChhcmdzLnByb2plY3RfaWQsIGFyZ3MucHJvamVjdF91c2VyX2lkKTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGN0cmwucHJvamVjdERldGFpbHM7XG4gICAgICAgICAgICByZXR1cm4gcHJvamVjdCgpLmlzX293bmVyX29yX2FkbWluID9cbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3REYXNoYm9hcmRNZW51LCB7cHJvamVjdDogcHJvamVjdH0pIDogJyc7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cuYy52bXMpKTtcbiIsIi8qKlxuICogd2luZG93LmMucm9vdC5Qcm9qZWN0c0V4cGxvcmUgY29tcG9uZW50XG4gKiBBIHJvb3QgY29tcG9uZW50IHRvIHNob3cgcHJvamVjdHMgYWNjb3JkaW5nIHRvIHVzZXIgZGVmaW5lZCBmaWx0ZXJzXG4gKlxuICogRXhhbXBsZTpcbiAqIFRvIG1vdW50IHRoaXMgY29tcG9uZW50IGp1c3QgY3JlYXRlIGEgRE9NIGVsZW1lbnQgbGlrZTpcbiAqIDxkaXYgZGF0YS1taXRocmlsPVwiUHJvamVjdHNFeHBsb3JlXCI+XG4gKi9cbndpbmRvdy5jLnJvb3QuUHJvamVjdHNFeHBsb3JlID0gKChtLCBjLCBoLCBfLCBtb21lbnQpID0+IHtcbiAgICByZXR1cm4ge1xuXG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcnMgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0sXG4gICAgICAgICAgICAgICAgICBmb2xsb3cgPSBjLm1vZGVscy5jYXRlZ29yeUZvbGxvd2VyLFxuICAgICAgICAgICAgICAgICAgZmlsdGVyc01hcCA9IGMudm1zLnByb2plY3RGaWx0ZXJzKCksXG4gICAgICAgICAgICAgICAgICBjYXRlZ29yeUNvbGxlY3Rpb24gPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgICAgLy8gRmFrZSBwcm9qZWN0cyBvYmplY3QgdG8gYmUgYWJsZSB0byByZW5kZXIgcGFnZSB3aGlsZSBsb2FkZGluZyAoaW4gY2FzZSBvZiBzZWFyY2gpXG4gICAgICAgICAgICAgICAgICBwcm9qZWN0cyA9IG0ucHJvcCh7Y29sbGVjdGlvbjogbS5wcm9wKFtdKSwgaXNMb2FkaW5nOiAoKSA9PiB7IHJldHVybiB0cnVlOyB9LCBpc0xhc3RQYWdlOiAoKSA9PiB7IHJldHVybiB0cnVlOyB9fSksXG4gICAgICAgICAgICAgICAgICB0aXRsZSA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlJZCA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgICAgZmluZENhdGVnb3J5ID0gKGlkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uZmluZChjYXRlZ29yeUNvbGxlY3Rpb24oKSwgZnVuY3Rpb24oYyl7IHJldHVybiBjLmlkID09PSBwYXJzZUludChpZCk7IH0pO1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gXy5jb21wb3NlKGZpbmRDYXRlZ29yeSwgY2F0ZWdvcnlJZCksXG5cbiAgICAgICAgICAgICAgICAgIGxvYWRDYXRlZ29yaWVzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjLm1vZGVscy5jYXRlZ29yeS5nZXRQYWdlV2l0aFRva2VuKGZpbHRlcnMoe30pLm9yZGVyKHtuYW1lOiAnYXNjJ30pLnBhcmFtZXRlcnMoKSkudGhlbihjYXRlZ29yeUNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgZm9sbG93Q2F0ZWdvcnkgPSAoaWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xsb3cucG9zdFdpdGhUb2tlbih7Y2F0ZWdvcnlfaWQ6IGlkfSkudGhlbihsb2FkQ2F0ZWdvcmllcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHVuRm9sbG93Q2F0ZWdvcnkgPSAoaWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xsb3cuZGVsZXRlV2l0aFRva2VuKGZpbHRlcnMoe2NhdGVnb3J5X2lkOiAnZXEnfSkuY2F0ZWdvcnlfaWQoaWQpLnBhcmFtZXRlcnMoKSkudGhlbihsb2FkQ2F0ZWdvcmllcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgbG9hZFJvdXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvdXRlID0gd2luZG93LmxvY2F0aW9uLmhhc2gubWF0Y2goL1xcIyhbXlxcL10qKVxcLz8oXFxkKyk/LyksXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXQgPSByb3V0ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZVsyXSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5kQ2F0ZWdvcnkocm91dGVbMl0pLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRnJvbVJvdXRlID0gICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBieUNhdGVnb3J5ID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZV9vcmRlcjogJ2d0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeV9pZDogJ2VxJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5zdGF0ZV9vcmRlcigncHVibGlzaGVkJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZVsxXSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyc01hcFtyb3V0ZVsxXV0gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3RpdGxlOiBjYXQubmFtZSwgZmlsdGVyOiBieUNhdGVnb3J5LmNhdGVnb3J5X2lkKGNhdC5pZCl9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXIgPSBmaWx0ZXJGcm9tUm91dGUoKSB8fCBmaWx0ZXJzTWFwLnJlY29tbWVuZGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaCA9IGgucGFyYW1CeU5hbWUoJ3BnX3NlYXJjaCcpLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoUHJvamVjdHMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGwgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYy5tb2RlbHMucHJvamVjdFNlYXJjaC5wb3N0T3B0aW9ucyh7cXVlcnk6IHNlYXJjaH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZSA9IHsgLy8gV2UgYnVpbGQgYW4gb2JqZWN0IHdpdGggdGhlIHNhbWUgaW50ZXJmYWNlIGFzIHBhZ2luYXRpb25WTVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzTG9hZGluZzogbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzTGFzdFBhZ2U6ICgpID0+IHsgcmV0dXJuIHRydWU7IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0UGFnZTogKCkgPT4geyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbC5sb2FkKCkudGhlbihwYWdlLmNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFnZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZFByb2plY3RzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYWdlcyA9IG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShjLm1vZGVscy5wcm9qZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZXMuZmlyc3RQYWdlKGZpbHRlci5maWx0ZXIub3JkZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3Blbl9mb3JfY29udHJpYnV0aW9uczogJ2Rlc2MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVfb3JkZXI6ICdhc2MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdkZXNjJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY29tbWVuZGVkOiAnZGVzYycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZGVzYydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhZ2VzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc1N0cmluZyhzZWFyY2gpICYmIHNlYXJjaC5sZW5ndGggPiAwICYmIHJvdXRlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlKCdCdXNjYSAnICsgc2VhcmNoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdHMoc2VhcmNoUHJvamVjdHMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUoZmlsdGVyLnRpdGxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdHMobG9hZFByb2plY3RzKCkpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeUlkKGNhdCAmJiBjYXQuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgIHJvdXRlID8gdG9nZ2xlQ2F0ZWdvcmllcyhmYWxzZSkgOiB0b2dnbGVDYXRlZ29yaWVzKHRydWUpO1xuXG4gICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICB0b2dnbGVDYXRlZ29yaWVzID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKTtcblxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9hZFJvdXRlKCk7XG4gICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcblxuICAgICAgICAgICAgLy8gSW5pdGlhbCBsb2Fkc1xuICAgICAgICAgICAgYy5tb2RlbHMucHJvamVjdC5wYWdlU2l6ZSg5KTtcbiAgICAgICAgICAgIGxvYWRDYXRlZ29yaWVzKCkudGhlbihsb2FkUm91dGUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNhdGVnb3JpZXM6IGNhdGVnb3J5Q29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICBmb2xsb3dDYXRlZ29yeTogZm9sbG93Q2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgdW5Gb2xsb3dDYXRlZ29yeTogdW5Gb2xsb3dDYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0czogcHJvamVjdHMsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJzTWFwOiBmaWx0ZXJzTWFwLFxuICAgICAgICAgICAgICAgIHRvZ2dsZUNhdGVnb3JpZXM6IHRvZ2dsZUNhdGVnb3JpZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5oZXJvLXNlYXJjaCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNleHBsb3JlLW9wZW4ubGluay1oaWRkZW4td2hpdGUuZm9udHdlaWdodC1saWdodC5mb250c2l6ZS1sYXJnZXJbaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIl0nLHtvbmNsaWNrOiAoKSA9PiBjdHJsLnRvZ2dsZUNhdGVnb3JpZXMudG9nZ2xlKCl9LCBbJ0V4cGxvcmUgcHJvamV0b3MgaW5jcsOtdmVpcyAnLG0oYHNwYW4jZXhwbG9yZS1idG4uZmEuZmEtYW5nbGUtZG93biR7Y3RybC50b2dnbGVDYXRlZ29yaWVzKCkgPyAnLm9wZW5lZCcgOiAnJ31gLCAnJyldKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKGAjY2F0ZWdvcmllcy5jYXRlZ29yeS1zbGlkZXIke2N0cmwudG9nZ2xlQ2F0ZWdvcmllcygpID8gJy5vcGVuZWQnIDogJyd9YCwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAoY3RybC5jYXRlZ29yaWVzKCksIChjYXRlZ29yeSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuQ2F0ZWdvcnlCdXR0b24sIHtjYXRlZ29yeTogY2F0ZWdvcnl9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAoY3RybC5maWx0ZXJzTWFwLCAoZmlsdGVyLCBocmVmKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5GaWx0ZXJCdXR0b24sIHt0aXRsZTogZmlsdGVyLnRpdGxlLCBocmVmOiBocmVmfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG5cbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYudy1jb2wtc21hbGwtNy53LWNvbC10aW55LTcnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXInLCBjdHJsLnRpdGxlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBfLmlzT2JqZWN0KGN0cmwuY2F0ZWdvcnkoKSkgPyBtKCcudy1jb2wudy1jb2wtNi53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIG0oJy5mb2xsb3dpbmcuZm9udHNpemUtc21hbGwuZm9udGNvbG9yLXNlY29uZGFyeS51LXJpZ2h0JywgYCR7Y3RybC5jYXRlZ29yeSgpLmZvbGxvd2Vyc30gc2VndWlkb3Jlc2ApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTEyLnctY29sLXRpbnktMTInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgY3RybC5jYXRlZ29yeSgpLmZvbGxvd2luZyA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1tZWRpdW0uYnRuLXRlcmNpYXJ5LnVuZm9sbG93LWJ0bltocmVmPVxcJyNcXCddJywge29uY2xpY2s6IGN0cmwudW5Gb2xsb3dDYXRlZ29yeShjdHJsLmNhdGVnb3J5KCkuaWQpfSwgJ0RlaXhhciBkZSBzZWd1aXInKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1tZWRpdW0uZm9sbG93LWJ0bltocmVmPVxcJyNcXCddJywge29uY2xpY2s6IGN0cmwuZm9sbG93Q2F0ZWdvcnkoY3RybC5jYXRlZ29yeSgpLmlkKX0sICdTZWd1aXInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBdKSA6ICcnXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG5cbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBfLm1hcChjdHJsLnByb2plY3RzKCkuY29sbGVjdGlvbigpLCAocHJvamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Qcm9qZWN0Q2FyZCwge3Byb2plY3Q6IHByb2plY3QsIHJlZjogJ2N0cnNlX2V4cGxvcmUnfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwucHJvamVjdHMoKS5pc0xvYWRpbmcoKSA/IGgubG9hZGVyKCkgOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGN0cmwucHJvamVjdHMoKS5pc0xhc3RQYWdlKCkgfHwgY3RybC5wcm9qZWN0cygpLmlzTG9hZGluZygpIHx8IF8uaXNFbXB0eShjdHJsLnByb2plY3RzKCkuY29sbGVjdGlvbigpKSkgPyAnJyA6IG0oJ2EuYnRuLmJ0bi1tZWRpdW0uYnRuLXRlcmNpYXJ5W2hyZWY9XFwnI2xvYWRNb3JlXFwnXScsIHtvbmNsaWNrOiAoKSA9PiB7IGN0cmwucHJvamVjdHMoKS5uZXh0UGFnZSgpOyByZXR1cm4gZmFsc2U7IH19LCAnQ2FycmVnYXIgbWFpcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKV07XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cubW9tZW50KSk7XG4iLCJ3aW5kb3cuYy5yb290LlByb2plY3RzSG9tZSA9ICgoKG0sIGMsIG1vbWVudCwgaCwgXykgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3Byb2plY3RzLmhvbWUnKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBzYW1wbGU2ID0gXy5wYXJ0aWFsKF8uc2FtcGxlLCBfLCA2KSxcbiAgICAgICAgICAgICAgICBsb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgcHJvamVjdCA9IGMubW9kZWxzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgZmlsdGVycyA9IGMudm1zLnByb2plY3RGaWx0ZXJzKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbGxlY3Rpb25zID0gXy5tYXAoWydyZWNvbW1lbmRlZCddLCAobmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGYgPSBmaWx0ZXJzW25hbWVdLFxuICAgICAgICAgICAgICAgICAgICAgIGNMb2FkZXIgPSBsb2FkZXIocHJvamVjdC5nZXRQYWdlT3B0aW9ucyhmLmZpbHRlci5wYXJhbWV0ZXJzKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uID0gbS5wcm9wKFtdKTtcblxuICAgICAgICAgICAgICAgIGNMb2FkZXIubG9hZCgpLnRoZW4oXy5jb21wb3NlKGNvbGxlY3Rpb24sIHNhbXBsZTYpKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBmLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICBoYXNoOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNMb2FkZXJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbnM6IGNvbGxlY3Rpb25zXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uaGVyby1mdWxsLmhlcm8tMjAxNicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbWVnYWp1bWJvLnUtbWFyZ2luYm90dG9tLTYwLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udGNvbG9yLW5lZ2F0aXZlJywgSTE4bi50KCd0aXRsZScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2hyZWY9XCJodHRwOi8vMjAxNS5jYXRhcnNlLm1lL1wiXS5idG4uYnRuLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwLmJ0bi1pbmxpbmUnLCBJMThuLnQoJ2N0YScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBfLm1hcChjdHJsLmNvbGxlY3Rpb25zLCAoY29sbGVjdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Qcm9qZWN0Um93LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiBgaG9tZV8ke2NvbGxlY3Rpb24uaGFzaH1gXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgfTtcbn0pKHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93Lm1vbWVudCwgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLnJvb3QuUHJvamVjdHNTaG93ID0gKChtLCBjLCBfLCBoLCB2bXMpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHZtcy5wcm9qZWN0KGFyZ3MucHJvamVjdF9pZCwgYXJncy5wcm9qZWN0X3VzZXJfaWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICBsZXQgcHJvamVjdCA9IGN0cmwucHJvamVjdERldGFpbHM7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcucHJvamVjdC1zaG93JywgW1xuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RIZWFkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyRGV0YWlsczogY3RybC51c2VyRGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0VGFicywge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZERldGFpbHM6IGN0cmwucmV3YXJkRGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0TWFpbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZERldGFpbHM6IGN0cmwucmV3YXJkRGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgKHByb2plY3QoKSAmJiBwcm9qZWN0KCkuaXNfb3duZXJfb3JfYWRtaW4gPyBtLmNvbXBvbmVudChjLlByb2plY3REYXNoYm9hcmRNZW51LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgIH0pIDogJycpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5fLCB3aW5kb3cuYy5oLCB3aW5kb3cuYy52bXMpKTtcbiIsIndpbmRvdy5jLnJvb3QuU3RhcnQgPSAoKG0sIGMsIGgsIG1vZGVscywgSTE4bikgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3BhZ2VzLnN0YXJ0Jyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRQYW5lID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnkgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIGZlYXR1cmVkUHJvamVjdHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnlJZHggPSBtLnByb3AoLTEpLFxuICAgICAgICAgICAgICAgIHN0YXJ0dm0gPSBjLnZtcy5zdGFydChJMThuKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJzID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNLFxuICAgICAgICAgICAgICAgIHBhbmVJbWFnZXMgPSBzdGFydHZtLnBhbmVzLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5dm0gPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlfaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0dm0gPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHVzZXJ2bSA9IGZpbHRlcnMoe1xuICAgICAgICAgICAgICAgICAgICBpZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGxvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcixcbiAgICAgICAgICAgICAgICBzdGF0c0xvYWRlciA9IGxvYWRlcihtb2RlbHMuc3RhdGlzdGljLmdldFJvd09wdGlvbnMoKSksXG4gICAgICAgICAgICAgICAgbG9hZENhdGVnb3JpZXMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjLm1vZGVscy5jYXRlZ29yeS5nZXRQYWdlKGZpbHRlcnMoe30pLm9yZGVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdhc2MnXG4gICAgICAgICAgICAgICAgICAgIH0pLnBhcmFtZXRlcnMoKSkudGhlbihjYXRlZ29yaWVzKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNlbGVjdFBhbmUgPSAoaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFBhbmUoaWR4KTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxDYXRlZ29yeSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvYWRlcihtb2RlbHMuY2F0ZWdvcnlUb3RhbHMuZ2V0Um93T3B0aW9ucyhjYXRlZ29yeXZtLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbFByb2plY3QgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2FkZXIobW9kZWxzLnByb2plY3REZXRhaWwuZ2V0Um93T3B0aW9ucyhwcm9qZWN0dm0ucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsVXNlciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvYWRlcihtb2RlbHMudXNlckRldGFpbC5nZXRSb3dPcHRpb25zKHVzZXJ2bS5wYXJhbWV0ZXJzKCkpKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNlbGVjdENhdGVnb3J5ID0gKGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZENhdGVnb3J5SWR4KGNhdGVnb3J5LmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5dm0uY2F0ZWdvcnlfaWQoY2F0ZWdvcnkuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeShbY2F0ZWdvcnldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsQ2F0ZWdvcnkoKS5sb2FkKCkudGhlbihsb2FkQ2F0ZWdvcnlQcm9qZWN0cyk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXRVc2VyID0gKHVzZXIsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmZWF0dXJlZFByb2plY3RzKClbaWR4XSA9IF8uZXh0ZW5kKHt9LCBmZWF0dXJlZFByb2plY3RzKClbaWR4XSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlclRodW1iOiAgXy5maXJzdCh1c2VyKS5wcm9maWxlX2ltZ190aHVtYm5haWxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXRQcm9qZWN0ID0gKHByb2plY3QsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmZWF0dXJlZFByb2plY3RzKClbaWR4XSA9IF8uZmlyc3QocHJvamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJ2bS5pZChfLmZpcnN0KHByb2plY3QpLnVzZXIuaWQpO1xuICAgICAgICAgICAgICAgICAgICBsVXNlcigpLmxvYWQoKS50aGVuKCh1c2VyKSA9PiBzZXRVc2VyKHVzZXIsIGlkeCkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbG9hZENhdGVnb3J5UHJvamVjdHMgPSAoY2F0ZWdvcnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeShjYXRlZ29yeSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjYXRlZ29yeVByb2plY3RzID0gXy5maW5kV2hlcmUoc3RhcnR2bS5jYXRlZ29yeVByb2plY3RzLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeUlkOiBfLmZpcnN0KGNhdGVnb3J5KS5jYXRlZ29yeV9pZFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZmVhdHVyZWRQcm9qZWN0cyhbXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChjYXRlZ29yeVByb2plY3RzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAoY2F0ZWdvcnlQcm9qZWN0cy5zYW1wbGVQcm9qZWN0cywgKHByb2plY3RfaWQsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChwcm9qZWN0X2lkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0dm0ucHJvamVjdF9pZChwcm9qZWN0X2lkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbFByb2plY3QoKS5sb2FkKCkudGhlbigocHJvamVjdCkgPT4gc2V0UHJvamVjdChwcm9qZWN0LCBpZHgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHN0YXRzTG9hZGVyLmxvYWQoKS50aGVuKHN0YXRzKTtcbiAgICAgICAgICAgIGxvYWRDYXRlZ29yaWVzKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3RhdHM6IHN0YXRzLFxuICAgICAgICAgICAgICAgIGNhdGVnb3JpZXM6IGNhdGVnb3JpZXMsXG4gICAgICAgICAgICAgICAgcGFuZUltYWdlczogcGFuZUltYWdlcyxcbiAgICAgICAgICAgICAgICBzZWxlY3RDYXRlZ29yeTogc2VsZWN0Q2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeTogc2VsZWN0ZWRDYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZENhdGVnb3J5SWR4OiBzZWxlY3RlZENhdGVnb3J5SWR4LFxuICAgICAgICAgICAgICAgIHNlbGVjdFBhbmU6IHNlbGVjdFBhbmUsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRQYW5lOiBzZWxlY3RlZFBhbmUsXG4gICAgICAgICAgICAgICAgZmVhdHVyZWRQcm9qZWN0czogZmVhdHVyZWRQcm9qZWN0cyxcbiAgICAgICAgICAgICAgICB0ZXN0aW1vbmlhbHM6IHN0YXJ0dm0udGVzdGltb25pYWxzLFxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uczogc3RhcnR2bS5xdWVzdGlvbnNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgc3RhdHMgPSBfLmZpcnN0KGN0cmwuc3RhdHMoKSk7XG4gICAgICAgICAgICBjb25zdCB0ZXN0aW1vbmlhbHMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF8ubWFwKGN0cmwudGVzdGltb25pYWxzLCAodGVzdGltb25pYWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy5jYXJkLnUtcmFkaXVzLmNhcmQtYmlnLmNhcmQtdGVyY2lhcnknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBpbWcudGh1bWItdGVzdGltb25pYWwudS1yb3VuZC51LW1hcmdpbmJvdHRvbS0yMFtzcmM9XCIke3Rlc3RpbW9uaWFsLnRodW1iVXJsfVwiXWApXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMzAnLCBgXCIke3Rlc3RpbW9uaWFsLmNvbnRlbnR9XCJgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5mb250d2VpZ2h0LXNlbWlib2xkJywgdGVzdGltb25pYWwubmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLCB0ZXN0aW1vbmlhbC50b3RhbHMpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLmhlcm8tZnVsbC5oZXJvLXN0YXJ0JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS00MCcsIEkxOG4udCgnc2xvZ2FuJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1wdXNoLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMFtocmVmPVwiI3N0YXJ0LWZvcm1cIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IGguc2Nyb2xsVG8oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBJMThuLnQoJ3N1Ym1pdCcsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBfLmlzRW1wdHkoc3RhdHMpID8gJycgOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0LmxpbmVoZWlnaHQtbG9vc2UnLCBoLmZvcm1hdE51bWJlcihzdGF0cy50b3RhbF9jb250cmlidXRvcnMsIDAsIDMpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1zbWFsbC5zdGFydC1zdGF0cycsIEkxOG4udCgnaGVhZGVyLnBlb3BsZScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QubGluZWhlaWdodC1sb29zZScsIHN0YXRzLnRvdGFsX2NvbnRyaWJ1dGVkLnRvU3RyaW5nKCkuc2xpY2UoMCwgMikgKyAnIG1pbGjDtWVzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtc21hbGwuc3RhcnQtc3RhdHMnLCBJMThuLnQoJ2hlYWRlci5tb25leScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QubGluZWhlaWdodC1sb29zZScsIGguZm9ybWF0TnVtYmVyKHN0YXRzLnRvdGFsX3Byb2plY3RzX3N1Y2Nlc3MsIDAsIDMpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1zbWFsbC5zdGFydC1zdGF0cycsIEkxOG4udCgnaGVhZGVyLnN1Y2Nlc3MnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwLnctY29sLXB1c2gtMS51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLnUtbWFyZ2luYm90dG9tLTEwLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBJMThuLnQoJ3BhZ2UtdGl0bGUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwnLCBJMThuLnQoJ3BhZ2Utc3VidGl0bGUnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNsZWFyZml4Lmhvdy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuaG93LWNvbC0wMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmluZm8taG93d29ya3MtYmFja2VycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlJywgSTE4bi50KCdiYW5uZXIuMScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnYmFubmVyLjInLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuaW5mby1ob3d3b3Jrcy1iYWNrZXJzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UnLCBJMThuLnQoJ2Jhbm5lci4zJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlJywgSTE4bi50KCdiYW5uZXIuNCcsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuaG93LWNvbC0wMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5ob3ctY29sLTAzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZScsIEkxOG4udCgnYmFubmVyLjUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnYmFubmVyLjYnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS51LW1hcmdpbnRvcC0zMCcsIEkxOG4udCgnYmFubmVyLjcnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnYmFubmVyLjgnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLmhvdy1jb2wtMDEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5pbmZvLWhvd3dvcmtzLWJhY2tlcnMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZScsIEkxOG4udCgnYmFubmVyLjEnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLCBJMThuLnQoJ2Jhbm5lci4yJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmluZm8taG93d29ya3MtYmFja2VycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlJywgSTE4bi50KCdiYW5uZXIuMycsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsICBJMThuLnQoJ2Jhbm5lci40JywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uZGl2aWRlcicpLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1sYXJnZScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1sYXJnZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBJMThuLnQoJ2ZlYXR1cmVzLnRpdGxlJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0yMCcsIEkxOG4udCgnZmVhdHVyZXMuc3VidGl0bGUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLnUtbWFyZ2ludG9wLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsIEkxOG4udCgnZmVhdHVyZXMuZmVhdHVyZV8xJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMzAnLCBJMThuLnQoJ2ZlYXR1cmVzLmZlYXR1cmVfMicsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTMwJywgSTE4bi50KCdmZWF0dXJlcy5mZWF0dXJlXzMnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsIEkxOG4udCgnZmVhdHVyZXMuZmVhdHVyZV80JywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMzAnLCBJMThuLnQoJ2ZlYXR1cmVzLmZlYXR1cmVfNScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy10YWJzLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctdGFiLW1lbnUudy1jb2wudy1jb2wtNCcsIF8ubWFwKGN0cmwucGFuZUltYWdlcywgKHBhbmUsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbShgYnRuLnctdGFiLWxpbmsudy1pbmxpbmUtYmxvY2sudGFiLWxpc3QtaXRlbSR7KGlkeCA9PT0gY3RybC5zZWxlY3RlZFBhbmUoKSkgPyAnLnNlbGVjdGVkJyA6ICcnfWAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuc2VsZWN0UGFuZShpZHgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHBhbmUubGFiZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy10YWItY29udGVudC53LWNvbC53LWNvbC04JywgXy5tYXAoY3RybC5wYW5lSW1hZ2VzLCAocGFuZSwgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy10YWItcGFuZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGltZ1tzcmM9XCIke3BhbmUuc3JjfVwiXS5wYW5lLWltYWdlJHsoaWR4ID09PSBjdHJsLnNlbGVjdGVkUGFuZSgpKSA/ICcuc2VsZWN0ZWQnIDogJyd9YClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1sYXJnZS5iZy1ibHVlLW9uZScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLmxpbmVoZWlnaHQtdGlnaHQuZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEkxOG4udCgndmlkZW8udGl0bGUnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBJMThuLnQoJ3ZpZGVvLnN1YnRpdGxlJywgSTE4blNjb3BlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuWW91dHViZUxpZ2h0Ym94LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBJMThuLnQoJ3ZpZGVvLnNyYycsIEkxOG5TY29wZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5zZWN0aW9uLWNhdGVnb3JpZXMnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwLnctY29sLXB1c2gtMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS00MC5mb250Y29sb3ItbmVnYXRpdmUnLCBJMThuLnQoJ2NhdGVnb3JpZXMudGl0bGUnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctdGFicycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy10YWItbWVudS51LXRleHQtY2VudGVyJywgXy5tYXAoY3RybC5jYXRlZ29yaWVzKCksIChjYXRlZ29yeSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbShgYS53LXRhYi1saW5rLnctaW5saW5lLWJsb2NrLmJ0bi1jYXRlZ29yeS5zbWFsbC5idG4taW5saW5lJHsoY3RybC5zZWxlY3RlZENhdGVnb3J5SWR4KCkgPT09IGNhdGVnb3J5LmlkKSA/ICcudy0tY3VycmVudCcgOiAnJ31gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnNlbGVjdENhdGVnb3J5KGNhdGVnb3J5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBjYXRlZ29yeS5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctdGFiLWNvbnRlbnQudS1tYXJnaW50b3AtNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXRhYi1wYW5lLnctLXRhYi1hY3RpdmUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCAoY3RybC5zZWxlY3RlZENhdGVnb3J5SWR4KCkgIT09IC0xKSA/IF8ubWFwKGN0cmwuc2VsZWN0ZWRDYXRlZ29yeSgpLCAoY2F0ZWdvcnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1iby51LW1hcmdpbmJvdHRvbS0yMCcsIGNhdGVnb3J5Lm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS53LWJ1dHRvbi5idG4uYnRuLW1lZGl1bS5idG4taW5saW5lLmJ0bi1kYXJrW2hyZWY9XCIjc3RhcnQtZm9ybVwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IGguc2Nyb2xsVG8oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgSTE4bi50KCdzdWJtaXQnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udGNvbG9yLW5lZ2F0aXZlJywgYFIkICR7Y2F0ZWdvcnkudG90YWxfc3VjY2Vzc2Z1bF92YWx1ZSA/IGguZm9ybWF0TnVtYmVyKGNhdGVnb3J5LnRvdGFsX3N1Y2Nlc3NmdWxfdmFsdWUsIDIsIDMpIDogJy4uLid9YCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMjAnLCAnRG9hZG9zIHBhcmEgcHJvamV0b3MnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udGNvbG9yLW5lZ2F0aXZlJywgKGNhdGVnb3J5LnN1Y2Nlc3NmdWxfcHJvamVjdHMpID8gY2F0ZWdvcnkuc3VjY2Vzc2Z1bF9wcm9qZWN0cyA6ICcuLi4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsICdQcm9qZXRvcyBmaW5hbmNpYWRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIV8uaXNFbXB0eShjdHJsLmZlYXR1cmVkUHJvamVjdHMoKSkgPyBfLm1hcChjdHJsLmZlYXR1cmVkUHJvamVjdHMoKSwgKHByb2plY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIV8uaXNVbmRlZmluZWQocHJvamVjdCkgPyBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgaW1nLnVzZXItYXZhdGFyW3NyYz1cIiR7aC51c2VBdmF0YXJPckRlZmF1bHQocHJvamVjdC51c2VyVGh1bWIpfVwiXWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkJywgcHJvamVjdC51c2VyLm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEkxOG4udCgnY2F0ZWdvcmllcy5wbGVkZ2VkJywgSTE4blNjb3BlKHtwbGVkZ2VkOiBoLmZvcm1hdE51bWJlcihwcm9qZWN0LnBsZWRnZWQpLCBjb250cmlidXRvcnM6IHByb2plY3QudG90YWxfY29udHJpYnV0b3JzfSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGEubGluay1oaWRkZW5baHJlZj1cIi8ke3Byb2plY3QucGVybWFsaW5rfVwiXWAsIHByb2plY3QubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnY2F0ZWdvcmllcy5sb2FkaW5nX2ZlYXR1cmVkJywgSTE4blNjb3BlKCkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5TbGlkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzOiB0ZXN0aW1vbmlhbHMoKSxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IEkxOG4udCgndGVzdGltb25pYWxzX3RpdGxlJywgSTE4blNjb3BlKCkpXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5kaXZpZGVyLnUtbWFyZ2ludG9wLTMwJyksXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tNjAudS1tYXJnaW50b3AtNDAnLCBJMThuLnQoJ3FhX3RpdGxlJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBfLm1hcChjdHJsLnF1ZXN0aW9ucy5jb2xfMSwgKHF1ZXN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiBxdWVzdGlvbi5xdWVzdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiBxdWVzdGlvbi5hbnN3ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgXy5tYXAoY3RybC5xdWVzdGlvbnMuY29sXzIsIChxdWVzdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogcXVlc3Rpb24ucXVlc3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogcXVlc3Rpb24uYW5zd2VyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcjc3RhcnQtZm9ybS53LXNlY3Rpb24uc2VjdGlvbi1sYXJnZS51LXRleHQtY2VudGVyLmJnLXB1cnBsZS5iZWZvcmUtZm9vdGVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtanVtYm8uZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTYwJywgJ0NyaWUgbyBzZXUgcmFzY3VuaG8gZ3JhdHVpdGFtZW50ZSEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm1bYWN0aW9uPVwiL3B0L3Byb2plY3RzXCJdW21ldGhvZD1cIlBPU1RcIl0udy1yb3cudy1mb3JtJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIuZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTEwJywgSTE4bi50KCdmb3JtLnRpdGxlJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXRbbmFtZT1cInV0ZjhcIl1bdHlwZT1cImhpZGRlblwiXVt2YWx1ZT1cIuKck1wiXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBpbnB1dFtuYW1lPVwiYXV0aGVudGljaXR5X3Rva2VuXCJdW3R5cGU9XCJoaWRkZW5cIl1bdmFsdWU9XCIke2guYXV0aGVudGljaXR5VG9rZW4oKX1cIl1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLm1lZGl1bS51LW1hcmdpbmJvdHRvbS0zMFt0eXBlPVwidGV4dFwiXScsIHtuYW1lOiAncHJvamVjdFtuYW1lXSd9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci5mb250Y29sb3ItbmVnYXRpdmUudS1tYXJnaW5ib3R0b20tMTAnLCAnbmEgY2F0ZWdvcmlhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NlbGVjdC53LXNlbGVjdC50ZXh0LWZpZWxkLm1lZGl1bS51LW1hcmdpbmJvdHRvbS00MCcsIHtuYW1lOiAncHJvamVjdFtjYXRlZ29yeV9pZF0nfSxbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdvcHRpb25bdmFsdWU9XCJcIl0nLCBJMThuLnQoJ2Zvcm0uc2VsZWN0X2RlZmF1bHQnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAoY3RybC5jYXRlZ29yaWVzKCksIChjYXRlZ29yeSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKGBvcHRpb25bdmFsdWU9XCIke2NhdGVnb3J5LmlkfVwiXWAsIGNhdGVnb3J5Lm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS04MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtcHVzaC00LnUtbWFyZ2ludG9wLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgaW5wdXRbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIiR7STE4bi50KCdmb3JtLnN1Ym1pdCcsIEkxOG5TY29wZSgpKX1cIl0udy1idXR0b24uYnRuLmJ0bi1sYXJnZWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5jLm1vZGVscywgd2luZG93LkkxOG4pKTtcbiIsIndpbmRvdy5jLnJvb3QuVGVhbSA9IChmdW5jdGlvbihtLCBjKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3N0YXRpYy10ZWFtLWFwcCcsIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlRlYW1Ub3RhbCksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5UZWFtTWVtYmVycylcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLnJvb3QuQmFsYW5jZSBjb21wb25lbnRcbiAqIEEgcm9vdCBjb21wb25lbnQgdG8gc2hvdyB1c2VyIGJhbGFuY2UgYW5kIHRyYW5zYWN0aW9uc1xuICpcbiAqIEV4YW1wbGU6XG4gKiBUbyBtb3VudCB0aGlzIGNvbXBvbmVudCBqdXN0IGNyZWF0ZSBhIERPTSBlbGVtZW50IGxpa2U6XG4gKiA8ZGl2IGRhdGEtbWl0aHJpbD1cIlVzZXJzQmFsYW5jZVwiIGRhdGEtcGFyYW1ldGVycz1cInsndXNlcl9pZCc6IDEwfVwiPlxuICovXG53aW5kb3cuYy5yb290LlVzZXJzQmFsYW5jZSA9ICgobSwgXywgYywgbW9kZWxzKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJJZFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHt1c2VyX2lkOiAnZXEnfSk7XG5cbiAgICAgICAgICAgIHVzZXJJZFZNLnVzZXJfaWQoYXJncy51c2VyX2lkKTtcblxuICAgICAgICAgICAgLy8gSGFuZGxlcyB3aXRoIHVzZXIgYmFsYW5jZSByZXF1ZXN0IGRhdGFcbiAgICAgICAgICAgIGNvbnN0IGJhbGFuY2VNYW5hZ2VyID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xsZWN0aW9uID0gbS5wcm9wKFt7YW1vdW50OiAwLCB1c2VyX2lkOiBhcmdzLnVzZXJfaWR9XSksXG4gICAgICAgICAgICAgICAgICAgICAgbG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWxzLmJhbGFuY2UuZ2V0Um93V2l0aFRva2VuKHVzZXJJZFZNLnBhcmFtZXRlcnMoKSkudGhlbihjb2xsZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgbG9hZDogbG9hZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuXG4gICAgICAgICAgICAgICAgICAvLyBIYW5kbGVzIHdpdGggdXNlciBiYWxhbmNlIHRyYW5zYWN0aW9ucyBsaXN0IGRhdGFcbiAgICAgICAgICAgICAgICAgIGJhbGFuY2VUcmFuc2FjdGlvbk1hbmFnZXIgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpc3RWTSA9IG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWxzLmJhbGFuY2VUcmFuc2FjdGlvbiwgJ2NyZWF0ZWRfYXQuZGVzYycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UodXNlcklkVk0ucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZDogbG9hZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdDogbGlzdFZNXG4gICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIH0pKCksXG5cbiAgICAgICAgICAgICAgICAgIC8vIEhhbmRsZXMgd2l0aCBiYW5rIGFjY291bnQgdG8gY2hlY2tcbiAgICAgICAgICAgICAgICAgIGJhbmtBY2NvdW50TWFuYWdlciA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVyID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVscy5iYW5rQWNjb3VudC5nZXRSb3dPcHRpb25zKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJZFZNLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVyLmxvYWQoKS50aGVuKGNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkOiBsb2FkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGxvYWRlclxuICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGJhbmtBY2NvdW50TWFuYWdlcjogYmFua0FjY291bnRNYW5hZ2VyLFxuICAgICAgICAgICAgICAgIGJhbGFuY2VNYW5hZ2VyOiBiYWxhbmNlTWFuYWdlcixcbiAgICAgICAgICAgICAgICBiYWxhbmNlVHJhbnNhY3Rpb25NYW5hZ2VyOiBiYWxhbmNlVHJhbnNhY3Rpb25NYW5hZ2VyXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IG9wdHMgPSBfLmV4dGVuZCh7fSwgYXJncywgY3RybCk7XG4gICAgICAgICAgICByZXR1cm4gbSgnI2JhbGFuY2UtYXJlYScsIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlVzZXJCYWxhbmNlLCBvcHRzKSxcbiAgICAgICAgICAgICAgICBtKCcuZGl2aWRlcicpLFxuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuVXNlckJhbGFuY2VUcmFuc2FjdGlvbnMsIG9wdHMpLFxuICAgICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS00MCcpLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi5jYXJkLXRlcmNpYXJ5LmJlZm9yZS1mb290ZXInKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLkFkbWluQ29udHJpYnV0aW9uRGV0YWlsID0gKGZ1bmN0aW9uKG0sIF8sIGMsIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICBsZXQgbDtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRSZXdhcmQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbW9kZWwgPSBjLm1vZGVscy5yZXdhcmREZXRhaWwsXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZF9pZCA9IGFyZ3MuaXRlbS5yZXdhcmRfaWQsXG4gICAgICAgICAgICAgICAgICAgIG9wdHMgPSBtb2RlbC5nZXRSb3dPcHRpb25zKGguaWRWTS5pZChyZXdhcmRfaWQpLnBhcmFtZXRlcnMoKSksXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZCA9IG0ucHJvcCh7fSk7XG4gICAgICAgICAgICAgICAgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihvcHRzKTtcbiAgICAgICAgICAgICAgICBpZiAocmV3YXJkX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIGwubG9hZCgpLnRoZW4oXy5jb21wb3NlKHJld2FyZCwgXy5maXJzdCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmV3YXJkO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHJld2FyZCA9IGxvYWRSZXdhcmQoKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmV3YXJkOiByZXdhcmQsXG4gICAgICAgICAgICAgICAgYWN0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICd1c2VyX2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ1RyYW5zZmVyaXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJMYWJlbDogJ0lkIGRvIG5vdm8gYXBvaWFkb3I6JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdUcmFuc2ZlcmlyIEFwb2lvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnZXg6IDEyOTkwOCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzTWVzc2FnZTogJ0Fwb2lvIHRyYW5zZmVyaWRvIGNvbSBzdWNlc3NvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdPIGFwb2lvIG7Do28gZm9pIHRyYW5zZmVyaWRvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0S2V5OiAncHJvamVjdF9pZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdjb250cmlidXRpb25faWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0S2V5OiAncmV3YXJkX2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhZGlvczogJ3Jld2FyZHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnQWx0ZXJhciBSZWNvbXBlbnNhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdSZWNvbXBlbnNhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldE1vZGVsOiBjLm1vZGVscy5yZXdhcmREZXRhaWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVNb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtOiByZXdhcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZTogKHJld2FyZHMsIG5ld1Jld2FyZElEKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJld2FyZCA9IF8uZmluZFdoZXJlKHJld2FyZHMsIHtpZDogbmV3UmV3YXJkSUR9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGFyZ3MuaXRlbS52YWx1ZSA+PSByZXdhcmQubWluaW11bV92YWx1ZSkgPyB1bmRlZmluZWQgOiAnVmFsb3IgbcOtbmltbyBkYSByZWNvbXBlbnNhIMOpIG1haW9yIGRvIHF1ZSBvIHZhbG9yIGRhIGNvbnRyaWJ1acOnw6NvLic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlZnVuZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnUmVlbWJvbHNvIGRpcmV0bycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnVGVtIGNlcnRlemEgcXVlIGRlc2VqYSByZWVtYm9sc2FyIGVzc2UgYXBvaW8/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdSZWVtYm9sc2FyIEFwb2lvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiBjLm1vZGVscy5jb250cmlidXRpb25EZXRhaWxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ3N0YXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ0FwYWdhcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnVGVtIGNlcnRlemEgcXVlIGRlc2VqYSBhcGFnYXIgZXNzZSBhcG9pbz8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ0FwYWdhciBBcG9pbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JjZVZhbHVlOiAnZGVsZXRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzTWVzc2FnZTogJ0Fwb2lvIHJlbW92aWRvIGNvbSBzdWNlc3NvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdPIGFwb2lvIG7Do28gZm9pIHJlbW92aWRvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGw6IGxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGFjdGlvbnMgPSBjdHJsLmFjdGlvbnMsXG4gICAgICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgICByZXdhcmQgPSBjdHJsLnJld2FyZDtcblxuICAgICAgICAgICAgY29uc3QgYWRkT3B0aW9ucyA9IChidWlsZGVyLCBpZCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgYnVpbGRlciwge1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0T3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiAoYC9hZG1pbi9jb250cmlidXRpb25zLyR7aWR9L2dhdGV3YXlfcmVmdW5kYCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjYWRtaW4tY29udHJpYnV0aW9uLWRldGFpbC1ib3gnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW50b3AtMjAudS1tYXJnaW5ib3R0b20tMjAnKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5JbnB1dEFjdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYWN0aW9ucy50cmFuc2ZlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChjdHJsLmwoKSkgPyBoLmxvYWRlciA6XG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5SYWRpb0FjdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYWN0aW9ucy5yZXdhcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiByZXdhcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRLZXlWYWx1ZTogaXRlbS5wcm9qZWN0X2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5VmFsdWU6IGl0ZW0uY29udHJpYnV0aW9uX2lkXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluRXh0ZXJuYWxBY3Rpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGFkZE9wdGlvbnMoYWN0aW9ucy5yZWZ1bmQsIGl0ZW0uaWQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbklucHV0QWN0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBhY3Rpb25zLnJlbW92ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cuY2FyZC5jYXJkLXRlcmNpYXJ5LnUtcmFkaXVzJywgW1xuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluVHJhbnNhY3Rpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbjogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblRyYW5zYWN0aW9uSGlzdG9yeSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAoY3RybC5sKCkpID8gaC5sb2FkZXIgOlxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUmV3YXJkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXdhcmQ6IHJld2FyZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogaXRlbS5rZXlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvbkl0ZW0gPSAoZnVuY3Rpb24obSwgYywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpdGVtQnVpbGRlcjogW3tcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Db250cmlidXRpb25Vc2VyJyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTQnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pblByb2plY3QnLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluQ29udHJpYnV0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTInXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdQYXltZW50U3RhdHVzJyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTInXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oXG4gICAgICAgICAgICAgICAgJy53LXJvdycsXG4gICAgICAgICAgICAgICAgXy5tYXAoY3RybC5pdGVtQnVpbGRlciwgZnVuY3Rpb24ocGFuZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0ocGFuZWwud3JhcHBlckNsYXNzLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjW3BhbmVsLmNvbXBvbmVudF0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBhcmdzLmtleVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuQWRtaW5Db250cmlidXRpb25Vc2VyIGNvbXBvbmVudFxuICogQW4gaXRlbWJ1aWxkZXIgY29tcG9uZW50IHRoYXQgcmV0dXJucyBhZGRpdGlvbmFsIGRhdGFcbiAqIHRvIGJlIGluY2x1ZGVkIGluIEFkbWluVXNlci5cbiAqXG4gKiBFeGFtcGxlOlxuICogY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gKiAgICAgcmV0dXJuIHtcbiAqICAgICAgICAgaXRlbUJ1aWxkZXI6IFt7XG4gKiAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pbkNvbnRyaWJ1dGlvblVzZXInLFxuICogICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTQnXG4gKiAgICAgICAgIH1dXG4gKiAgICAgfVxuICogfVxuICovXG53aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvblVzZXIgPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgICAgdXNlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgICBwcm9maWxlX2ltZ190aHVtYm5haWw6IGl0ZW0udXNlcl9wcm9maWxlX2ltZyxcbiAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS51c2VyX2lkLFxuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udXNlcl9uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiBpdGVtLmVtYWlsLFxuICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgYWRkaXRpb25hbERhdGEgPSBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdHYXRld2F5OiAnICsgaXRlbS5wYXllcl9lbWFpbCk7XG4gICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5BZG1pblVzZXIsIHtpdGVtOiB1c2VyLCBhZGRpdGlvbmFsX2RhdGE6IGFkZGl0aW9uYWxEYXRhfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuQWRtaW5Db250cmlidXRpb24gPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjb250cmlidXRpb24gPSBhcmdzLml0ZW07XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LmFkbWluLWNvbnRyaWJ1dGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtc21hbGwnLCAnUiQnICsgY29udHJpYnV0aW9uLnZhbHVlKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgubW9tZW50aWZ5KGNvbnRyaWJ1dGlvbi5jcmVhdGVkX2F0LCAnREQvTU0vWVlZWSBISDptbVtoXScpKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCBbXG4gICAgICAgICAgICAgICAgICAgICdJRCBkbyBHYXRld2F5OiAnLFxuICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiaHR0cHM6Ly9kYXNoYm9hcmQucGFnYXIubWUvIy90cmFuc2FjdGlvbnMvJyArIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkICsgJ1wiXScsIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFkbWluRXh0ZXJuYWxBY3Rpb24gY29tcG9uZW50XG4gKiBNYWtlcyBhcmJpdHJhcnkgYWpheCByZXF1ZXN0cyBhbmQgdXBkYXRlIHVuZGVybHlpbmdcbiAqIGRhdGEgZnJvbSBzb3VyY2UgZW5kcG9pbnQuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQWRtaW5FeHRlcm5hbEFjdGlvbiwge1xuICogICAgIGRhdGE6IHt9LFxuICogICAgIGl0ZW06IHJvd0Zyb21EYXRhYmFzZVxuICogfSlcbiAqL1xud2luZG93LmMuQWRtaW5FeHRlcm5hbEFjdGlvbiA9ICgoZnVuY3Rpb24obSwgaCwgYywgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBidWlsZGVyID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBlcnJvciA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZmFpbCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZGF0YSA9IHt9LFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW07XG5cbiAgICAgICAgICAgIGJ1aWxkZXIucmVxdWVzdE9wdGlvbnMuY29uZmlnID0gKHhocikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChoLmF1dGhlbnRpY2l0eVRva2VuKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ1gtQ1NSRi1Ub2tlbicsIGguYXV0aGVudGljaXR5VG9rZW4oKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgcmVsb2FkID0gXy5jb21wb3NlKGJ1aWxkZXIubW9kZWwuZ2V0Um93V2l0aFRva2VuLCBoLmlkVk0uaWQoaXRlbVtidWlsZGVyLnVwZGF0ZUtleV0pLnBhcmFtZXRlcnMpLFxuICAgICAgICAgICAgICAgIGwgPSBtLnByb3AoZmFsc2UpO1xuXG4gICAgICAgICAgICBjb25zdCByZWxvYWRJdGVtID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICByZWxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgcmVxdWVzdEVycm9yID0gKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGwoZmFsc2UpO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgIGVycm9yKHRydWUpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgdXBkYXRlSXRlbSA9IChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICBfLmV4dGVuZChpdGVtLCByZXNbMF0pO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHN1Ym1pdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBsKHRydWUpO1xuICAgICAgICAgICAgICAgIG0ucmVxdWVzdChidWlsZGVyLnJlcXVlc3RPcHRpb25zKS50aGVuKHJlbG9hZEl0ZW0sIHJlcXVlc3RFcnJvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgdW5sb2FkID0gKGVsLCBpc2luaXQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgbDogbCxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgICAgIHVubG9hZDogdW5sb2FkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBidG5WYWx1ZSA9IChjdHJsLmwoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSwgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC51bmxvYWRcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm0udy1mb3JtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgICAgIH0sICghY3RybC5jb21wbGV0ZSgpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsJywgZGF0YS5pbm5lckxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tc21hbGxbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIicgKyBidG5WYWx1ZSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICBdIDogKCFjdHJsLmVycm9yKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdSZXF1aXNpw6fDo28gZmVpdGEgY29tIHN1Y2Vzc28uJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdIb3V2ZSB1bSBwcm9ibGVtYSBuYSByZXF1aXNpw6fDo28uJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSkod2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5GaWx0ZXIgPSAoZnVuY3Rpb24oYywgbSwgXywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgdmFyIGZpbHRlckJ1aWxkZXIgPSBhcmdzLmZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBsYWJlbCA9IGFyZ3MubGFiZWwgfHwgJycsXG4gICAgICAgICAgICAgICAgbWFpbiA9IF8uZmluZFdoZXJlKGZpbHRlckJ1aWxkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyTWFpbidcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNhZG1pbi1jb250cmlidXRpb25zLWZpbHRlci53LXNlY3Rpb24ucGFnZS1oZWFkZXInLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMzAnLCBsYWJlbCksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdmb3JtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uc3VibWl0OiBhcmdzLnN1Ym1pdFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfLmZpbmRXaGVyZShmaWx0ZXJCdWlsZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpID8gbS5jb21wb25lbnQoY1ttYWluLmNvbXBvbmVudF0sIG1haW4uZGF0YSkgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS1tYXJnaW5ib3R0b20tMjAudy1yb3cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24udy1jb2wudy1jb2wtMTIuZm9udHNpemUtc21hbGxlc3QubGluay1oaWRkZW4tbGlnaHRbc3R5bGU9XCJiYWNrZ3JvdW5kOiBub25lOyBib3JkZXI6IG5vbmU7IG91dGxpbmU6IG5vbmU7IHRleHQtYWxpZ246IGxlZnQ7XCJdW3R5cGU9XCJidXR0b25cIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdGaWx0cm9zIGF2YW7Dp2Fkb3MgwqA+JykpLCAoY3RybC50b2dnbGVyKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjYWR2YW5jZWQtc2VhcmNoLnctcm93LmFkbWluLWZpbHRlcnMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChmaWx0ZXJCdWlsZGVyLCBmdW5jdGlvbihmKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChmLmNvbXBvbmVudCAhPT0gJ0ZpbHRlck1haW4nKSA/IG0uY29tcG9uZW50KGNbZi5jb21wb25lbnRdLCBmLmRhdGEpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cuYywgd2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbklucHV0QWN0aW9uID0gKGZ1bmN0aW9uKG0sIGgsIGMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7fSxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgIGtleSA9IGJ1aWxkZXIucHJvcGVydHksXG4gICAgICAgICAgICAgICAgZm9yY2VWYWx1ZSA9IGJ1aWxkZXIuZm9yY2VWYWx1ZSB8fCBudWxsLFxuICAgICAgICAgICAgICAgIG5ld1ZhbHVlID0gbS5wcm9wKGZvcmNlVmFsdWUpO1xuXG4gICAgICAgICAgICBoLmlkVk0uaWQoaXRlbVtidWlsZGVyLnVwZGF0ZUtleV0pO1xuXG4gICAgICAgICAgICB2YXIgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLm1vZGVsLnBhdGNoT3B0aW9ucyhoLmlkVk0ucGFyYW1ldGVycygpLCBkYXRhKSk7XG5cbiAgICAgICAgICAgIHZhciB1cGRhdGVJdGVtID0gZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgXy5leHRlbmQoaXRlbSwgcmVzWzBdKTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZGF0YVtrZXldID0gbmV3VmFsdWUoKTtcbiAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHVubG9hZCA9IGZ1bmN0aW9uKGVsLCBpc2luaXQsIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZShmb3JjZVZhbHVlKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogY29tcGxldGUsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIGw6IGwsXG4gICAgICAgICAgICAgICAgbmV3VmFsdWU6IG5ld1ZhbHVlLFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgdW5sb2FkOiB1bmxvYWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGJ0blZhbHVlID0gKGN0cmwubCgpKSA/ICdwb3IgZmF2b3IsIGFndWFyZGUuLi4nIDogZGF0YS5jYWxsVG9BY3Rpb247XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLCAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICAgICAgICBtKCcuZHJvcGRvd24tbGlzdC5jYXJkLnUtcmFkaXVzLmRyb3Bkb3duLWxpc3QtbWVkaXVtLnppbmRleC0xMCcsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnVubG9hZFxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWwnLCBkYXRhLmlubmVyTGFiZWwpLCAoZGF0YS5mb3JjZVZhbHVlID09PSB1bmRlZmluZWQpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZFt0eXBlPVwidGV4dFwiXVtwbGFjZWhvbGRlcj1cIicgKyBkYXRhLnBsYWNlaG9sZGVyICsgJ1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBjdHJsLm5ld1ZhbHVlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3RybC5uZXdWYWx1ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgZGF0YS5zdWNjZXNzTWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdIb3V2ZSB1bSBwcm9ibGVtYSBuYSByZXF1aXNpw6fDo28uICcgKyBkYXRhLmVycm9yTWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluSXRlbSA9IChmdW5jdGlvbihtLCBfLCBoLCBjKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIGRpc3BsYXlEZXRhaWxCb3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlEZXRhaWxCb3g6IGRpc3BsYXlEZXRhaWxCb3hcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSBhcmdzLml0ZW07XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jbGVhcmZpeC5jYXJkLnUtcmFkaXVzLnUtbWFyZ2luYm90dG9tLTIwLnJlc3VsdHMtYWRtaW4taXRlbXMnLCBbXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYXJncy5saXN0SXRlbSwge1xuICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICBrZXk6IGFyZ3Mua2V5XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLnctaW5saW5lLWJsb2NrLmFycm93LWFkbWluLmZhLmZhLWNoZXZyb24tZG93bi5mb250Y29sb3Itc2Vjb25kYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmRpc3BsYXlEZXRhaWxCb3gudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgY3RybC5kaXNwbGF5RGV0YWlsQm94KCkgPyBtLmNvbXBvbmVudChhcmdzLmxpc3REZXRhaWwsIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAga2V5OiBhcmdzLmtleVxuICAgICAgICAgICAgICAgIH0pIDogJydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5MaXN0ID0gKGZ1bmN0aW9uKG0sIGgsIGMpIHtcbiAgICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBsaXN0ID0gYXJncy52bS5saXN0O1xuICAgICAgICAgICAgaWYgKCFsaXN0LmNvbGxlY3Rpb24oKS5sZW5ndGggJiYgbGlzdC5maXJzdFBhZ2UpIHtcbiAgICAgICAgICAgICAgICBsaXN0LmZpcnN0UGFnZSgpLnRoZW4obnVsbCwgZnVuY3Rpb24oc2VydmVyRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncy52bS5lcnJvcihzZXJ2ZXJFcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgbGlzdCA9IGFyZ3Mudm0ubGlzdCxcbiAgICAgICAgICAgICAgICBlcnJvciA9IGFyZ3Mudm0uZXJyb3IsXG4gICAgICAgICAgICAgICAgbGFiZWwgPSBhcmdzLmxhYmVsIHx8ICcnO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcigpID9cbiAgICAgICAgICAgICAgICAgICAgbSgnLmNhcmQuY2FyZC1lcnJvci51LXJhZGl1cy5mb250d2VpZ2h0LWJvbGQnLCBlcnJvcigpKSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5pc0xvYWRpbmcoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgQ2FycmVnYW5kbyAke2xhYmVsLnRvTG93ZXJDYXNlKCl9Li4uYCA6IFttKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBsaXN0LnRvdGFsKCkpLCBgICR7bGFiZWwudG9Mb3dlckNhc2UoKX0gZW5jb250cmFkb3NgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2FkbWluLWNvbnRyaWJ1dGlvbnMtbGlzdC53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LmNvbGxlY3Rpb24oKS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5BZG1pbkl0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtOiBhcmdzLmxpc3RJdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdERldGFpbDogYXJncy5saXN0RGV0YWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogaXRlbS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBsaXN0Lm5leHRQYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdDYXJyZWdhciBtYWlzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5BZG1pbk5vdGlmaWNhdGlvbkhpc3RvcnkgY29tcG9uZW50XG4gKiBSZXR1cm4gbm90aWZpY2F0aW9ucyBsaXN0IGZyb20gYW4gVXNlciBvYmplY3QuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQWRtaW5Ob3RpZmljYXRpb25IaXN0b3J5LCB7XG4gKiAgICAgdXNlcjogdXNlclxuICogfSlcbiAqL1xuXG53aW5kb3cuYy5BZG1pbk5vdGlmaWNhdGlvbkhpc3RvcnkgPSAoKG0sIGgsIF8sIG1vZGVscykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25zID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBnZXROb3RpZmljYXRpb25zID0gKHVzZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5vdGlmaWNhdGlvbiA9IG1vZGVscy5ub3RpZmljYXRpb247XG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5nZXRQYWdlV2l0aFRva2VuKG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiAnZXEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VudF9hdDogJ2lzLm51bGwnXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC51c2VyX2lkKHVzZXIuaWQpXG4gICAgICAgICAgICAgICAgICAgIC5zZW50X2F0KCFudWxsKVxuICAgICAgICAgICAgICAgICAgICAub3JkZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VudF9hdDogJ2Rlc2MnXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5wYXJhbWV0ZXJzKCkpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKG5vdGlmaWNhdGlvbnMpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGdldE5vdGlmaWNhdGlvbnMoYXJncy51c2VyKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25zOiBub3RpZmljYXRpb25zXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnSGlzdMOzcmljbyBkZSBub3RpZmljYcOnw7VlcycpLFxuICAgICAgICAgICAgICAgIGN0cmwubm90aWZpY2F0aW9ucygpLm1hcCgoY0V2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXIuZGF0ZS1ldmVudCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeScsIGgubW9tZW50aWZ5KGNFdmVudC5zZW50X2F0LCAnREQvTU0vWVlZWSwgSEg6bW0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgLSAnLCBjRXZlbnQudGVtcGxhdGVfbmFtZSwgY0V2ZW50Lm9yaWdpbiA/ICcgLSAnICsgY0V2ZW50Lm9yaWdpbiA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXywgd2luZG93LmMubW9kZWxzKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFkbWluUHJvamVjdERldGFpbHNDYXJkIGNvbXBvbmVudFxuICogcmVuZGVyIGFuIGJveCB3aXRoIHNvbWUgcHJvamVjdCBzdGF0aXN0aWNzIGluZm9cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5BZG1pblByb2plY3REZXRhaWxzQ2FyZCwge1xuICogICAgIHJlc291cmNlOiBwcm9qZWN0RGV0YWlsIE9iamVjdCxcbiAqIH0pXG4gKi9cbndpbmRvdy5jLkFkbWluUHJvamVjdERldGFpbHNDYXJkID0gKChtLCBoLCBtb21lbnQpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHByb2plY3QgPSBhcmdzLnJlc291cmNlLFxuICAgICAgICAgICAgICAgIGlzRmluYWxMYXAgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEBUT0RPOiB1c2UgOCBkYXlzIGJlY2F1c2UgdGltZXpvbmUgb24ganNcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFfLmlzTnVsbChwcm9qZWN0LmV4cGlyZXNfYXQpICYmIG1vbWVudCgpLmFkZCg4LCAnZGF5cycpID49IG1vbWVudChwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICByZW1haW5pbmdUZXh0T2JqOiBoLnRyYW5zbGF0ZWRUaW1lKHByb2plY3QucmVtYWluaW5nX3RpbWUpLFxuICAgICAgICAgICAgICAgIGVsYXBzZWRUZXh0T2JqOiBoLnRyYW5zbGF0ZWRUaW1lKHByb2plY3QuZWxhcHNlZF90aW1lKSxcbiAgICAgICAgICAgICAgICBpc0ZpbmFsTGFwOiBpc0ZpbmFsTGFwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICBsZXQgcHJvamVjdCA9IGN0cmwucHJvamVjdCxcbiAgICAgICAgICAgICAgICBwcm9ncmVzcyA9IHByb2plY3QucHJvZ3Jlc3MudG9GaXhlZCgyKSxcbiAgICAgICAgICAgICAgICBzdGF0dXNUZXh0T2JqID0gaC5wcm9qZWN0U3RhdGVUZXh0Q2xhc3MocHJvamVjdC5zdGF0ZSksXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nVGV4dE9iaiA9IGN0cmwucmVtYWluaW5nVGV4dE9iaixcbiAgICAgICAgICAgICAgICBlbGFwc2VkVGV4dE9iaiA9IGN0cmwuZWxhcHNlZFRleHRPYmo7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcucHJvamVjdC1kZXRhaWxzLWNhcmQuY2FyZC51LXJhZGl1cy5jYXJkLXRlcmNpYXJ5LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRjb2xvci1zZWNvbmRhcnknLCAnU3RhdHVzOicpLCAnwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogc3RhdHVzVGV4dE9iai5jc3NDbGFzc1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgKGN0cmwuaXNGaW5hbExhcCgpICYmIHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/ICdSRVRBIEZJTkFMJyA6IHN0YXR1c1RleHRPYmoudGV4dCkpLCAnwqAnXG4gICAgICAgICAgICAgICAgICAgIF0pLCAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2plY3QuaXNfcHVibGlzaGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyLWZpbGwnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IChwcm9ncmVzcyA+IDEwMCA/IDEwMCA6IHByb2dyZXNzKSArICclJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCAnZmluYW5jaWFkbycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBwcm9ncmVzcyArICclJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ2xldmFudGFkb3MnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUiQgJyArIGguZm9ybWF0TnVtYmVyKHByb2plY3QucGxlZGdlZCwgMiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsICdhcG9pb3MnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcHJvamVjdC50b3RhbF9jb250cmlidXRpb25zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoXy5pc051bGwocHJvamVjdC5leHBpcmVzX2F0KSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ2luaWNpYWRvIGjDoScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgZWxhcHNlZFRleHRPYmoudG90YWwgKyAnICcgKyBlbGFwc2VkVGV4dE9iai51bml0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCAncmVzdGFtJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcmVtYWluaW5nVGV4dE9iai50b3RhbCArICcgJyArIHJlbWFpbmluZ1RleHRPYmoudW5pdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgICAgICAgICAgfSgpKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cubW9tZW50KSk7XG4iLCJ3aW5kb3cuYy5BZG1pblByb2plY3QgPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5pdGVtO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5hZG1pbi1wcm9qZWN0JywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi1wcm9qZWN0LnUtcmFkaXVzW3NyYz0nICsgcHJvamVjdC5wcm9qZWN0X2ltZyArICddW3dpZHRoPTUwXScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTkudy1jb2wtc21hbGwtOScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiLycgKyBwcm9qZWN0LnBlcm1hbGluayArICdcIl0nLCBwcm9qZWN0LnByb2plY3RfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250d2VpZ2h0LXNlbWlib2xkJywgcHJvamVjdC5wcm9qZWN0X3N0YXRlKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCBoLm1vbWVudGlmeShwcm9qZWN0LnByb2plY3Rfb25saW5lX2RhdGUpICsgJyBhICcgKyBoLm1vbWVudGlmeShwcm9qZWN0LnByb2plY3RfZXhwaXJlc19hdCkpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluUmFkaW9BY3Rpb24gPSAoZnVuY3Rpb24obSwgaCwgYywgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBidWlsZGVyID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge30sXG4gICAgICAgICAgICAgICAgLy9UT0RPOiBJbXBsZW1lbnQgYSBkZXNjcmlwdG9yIHRvIGFic3RyYWN0IHRoZSBpbml0aWFsIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0oKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IG0ucHJvcChpdGVtLmRlc2NyaXB0aW9uIHx8ICcnKSxcbiAgICAgICAgICAgICAgICBrZXkgPSBidWlsZGVyLmdldEtleSxcbiAgICAgICAgICAgICAgICBuZXdJRCA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgICAgICAgZ2V0RmlsdGVyID0ge30sXG4gICAgICAgICAgICAgICAgc2V0RmlsdGVyID0ge30sXG4gICAgICAgICAgICAgICAgcmFkaW9zID0gbS5wcm9wKCksXG4gICAgICAgICAgICAgICAgZ2V0QXR0ciA9IGJ1aWxkZXIucmFkaW9zLFxuICAgICAgICAgICAgICAgIGdldEtleSA9IGJ1aWxkZXIuZ2V0S2V5LFxuICAgICAgICAgICAgICAgIGdldEtleVZhbHVlID0gYXJncy5nZXRLZXlWYWx1ZSxcbiAgICAgICAgICAgICAgICB1cGRhdGVLZXkgPSBidWlsZGVyLnVwZGF0ZUtleSxcbiAgICAgICAgICAgICAgICB1cGRhdGVLZXlWYWx1ZSA9IGFyZ3MudXBkYXRlS2V5VmFsdWUsXG4gICAgICAgICAgICAgICAgdmFsaWRhdGUgPSBidWlsZGVyLnZhbGlkYXRlLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkSXRlbSA9IGJ1aWxkZXIuc2VsZWN0ZWRJdGVtIHx8IG0ucHJvcCgpO1xuXG4gICAgICAgICAgICBzZXRGaWx0ZXJbdXBkYXRlS2V5XSA9ICdlcSc7XG4gICAgICAgICAgICB2YXIgc2V0Vk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oc2V0RmlsdGVyKTtcbiAgICAgICAgICAgIHNldFZNW3VwZGF0ZUtleV0odXBkYXRlS2V5VmFsdWUpO1xuXG4gICAgICAgICAgICBnZXRGaWx0ZXJbZ2V0S2V5XSA9ICdlcSc7XG4gICAgICAgICAgICB2YXIgZ2V0Vk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oZ2V0RmlsdGVyKTtcbiAgICAgICAgICAgIGdldFZNW2dldEtleV0oZ2V0S2V5VmFsdWUpO1xuXG4gICAgICAgICAgICB2YXIgZ2V0TG9hZGVyID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGJ1aWxkZXIuZ2V0TW9kZWwuZ2V0UGFnZU9wdGlvbnMoZ2V0Vk0ucGFyYW1ldGVycygpKSk7XG5cbiAgICAgICAgICAgIHZhciBzZXRMb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYnVpbGRlci51cGRhdGVNb2RlbC5wYXRjaE9wdGlvbnMoc2V0Vk0ucGFyYW1ldGVycygpLCBkYXRhKSk7XG5cbiAgICAgICAgICAgIHZhciB1cGRhdGVJdGVtID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3SXRlbSA9IF8uZmluZFdoZXJlKHJhZGlvcygpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogZGF0YVswXVtidWlsZGVyLnNlbGVjdEtleV1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkSXRlbShuZXdJdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnTmVuaHVtIGl0ZW0gYXR1YWxpemFkbydcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgZmV0Y2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBnZXRMb2FkZXIubG9hZCgpLnRoZW4ocmFkaW9zLCBlcnJvcik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5ld0lEKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZhbGlkYXRpb24gPSB2YWxpZGF0ZShyYWRpb3MoKSwgbmV3SUQoKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKHZhbGlkYXRpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2J1aWxkZXIuc2VsZWN0S2V5XSA9IG5ld0lEKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRMb2FkZXIubG9hZCgpLnRoZW4odXBkYXRlSXRlbSwgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogdmFsaWRhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHVubG9hZCA9IGZ1bmN0aW9uKGVsLCBpc2luaXQsIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBuZXdJRCgnJyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzZXREZXNjcmlwdGlvbiA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbih0ZXh0KTtcbiAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZmV0Y2goKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogY29tcGxldGUsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIHNldERlc2NyaXB0aW9uOiBzZXREZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgc2V0TG9hZGVyOiBzZXRMb2FkZXIsXG4gICAgICAgICAgICAgICAgZ2V0TG9hZGVyOiBnZXRMb2FkZXIsXG4gICAgICAgICAgICAgICAgbmV3SUQ6IG5ld0lELFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgdW5sb2FkOiB1bmxvYWQsXG4gICAgICAgICAgICAgICAgcmFkaW9zOiByYWRpb3NcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0oKSxcbiAgICAgICAgICAgICAgICBidG5WYWx1ZSA9IChjdHJsLnNldExvYWRlcigpIHx8IGN0cmwuZ2V0TG9hZGVyKCkpID8gJ3BvciBmYXZvciwgYWd1YXJkZS4uLicgOiBkYXRhLmNhbGxUb0FjdGlvbjtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0yJywgW1xuICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0sIGRhdGEub3V0ZXJMYWJlbCksIChjdHJsLnRvZ2dsZXIoKSkgP1xuICAgICAgICAgICAgICAgIG0oJy5kcm9wZG93bi1saXN0LmNhcmQudS1yYWRpdXMuZHJvcGRvd24tbGlzdC1tZWRpdW0uemluZGV4LTEwJywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwudW5sb2FkXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdmb3JtLnctZm9ybScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgICAgICAgICB9LCAoIWN0cmwuY29tcGxldGUoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAoY3RybC5yYWRpb3MoKSkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAoY3RybC5yYWRpb3MoKSwgZnVuY3Rpb24ocmFkaW8sIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLm5ld0lEKHJhZGlvLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXREZXNjcmlwdGlvbihyYWRpby5kZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSAocmFkaW8uaWQgPT09IChpdGVtW2RhdGEuc2VsZWN0S2V5XSB8fCBpdGVtLmlkKSkgPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcmFkaW8nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0I3ItJyArIGluZGV4ICsgJy53LXJhZGlvLWlucHV0W3R5cGU9cmFkaW9dW25hbWU9XCJhZG1pbi1yYWRpb1wiXVt2YWx1ZT1cIicgKyByYWRpby5pZCArICdcIl0nICsgKChzZWxlY3RlZCkgPyAnW2NoZWNrZWRdJyA6ICcnKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbC53LWZvcm0tbGFiZWxbZm9yPVwici0nICsgaW5kZXggKyAnXCJdJywgJ1IkJyArIHJhZGlvLm1pbmltdW1fdmFsdWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSA6IGgubG9hZGVyKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzdHJvbmcnLCAnRGVzY3Jpw6fDo28nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCBjdHJsLmRlc2NyaXB0aW9uKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ1JlY29tcGVuc2EgYWx0ZXJhZGEgY29tIHN1Y2Vzc28hJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsIGN0cmwuZXJyb3IoKS5tZXNzYWdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYywgd2luZG93Ll8pKTtcbiIsIi8qKlxuICogd2luZG93LmMuQWRtaW5SZXNldFBhc3N3b3JkIGNvbXBvbmVudFxuICogTWFrZXMgYWpheCByZXF1ZXN0IHRvIHVwZGF0ZSBVc2VyIHBhc3N3b3JkLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkFkbWluUmVzZXRQYXNzd29yZCwge1xuICogICAgIGRhdGE6IHt9LFxuICogICAgIGl0ZW06IHJvd0Zyb21EYXRhYmFzZVxuICogfSlcbiAqL1xud2luZG93LmMuQWRtaW5SZXNldFBhc3N3b3JkID0gKChmdW5jdGlvbihtLCBoLCBjLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgbGV0IGJ1aWxkZXIgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgY29tcGxldGUgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBmYWlsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBrZXkgPSBidWlsZGVyLnByb3BlcnR5LFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7fSxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtO1xuXG4gICAgICAgICAgICBidWlsZGVyLnJlcXVlc3RPcHRpb25zLmNvbmZpZyA9ICh4aHIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaC5hdXRoZW50aWNpdHlUb2tlbigpKSB7XG4gICAgICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLUNTUkYtVG9rZW4nLCBoLmF1dGhlbnRpY2l0eVRva2VuKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGwgPSBtLnBvc3RncmVzdC5sb2FkZXIoXy5leHRlbmQoe30sIHtkYXRhOiBkYXRhfSwgYnVpbGRlci5yZXF1ZXN0T3B0aW9ucykpLFxuICAgICAgICAgICAgICAgIG5ld1Bhc3N3b3JkID0gbS5wcm9wKCcnKSxcbiAgICAgICAgICAgICAgICBlcnJvcl9tZXNzYWdlID0gbS5wcm9wKCcnKTtcblxuICAgICAgICAgICAgY29uc3QgcmVxdWVzdEVycm9yID0gKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGVycm9yX21lc3NhZ2UoZXJyLmVycm9yc1swXSk7XG4gICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgZXJyb3IodHJ1ZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgdXBkYXRlSXRlbSA9IChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICBfLmV4dGVuZChpdGVtLCByZXNbMF0pO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHN1Ym1pdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSBuZXdQYXNzd29yZCgpO1xuICAgICAgICAgICAgICAgIGwubG9hZCgpLnRoZW4odXBkYXRlSXRlbSwgcmVxdWVzdEVycm9yKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCB1bmxvYWQgPSAoZWwsIGlzaW5pdCwgY29udGV4dCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnRleHQub251bmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29tcGxldGU6IGNvbXBsZXRlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcixcbiAgICAgICAgICAgICAgICBlcnJvcl9tZXNzYWdlOiBlcnJvcl9tZXNzYWdlLFxuICAgICAgICAgICAgICAgIGw6IGwsXG4gICAgICAgICAgICAgICAgbmV3UGFzc3dvcmQ6IG5ld1Bhc3N3b3JkLFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgdW5sb2FkOiB1bmxvYWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGJ0blZhbHVlID0gKGN0cmwubCgpKSA/ICdwb3IgZmF2b3IsIGFndWFyZGUuLi4nIDogZGF0YS5jYWxsVG9BY3Rpb247XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLCAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICAgICAgICBtKCcuZHJvcGRvd24tbGlzdC5jYXJkLnUtcmFkaXVzLmRyb3Bkb3duLWxpc3QtbWVkaXVtLnppbmRleC0xMCcsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnVubG9hZFxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWwnLCBkYXRhLmlubmVyTGFiZWwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkW3R5cGU9XCJ0ZXh0XCJdW25hbWU9XCInICsgZGF0YS5wcm9wZXJ0eSArICdcIl1bcGxhY2Vob2xkZXI9XCInICsgZGF0YS5wbGFjZWhvbGRlciArICdcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgY3RybC5uZXdQYXNzd29yZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGN0cmwubmV3UGFzc3dvcmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWJ1dHRvbi5idG4uYnRuLXNtYWxsW3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCInICsgYnRuVmFsdWUgKyAnXCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSA6ICghY3RybC5lcnJvcigpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZG9uZVtzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnU2VuaGEgYWx0ZXJhZGEgY29tIHN1Y2Vzc28uJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsIGN0cmwuZXJyb3JfbWVzc2FnZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblJld2FyZCA9IChmdW5jdGlvbihtLCBjLCBoLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJld2FyZCA9IGFyZ3MucmV3YXJkKCksXG4gICAgICAgICAgICAgICAgYXZhaWxhYmxlID0gcGFyc2VJbnQocmV3YXJkLnBhaWRfY291bnQpICsgcGFyc2VJbnQocmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCk7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdSZWNvbXBlbnNhJyksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyJywgcmV3YXJkLmlkID8gW1xuICAgICAgICAgICAgICAgICAgICAnSUQ6ICcgKyByZXdhcmQuaWQsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdWYWxvciBtw61uaW1vOiBSJCcgKyBoLmZvcm1hdE51bWJlcihyZXdhcmQubWluaW11bV92YWx1ZSwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJ0Rpc3BvbsOtdmVpczogJyArIGF2YWlsYWJsZSArICcgLyAnICsgKHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgfHwgJyZpbmZpbjsnKSksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdBZ3VhcmRhbmRvIGNvbmZpcm1hw6fDo286ICcgKyByZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50LFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnRGVzY3Jpw6fDo286ICcgKyByZXdhcmQuZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICBdIDogJ0Fwb2lvIHNlbSByZWNvbXBlbnNhJylcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5UcmFuc2FjdGlvbkhpc3RvcnkgPSAoZnVuY3Rpb24obSwgaCwgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjb250cmlidXRpb24gPSBhcmdzLmNvbnRyaWJ1dGlvbixcbiAgICAgICAgICAgICAgICBtYXBFdmVudHMgPSBfLnJlZHVjZShbe1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24ucGFpZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0Fwb2lvIGNvbmZpcm1hZG8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24ucGVuZGluZ19yZWZ1bmRfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdSZWVtYm9sc28gc29saWNpdGFkbydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5yZWZ1bmRlZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0VzdG9ybm8gcmVhbGl6YWRvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLmNyZWF0ZWRfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBcG9pbyBjcmlhZG8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24ucmVmdXNlZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0Fwb2lvIGNhbmNlbGFkbydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5kZWxldGVkX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXBvaW8gZXhjbHXDrWRvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLmNoYXJnZWJhY2tfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdDaGFyZ2ViYWNrJ1xuICAgICAgICAgICAgICAgIH1dLCBmdW5jdGlvbihtZW1vLCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmRhdGUgIT09IG51bGwgJiYgaXRlbS5kYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ub3JpZ2luYWxEYXRlID0gaXRlbS5kYXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5kYXRlID0gaC5tb21lbnRpZnkoaXRlbS5kYXRlLCAnREQvTU0vWVlZWSwgSEg6bW0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtZW1vLmNvbmNhdChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtZW1vO1xuICAgICAgICAgICAgICAgIH0sIFtdKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcmRlcmVkRXZlbnRzOiBfLnNvcnRCeShtYXBFdmVudHMsICdvcmlnaW5hbERhdGUnKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnSGlzdMOzcmljbyBkYSB0cmFuc2HDp8OjbycpLFxuICAgICAgICAgICAgICAgIGN0cmwub3JkZXJlZEV2ZW50cy5tYXAoZnVuY3Rpb24oY0V2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXIuZGF0ZS1ldmVudCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5JywgY0V2ZW50LmRhdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIGNFdmVudC5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblRyYW5zYWN0aW9uID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY29udHJpYnV0aW9uID0gYXJncy5jb250cmlidXRpb247XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnRGV0YWxoZXMgZG8gYXBvaW8nKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICdWYWxvcjogUiQnICsgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLnZhbHVlLCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ1RheGE6IFIkJyArIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi5nYXRld2F5X2ZlZSwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdBZ3VhcmRhbmRvIENvbmZpcm1hw6fDo286ICcgKyAoY29udHJpYnV0aW9uLndhaXRpbmdfcGF5bWVudCA/ICdTaW0nIDogJ07Do28nKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0Fuw7RuaW1vOiAnICsgKGNvbnRyaWJ1dGlvbi5hbm9ueW1vdXMgPyAnU2ltJyA6ICdOw6NvJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdJZCBwYWdhbWVudG86ICcgKyBjb250cmlidXRpb24uZ2F0ZXdheV9pZCxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0Fwb2lvOiAnICsgY29udHJpYnV0aW9uLmNvbnRyaWJ1dGlvbl9pZCxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0NoYXZlOsKgXFxuJyxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uLmtleSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ01laW86ICcgKyBjb250cmlidXRpb24uZ2F0ZXdheSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ09wZXJhZG9yYTogJyArIChjb250cmlidXRpb24uZ2F0ZXdheV9kYXRhICYmIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2RhdGEuYWNxdWlyZXJfbmFtZSksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksIChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250cmlidXRpb24uaXNfc2Vjb25kX3NsaXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW20oJ2EubGluay1oaWRkZW5baHJlZj1cIiNcIl0nLCAnQm9sZXRvIGJhbmPDoXJpbycpLCAnICcsIG0oJ3NwYW4uYmFkZ2UnLCAnMmEgdmlhJyldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KCkpLFxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFkbWluVXNlckRldGFpbCBjb21wb25lbnRcbiAqIFJldHVybiBhY3Rpb24gaW5wdXRzIHRvIGJlIHVzZWQgaW5zaWRlIEFkbWluTGlzdCBjb21wb25lbnQuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQWRtaW5MaXN0LCB7XG4gKiAgICAgZGF0YToge30sXG4gKiAgICAgbGlzdERldGFpbDogYy5BZG1pblVzZXJEZXRhaWxcbiAqIH0pXG4gKi9cbndpbmRvdy5jLkFkbWluVXNlckRldGFpbCA9IChmdW5jdGlvbihtLCBfLCBjKXtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc2V0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ3Bhc3N3b3JkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ1JlZGVmaW5pcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnTm92YSBzZW5oYSBkZSBVc3XDoXJpbzonLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1JlZGVmaW5pciBzZW5oYScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ2V4OiAxMjNtdWRAcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMudXNlclxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZWFjdGl2YXRlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2RlYWN0aXZhdGVkX2F0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ1JlYXRpdmFyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdUZW0gY2VydGV6YSBxdWUgZGVzZWphIHJlYXRpdmFyIGVzc2UgdXN1w6FyaW8/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NNZXNzYWdlOiAnVXN1w6FyaW8gcmVhdGl2YWRvIGNvbSBzdWNlc3NvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdPIHVzdcOhcmlvIG7Do28gcMO0ZGUgc2VyIHJlYXRpdmFkbyEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1JlYXRpdmFyIHVzdcOhcmlvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcmNlVmFsdWU6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMudXNlclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgICAgICAgIHZhciBhY3Rpb25zID0gY3RybC5hY3Rpb25zLFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgICAgZGV0YWlscyA9IGFyZ3MuZGV0YWlscztcblxuICAgICAgICAgICAgY29uc3QgYWRkT3B0aW9ucyA9IChidWlsZGVyLCBpZCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgYnVpbGRlciwge1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0T3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiAoYC91c2Vycy8ke2lkfS9uZXdfcGFzc3dvcmRgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjYWRtaW4tY29udHJpYnV0aW9uLWRldGFpbC1ib3gnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW50b3AtMjAudS1tYXJnaW5ib3R0b20tMjAnKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5SZXNldFBhc3N3b3JkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBhZGRPcHRpb25zKGFjdGlvbnMucmVzZXQsIGl0ZW0uaWQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgKGl0ZW0uZGVhY3RpdmF0ZWRfYXQpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5JbnB1dEFjdGlvbiwge2RhdGE6IGFjdGlvbnMucmVhY3RpdmF0ZSwgaXRlbTogaXRlbX0pIDogJydcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cuY2FyZC5jYXJkLXRlcmNpYXJ5LnUtcmFkaXVzJywgW1xuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluTm90aWZpY2F0aW9uSGlzdG9yeSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5Vc2VySXRlbSA9IChmdW5jdGlvbihtLCBjLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oXG4gICAgICAgICAgICAgICAgJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluVXNlciwgYXJncylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblVzZXIgPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciB1c2VyID0gYXJncy5pdGVtO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5hZG1pbi11c2VyJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2ltZy51c2VyLWF2YXRhcltzcmM9XCInICsgaC51c2VBdmF0YXJPckRlZmF1bHQodXNlci5wcm9maWxlX2ltZ190aHVtYm5haWwpICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTkudy1jb2wtc21hbGwtOScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiL3VzZXJzLycgKyB1c2VyLmlkICsgJy9lZGl0XCJdJywgdXNlci5uYW1lIHx8IHVzZXIuZW1haWwpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCAnVXN1w6FyaW86ICcgKyB1c2VyLmlkKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnRW1haWw6ICcgKyB1c2VyLmVtYWlsKSxcbiAgICAgICAgICAgICAgICAgICAgYXJncy5hZGRpdGlvbmFsX2RhdGFcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5DYXRlZ29yeUJ1dHRvbiBjb21wb25lbnRcbiAqIFJldHVybiBhIGxpbmsgd2l0aCBhIGJ0bi1jYXRlZ29yeSBjbGFzcy5cbiAqIEl0IHVzZXMgYSBjYXRlZ29yeSBwYXJhbWV0ZXIuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQ2F0ZWdvcnlCdXR0b24sIHtcbiAqICAgICBjYXRlZ29yeToge1xuICogICAgICAgICBpZDogMSxcbiAqICAgICAgICAgbmFtZTogJ1ZpZGVvJyxcbiAqICAgICAgICAgb25saW5lX3Byb2plY3RzOiAxXG4gKiAgICAgfVxuICogfSlcbiAqL1xud2luZG93LmMuQ2F0ZWdvcnlCdXR0b24gPSAoKG0sIGMpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBhcmdzLmNhdGVnb3J5O1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgIG0oYGEudy1pbmxpbmUtYmxvY2suYnRuLWNhdGVnb3J5JHtjYXRlZ29yeS5uYW1lLmxlbmd0aCA+IDEzID8gJy5kb3VibGUtbGluZScgOiAnJ31baHJlZj0nI2J5X2NhdGVnb3J5X2lkLyR7Y2F0ZWdvcnkuaWR9J11gLFxuICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnkubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZS5leHBsb3JlJywgY2F0ZWdvcnkub25saW5lX3Byb2plY3RzKVxuICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkRyb3Bkb3duID0gKGZ1bmN0aW9uKG0sIGgsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbShcbiAgICAgICAgICAgICAgICBgc2VsZWN0JHthcmdzLmNsYXNzZXN9W2lkPVwiJHthcmdzLmlkfVwiXWAsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLnZhbHVlUHJvcCksXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLnZhbHVlUHJvcCgpXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBfLm1hcChhcmdzLm9wdGlvbnMsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJ29wdGlvblt2YWx1ZT1cIicgKyBkYXRhLnZhbHVlICsgJ1wiXScsIGRhdGEub3B0aW9uKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5GaWx0ZXJCdXR0b24gY29tcG9uZW50XG4gKiBSZXR1cm4gYSBsaW5rIHdpdGggYSBmaWx0ZXJzIGNsYXNzLlxuICogSXQgdXNlcyBhIGhyZWYgYW5kIGEgdGl0bGUgcGFyYW1ldGVyLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkZpbHRlckJ1dHRvbiwge1xuICogICAgIHRpdGxlOiAnRmlsdGVyIGJ5IGNhdGVnb3J5JyxcbiAqICAgICBocmVmOiAnZmlsdGVyX2J5X2NhdGVnb3J5J1xuICogfSlcbiAqL1xud2luZG93LmMuRmlsdGVyQnV0dG9uID0gKChtLCBjKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gYXJncy50aXRsZSxcbiAgICAgICAgICAgICAgICAgIGhyZWYgPSBhcmdzLmhyZWY7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgbShgYS53LWlubGluZS1ibG9jay5idG4tY2F0ZWdvcnkuZmlsdGVycyR7dGl0bGUubGVuZ3RoID4gMTMgPyAnLmRvdWJsZS1saW5lJyA6ICcnfVtocmVmPScjJHtocmVmfSddYCwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuRmlsdGVyRGF0ZVJhbmdlID0gKGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl1bdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5maXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MuZmlyc3QoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTIudy1jb2wtdGlueS0yJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS10ZXh0LWNlbnRlci5saW5laGVpZ2h0LWxvb3NlcicsICdlJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MubGFzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MubGFzdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJEcm9wZG93biA9IChmdW5jdGlvbihtLCBjLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTYnLCBbXG4gICAgICAgICAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkRyb3Bkb3duLCB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBhcmdzLmluZGV4LFxuICAgICAgICAgICAgICAgICAgICBjbGFzc2VzOiAnLnctc2VsZWN0LnRleHQtZmllbGQucG9zaXRpdmUnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZVByb3A6IGFyZ3Mudm0sXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IGFyZ3Mub3B0aW9uc1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkZpbHRlck1haW4gPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmUubWVkaXVtW3BsYWNlaG9sZGVyPVwiJyArIGFyZ3MucGxhY2Vob2xkZXIgKyAnXCJdW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy52bSksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy52bSgpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0I2ZpbHRlci1idG4uYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiQnVzY2FyXCJdJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuRmlsdGVyTnVtYmVyUmFuZ2UgPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICAgICAgICAgIG0oJ2xhYmVsLmZvbnRzaXplLXNtYWxsZXJbZm9yPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywgYXJncy5sYWJlbCksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVtpZD1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmZpcnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy5maXJzdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LXRleHQtY2VudGVyLmxpbmVoZWlnaHQtbG9vc2VyJywgJ2UnKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5sYXN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy5sYXN0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIi8qKlxuICogd2luZG93LmMubGFuZGluZ1FBIGNvbXBvbmVudFxuICogQSB2aXN1YWwgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgYSBxdWVzdGlvbi9hbnN3ZXIgYm94IHdpdGggdG9nZ2xlXG4gKlxuICogRXhhbXBsZTpcbiAqIHZpZXc6ICgpID0+IHtcbiAqICAgICAgLi4uXG4gKiAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gKiAgICAgICAgICBxdWVzdGlvbjogJ1doYXRzIHlvdXIgbmFtZT8nLFxuICogICAgICAgICAgYW5zd2VyOiAnRGFydGggVmFkZXIuJ1xuICogICAgICB9KVxuICogICAgICAuLi5cbiAqICB9XG4gKi9cbndpbmRvdy5jLmxhbmRpbmdRQSA9IChmdW5jdGlvbihtLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc2hvd0Fuc3dlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcuY2FyZC5xYS1jYXJkLnUtbWFyZ2luYm90dG9tLTIwLnUtcmFkaXVzLmJ0bi10ZXJjaWFyeScsW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlJywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnNob3dBbnN3ZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgYXJncy5xdWVzdGlvbiksXG4gICAgICAgICAgICAgICAgY3RybC5zaG93QW5zd2VyKCkgPyBtKCdwLnUtbWFyZ2ludG9wLTIwLmZvbnRzaXplLXNtYWxsJywgbS50cnVzdChhcmdzLmFuc3dlcikpIDogJydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMubGFuZGluZ1NpZ251cCBjb21wb25lbnRcbiAqIEEgdmlzdWFsIGNvbXBvbmVudCB0aGF0IGRpc3BsYXlzIHNpZ251cCBlbWFpbCB0eXBpY2FsbHkgdXNlZCBvbiBsYW5kaW5nIHBhZ2VzLlxuICogSXQgYWNjZXB0cyBhIGN1c3RvbSBmb3JtIGFjdGlvbiB0byBhdHRhY2ggdG8gdGhpcmQtcGFydHkgc2VydmljZXMgbGlrZSBNYWlsY2hpbXBcbiAqXG4gKiBFeGFtcGxlOlxuICogdmlldzogKCkgPT4ge1xuICogICAgICAuLi5cbiAqICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nU2lnbnVwLCB7XG4gKiAgICAgICAgICBidWlsZGVyOiB7XG4gKiAgICAgICAgICAgICAgY3VzdG9tQWN0aW9uOiAnaHR0cDovL2Zvcm1lbmRwb2ludC5jb20nXG4gKiAgICAgICAgICB9XG4gKiAgICAgIH0pXG4gKiAgICAgIC4uLlxuICogIH1cbiAqL1xud2luZG93LmMubGFuZGluZ1NpZ251cCA9IChmdW5jdGlvbihtLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJ1aWxkZXIgPSBhcmdzLmJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgZW1haWwgPSBtLnByb3AoJycpLFxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBzdWJtaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChoLnZhbGlkYXRlRW1haWwoZW1haWwoKSkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcih0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgZXJyb3JDbGFzc2VzID0gKCFjdHJsLmVycm9yKSA/ICcucG9zaXRpdmUuZXJyb3InIDogJyc7XG4gICAgICAgICAgICByZXR1cm4gbSgnZm9ybS53LWZvcm1baWQ9XCJlbWFpbC1mb3JtXCJdW21ldGhvZD1cInBvc3RcIl1bYWN0aW9uPVwiJyArIGFyZ3MuYnVpbGRlci5jdXN0b21BY3Rpb24gKyAnXCJdJyx7XG4gICAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICB9LFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgbShgaW5wdXQke2Vycm9yQ2xhc3Nlc30udy1pbnB1dC50ZXh0LWZpZWxkLm1lZGl1bVtuYW1lPVwiRU1BSUxcIl1bcGxhY2Vob2xkZXI9XCJEaWdpdGUgc2V1IGVtYWlsXCJdW3R5cGU9XCJ0ZXh0XCJdYCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgY3RybC5lbWFpbCksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3RybC5lbWFpbCgpXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAoY3RybC5lcnJvcigpID8gbSgnc3Bhbi5mb250c2l6ZS1zbWFsbGVyLnRleHQtZXJyb3InLCAnRS1tYWlsIGludsOhbGlkbycpIDogJycpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tbGFyZ2VbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIkNhZGFzdHJhclwiXScpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuTW9kYWxCb3ggY29tcG9uZW50XG4gKiBCdWlscyB0aGUgdGVtcGxhdGUgZm9yIHVzaW5nIG1vZGFsXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuTW9kYWxCb3gsIHtcbiAqICAgICBkaXNwbGF5TW9kYWw6IHRvb2dsZVByb3BPYmplY3QsXG4gKiAgICAgY29udGVudDogWydDb21wb25lbnROYW1lJywge2FyZ3g6ICd4JywgYXJneTogJ3knfV1cbiAqIH0pXG4gKiBDb21wb25lbnROYW1lIHN0cnVjdHVyZSA9PiAgbSgnZGl2JywgW1xuICogICAgICAgICAgICAgICAgICBtKCcubW9kYWwtZGlhbG9nLWhlYWRlcicsIFtdKSxcbiAqICAgICAgICAgICAgICAgICAgbSgnLm1vZGFsLWRpYWxvZy1jb250ZW50JywgW10pLFxuICogICAgICAgICAgICAgICAgICBtKCcubW9kYWwtZGlhbG9nLW5hdi1ib3R0b20nLCBbXSksXG4gKiAgICAgICAgICAgICAgXSlcbiAqL1xuXG53aW5kb3cuYy5Nb2RhbEJveCA9ICgobSwgYywgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLm1vZGFsLWJhY2tkcm9wJywgW1xuICAgICAgICAgICAgICAgIG0oJy5tb2RhbC1kaWFsb2ctb3V0ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5tb2RhbC1kaWFsb2ctaW5uZXIubW9kYWwtZGlhbG9nLXNtYWxsJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS53LWlubGluZS1ibG9jay5tb2RhbC1jbG9zZS5mYS5mYS1jbG9zZS5mYS1sZ1tocmVmPVwianM6dm9pZCgwKTtcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogYXJncy5kaXNwbGF5TW9kYWwudG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGNbYXJncy5jb250ZW50WzBdXSwgYXJncy5jb250ZW50WzFdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5QYXltZW50U3RhdHVzID0gKGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcGF5bWVudCA9IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgICBjYXJkID0gbnVsbCxcbiAgICAgICAgICAgICAgICBkaXNwbGF5UGF5bWVudE1ldGhvZCwgcGF5bWVudE1ldGhvZENsYXNzLCBzdGF0ZUNsYXNzO1xuXG4gICAgICAgICAgICBjYXJkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBheW1lbnQuZ2F0ZXdheV9kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAocGF5bWVudC5nYXRld2F5LnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ21vaXAnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FydGFvX2JpbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcnRhb19maW5hbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJhbmQ6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcnRhb19iYW5kZWlyYVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdwYWdhcm1lJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcmRfZmlyc3RfZGlnaXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FyZF9sYXN0X2RpZ2l0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJhbmQ6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcmRfYnJhbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZGlzcGxheVBheW1lbnRNZXRob2QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHBheW1lbnQucGF5bWVudF9tZXRob2QudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdib2xldG9iYW5jYXJpbyc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnc3BhbiNib2xldG8tZGV0YWlsJywgJycpO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdjYXJ0YW9kZWNyZWRpdG8nOlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNhcmREYXRhID0gY2FyZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhcmREYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJyNjcmVkaXRjYXJkLWRldGFpbC5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmREYXRhLmZpcnN0X2RpZ2l0cyArICcqKioqKionICsgY2FyZERhdGEubGFzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmREYXRhLmJyYW5kICsgJyAnICsgcGF5bWVudC5pbnN0YWxsbWVudHMgKyAneCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBwYXltZW50TWV0aG9kQ2xhc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHBheW1lbnQucGF5bWVudF9tZXRob2QudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdib2xldG9iYW5jYXJpbyc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy5mYS1iYXJjb2RlJztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnY2FydGFvZGVjcmVkaXRvJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLmZhLWNyZWRpdC1jYXJkJztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLmZhLXF1ZXN0aW9uJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzdGF0ZUNsYXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChwYXltZW50LnN0YXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3BhaWQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcudGV4dC1zdWNjZXNzJztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncmVmdW5kZWQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcudGV4dC1yZWZ1bmRlZCc7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3BlbmRpbmcnOlxuICAgICAgICAgICAgICAgICAgICBjYXNlICdwZW5kaW5nX3JlZnVuZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy50ZXh0LXdhaXRpbmcnO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcudGV4dC1lcnJvcic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5UGF5bWVudE1ldGhvZDogZGlzcGxheVBheW1lbnRNZXRob2QsXG4gICAgICAgICAgICAgICAgcGF5bWVudE1ldGhvZENsYXNzOiBwYXltZW50TWV0aG9kQ2xhc3MsXG4gICAgICAgICAgICAgICAgc3RhdGVDbGFzczogc3RhdGVDbGFzc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcGF5bWVudCA9IGFyZ3MuaXRlbTtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cucGF5bWVudC1zdGF0dXMnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtY2lyY2xlJyArIGN0cmwuc3RhdGVDbGFzcygpKSwgJ8KgJyArIHBheW1lbnQuc3RhdGVcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYScgKyBjdHJsLnBheW1lbnRNZXRob2RDbGFzcygpKSwgJyAnLCBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIjXCJdJywgcGF5bWVudC5wYXltZW50X21ldGhvZClcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0JywgW1xuICAgICAgICAgICAgICAgICAgICBjdHJsLmRpc3BsYXlQYXltZW50TWV0aG9kKClcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuUG9wTm90aWZpY2F0aW9uID0gKChtLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGRpc3BsYXlOb3RpZmljYXRpb24gPSBoLnRvZ2dsZVByb3AodHJ1ZSwgZmFsc2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlOb3RpZmljYXRpb246IGRpc3BsYXlOb3RpZmljYXRpb25cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKGN0cmwuZGlzcGxheU5vdGlmaWNhdGlvbigpID8gbSgnLmZsYXNoLnctY2xlYXJmaXguY2FyZC5jYXJkLW5vdGlmaWNhdGlvbi51LXJhZGl1cy56aW5kZXgtMjAnLCBbXG4gICAgICAgICAgICAgICAgbSgnaW1nLmljb24tY2xvc2Vbc3JjPVwiL2Fzc2V0cy9jYXRhcnNlX2Jvb3RzdHJhcC94LnBuZ1wiXVt3aWR0aD1cIjEyXCJdW2FsdD1cImZlY2hhclwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5kaXNwbGF5Tm90aWZpY2F0aW9uLnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbCcsIGFyZ3MubWVzc2FnZSlcbiAgICAgICAgICAgIF0pIDogbSgnc3BhbicpKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0QWJvdXQgPSAoKG0sIGMsIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCgpIHx8IHt9LFxuICAgICAgICAgICAgICAgIG9ubGluZURheXMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkaWZmID0gbW9tZW50KHByb2plY3Quem9uZV9vbmxpbmVfZGF0ZSkuZGlmZihtb21lbnQocHJvamVjdC56b25lX2V4cGlyZXNfYXQpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uID0gbW9tZW50LmR1cmF0aW9uKGRpZmYpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtTWF0aC5jZWlsKGR1cmF0aW9uLmFzRGF5cygpKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGV0IGZ1bmRpbmdQZXJpb2QgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCAmJiBoLmV4aXN0eShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCkpID8gbSgnLmZ1bmRpbmctcGVyaW9kJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCAnUGVyw61vZG8gZGUgY2FtcGFuaGEnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsIGAke2gubW9tZW50aWZ5KHByb2plY3Quem9uZV9vbmxpbmVfZGF0ZSl9IC0gJHtoLm1vbWVudGlmeShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCl9ICgke29ubGluZURheXMoKX0gZGlhcylgKVxuICAgICAgICAgICAgICAgIF0pIDogJyc7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3QtYWJvdXQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnByb2plY3QtYWJvdXQudy1jb2wudy1jb2wtOCcsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBoLlVJSGVscGVyKClcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtYmFzZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3N0cm9uZycsICdPIHByb2pldG8nKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlW2l0ZW1wcm9wPVwiYWJvdXRcIl0nLCBtLnRydXN0KGguc2VsZk9yRW1wdHkocHJvamVjdC5hYm91dF9odG1sLCAnLi4uJykpKSxcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5idWRnZXQgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdwLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdPcsOnYW1lbnRvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdwLmZvbnRzaXplLWJhc2UnLCBtLnRydXN0KHByb2plY3QuYnVkZ2V0KSlcbiAgICAgICAgICAgICAgICAgICAgXSA6ICcnLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCAhXy5pc0VtcHR5KGFyZ3MucmV3YXJkRGV0YWlscygpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0zMCcsICdSZWNvbXBlbnNhcycpLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RSZXdhcmRMaXN0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogYXJncy5yZXdhcmREZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgIH0pLCBmdW5kaW5nUGVyaW9kKClcbiAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTMwJywgJ1N1Z2VzdMO1ZXPCoGRlwqBhcG9pbycpLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RTdWdnZXN0ZWRDb250cmlidXRpb25zLCB7cHJvamVjdDogcHJvamVjdH0pLFxuICAgICAgICAgICAgICAgICAgICBmdW5kaW5nUGVyaW9kKClcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RDYXJkID0gKChtLCBoLCBtb2RlbHMsIEkxOG4pID0+IHtcbiAgICBjb25zdCBJMThuU2NvcGUgPSBfLnBhcnRpYWwoaC5pMThuU2NvcGUsICdwcm9qZWN0cy5jYXJkJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBwcm9ncmVzcyA9IHByb2plY3QucHJvZ3Jlc3MudG9GaXhlZCgyKSxcbiAgICAgICAgICAgICAgICByZW1haW5pbmdUZXh0T2JqID0gaC50cmFuc2xhdGVkVGltZShwcm9qZWN0LnJlbWFpbmluZ190aW1lKSxcbiAgICAgICAgICAgICAgICBsaW5rID0gJy8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAoYXJncy5yZWYgPyAnP3JlZj0nICsgYXJncy5yZWYgOiAnJyk7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuY2FyZC1wcm9qZWN0LmNhcmQudS1yYWRpdXMnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oYGEuY2FyZC1wcm9qZWN0LXRodW1iW2hyZWY9XCIke2xpbmt9XCJdYCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1pbWFnZSc6IGB1cmwoJHtwcm9qZWN0LnByb2plY3RfaW1nfSlgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXNwbGF5JzogJ2Jsb2NrJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmNhcmQtcHJvamVjdC1kZXNjcmlwdGlvbi5hbHQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHkubGluZWhlaWdodC10aWdodC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1iYXNlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGEubGluay1oaWRkZW5baHJlZj1cIiR7bGlua31cIl1gLCBwcm9qZWN0LnByb2plY3RfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeS51LW1hcmdpbmJvdHRvbS0yMCcsIGAke0kxOG4udCgnYnknLCBJMThuU2NvcGUoKSl9ICR7cHJvamVjdC5vd25lcl9uYW1lfWApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuZm9udGNvbG9yLXNlY29uZGFyeS5mb250c2l6ZS1zbWFsbGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGEubGluay1oaWRkZW5baHJlZj1cIiR7bGlua31cIl1gLCBwcm9qZWN0LmhlYWRsaW5lKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmNhcmQtcHJvamVjdC1hdXRob3IuYWx0dCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgW20oJ3NwYW4uZmEuZmEtbWFwLW1hcmtlci5mYS0xJywgJyAnKSwgYCAke3Byb2plY3QuY2l0eV9uYW1lID8gcHJvamVjdC5jaXR5X25hbWUgOiAnJ30sICR7cHJvamVjdC5zdGF0ZV9hY3JvbnltID8gcHJvamVjdC5zdGF0ZV9hY3JvbnltIDogJyd9YF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKGAuY2FyZC1wcm9qZWN0LW1ldGVyLiR7cHJvamVjdC5zdGF0ZX1gLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAoXy5jb250YWlucyhbJ3N1Y2Nlc3NmdWwnLCAnZmFpbGVkJywgJ3dhaXRpbmdfZnVuZHMnXSwgcHJvamVjdC5zdGF0ZSkpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBJMThuLnQoJ2Rpc3BsYXlfc3RhdHVzLicgKyBwcm9qZWN0LnN0YXRlLCBJMThuU2NvcGUoKSkpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5tZXRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcubWV0ZXItZmlsbCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBgJHsocHJvZ3Jlc3MgPiAxMDAgPyAxMDAgOiBwcm9ncmVzcyl9JWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmNhcmQtcHJvamVjdC1zdGF0cycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsIGAke01hdGguY2VpbChwcm9qZWN0LnByb2dyZXNzKX0lYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBgUiQgJHtoLmZvcm1hdE51bWJlcihwcm9qZWN0LnBsZWRnZWQpfWApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC10aWdodGVzdCcsICdMZXZhbnRhZG9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC51LXRleHQtcmlnaHQnLCBwcm9qZWN0LmV4cGlyZXNfYXQgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBgJHtyZW1haW5pbmdUZXh0T2JqLnRvdGFsfSAke3JlbWFpbmluZ1RleHRPYmoudW5pdH1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtdGlnaHRlc3QnLCAocmVtYWluaW5nVGV4dE9iai50b3RhbCA+IDEpID8gJ1Jlc3RhbnRlcycgOiAnUmVzdGFudGUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LXRpZ2h0JywgWydQcmF6byBlbScsbSgnYnInKSwnYWJlcnRvJ10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cuSTE4bikpO1xuIiwid2luZG93LmMuUHJvamVjdENvbW1lbnRzID0gKGZ1bmN0aW9uKG0sIGMsIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsb2FkQ29tbWVudHMgPSAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0luaXRpYWxpemVkKSB7cmV0dXJuO31cbiAgICAgICAgICAgICAgICAgICAgaC5mYlBhcnNlKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7bG9hZENvbW1lbnRzOiBsb2FkQ29tbWVudHN9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0KCk7XG4gICAgICAgICAgICByZXR1cm4gbSgnLmZiLWNvbW1lbnRzW2RhdGEtaHJlZj1cImh0dHA6Ly93d3cuY2F0YXJzZS5tZS8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdW2RhdGEtbnVtLXBvc3RzPTUwXVtkYXRhLXdpZHRoPVwiNjEwXCJdJywge2NvbmZpZzogY3RybC5sb2FkQ29tbWVudHMoKX0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q29udHJpYnV0aW9ucyA9ICgobSwgbW9kZWxzLCBoLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RWTSA9IG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShtb2RlbHMucHJvamVjdENvbnRyaWJ1dGlvbiksXG4gICAgICAgICAgICAgICAgZmlsdGVyVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnLFxuICAgICAgICAgICAgICAgICAgICB3YWl0aW5nX3BheW1lbnQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB0b2dnbGVXYWl0aW5nID0gKHdhaXRpbmcgPSBmYWxzZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyVk0ud2FpdGluZ19wYXltZW50KHdhaXRpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZpbHRlclZNLnByb2plY3RfaWQoYXJncy5wcm9qZWN0KCkuaWQpLndhaXRpbmdfcGF5bWVudChmYWxzZSk7XG5cbiAgICAgICAgICAgIGlmICghbGlzdFZNLmNvbGxlY3Rpb24oKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbGlzdFZNOiBsaXN0Vk0sXG4gICAgICAgICAgICAgICAgZmlsdGVyVk06IGZpbHRlclZNLFxuICAgICAgICAgICAgICAgIHRvZ2dsZVdhaXRpbmc6IHRvZ2dsZVdhaXRpbmdcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gY3RybC5saXN0Vk07XG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3RfY29udHJpYnV0aW9ucy5jb250ZW50LnctY29sLnctY29sLTEyJywgW1xuICAgICAgICAgICAgICAgIChhcmdzLnByb2plY3QoKS5pc19vd25lcl9vcl9hZG1pbiA/XG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0W2NoZWNrZWQ9XCJjaGVja2VkXCJdW2lkPVwiY29udHJpYnV0aW9uX3N0YXRlX2F2YWlsYWJsZV90b19jb3VudFwiXVtuYW1lPVwid2FpdGluZ19wYXltZW50XCJdW3R5cGU9XCJyYWRpb1wiXVt2YWx1ZT1cImF2YWlsYWJsZV90b19jb3VudFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVXYWl0aW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbFtmb3I9XCJjb250cmlidXRpb25fc3RhdGVfYXZhaWxhYmxlX3RvX2NvdW50XCJdJywgJ0NvbmZpcm1hZG9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXRbaWQ9XCJjb250cmlidXRpb25fc3RhdGVfd2FpdGluZ19jb25maXJtYXRpb25cIl1bdHlwZT1cInJhZGlvXCJdW25hbWU9XCJ3YWl0aW5nX3BheW1lbnRcIl1bdmFsdWU9XCJ3YWl0aW5nX2NvbmZpcm1hdGlvblwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVXYWl0aW5nKHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWxbZm9yPVwiY29udHJpYnV0aW9uX3N0YXRlX3dhaXRpbmdfY29uZmlybWF0aW9uXCJdJywgJ1BlbmRlbnRlcycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1jb250cmlidXRpb25zJywgXy5tYXAobGlzdC5jb2xsZWN0aW9uKCksIChjb250cmlidXRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2hyZWY9XCIvdXNlcnMvJyArIGNvbnRyaWJ1dGlvbi51c2VyX2lkICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy50aHVtYi51LWxlZnQudS1yb3VuZFtzdHlsZT1cImJhY2tncm91bmQtaW1hZ2U6IHVybCgnICsgKCFfLmlzRW1wdHkoY29udHJpYnV0aW9uLnByb2ZpbGVfaW1nX3RodW1ibmFpbCkgPyBjb250cmlidXRpb24ucHJvZmlsZV9pbWdfdGh1bWJuYWlsIDogJy9hc3NldHMvY2F0YXJzZV9ib290c3RyYXAvdXNlci5qcGcnKSArICcpOyBiYWNrZ3JvdW5kLXNpemU6IGNvbnRhaW47XCJdJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuLWRhcmtbaHJlZj1cIi91c2Vycy8nICsgY29udHJpYnV0aW9uLnVzZXJfaWQgKyAnXCJdJywgY29udHJpYnV0aW9uLnVzZXJfbmFtZSksIChjb250cmlidXRpb24uaXNfb3duZXJfb3JfYWRtaW4gP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUiQgJyArIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi52YWx1ZSwgMiwgMyksIChjb250cmlidXRpb24uYW5vbnltb3VzID8gW20udHJ1c3QoJyZuYnNwOy0mbmJzcDsnKSwgbSgnc3Ryb25nJywgJ0Fwb2lhZG9yIGFuw7RuaW1vJyldIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlcicsIGgubW9tZW50aWZ5KGNvbnRyaWJ1dGlvbi5jcmVhdGVkX2F0LCAnREQvTU0vWVlZWSwgSEg6bW0nKSArICdoJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlcicsIChjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgPiAxID8gJ0Fwb2lvdSBlc3RlIGUgbWFpcyBvdXRyb3MgJyArIGNvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyArICcgcHJvamV0b3MnIDogJ0Fwb2lvdSBzb21lbnRlIGVzdGUgcHJvamV0byBhdMOpIGFnb3JhJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW5ib3R0b20tMjAnKVxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLCBbIWxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgKGxpc3QuaXNMYXN0UGFnZSgpID8gJycgOiBtKCdidXR0b24jbG9hZC1tb3JlLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBsaXN0Lm5leHRQYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAnQ2FycmVnYXIgbWFpcycpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpLFxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3REYXNoYm9hcmRNZW51IGNvbXBvbmVudFxuICogYnVpbGQgZGFzaGJvYXJkIHByb2plY3QgbWVudSBmb3IgcHJvamVjdCBvd25lcnNcbiAqIGFuZCBhZG1pbi5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5Qcm9qZWN0RGFzaGJvYXJkTWVudSwge1xuICogICAgIHByb2plY3Q6IHByb2plY3REZXRhaWwgT2JqZWN0LFxuICogfSlcbiAqL1xud2luZG93LmMuUHJvamVjdERhc2hib2FyZE1lbnUgPSAoKG0sIF8sIGgsIEkxOG4pID0+IHtcbiAgICBjb25zdCBJMThuU2NvcGUgPSBfLnBhcnRpYWwoaC5pMThuU2NvcGUsICdwcm9qZWN0cy5kYXNoYm9hcmRfbmF2Jyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdLFxuICAgICAgICAgICAgICAgIGVkaXRMaW5rc1RvZ2dsZSA9IGgudG9nZ2xlUHJvcCh0cnVlLCBmYWxzZSksXG4gICAgICAgICAgICAgICAgYm9keVRvZ2dsZUZvck5hdiA9IGgudG9nZ2xlUHJvcCgnYm9keS1wcm9qZWN0IG9wZW4nLCAnYm9keS1wcm9qZWN0IGNsb3NlZCcpO1xuXG4gICAgICAgICAgICBpZiAoYXJncy5wcm9qZWN0KCkuaXNfcHVibGlzaGVkKSB7XG4gICAgICAgICAgICAgICAgZWRpdExpbmtzVG9nZ2xlLnRvZ2dsZShmYWxzZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYm9keTogYm9keSxcbiAgICAgICAgICAgICAgICBlZGl0TGlua3NUb2dnbGU6IGVkaXRMaW5rc1RvZ2dsZSxcbiAgICAgICAgICAgICAgICBib2R5VG9nZ2xlRm9yTmF2OiBib2R5VG9nZ2xlRm9yTmF2XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCgpLFxuICAgICAgICAgICAgICAgICAgcHJvamVjdFJvdXRlID0gJy9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCxcbiAgICAgICAgICAgICAgICAgIGVkaXRSb3V0ZSA9IHByb2plY3RSb3V0ZSArICcvZWRpdCcsXG4gICAgICAgICAgICAgICAgICBlZGl0TGlua0NsYXNzID0gJ2Rhc2hib2FyZC1uYXYtbGluay1sZWZ0ICcgKyAocHJvamVjdC5pc19wdWJsaXNoZWQgPyAnaW5kZW50JyA6ICcnKTtcbiAgICAgICAgICAgIGxldCBvcHRpb25hbE9wdCA9IChwcm9qZWN0Lm1vZGUgPT09ICdmbGV4JyA/IG0oJ3NwYW4uZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICcgKG9wY2lvbmFsKScpIDogJycpO1xuXG4gICAgICAgICAgICBjdHJsLmJvZHkuY2xhc3NOYW1lID0gY3RybC5ib2R5VG9nZ2xlRm9yTmF2KCk7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1uYXYnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnByb2plY3QtbmF2LXdyYXBwZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ25hdi53LXNlY3Rpb24uZGFzaGJvYXJkLW5hdi5zaWRlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcHJldmlld19saW5rLnctaW5saW5lLWJsb2NrLmRhc2hib2FyZC1wcm9qZWN0LW5hbWVbaHJlZj1cIicgKyAocHJvamVjdC5pc19wdWJsaXNoZWQgPyAnLycgKyBwcm9qZWN0LnBlcm1hbGluayA6IGVkaXRSb3V0ZSArICcjcHJldmlldycpICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWItcHJvamVjdC1kYXNoYm9hcmRbc3JjPVwiJyArIChfLmlzTnVsbChwcm9qZWN0LmxhcmdlX2ltYWdlKSA/ICcvYXNzZXRzL3RodW1iLXByb2plY3QucG5nJyA6IHByb2plY3QubGFyZ2VfaW1hZ2UpICsgJ1wiXVt3aWR0aD1cIjExNFwiXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3ItbmVnYXRpdmUubGluZWhlaWdodC10aWdodC5mb250c2l6ZS1zbWFsbCcsIHByb2plY3QubmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgaW1nLnUtbWFyZ2ludG9wLTEwW3NyYz1cIi9hc3NldHMvY2F0YXJzZV9ib290c3RyYXAvYmFkZ2UtJHtwcm9qZWN0Lm1vZGV9LWgucG5nXCJdW3dpZHRoPTgwXWApXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2luZm8tbGlua3MnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfaG9tZV9saW5rW2NsYXNzPVwiZGFzaGJvYXJkLW5hdi1saW5rLWxlZnQgJyArIChoLmxvY2F0aW9uQWN0aW9uTWF0Y2goJ2luc2lnaHRzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiJyArIHByb2plY3RSb3V0ZSArICcvaW5zaWdodHNcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtYmFyLWNoYXJ0LmZhLWxnLmZhLWZ3JyksIEkxOG4udCgnc3RhcnRfdGFiJywgSTE4blNjb3BlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcmVwb3J0c19saW5rLmRhc2hib2FyZC1uYXYtbGluay1sZWZ0W2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNyZXBvcnRzJyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLmZhLXRhYmxlLmZhLWxnLmZhLWZ3JyksIEkxOG4udCgncmVwb3J0c190YWInLCBJMThuU2NvcGUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3JlcG9ydHNfbGluay5kYXNoYm9hcmQtbmF2LWxpbmstbGVmdC51LW1hcmdpbmJvdHRvbS0zMFtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjcG9zdHMnICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtYnVsbGhvcm4uZmEtZncuZmEtbGcnKSwgSTE4bi50KCdwb3N0c190YWInLCBJMThuU2NvcGUoKSksIG0oJ3NwYW4uYmFkZ2UnLCBwcm9qZWN0LnBvc3RzX2NvdW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmVkaXQtcHJvamVjdC1kaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/ICcnIDogbSgnYnV0dG9uI3RvZ2dsZS1lZGl0LW1lbnUuZGFzaGJvYXJkLW5hdi1saW5rLWxlZnQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuZWRpdExpbmtzVG9nZ2xlLnRvZ2dsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1wZW5jaWwuZmEtZncuZmEtbGcnKSwgSTE4bi50KCdlZGl0X3Byb2plY3QnLCBJMThuU2NvcGUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSksIChjdHJsLmVkaXRMaW5rc1RvZ2dsZSgpID8gbSgnI2VkaXQtbWVudS1pdGVtcycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2Rhc2hib2FyZC1saW5rcycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgoIXByb2plY3QuaXNfcHVibGlzaGVkIHx8IHByb2plY3QuaXNfYWRtaW5fcm9sZSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNiYXNpY3NfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjYmFzaWNzJyArICdcIl0nLCAnQsOhc2ljbycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZ29hbF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNnb2FsJyArICdcIl0nLCAnRmluYW5jaWFtZW50bycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGVzY3JpcHRpb25fbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjZGVzY3JpcHRpb24nICsgJ1wiXScsICdEZXNjcmnDp8OjbycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSN2aWRlb19saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyN2aWRlbycgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdWw61kZW8nLCBvcHRpb25hbE9wdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2J1ZGdldF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNidWRnZXQnICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnT3LDp2FtZW50bycsIG9wdGlvbmFsT3B0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjY2FyZF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNjYXJkJyArICdcIl0nLCAnQ2FyZCBkbyBwcm9qZXRvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9yZXdhcmRfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjcmV3YXJkJyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1JlY29tcGVuc2FzJywgb3B0aW9uYWxPcHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfdXNlcl9hYm91dF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyN1c2VyX2Fib3V0JyArICdcIl0nLCAnU29icmUgdm9jw6onKSwgKHByb2plY3QubW9kZSA9PT0gJ2ZsZXgnIHx8IChwcm9qZWN0LmlzX3B1Ymxpc2hlZCB8fCBwcm9qZWN0LnN0YXRlID09PSAnYXBwcm92ZWQnKSB8fCBwcm9qZWN0LmlzX2FkbWluX3JvbGUgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfdXNlcl9zZXR0aW5nc19saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyN1c2VyX3NldHRpbmdzJyArICdcIl0nLCAnQ29udGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJyksICghcHJvamVjdC5pc19wdWJsaXNoZWQgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcHJldmlld19saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNwcmV2aWV3JyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtZncuZmEtZXllLmZhLWxnJyksICcgUHJldmlldydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIXByb2plY3QuaXNfcHVibGlzaGVkID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuYnRuLXNlbmQtZHJhZnQtZml4ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwcm9qZWN0Lm1vZGUgPT09ICdhb24nID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5zdGF0ZSA9PT0gJ2RyYWZ0JyA/IG0oJ2EuYnRuLmJ0bi1tZWRpdW1baHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvc2VuZF90b19hbmFseXNpc1wiXScsIEkxOG4udCgnc2VuZCcsIEkxOG5TY29wZSgpKSkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwcm9qZWN0LnN0YXRlID09PSAnYXBwcm92ZWQnID8gbSgnYS5idG4uYnRuLW1lZGl1bVtocmVmPVwiL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkICsgJy9wdWJsaXNoXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSTE4bi50KCdwdWJsaXNoJywgSTE4blNjb3BlKCkpLCBtLnRydXN0KCcmbmJzcDsmbmJzcDsnKSwgbSgnc3Bhbi5mYS5mYS1jaGV2cm9uLXJpZ2h0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5zdGF0ZSA9PT0gJ2RyYWZ0JyA/IG0oJ2EuYnRuLmJ0bi1tZWRpdW1baHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvZWRpdCNwcmV2aWV3XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSTE4bi50KCdwdWJsaXNoJywgSTE4blNjb3BlKCkpLCBtLnRydXN0KCcmbmJzcDsmbmJzcDsnKSwgbSgnc3Bhbi5mYS5mYS1jaGV2cm9uLXJpZ2h0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwcm9qZWN0Lm1vZGUgPT09ICdmbGV4JyA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5idG4tc2VuZC1kcmFmdC1maXhlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfLmlzTnVsbChwcm9qZWN0LmV4cGlyZXNfYXQpID8gbSgnYS53LWJ1dHRvbi5idG4uYnRuLW1lZGl1bS5idG4tc2Vjb25kYXJ5LWRhcmtbaHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvZWRpdCNhbm5vdW5jZV9leHBpcmF0aW9uXCJdJywgSTE4bi50KCdhbm5vdW5jZV9leHBpcmF0aW9uJywgSTE4blNjb3BlKCkpKSA6ICcnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnYS5idG4tZGFzaGJvYXJkIGhyZWY9XCJqczp2b2lkKDApO1wiJywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmJvZHlUb2dnbGVGb3JOYXYudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWJhcnMuZmEtbGcnKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMuaCwgd2luZG93LkkxOG4pKTtcbiIsIi8qKlxuICogd2luZG93LmMuUHJvamVjdERhdGFDaGFydCBjb21wb25lbnRcbiAqIEEgZ3JhcGggYnVpbGRlciBpbnRlcmZhY2UgdG8gYmUgdXNlZCBvbiBwcm9qZWN0IHJlbGF0ZWQgZGFzaGJvYXJkcy5cbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLlByb2plY3REYXRhQ2hhcnQsIHtcbiAqICAgICBjb2xsZWN0aW9uOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJEYXksXG4gKiAgICAgbGFiZWw6ICdSJCBhcnJlY2FkYWRvcyBwb3IgZGlhJyxcbiAqICAgICBkYXRhS2V5OiAndG90YWxfYW1vdW50J1xuICogfSlcbiAqL1xud2luZG93LmMuUHJvamVjdERhdGFDaGFydCA9ICgobSwgQ2hhcnQsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVzb3VyY2UgPSBfLmZpcnN0KGFyZ3MuY29sbGVjdGlvbigpKSxcbiAgICAgICAgICAgICAgICAgIHNvdXJjZSA9ICghXy5pc1VuZGVmaW5lZChyZXNvdXJjZSkgPyByZXNvdXJjZS5zb3VyY2UgOiBbXSksXG5cbiAgICAgICAgICAgICAgICBtb3VudERhdGFzZXQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDAuMiknLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMSknLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludFN0cm9rZUNvbG9yOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludEhpZ2hsaWdodEZpbGw6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0U3Ryb2tlOiAncmdiYSgyMjAsMjIwLDIyMCwxKScsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBfLm1hcChzb3VyY2UsIChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1bYXJncy5kYXRhS2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVuZGVyQ2hhcnQgPSAoZWxlbWVudCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGN0eCA9IGVsZW1lbnQuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IENoYXJ0KGN0eCkuTGluZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiBfLm1hcChzb3VyY2UsIChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhcmdzLnhBeGlzKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBtb3VudERhdGFzZXQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVuZGVyQ2hhcnQ6IHJlbmRlckNoYXJ0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy5jYXJkLnUtcmFkaXVzLm1lZGl1bS51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgYXJncy5sYWJlbCksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIub3ZlcmZsb3ctYXV0bycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2NhbnZhc1tpZD1cImNoYXJ0XCJdW3dpZHRoPVwiODYwXCJdW2hlaWdodD1cIjMwMFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwucmVuZGVyQ2hhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuQ2hhcnQsIHdpbmRvdy5fKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3REYXRhU3RhdHMgY29tcG9uZW50XG4gKiByZW5kZXIgYSByb3cgd2l0aCBwcm9qZWN0IHN0YXRzIGluZm8gbGlrZTpcbiAqIHN0YXRlIC8gdG90YWxfY29udHJpYnV0aW9ucyAvIHRvdGFsX3BsZWRnZWQgLyBlbGFwc2VkIHwgcmVtYW5pbmcgdGltZVxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLlByb2plY3REYXRhU3RhdHMsIHtwcm9qZWN0OiBwcm9qZWN0fSlcbiAqKi9cbndpbmRvdy5jLlByb2plY3REYXRhU3RhdHMgPSAoKG0sIG1vZGVscywgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3MgPSBwcm9qZWN0LnByb2dyZXNzLnRvRml4ZWQoMiksXG4gICAgICAgICAgICAgICAgICBzdGF0dXNUZXh0T2JqID0gaC5wcm9qZWN0U3RhdGVUZXh0Q2xhc3MocHJvamVjdC5zdGF0ZSksXG4gICAgICAgICAgICAgICAgICByZW1haW5pbmdUZXh0T2JqID0gaC50cmFuc2xhdGVkVGltZShwcm9qZWN0LnJlbWFpbmluZ190aW1lKSxcbiAgICAgICAgICAgICAgICAgIGVsYXBzZWRUZXh0T2JqID0gaC50cmFuc2xhdGVkVGltZShwcm9qZWN0LmVsYXBzZWRfdGltZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsICdTdGF0dXM6ICcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbicsIHtjbGFzczogc3RhdHVzVGV4dE9iai5jc3NDbGFzc30gLHN0YXR1c1RleHRPYmoudGV4dClcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgYCR7cHJvZ3Jlc3N9JWApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbC51LW1hcmdpbmJvdHRvbS0xMCcsICdmaW5hbmNpYWRvJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIGBSJCAke2guZm9ybWF0TnVtYmVyKHByb2plY3QucGxlZGdlZCwgMil9YCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsLnUtbWFyZ2luYm90dG9tLTEwJywgJ2xldmFudGFkb3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcHJvamVjdC50b3RhbF9jb250cmlidXRpb25zKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCAnYXBvaW9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKF8uaXNOdWxsKHByb2plY3QuZXhwaXJlc19hdCkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBgJHtlbGFwc2VkVGV4dE9iai50b3RhbH0gJHtlbGFwc2VkVGV4dE9iai51bml0fWApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCAnaW5pY2lhZG8gaMOhJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgYCR7cmVtYWluaW5nVGV4dE9iai50b3RhbH1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgYCR7cmVtYWluaW5nVGV4dE9iai51bml0fSAkeyhyZW1haW5pbmdUZXh0T2JqLnRvdGFsID4gMCA/ICdyZXN0YW50ZXMnIDogJ3Jlc3RhbnRlJyl9YClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0RGF0YVRhYmxlIGNvbXBvbmVudFxuICogQSB0YWJsZSBpbnRlcmZhY2UgY29uc3RydWN0b3IgdGhhdCBzaG91bGQgYmUgdXNlZCBvbiBwcm9qZWN0IHJlbGF0ZWQgZGFzaGJvYXJkcy5cbiAqIEl0IHRha2VzIGFuIGFycmF5IGFuZCBhIGxhYmxlIGFzIGl0J3Mgc291cmNlcy5cbiAqIFRoZSBmaXJzdCBpdGVtIGluIHRoZSBhcnJheSBpcyB0aGUgaGVhZGVyIGRlc2NyaXB0b3IgYW5kIHRoZSByZXN0IG9mIHRoZW0gYXJlIHJvdyBkYXRhLlxuICogUm93cyBtYXkgcmV0dXJuIGEgc3RyaW5nIG9yIGFuIGFycmF5IGFuZCB0aGlzIHZhbHVlIHdpbGwgYmUgdXNlZCBhcyBhIHJvdyBvdXRwdXQuXG4gKiBBbGwgdGFibGUgcm93cyBhcmUgc29ydGFibGUgYnkgZGVmYXVsdC4gSWYgeW91IHdhbnQgdG8gdXNlIGEgY3VzdG9tIHZhbHVlIGFzIHNvcnQgcGFyYW1ldGVyXG4gKiB5b3UgbWF5IHNldCBhIDJEIGFycmF5IGFzIHJvdy4gSW4gdGhpcyBjYXNlLCB0aGUgZmlyc3QgYXJyYXkgdmFsdWUgd2lsbCBiZSB0aGUgY3VzdG9tIHZhbHVlXG4gKiB3aGlsZSB0aGUgb3RoZXIgd2lsbCBiZSB0aGUgYWN0dWFsIG91dHB1dC5cbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLlByb2plY3REYXRhVGFibGUsIHtcbiAqICAgICAgbGFiZWw6ICdUYWJsZSBsYWJlbCcsXG4gKiAgICAgIHRhYmxlOiBbXG4gKiAgICAgICAgICBbJ2NvbCBoZWFkZXIgMScsICdjb2wgaGVhZGVyIDInXSxcbiAqICAgICAgICAgIFsndmFsdWUgMXgxJywgWzMsICd2YWx1ZSAxeDInXV0sXG4gKiAgICAgICAgICBbJ3ZhbHVlIDJ4MScsIFsxLCAndmFsdWUgMngyJ11dIC8vV2UgYXJlIHVzaW5nIGEgY3VzdG9tIGNvbXBhcmF0b3IgdHdvIGNvbCAyIHZhbHVlc1xuICogICAgICBdLFxuICogICAgICAvL0FsbG93cyB5b3UgdG8gc2V0IGEgc3BlY2lmaWMgY29sdW1uIHRvIGJlIG9yZGVyZWQgYnkgZGVmYXVsdC5cbiAqICAgICAgLy9JZiBubyB2YWx1ZSBpcyBzZXQsIHRoZSBmaXJzdCByb3cgd2lsbCBiZSB0aGUgZGVmYXVsdCBvbmUgdG8gYmUgb3JkZXJlZC5cbiAqICAgICAgLy9OZWdhdGl2ZSB2YWx1ZXMgbWVhbiB0aGF0IHRoZSBvcmRlciBzaG91bGQgYmUgcmV2ZXJ0ZWRcbiAqICAgICAgZGVmYXVsdFNvcnRJbmRleDogLTNcbiAqICB9KVxuICovXG53aW5kb3cuYy5Qcm9qZWN0RGF0YVRhYmxlID0gKChtLCBtb2RlbHMsIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHRhYmxlID0gbS5wcm9wKGFyZ3MudGFibGUpLFxuICAgICAgICAgICAgICAgIHNvcnRJbmRleCA9IG0ucHJvcCgtMSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbXBhcmF0b3IgPSAoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBpZHggPSBzb3J0SW5kZXgoKSxcbiAgICAgICAgICAgICAgICAgICAgLy9DaGVjayBpZiBhIGN1c3RvbSBjb21wYXJhdG9yIGlzIHVzZWQgPT4gUmVhZCBjb21wb25lbnQgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgeCA9IChfLmlzQXJyYXkoYVtpZHhdKSAmJiBhW2lkeF0ubGVuZ3RoID4gMSkgPyBhW2lkeF1bMF0gOiBhW2lkeF0sXG4gICAgICAgICAgICAgICAgICAgIHkgPSAoXy5pc0FycmF5KGJbaWR4XSkgJiYgYltpZHhdLmxlbmd0aCA+IDEpID8gYltpZHhdWzBdIDogYltpZHhdO1xuXG4gICAgICAgICAgICAgICAgaWYgKHggPCB5KXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoeSA8IHgpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBzb3J0VGFibGUgPSAoaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGhlYWRlciA9IF8uZmlyc3QodGFibGUoKSksXG4gICAgICAgICAgICAgICAgICAgIGJvZHk7XG4gICAgICAgICAgICAgICAgaWYgKHNvcnRJbmRleCgpID09PSBpZHgpe1xuICAgICAgICAgICAgICAgICAgICBib2R5ID0gXy5yZXN0KHRhYmxlKCkpLnJldmVyc2UoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzb3J0SW5kZXgoaWR4KTtcbiAgICAgICAgICAgICAgICAgICAgYm9keSA9IF8ucmVzdCh0YWJsZSgpKS5zb3J0KGNvbXBhcmF0b3IpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRhYmxlKF8udW5pb24oW2hlYWRlcl0sYm9keSkpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc29ydFRhYmxlKE1hdGguYWJzKGFyZ3MuZGVmYXVsdFNvcnRJbmRleCkgfHwgMCk7XG5cbiAgICAgICAgICAgIGlmIChhcmdzLmRlZmF1bHRTb3J0SW5kZXggPCAwKXtcbiAgICAgICAgICAgICAgICBzb3J0VGFibGUoTWF0aC5hYnMoYXJncy5kZWZhdWx0U29ydEluZGV4KSB8fCAwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0YWJsZTogdGFibGUsXG4gICAgICAgICAgICAgICAgc29ydFRhYmxlOiBzb3J0VGFibGVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgaGVhZGVyID0gXy5maXJzdChjdHJsLnRhYmxlKCkpLFxuICAgICAgICAgICAgICAgIGJvZHkgPSBfLnJlc3QoY3RybC50YWJsZSgpKTtcbiAgICAgICAgICAgIHJldHVybiBtKCcudGFibGUtb3V0ZXIudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctcm93LnRhYmxlLXJvdy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIuaGVhZGVyJyxcbiAgICAgICAgICAgICAgICAgICAgXy5tYXAoaGVhZGVyLCAoaGVhZGluZywgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc29ydCA9ICgpID0+IGN0cmwuc29ydFRhYmxlKGlkeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IHNvcnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2hlYWRpbmd9IGAsIG0oJ3NwYW4uZmEuZmEtc29ydCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICksIG0oJy50YWJsZS1pbm5lci5mb250c2l6ZS1zbWFsbCcsXG4gICAgICAgICAgICAgICAgICAgIF8ubWFwKGJvZHksIChyb3dEYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnRhYmxlLXJvdycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAocm93RGF0YSwgKHJvdykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0NoZWNrIGlmIGEgY3VzdG9tIGNvbXBhcmF0b3IgaXMgdXNlZCA9PiBSZWFkIGNvbXBvbmVudCBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3cgPSAoXy5pc0FycmF5KHJvdykgJiYgcm93Lmxlbmd0aCA+IDEpID8gcm93WzFdIDogcm93O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2Jywgcm93KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0SGVhZGVyID0gKChtLCBjLCBoLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuXG4gICAgICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChwcm9qZWN0KCkpKXtcbiAgICAgICAgICAgICAgICBwcm9qZWN0ID0gbS5wcm9wKHt9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LWhlYWRlcicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24tcHJvZHVjdC4nICsgcHJvamVjdCgpLm1vZGUpLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24ucGFnZS1oZWFkZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaDEuZm9udHNpemUtbGFyZ2VyLmZvbnR3ZWlnaHQtc2VtaWJvbGQucHJvamVjdC1uYW1lW2l0ZW1wcm9wPVwibmFtZVwiXScsIGguc2VsZk9yRW1wdHkocHJvamVjdCgpLm5hbWUpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2gyLmZvbnRzaXplLWJhc2UubGluZWhlaWdodC1sb29zZXJbaXRlbXByb3A9XCJhdXRob3JcIl0nLCAocHJvamVjdCgpLnVzZXIpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdwb3IgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0KCkudXNlci5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5wcm9qZWN0LW1haW4nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy5wcm9qZWN0LW1haW4nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgucHJvamVjdC1oaWdobGlnaHQnLCBtLmNvbXBvbmVudChjLlByb2plY3RIaWdobGlnaHQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIG0uY29tcG9uZW50KGMuUHJvamVjdFNpZGViYXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlckRldGFpbHM6IGFyZ3MudXNlckRldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdEhpZ2hsaWdodCA9ICgobSwgXywgaCwgYykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5U2hhcmVCb3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlTaGFyZUJveDogZGlzcGxheVNoYXJlQm94XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBhZGRyZXNzID0gcHJvamVjdCgpLmFkZHJlc3MgfHwge3N0YXRlX2Fjcm9ueW06ICcnLCBjaXR5OiAnJ307XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1oaWdobGlnaHQnLCBbXG4gICAgICAgICAgICAgICAgKHByb2plY3QoKS52aWRlb19lbWJlZF91cmwgPyBtKCcudy1lbWJlZC53LXZpZGVvLnByb2plY3QtdmlkZW8nLCB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnbWluLWhlaWdodDogMjQwcHg7J1xuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaWZyYW1lLmVtYmVkbHktZW1iZWRbaXRlbXByb3A9XCJ2aWRlb1wiXVtzcmM9XCInICsgcHJvamVjdCgpLnZpZGVvX2VtYmVkX3VybCArICdcIl1bZnJhbWVib3JkZXI9XCIwXCJdW2FsbG93RnVsbFNjcmVlbl0nKVxuICAgICAgICAgICAgICAgIF0pIDogbSgnLnByb2plY3QtaW1hZ2UnLCB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnYmFja2dyb3VuZC1pbWFnZTp1cmwoJyArIHByb2plY3QoKS5vcmlnaW5hbF9pbWFnZSArICcpOydcbiAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgbSgnLnByb2plY3QtYmx1cmInLCBwcm9qZWN0KCkuaGVhZGxpbmUpLFxuICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLXNtYWxsLW9ubHkudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgICAgICghXy5pc051bGwoYWRkcmVzcykgP1xuICAgICAgICAgICAgICAgICAgICAgbShgYS5idG4uYnRuLWlubGluZS5idG4tc21hbGwuYnRuLXRyYW5zcGFyZW50LmxpbmstaGlkZGVuLWxpZ2h0LnUtbWFyZ2luYm90dG9tLTEwW2hyZWY9XCIvcHQvZXhwbG9yZT9wZ19zZWFyY2g9JHthZGRyZXNzLnN0YXRlX2Fjcm9ueW19XCJdYCwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtbWFwLW1hcmtlcicpLCBgICR7YWRkcmVzcy5jaXR5fSwgJHthZGRyZXNzLnN0YXRlX2Fjcm9ueW19YFxuICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBtKGBhLmJ0bi5idG4taW5saW5lLmJ0bi1zbWFsbC5idG4tdHJhbnNwYXJlbnQubGluay1oaWRkZW4tbGlnaHRbaHJlZj1cIi9wdC9leHBsb3JlI2J5X2NhdGVnb3J5X2lkLyR7cHJvamVjdC5jYXRlZ29yeV9pZH1cIl1gLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLXRhZycpLCAnICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0KCkuY2F0ZWdvcnlfbmFtZVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uI3NoYXJlLWJveC5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeS5idG4taW5saW5lJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5kaXNwbGF5U2hhcmVCb3gudG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgIH0sICdDb21wYXJ0aWxoYXInKSwgKGN0cmwuZGlzcGxheVNoYXJlQm94KCkgPyBtLmNvbXBvbmVudChjLlByb2plY3RTaGFyZUJveCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlTaGFyZUJveDogY3RybC5kaXNwbGF5U2hhcmVCb3hcbiAgICAgICAgICAgICAgICAgICAgfSkgOiAnJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0TWFpbiA9ICgobSwgYywgXywgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgZGlzcGxheVRhYkNvbnRlbnQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNfb3B0cyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFicyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNyZXdhcmRzJzogbSgnLnctY29sLnctY29sLTEyJywgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmV3YXJkTGlzdCwgXy5leHRlbmQoe30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZERldGFpbHM6IGFyZ3MucmV3YXJkRGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBjX29wdHMpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjY29udHJpYnV0aW9uX3N1Z2dlc3Rpb25zJzogbS5jb21wb25lbnQoYy5Qcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucywgY19vcHRzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNjb250cmlidXRpb25zJzogbS5jb21wb25lbnQoYy5Qcm9qZWN0Q29udHJpYnV0aW9ucywgY19vcHRzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNhYm91dCc6IG0uY29tcG9uZW50KGMuUHJvamVjdEFib3V0LCBfLmV4dGVuZCh7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogYXJncy5yZXdhcmREZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGNfb3B0cykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI2NvbW1lbnRzJzogbS5jb21wb25lbnQoYy5Qcm9qZWN0Q29tbWVudHMsIGNfb3B0cyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjcG9zdHMnOiBtLmNvbXBvbmVudChjLlByb2plY3RQb3N0cywgY19vcHRzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc0VtcHR5KGhhc2gpIHx8IGhhc2ggPT09ICcjXz1fJyB8fCBoYXNoID09PSAnI3ByZXZpZXcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YWJzWycjYWJvdXQnXTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFic1toYXNoXTtcbiAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGgucmVkcmF3SGFzaENoYW5nZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlUYWJDb250ZW50OiBkaXNwbGF5VGFiQ29udGVudFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJ3NlY3Rpb24uc2VjdGlvbltpdGVtdHlwZT1cImh0dHA6Ly9zY2hlbWEub3JnL0NyZWF0aXZlV29ya1wiXScsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIGN0cmwuZGlzcGxheVRhYkNvbnRlbnQoKSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3RNb2RlIGNvbXBvbmVudFxuICogQSBzaW1wbGUgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgYSBiYWRnZSB3aXRoIHRoZSBjdXJyZW50IHByb2plY3QgbW9kZVxuICogdG9nZXRoZXIgd2l0aCBhIGRlc2NyaXB0aW9uIG9mIHRoZSBtb2RlLCBzaG93biBpbnNpZGUgYSB0b29sdGlwLlxuICogSXQgcmVjZWl2ZXMgYSBwcm9qZWN0IGFzIHJlc291cmNlXG4gKlxuICogRXhhbXBsZTpcbiAqICB2aWV3OiB7XG4gKiAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RNb2RlLCB7cHJvamVjdDogcHJvamVjdH0pXG4gKiAgfVxuICovXG53aW5kb3cuYy5Qcm9qZWN0TW9kZSA9ICgobSwgYywgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgcHJvamVjdCA9IGFyZ3MucHJvamVjdCgpLFxuICAgICAgICAgICAgICAgIG1vZGUgPSBwcm9qZWN0Lm1vZGUsXG4gICAgICAgICAgICAgICAgbW9kZUltZ1NyYyA9IChtb2RlID09PSAnYW9uJykgPyAnL2Fzc2V0cy9hb24tYmFkZ2UucG5nJyA6ICcvYXNzZXRzL2ZsZXgtYmFkZ2UucG5nJyxcbiAgICAgICAgICAgICAgICBtb2RlVGl0bGUgPSAobW9kZSA9PT0gJ2FvbicpID8gJ0NhbXBhbmhhIFR1ZG8tb3UtbmFkYSAnIDogJ0NhbXBhbmhhIEZsZXjDrXZlbCAnLFxuICAgICAgICAgICAgICAgIGdvYWwgPSAoXy5pc051bGwocHJvamVjdC5nb2FsKSA/ICduw6NvIGRlZmluaWRhJyA6IGguZm9ybWF0TnVtYmVyKHByb2plY3QuZ29hbCkpLFxuICAgICAgICAgICAgICAgIHRvb2x0aXAgPSAoZWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuVG9vbHRpcCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWw6IGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogKG1vZGUgPT09ICdhb24nKSA/IGBTb21lbnRlIHJlY2ViZXLDoSBvcyByZWN1cnNvcyBzZSBhdGluZ2lyIG91IHVsdHJhcGFzc2FyIGEgbWV0YSBhdMOpIG8gZGlhICR7aC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQsICdERC9NTS9ZWVlZJyl9LmAgOiAnTyByZWFsaXphZG9yIHJlY2ViZXLDoSB0b2RvcyBvcyByZWN1cnNvcyBxdWFuZG8gZW5jZXJyYXIgYSBjYW1wYW5oYSwgbWVzbW8gcXVlIG7Do28gdGVuaGEgYXRpbmdpZG8gZXN0YSBtZXRhLicsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogMjgwXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBtKGAjJHttb2RlfS53LXJvd2AsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC0yLnctY29sLXRpbnktMicsIFtcbiAgICAgICAgICAgICAgICAgICAgIV8uaXNFbXB0eShwcm9qZWN0KSA/IG0oYGltZ1tzcmM9XCIke21vZGVJbWdTcmN9XCJdW3dpZHRoPSczMCddYCkgOiAnJ1xuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMC53LWNvbC1zbWFsbC0xMC53LWNvbC10aW55LTEwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgJ01ldGEgUiQgJyArIGguc2VsZk9yRW1wdHkoZ29hbCwgJy0tJykpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1pbmxpbmUtYmxvY2suZm9udHNpemUtc21hbGxlc3QuX3ctaW5saW5lLWJsb2NrJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgIV8uaXNFbXB0eShwcm9qZWN0KSA/IG1vZGVUaXRsZSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcCgnc3Bhbi53LWlubGluZS1ibG9jay50b29sdGlwLXdyYXBwZXIuZmEuZmEtcXVlc3Rpb24tY2lyY2xlLmZvbnRjb2xvci1zZWNvbmRhcnknKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlByb2plY3RQb3N0cyA9ICgobSwgbW9kZWxzLCBoLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RWTSA9IG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShtb2RlbHMucHJvamVjdFBvc3REZXRhaWwpLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmaWx0ZXJWTS5wcm9qZWN0X2lkKGFyZ3MucHJvamVjdCgpLmlkKTtcblxuICAgICAgICAgICAgaWYgKCFsaXN0Vk0uY29sbGVjdGlvbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBsaXN0Vk06IGxpc3RWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTTogZmlsdGVyVk1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gY3RybC5saXN0Vk0sXG4gICAgICAgICAgICAgICAgcHJvamVjdCA9IGFyZ3MucHJvamVjdCgpIHx8IHt9O1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3QtcG9zdHMudy1zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LW1hcmdpbnRvcC0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgKHByb2plY3QuaXNfb3duZXJfb3JfYWRtaW4gPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAoIWxpc3QuaXNMb2FkaW5nKCkpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIChfLmlzRW1wdHkobGlzdC5jb2xsZWN0aW9uKCkpID8gbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UudS1tYXJnaW5ib3R0b20tMzAudS1tYXJnaW50b3AtMjAnLCAnVG9kYSBub3ZpZGFkZSBwdWJsaWNhZGEgbm8gQ2F0YXJzZSDDqSBlbnZpYWRhIGRpcmV0YW1lbnRlIHBhcmEgbyBlbWFpbCBkZSBxdWVtIGrDoSBhcG9pb3Ugc2V1IHByb2pldG8gZSB0YW1iw6ltIGZpY2EgZGlzcG9uw612ZWwgcGFyYSB2aXN1YWxpemHDp8OjbyBubyBzaXRlLiBWb2PDqiBwb2RlIG9wdGFyIHBvciBkZWl4w6EtbGEgcMO6YmxpY2EsIG91IHZpc8OtdmVsIHNvbWVudGUgcGFyYSBzZXVzIGFwb2lhZG9yZXMgYXF1aSBuZXN0YSBhYmEuJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYS5idG4uYnRuLWVkaXQuYnRuLXNtYWxsW2hyZWY9Jy9wdC9wcm9qZWN0cy8ke3Byb2plY3QuaWR9L2VkaXQjcG9zdHMnXWAsICdFc2NyZXZlciBub3ZpZGFkZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiAnJyksIChfLm1hcChsaXN0LmNvbGxlY3Rpb24oKSwgKHBvc3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wb3N0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTYwIC53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtdGV4dC1jZW50ZXInLCBoLm1vbWVudGlmeShwb3N0LmNyZWF0ZWRfYXQpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZXIudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0zMCcsIHBvc3QudGl0bGUpLCAoIV8uaXNFbXB0eShwb3N0LmNvbW1lbnRfaHRtbCkgPyBtKCcuZm9udHNpemUtYmFzZScsIG0udHJ1c3QocG9zdC5jb21tZW50X2h0bWwpKSA6IG0oJy5mb250c2l6ZS1iYXNlJywgJ1Bvc3QgZXhjbHVzaXZvIHBhcmEgYXBvaWFkb3Jlcy4nKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW5ib3R0b20tNjAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXB1c2gtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIWxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAobGlzdC5pc0xhc3RQYWdlKCkgPyAnJyA6IG0oJ2J1dHRvbiNsb2FkLW1vcmUuYnRuLmJ0bi1tZWRpdW0uYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogbGlzdC5uZXh0UGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnQ2FycmVnYXIgbWFpcycpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgubG9hZGVyKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlByb2plY3RSZW1pbmRlckNvdW50ID0gKGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucmVzb3VyY2U7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3QtcmVtaW5kZXItY291bnQuY2FyZC51LXJhZGl1cy51LXRleHQtY2VudGVyLm1lZGl1bS51LW1hcmdpbmJvdHRvbS04MCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdUb3RhbCBkZSBwZXNzb2FzIHF1ZSBjbGljYXJhbSBubyBib3TDo28gTGVtYnJhci1tZScpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtbWFyZ2luYm90dG9tLTMwJywgJ1VtIGxlbWJyZXRlIHBvciBlbWFpbCDDqSBlbnZpYWRvIDQ4IGhvcmFzIGFudGVzIGRvIHTDqXJtaW5vIGRhIHN1YSBjYW1wYW5oYScpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1ibycsIHByb2plY3QucmVtaW5kZXJfY291bnQpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3RSZW1pbmRlciBjb21wb25lbnRcbiAqIEEgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgYSBjbGlja2FibGUgcHJvamVjdCByZW1pbmRlciBlbGVtZW50LlxuICogVGhlIGNvbXBvbmVudCBjYW4gYmUgb2YgdHdvIHR5cGVzOiBhICdsaW5rJyBvciBhICdidXR0b24nXG4gKlxuICogRXhhbXBsZTpcbiAqICB2aWV3OiB7XG4gKiAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RSZW1pbmRlciwge3Byb2plY3Q6IHByb2plY3QsIHR5cGU6ICdidXR0b24nfSlcbiAqICB9XG4gKi9cbndpbmRvdy5jLlByb2plY3RSZW1pbmRlciA9ICgobSwgbW9kZWxzLCBoLCBjKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIGZpbHRlclZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHN0b3JlUmVtaW5kZXJOYW1lID0gJ3JlbWluZF8nICsgcHJvamVjdCgpLmlkLFxuICAgICAgICAgICAgICAgIGwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIHBvcE5vdGlmaWNhdGlvbiA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgc3VibWl0UmVtaW5kZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaC5nZXRVc2VyKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGguc3RvcmVBY3Rpb24oc3RvcmVSZW1pbmRlck5hbWUsIHN1Ym1pdFJlbWluZGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoLm5hdmlnYXRlVG9EZXZpc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsZXQgbG9hZGVyT3B0cyA9IHByb2plY3QoKS5pbl9yZW1pbmRlciA/IG1vZGVscy5wcm9qZWN0UmVtaW5kZXIuZGVsZXRlT3B0aW9ucyhmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpIDogbW9kZWxzLnByb2plY3RSZW1pbmRlci5wb3N0T3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiBwcm9qZWN0KCkuaWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGwgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obG9hZGVyT3B0cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgbC5sb2FkKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0KCkuaW5fcmVtaW5kZXIgPSAhcHJvamVjdCgpLmluX3JlbWluZGVyO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvamVjdCgpLmluX3JlbWluZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wTm90aWZpY2F0aW9uKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3BOb3RpZmljYXRpb24oZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIDUwMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3BOb3RpZmljYXRpb24oZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBoLmNhbGxTdG9yZWRBY3Rpb24oc3RvcmVSZW1pbmRlck5hbWUsIHN1Ym1pdFJlbWluZGVyKTtcbiAgICAgICAgICAgIGZpbHRlclZNLnByb2plY3RfaWQocHJvamVjdCgpLmlkKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBsOiBsLFxuICAgICAgICAgICAgICAgIHN1Ym1pdFJlbWluZGVyOiBzdWJtaXRSZW1pbmRlcixcbiAgICAgICAgICAgICAgICBwb3BOb3RpZmljYXRpb246IHBvcE5vdGlmaWNhdGlvblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1haW5DbGFzcyA9IChhcmdzLnR5cGUgPT09ICdidXR0b24nKSA/ICcnIDogJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTMwJyxcbiAgICAgICAgICAgICAgICBidXR0b25DbGFzcyA9IChhcmdzLnR5cGUgPT09ICdidXR0b24nKSA/ICd3LWJ1dHRvbiBidG4gYnRuLXRlcmNpYXJ5IGJ0bi1uby1ib3JkZXInIDogJ2J0bi1saW5rIGxpbmstaGlkZGVuIGZvbnRzaXplLXNtYWxsJyxcbiAgICAgICAgICAgICAgICBoaWRlVGV4dE9uTW9iaWxlID0gYXJncy5oaWRlVGV4dE9uTW9iaWxlIHx8IGZhbHNlLFxuICAgICAgICAgICAgICAgIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG5cbiAgICAgICAgICAgIHJldHVybiBtKGAjcHJvamVjdC1yZW1pbmRlciR7bWFpbkNsYXNzfWAsIFtcbiAgICAgICAgICAgICAgICBtKGBidXR0b25bY2xhc3M9XCIke2J1dHRvbkNsYXNzfSAkeyhwcm9qZWN0KCkuaW5fcmVtaW5kZXIgPyAnbGluay1oaWRkZW4tc3VjY2VzcycgOiAnZm9udGNvbG9yLXNlY29uZGFyeScpfSBmb250d2VpZ2h0LXNlbWlib2xkXCJdYCwge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnN1Ym1pdFJlbWluZGVyXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAoY3RybC5sKCkgPyAnYWd1YXJkZSAuLi4nIDogbSgnc3Bhbi5mYS5mYS1jbG9jay1vJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbShgc3BhbiR7aGlkZVRleHRPbk1vYmlsZSA/ICcudy1oaWRkZW4tbWVkaXVtJyA6ICcnfWAsIHByb2plY3QoKS5pbl9yZW1pbmRlciA/ICcgTGVtYnJldGUgYXRpdm8nIDogJyBMZW1icmFyLW1lJylcbiAgICAgICAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICAgICAgXSksIChjdHJsLnBvcE5vdGlmaWNhdGlvbigpID8gbS5jb21wb25lbnQoYy5Qb3BOb3RpZmljYXRpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ09rISBWYW1vcyB0ZSBtYW5kYXIgdW0gbGVtYnJldGUgcG9yIGUtbWFpbCA0OCBob3JhcyBhbnRlcyBkbyBmaW0gZGEgY2FtcGFuaGEnXG4gICAgICAgICAgICAgICAgfSkgOiAnJylcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLlByb2plY3RSZXdhcmRMaXN0ID0gKChtLCBoLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIC8vRklYTUU6IE1JU1NJTkcgQURKVVNUU1xuICAgICAgICAgICAgLy8gLSBhZGQgZHJhZnQgYWRtaW4gbW9kaWZpY2F0aW9uc1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3Jld2FyZHMudS1tYXJnaW5ib3R0b20tMzAnLCBfLm1hcChhcmdzLnJld2FyZERldGFpbHMoKSwgKHJld2FyZCkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBjb250cmlidXRpb25VcmxXaXRoUmV3YXJkID0gJy9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvY29udHJpYnV0aW9ucy9uZXc/cmV3YXJkX2lkPScgKyByZXdhcmQuaWQ7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnYVtjbGFzcz1cIicgKyAoaC5yZXdhcmRTb3VsZE91dChyZXdhcmQpID8gJ2NhcmQtZ29uZScgOiAnY2FyZC1yZXdhcmQgJyArIChwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgPyAnY2xpY2thYmxlJyA6ICcnKSkgKyAnIGNhcmQgY2FyZC1zZWNvbmRhcnkgdS1tYXJnaW5ib3R0b20tMTBcIl1baHJlZj1cIicgKyAocHJvamVjdC5vcGVuX2Zvcl9jb250cmlidXRpb25zICYmICFoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgPyBjb250cmlidXRpb25VcmxXaXRoUmV3YXJkIDogJ2pzOnZvaWQoMCk7JykgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1BhcmEgUiQgJyArIGguZm9ybWF0TnVtYmVyKHJld2FyZC5taW5pbXVtX3ZhbHVlKSArICcgb3UgbWFpcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIGgucGx1cmFsaXplKHJld2FyZC5wYWlkX2NvdW50LCAnIGFwb2lvJywgJyBhcG9pb3MnKSksIChyZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zID4gMCA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAocmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCA+IDAgPyBtKCcubWF4aW11bV9jb250cmlidXRpb25zLmluX3RpbWVfdG9fY29uZmlybS5jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnBlbmRpbmcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgucGx1cmFsaXplKHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQsICcgYXBvaW8gZW0gcHJhem8gZGUgY29uZmlybWHDp8OjbycsICcgYXBvaW9zIGVtIHByYXpvIGRlIGNvbmZpcm1hw6fDo28uJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksIChoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgPyBtKCcudS1tYXJnaW50b3AtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2UuYmFkZ2UtZ29uZS5mb250c2l6ZS1zbWFsbGVyJywgJ0VzZ290YWRhJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6IG0oJy51LW1hcmdpbnRvcC0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZS5iYWRnZS1hdHRlbnRpb24uZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1ib2xkJywgJ0xpbWl0YWRhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICgnICsgaC5yZXdhcmRSZW1hbmluZyhyZXdhcmQpICsgJyBkZSAnICsgcmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyArICcgZGlzcG9uw612ZWlzKSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJyksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LW1hcmdpbnRvcC0yMCcsIG0udHJ1c3QoaC5zaW1wbGVGb3JtYXQocmV3YXJkLmRlc2NyaXB0aW9uKSkpLCAoIV8uaXNFbXB0eShyZXdhcmQuZGVsaXZlcl9hdCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYicsICdFc3RpbWF0aXZhIGRlIEVudHJlZ2E6ICcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgubW9tZW50aWZ5KHJld2FyZC5kZWxpdmVyX2F0LCAnTU1NL1lZWVknKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksIChwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgJiYgIWgucmV3YXJkU291bGRPdXQocmV3YXJkKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1yZXdhcmQtYm94LWhvdmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LXJld2FyZC1ib3gtc2VsZWN0LXRleHQudS10ZXh0LWNlbnRlcicsICdTZWxlY2lvbmUgZXNzYSByZWNvbXBlbnNhJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlByb2plY3RSb3cgPSAoKG0sIF8sIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IGFyZ3MuY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICByZWYgPSBhcmdzLnJlZixcbiAgICAgICAgICAgICAgICB3cmFwcGVyID0gYXJncy53cmFwcGVyIHx8ICcudy1zZWN0aW9uLnNlY3Rpb24udS1tYXJnaW5ib3R0b20tNDAnO1xuXG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvbi5sb2FkZXIoKSB8fCBjb2xsZWN0aW9uLmNvbGxlY3Rpb24oKS5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSh3cmFwcGVyLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICghXy5pc1VuZGVmaW5lZChjb2xsZWN0aW9uLnRpdGxlKSB8fCAhXy5pc1VuZGVmaW5lZChjb2xsZWN0aW9uLmhhc2gpKSA/IG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LWxvb3NlcicsIGNvbGxlY3Rpb24udGl0bGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGEuYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnlbaHJlZj1cIi9wdC9leHBsb3JlP3JlZj0ke3JlZn0jJHtjb2xsZWN0aW9uLmhhc2h9XCJdYCwgJ1ZlciB0b2RvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uLmxvYWRlcigpID8gaC5sb2FkZXIoKSA6IG0oJy53LXJvdycsIF8ubWFwKGNvbGxlY3Rpb24uY29sbGVjdGlvbigpLCAocHJvamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RDYXJkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogcmVmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJ2RpdicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0U2hhcmVCb3ggPSAoKG0sIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlFbWJlZDogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcucG9wLXNoYXJlJywge1xuICAgICAgICAgICAgICAgIHN0eWxlOiAnZGlzcGxheTogYmxvY2s7J1xuICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdhLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5LmJ0bi1pbmxpbmUudS1yaWdodCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGFyZ3MuZGlzcGxheVNoYXJlQm94LnRvZ2dsZVxuICAgICAgICAgICAgICAgICAgICB9LCAnRmVjaGFyJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTMwJywgJ0NvbXBhcnRpbGhlIGVzdGUgcHJvamV0bycpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctd2lkZ2V0Lnctd2lkZ2V0LWZhY2Vib29rLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuc2hhcmUtYmxvY2snLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lmcmFtZVthbGxvd3RyYW5zcGFyZW5jeT1cInRydWVcIl1bd2lkdGg9XCIxNTBweFwiXVtoZWlnaHQ9XCIyMnB4XCJdW2ZyYW1lYm9yZGVyPVwiMFwiXVtzY3JvbGxpbmc9XCJub1wiXVtzcmM9XCJodHRwczovL3d3dy5mYWNlYm9vay5jb20vdjIuMC9wbHVnaW5zL3NoYXJlX2J1dHRvbi5waHA/YXBwX2lkPTE3Mzc0NzA0MjY2MTQ5MSZjaGFubmVsPWh0dHBzJTNBJTJGJTJGcy1zdGF0aWMuYWsuZmFjZWJvb2suY29tJTJGY29ubmVjdCUyRnhkX2FyYml0ZXIlMkY0NE93Szc0dTBJZS5qcyUzRnZlcnNpb24lM0Q0MSUyM2NiJTNEZjdkOWI5MDBjJTI2ZG9tYWluJTNEd3d3LmNhdGFyc2UubWUlMjZvcmlnaW4lM0RodHRwcyUyNTNBJTI1MkYlMjUyRnd3dy5jYXRhcnNlLm1lJTI1MkZmNGIzYWQwYzglMjZyZWxhdGlvbiUzRHBhcmVudC5wYXJlbnQmY29udGFpbmVyX3dpZHRoPTAmaHJlZj1odHRwcyUzQSUyRiUyRnd3dy5jYXRhcnNlLm1lJTJGcHQlMkYnICsgYXJncy5wcm9qZWN0KCkucGVybWFsaW5rICsgJyUzRnJlZiUzRGZhY2Vib29rJmxheW91dD1idXR0b25fY291bnQmbG9jYWxlPXB0X0JSJnNkaz1qb2V5XCJdJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy13aWRnZXQudy13aWRnZXQtdHdpdHRlci53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LnNoYXJlLWJsb2NrJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpZnJhbWVbYWxsb3d0cmFuc3BhcmVuY3k9XCJ0cnVlXCJdW3dpZHRoPVwiMTIwcHhcIl1baGVpZ2h0PVwiMjJweFwiXVtmcmFtZWJvcmRlcj1cIjBcIl1bc2Nyb2xsaW5nPVwibm9cIl1bc3JjPVwiLy9wbGF0Zm9ybS50d2l0dGVyLmNvbS93aWRnZXRzL3R3ZWV0X2J1dHRvbi44ZDAwN2RkZmMxODRlNjc3NmJlNzZmZTllNWU1MmQ2OS5lbi5odG1sI189MTQ0MjQyNTk4NDkzNiZjb3VudD1ob3Jpem9udGFsJmRudD1mYWxzZSZpZD10d2l0dGVyLXdpZGdldC0xJmxhbmc9ZW4mb3JpZ2luYWxfcmVmZXJlcj1odHRwcyUzQSUyRiUyRnd3dy5jYXRhcnNlLm1lJTJGcHQlMkYnICsgYXJncy5wcm9qZWN0KCkucGVybWFsaW5rICsgJyZzaXplPW0mdGV4dD1Db25maXJhJTIwbyUyMHByb2pldG8lMjAnICsgYXJncy5wcm9qZWN0KCkubmFtZSArICclMjBubyUyMCU0MGNhdGFyc2UmdHlwZT1zaGFyZSZ1cmw9aHR0cHMlM0ElMkYlMkZ3d3cuY2F0YXJzZS5tZSUyRnB0JTJGJyArIGFyZ3MucHJvamVjdCgpLnBlcm1hbGluayArICclM0ZyZWYlM0R0d2l0dGVyJnZpYT1jYXRhcnNlXCJdJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCdhLnctaGlkZGVuLXNtYWxsLndpZGdldC1lbWJlZC53LWhpZGRlbi10aW55LmZvbnRzaXplLXNtYWxsLmxpbmstaGlkZGVuLmZvbnRjb2xvci1zZWNvbmRhcnlbaHJlZj1cImpzOnZvaWQoMCk7XCJdJywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmRpc3BsYXlFbWJlZC50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCAnPCBlbWJlZCA+JyksIChjdHJsLmRpc3BsYXlFbWJlZCgpID8gbSgnLmVtYmVkLWV4cGFuZGVkLnUtbWFyZ2ludG9wLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0yMCcsICdJbnNpcmEgdW0gd2lkZ2V0IGVtIHNldSBzaXRlJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0W3R5cGU9XCJ0ZXh0XCJdW3ZhbHVlPVwiPGlmcmFtZSBmcmFtZWJvcmRlcj1cIjBcIiBoZWlnaHQ9XCIzMTRweFwiIHNyYz1cImh0dHBzOi8vd3d3LmNhdGFyc2UubWUvcHQvcHJvamVjdHMvJyArIGFyZ3MucHJvamVjdCgpLmlkICsgJy9lbWJlZFwiIHdpZHRoPVwiMzAwcHhcIiBzY3JvbGxpbmc9XCJub1wiPjwvaWZyYW1lPlwiXScpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuY2FyZC1lbWJlZCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lmcmFtZVtmcmFtZWJvcmRlcj1cIjBcIl1baGVpZ2h0PVwiMzUwcHhcIl1bc3JjPVwiL3Byb2plY3RzLycgKyBhcmdzLnByb2plY3QoKS5pZCArICcvZW1iZWRcIl1bd2lkdGg9XCIzMDBweFwiXVtzY3JvbGxpbmc9XCJub1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgbSgnYS53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS5idG4uYnRuLW1lZGl1bS5idG4tZmIudS1tYXJnaW5ib3R0b20tMjBbaHJlZj1cImh0dHA6Ly93d3cuZmFjZWJvb2suY29tL3NoYXJlci9zaGFyZXIucGhwP3U9aHR0cHM6Ly93d3cuY2F0YXJzZS5tZS8nICsgYXJncy5wcm9qZWN0KCkucGVybWFsaW5rICsgJz9yZWY9ZmFjZWJvb2smdGl0bGU9JyArIGFyZ3MucHJvamVjdCgpLm5hbWUgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1mYWNlYm9vaycpLCAnIENvbXBhcnRpbGhlJ1xuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJ2Eudy1oaWRkZW4tbWFpbi53LWhpZGRlbi1tZWRpdW0uYnRuLmJ0bi1tZWRpdW0uYnRuLXR3ZWV0LnUtbWFyZ2luYm90dG9tLTIwW2hyZWY9XCJodHRwOi8vdHdpdHRlci5jb20vP3N0YXR1cz1BY2FiZWkgZGUgYXBvaWFyIG8gcHJvamV0byAnICsgYXJncy5wcm9qZWN0KCkubmFtZSArICcgaHR0czovL3d3dy5jYXRhcnNlLm1lLycgKyBhcmdzLnByb2plY3QoKS5wZXJtYWxpbmsgKyAnP3JlZj10d2l0dGVyclwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtdHdpdHRlcicpLCAnIFR3ZWV0J1xuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdFNpZGViYXIgPSAoKG0sIGgsIGMsIF8sIEkxOG4pID0+IHtcbiAgICBjb25zdCBJMThuU2NvcGUgPSBfLnBhcnRpYWwoaC5pMThuU2NvcGUsICdwcm9qZWN0cy5wcm9qZWN0X3NpZGViYXInKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIGFuaW1hdGVQcm9ncmVzcyA9IChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhbmltYXRpb24sIHByb2dyZXNzID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGVkZ2VkID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRvcnMgPSAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsZWRnZWRJbmNyZW1lbnQgPSBwcm9qZWN0KCkucGxlZGdlZCAvIHByb2plY3QoKS5wcm9ncmVzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRvcnNJbmNyZW1lbnQgPSBwcm9qZWN0KCkudG90YWxfY29udHJpYnV0b3JzIC8gcHJvamVjdCgpLnByb2dyZXNzO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9ncmVzc0JhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcm9ncmVzc0JhcicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsZWRnZWRFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGVkZ2VkJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0b3JzRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udHJpYnV0b3JzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uID0gc2V0SW50ZXJ2YWwoaW5jcmVtZW50UHJvZ3Jlc3MsIDI4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluY3JlbWVudFByb2dyZXNzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvZ3Jlc3MgPD0gcGFyc2VJbnQocHJvamVjdCgpLnByb2dyZXNzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBgJHtwcm9ncmVzc30lYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsZWRnZWRFbC5pbm5lclRleHQgPSBgUiQgJHtoLmZvcm1hdE51bWJlcihwbGVkZ2VkKX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0b3JzRWwuaW5uZXJUZXh0ID0gYCR7cGFyc2VJbnQoY29udHJpYnV0b3JzKX0gcGVzc29hc2A7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5pbm5lclRleHQgPSBgJHtwcm9ncmVzc30lYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsZWRnZWQgPSBwbGVkZ2VkICsgcGxlZGdlZEluY3JlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dG9ycyA9IGNvbnRyaWJ1dG9ycyArIGNvbnRyaWJ1dG9yc0luY3JlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzID0gcHJvZ3Jlc3MgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChhbmltYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMTgwMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc3BsYXlDYXJkQ2xhc3MgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICd3YWl0aW5nX2Z1bmRzJzogJ2NhcmQtd2FpdGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3VjY2Vzc2Z1bCc6ICdjYXJkLXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2ZhaWxlZCc6ICdjYXJkLWVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdkcmFmdCc6ICdjYXJkLWRhcmsnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2luX2FuYWx5c2lzJzogJ2NhcmQtZGFyaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnYXBwcm92ZWQnOiAnY2FyZC1kYXJrJ1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoc3RhdGVzW3Byb2plY3QoKS5zdGF0ZV0gPyAnY2FyZCB1LXJhZGl1cyB6aW5kZXgtMTAgJyArIHN0YXRlc1twcm9qZWN0KCkuc3RhdGVdIDogJycpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGlzcGxheVN0YXR1c1RleHQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdhcHByb3ZlZCc6IEkxOG4udCgnZGlzcGxheV9zdGF0dXMuYXBwcm92ZWQnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAnb25saW5lJzogaC5leGlzdHkocHJvamVjdCgpLnpvbmVfZXhwaXJlc19hdCkgPyBJMThuLnQoJ2Rpc3BsYXlfc3RhdHVzLm9ubGluZScsIEkxOG5TY29wZSh7ZGF0ZTogaC5tb21lbnRpZnkocHJvamVjdCgpLnpvbmVfZXhwaXJlc19hdCl9KSkgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdmYWlsZWQnOiBJMThuLnQoJ2Rpc3BsYXlfc3RhdHVzLmZhaWxlZCcsIEkxOG5TY29wZSh7ZGF0ZTogaC5tb21lbnRpZnkocHJvamVjdCgpLnpvbmVfZXhwaXJlc19hdCksIGdvYWw6IHByb2plY3QoKS5nb2FsfSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3JlamVjdGVkJzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5yZWplY3RlZCcsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdpbl9hbmFseXNpcyc6IEkxOG4udCgnZGlzcGxheV9zdGF0dXMuaW5fYW5hbHlzaXMnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3VjY2Vzc2Z1bCc6IEkxOG4udCgnZGlzcGxheV9zdGF0dXMuc3VjY2Vzc2Z1bCcsIEkxOG5TY29wZSh7ZGF0ZTogaC5tb21lbnRpZnkocHJvamVjdCgpLnpvbmVfZXhwaXJlc19hdCl9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAnd2FpdGluZ19mdW5kcyc6IEkxOG4udCgnZGlzcGxheV9zdGF0dXMud2FpdGluZ19mdW5kcycsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdkcmFmdCc6IEkxOG4udCgnZGlzcGxheV9zdGF0dXMuZHJhZnQnLCBJMThuU2NvcGUoKSlcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGVzW3Byb2plY3QoKS5zdGF0ZV07XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBhbmltYXRlUHJvZ3Jlc3M6IGFuaW1hdGVQcm9ncmVzcyxcbiAgICAgICAgICAgICAgICBkaXNwbGF5Q2FyZENsYXNzOiBkaXNwbGF5Q2FyZENsYXNzLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlTdGF0dXNUZXh0OiBkaXNwbGF5U3RhdHVzVGV4dFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBlbGFwc2VkID0gcHJvamVjdCgpLmVsYXBzZWRfdGltZSxcbiAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBwcm9qZWN0KCkucmVtYWluaW5nX3RpbWU7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1zaWRlYmFyLmFzaWRlJywgW1xuICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LXN0YXRzJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1zdGF0cy1pbm5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LXN0YXRzLWluZm8nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjcGxlZGdlZC5mb250c2l6ZS1sYXJnZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgYFIkICR7cHJvamVjdCgpLnBsZWRnZWQgPyBoLmZvcm1hdE51bWJlcihwcm9qZWN0KCkucGxlZGdlZCkgOiAnMCd9YCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJMThuLnQoJ2NvbnRyaWJ1dG9yc19jYWxsJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbiNjb250cmlidXRvcnMuZm9udHdlaWdodC1zZW1pYm9sZCcsIEkxOG4udCgnY29udHJpYnV0b3JzX2NvdW50JywgSTE4blNjb3BlKHtjb3VudDogcHJvamVjdCgpLnRvdGFsX2NvbnRyaWJ1dG9yc30pKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIXByb2plY3QoKS5leHBpcmVzX2F0ICYmIGVsYXBzZWQpID8gJyBlbSAnICsgSTE4bi50KCdkYXRldGltZS5kaXN0YW5jZV9pbl93b3Jkcy54XycgKyBlbGFwc2VkLnVuaXQsIHtjb3VudDogZWxhcHNlZC50b3RhbH0sIEkxOG5TY29wZSgpKSA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjcHJvZ3Jlc3NCYXIubWV0ZXItZmlsbCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGAke3Byb2plY3QoKS5wcm9ncmVzc30lYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbnRvcC0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXInLCBgJHtwcm9qZWN0KCkucHJvZ3Jlc3MgPyBwYXJzZUludChwcm9qZWN0KCkucHJvZ3Jlc3MpIDogJzAnfSVgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTcudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYudy1jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXJpZ2h0LmZvbnRzaXplLXNtYWxsLmxpbmVoZWlnaHQtdGlnaHRlcicsIHJlbWFpbmluZyAmJiByZW1haW5pbmcudG90YWwgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVtYWluaW5nLnRvdGFsKSwgSTE4bi50KCdyZW1haW5pbmdfdGltZS4nICsgcmVtYWluaW5nLnVuaXQsIEkxOG5TY29wZSh7Y291bnQ6IHJlbWFpbmluZy50b3RhbH0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RNb2RlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgLCAocHJvamVjdCgpLm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgPyBtKCdhI2NvbnRyaWJ1dGVfcHJvamVjdF9mb3JtLmJ0bi5idG4tbGFyZ2UudS1tYXJnaW5ib3R0b20tMjBbaHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdCgpLmlkICsgJy9jb250cmlidXRpb25zL25ld1wiXScsIEkxOG4udCgnc3VibWl0JywgSTE4blNjb3BlKCkpKSA6ICcnKSwgKChwcm9qZWN0KCkub3Blbl9mb3JfY29udHJpYnV0aW9ucykgPyBtLmNvbXBvbmVudChjLlByb2plY3RSZW1pbmRlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdsaW5rJ1xuICAgICAgICAgICAgICAgICAgICB9KSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnZGl2W2NsYXNzPVwiZm9udHNpemUtc21hbGxlciB1LW1hcmdpbmJvdHRvbS0zMCAnICsgKGN0cmwuZGlzcGxheUNhcmRDbGFzcygpKSArICdcIl0nLCBjdHJsLmRpc3BsYXlTdGF0dXNUZXh0KCkpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnVzZXItYycsIG0uY29tcG9uZW50KGMuUHJvamVjdFVzZXJDYXJkLCB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiBhcmdzLnVzZXJEZXRhaWxzXG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYywgd2luZG93Ll8sIHdpbmRvdy5JMThuKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3RTdWNjZXNzZnVsT25ib2FyZENvbmZpcm1BY2NvdW50QWNjZXB0IGNvbXBvbmVudFxuICogcmVuZGVyIGNvbmZpcm1hdGlvbiBtZXNzYWdlIHRvIGFjY2VwdCBiYW5rIGRhdGFcbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5Qcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmRDb25maXJtQWNjb3VudEFjY2VwdCwge1xuICogICAgcHJvamVjdEFjY291bnQ6IHByb2plY3RBY2NvdW50LFxuICogICAgY2hhbmdlVG9BY3Rpb246IGN0cmwuY2hhbmdlVG9BY3Rpb24gLy9wcm92aWRlZCBieSBQcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmRDb25maXJtQWNjb3VudCBjb250cm9sbGVyXG4gKiB9KVxuICoqL1xud2luZG93LmMuUHJvamVjdFN1Y2Nlc3NmdWxPbmJvYXJkQ29uZmlybUFjY291bnRBY2NlcHQgPSAoKG0sIGMsIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5iYW5rLXRyYW5zZmVyLWFuc3dlcicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMycpLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLmJhbmstdHJhbnNmZXItY29uZmlybS5jYXJkLnUtcmFkaXVzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnZm9ybScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLnctaW5saW5lLWJsb2NrLnUtcmlnaHQuYnRuLmJ0bi10ZXJjaWFyeS5idG4tbm8tYm9yZGVyLmJ0bi1pbmxpbmUuZmEuZmEtY2xvc2UnLCB7aHJlZjogJ2pzOnZvaWQoMCk7Jywgb25jbGljazogYXJncy5jaGFuZ2VUb0FjdGlvbignc3RhcnQnKX0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsLmZpZWxkLWxhYmVsLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMjAnLCAnVGVtIGNlcnRlemE/JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS1tYXJnaW5ib3R0b20tMzAnLCAnUXVhbHF1ZXIgaW5mb3JtYcOnw6NvIGVycmFkYSBuZXNzZSBtb21lbnRvIHBvZGUgYXRyYXNhciBvIHJlcGFzc2UgZG9zIHJlY3Vyc29zIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIWFyZ3MuYWNjZXB0QWNjb3VudExvYWRlcigpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLnctYnV0dG9uLmJ0bi5idG4tbWVkaXVtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBocmVmOiAnanM6dm9pZCgwKTsnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBhcmdzLmFjY2VwdEFjY291bnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnQ29uZmlybWFyJykgOiBoLmxvYWRlcigpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zJylcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmRDb25maXJtQWNjb3VudEFjdGlvbnMgY29tcG9uZW50XG4gKiByZW5kZXIgYWN0aW9ucyB0byBoYW5kbGUgd2l0aCBhY2NlcHRhdGlvbiBvciBkZWNsaW5lIGN1cnJlbnQgYmFuayBkYXRhXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuUHJvamVjdFN1Y2Nlc3NmdWxPbmJvYXJkQ29uZmlybUFjY291bnRBY3Rpb25zLCB7XG4gKiAgICBwcm9qZWN0QWNjb3VudDogcHJvamVjdEFjY291bnQsXG4gKiAgICBjaGFuZ2VUb0FjdGlvbjogY3RybC5jaGFuZ2VUb0FjdGlvbiAvL3Byb3ZpZGVkIGJ5IFByb2plY3RTdWNjZXNzZnVsT25ib2FyZENvbmZpcm1BY2NvdW50IGNvbnRyb2xsZXJcbiAqIH0pXG4gKiovXG53aW5kb3cuYy5Qcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmRDb25maXJtQWNjb3VudEFjdGlvbnMgPSAoKG0sIGMsIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5iYW5rLXRyYW5zZmVyLWFuc3dlcicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNi53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JyksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1sYXJnZScsIHtocmVmOiAnanM6dm9pZCgwKTsnLCBvbmNsaWNrOiBhcmdzLmNoYW5nZVRvQWN0aW9uKCdhY2NlcHQnKX0sICdTaW0nKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdhLmJ0bi5idG4tbGFyZ2UuYnRuLXRlcmNpYXJ5Jywge2hyZWY6ICdqczp2b2lkKDApOycsIG9uY2xpY2s6IGFyZ3MuY2hhbmdlVG9BY3Rpb24oJ2Vycm9yJyl9LCAnTsOjbycpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIi8qKlxuICogd2luZG93LmMuUHJvamVjdFN1Y2Nlc3NmdWxPbmJvYXJkQ29uZmlybUFjY291bnRFcnJvciBjb21wb25lbnRcbiAqIHJlbmRlciBlcnJvciBmb3JtIHRvIGNvbGxlY3QgdXNlciBhbnN3ZXJcbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5Qcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmRDb25maXJtQWNjb3VudEVycm9yLCB7XG4gKiAgICBwcm9qZWN0QWNjb3VudDogcHJvamVjdEFjY291bnQsXG4gKiAgICBjaGFuZ2VUb0FjdGlvbjogY3RybC5jaGFuZ2VUb0FjdGlvbiAvL3Byb3ZpZGVkIGJ5IFByb2plY3RTdWNjZXNzZnVsT25ib2FyZENvbmZpcm1BY2NvdW50IGNvbnRyb2xsZXJcbiAqIH0pXG4gKiovXG53aW5kb3cuYy5Qcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmRDb25maXJtQWNjb3VudEVycm9yID0gKChtLCBjLCBoLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXJyb3JSZWFzb25NOiBtLnByb3AoJycpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5iYW5rLXRyYW5zZmVyLWFuc3dlcicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMycpLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLmJhbmstdHJhbnNmZXItcHJvYmxlbS5jYXJkLnUtcmFkaXVzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnZm9ybScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLnctaW5saW5lLWJsb2NrLnUtcmlnaHQuYnRuLmJ0bi10ZXJjaWFyeS5idG4tbm8tYm9yZGVyLmJ0bi1pbmxpbmUuZmEuZmEtY2xvc2UnLCB7aHJlZjogJ2pzOnZvaWQoMCk7Jywgb25jbGljazogYXJncy5jaGFuZ2VUb0FjdGlvbignc3RhcnQnKX0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsLmZpZWxkLWxhYmVsLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMjAnLCAnTyBxdWUgZXN0w6EgZXJyYWRvIGNvbSBzZXVzIGRhZG9zPycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3RleHRhcmVhLnctaW5wdXQudGV4dC1maWVsZCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdOb3MgYWp1ZGUgZGl6ZW5kbyBvIHF1ZSBwcmVjaXNhIHNlciBhanVzdGFkbyEgSXNzbyB2YWkgZmFjaWxpdGFyIG8gbm9zc28gdHJhYmFsaG8gZSBwb3VwYXIgc2V1IHRlbXBvLicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGN0cmwuZXJyb3JSZWFzb25NKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLnctYnV0dG9uLmJ0bi5idG4tbWVkaXVtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY6ICdqczp2b2lkKDApOycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogYXJncy5hZGRFcnJvclJlYXNvbihjdHJsLmVycm9yUmVhc29uTSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdFbnZpYXInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zJylcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmRDb25maXJtQWNjb3VudCBjb21wb25lbnRcbiAqIHJlbmRlciBwcm9qZWN0IGFjY291bnQgZGF0YSB0byBjb25maXJtIG9yIGFkZCBlcnJvclxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLlByb2plY3RTdWNjZXNzZnVsT25ib2FyZENvbmZpcm1BY2NvdW50LCB7cHJvamVjdEFjY291bnQ6IHByb2plY3RBY2NvdW50fSlcbiAqKi9cblxud2luZG93LmMuUHJvamVjdFN1Y2Nlc3NmdWxPbmJvYXJkQ29uZmlybUFjY291bnQgPSAoKG0sIGMsIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWN0aW9uU3RhZ2VzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICdzdGFydCc6ICdQcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmRDb25maXJtQWNjb3VudEFjdGlvbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICdlcnJvcic6ICdQcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmRDb25maXJtQWNjb3VudEVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAnYWNjZXB0JzogJ1Byb2plY3RTdWNjZXNzZnVsT25ib2FyZENvbmZpcm1BY2NvdW50QWNjZXB0J30sXG5cbiAgICAgICAgICAgICAgICAgIGFjdGlvblN0YWdlID0gbS5wcm9wKGFjdGlvblN0YWdlc1snc3RhcnQnXSksXG5cbiAgICAgICAgICAgICAgICAgIGNoYW5nZVRvQWN0aW9uID0gKHN0YWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uU3RhZ2UoYWN0aW9uU3RhZ2VzW3N0YWdlXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZvaWQoMCk7XG4gICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY2hhbmdlVG9BY3Rpb246IGNoYW5nZVRvQWN0aW9uLFxuICAgICAgICAgICAgICAgIGFjdGlvblN0YWdlOiBhY3Rpb25TdGFnZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3RBY2NvdW50ID0gYXJncy5wcm9qZWN0QWNjb3VudCxcbiAgICAgICAgICAgICAgICAgIGFjdGlvblN0YWdlID0gY3RybC5hY3Rpb25TdGFnZSxcbiAgICAgICAgICAgICAgICAgIHBlcnNvbktpbmQgPSAocHJvamVjdEFjY291bnQub3duZXJfZG9jdW1lbnQubGVuZ3RoID4gMTQgPyAnSnVyw61kaWNhJyA6ICdGw61zaWNhJyk7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb250YWluZXIudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTMwJywnT3Mgc2V1cyBkYWRvcyBlc3TDo28gY29ycmV0b3M/JylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UudS1tYXJnaW5ib3R0b20tMzAuY2FyZC5jYXJkLXRlcmNpYXJ5JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ1Blc3NvYTogJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcnNvbktpbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsICdOb21lIGNvbXBsZXRvIGRvIHRpdHVsYXI6ICcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0QWNjb3VudC5vd25lcl9uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRjb2xvci1zZWNvbmRhcnknLCAnQ1BGIGRvIHRpdHVsYXIgZGEgY29udGEgYmFuY8OhcmlhOiAnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdEFjY291bnQub3duZXJfZG9jdW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsICdCYW5jbzogJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RBY2NvdW50LmJhbmtfbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0Fnw6puY2lhOiAnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7cHJvamVjdEFjY291bnQuYWdlbmN5fSR7KF8uaXNFbXB0eShwcm9qZWN0QWNjb3VudC5hZ2VuY3lfZGlnaXQpID8gJycgOiBgLSR7cHJvamVjdEFjY291bnQuYWdlbmN5X2RpZ2l0fWApfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsICdDb250YSBDb3JyZW50ZTogJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke3Byb2plY3RBY2NvdW50LmFjY291bnR9LSR7cHJvamVjdEFjY291bnQuYWNjb3VudF9kaWdpdH1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTMwLmNhcmQuY2FyZC10ZXJjaWFyeScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsICdFbmRlcmXDp286ICcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtwcm9qZWN0QWNjb3VudC5hZGRyZXNzX3N0cmVldH0sICR7cHJvamVjdEFjY291bnQuYWRkcmVzc19udW1iZXJ9ICR7KCFfLmlzTnVsbChwcm9qZWN0QWNjb3VudC5hZGRyZXNzX2NvbXBsZW1lbnQpID8gYCwgJHtwcm9qZWN0QWNjb3VudC5hZGRyZXNzX2NvbXBsZW1lbnR9YCA6ICcnKX1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRjb2xvci1zZWNvbmRhcnknLCAnQmFpcnJvOiAnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdEFjY291bnQuYWRkcmVzc19uZWlnaGJvdXJob29kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRjb2xvci1zZWNvbmRhcnknLCAnQ2lkYWRlOiAnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdEFjY291bnQuYWRkcmVzc19jaXR5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRjb2xvci1zZWNvbmRhcnknLCAnRXN0YWRvOiAnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdEFjY291bnQuYWRkcmVzc19zdGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0NFUDogJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RBY2NvdW50LmFkZHJlc3NfemlwX2NvZGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoY1thY3Rpb25TdGFnZSgpXSwge1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0QWNjb3VudDogcHJvamVjdEFjY291bnQsXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZVRvQWN0aW9uOiBjdHJsLmNoYW5nZVRvQWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBhZGRFcnJvclJlYXNvbjogYXJncy5hZGRFcnJvclJlYXNvbixcbiAgICAgICAgICAgICAgICAgICAgYWNjZXB0QWNjb3VudDogYXJncy5hY2NlcHRBY2NvdW50LFxuICAgICAgICAgICAgICAgICAgICBhY2NlcHRBY2NvdW50TG9hZGVyOiBhcmdzLmFjY2VwdEFjY291bnRMb2FkZXJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3RTdWNjZXNzZnVsT25ib2FyZEVycm9yQWNjb3VudCBjb21wb25lbnRcbiAqIHJlbmRlciBtZXNzYWdlIGFib3V0IGVycm9yIG9uIGFjY291bnRcbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5Qcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmRFcnJvckFjY291bnQsIHtcbiAqICAgICBwcm9qZWN0VHJhbnNmZXI6IHByb2plY3RUcmFuc2ZlcixcbiAqICAgICBzZXRTdGFnZTogc2V0U3RhZ2UgLy8gc2V0U3RhZ2UgaXMgZGVmaW5lZCBvbiBQcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmQgY29tcG9uZW50XG4gKiB9KVxuICoqL1xuXG53aW5kb3cuYy5Qcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmRFcnJvckFjY291bnQgPSAoKG0sIGMsIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdFRyYW5zZmVyID0gYXJncy5wcm9qZWN0VHJhbnNmZXIsXG4gICAgICAgICAgICAgICAgICBwcm9qZWN0QWNjb3VudCA9IGFyZ3MucHJvamVjdEFjY291bnQ7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMycpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy51LW1hcmdpbmJvdHRvbS0yMCcsIHtzcmM6ICdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2YzM1MGZhYmZjNTBhZWY1MDk1YzY3ZF90cmFuc2Zlci1wZW5kaW5nLWljb24ucG5nJywgd2lkdGg6IDk0fSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMjAnLCAnVHJhbnNmZXLDqm5jaWEgYmFuY8OhcmlhIHBlbmRlbnRlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdTZXVzIGRhZG9zIGJhbmPDoXJpb3MgZXN0YXZhbSBjb20gYWxndW1hIGluZm9ybWHDp8OjbyBlcnJhZGEgZSBqw6EgZm9tb3Mgbm90aWZpY2Fkb3Mgc29icmUgZXNzZSBwcm9ibGVtYSEgRmlxdWUgZGUgb2xobyBubyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBwcm9qZWN0QWNjb3VudC51c2VyX2VtYWlsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAsIHBvaXMgdmFtb3MgcmVzb2x2ZXIgZXNzZSBwcm9ibGVtYSB2aWEgZW1haWwhJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMnKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmRGaW5pc2hlZCBjb21wb25lbnRcbiAqIHJlbmRlciBmaW5pc2hlZCBtZXNzYWdlXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuUHJvamVjdFN1Y2Nlc3NmdWxPbmJvYXJkRmluaXNoZWQsIHtcbiAqICAgICBwcm9qZWN0VHJhbnNmZXI6IHByb2plY3RUcmFuc2ZlcixcbiAqICAgICBzZXRTdGFnZTogc2V0U3RhZ2UgLy8gc2V0U3RhZ2UgaXMgZGVmaW5lZCBvbiBQcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmQgY29tcG9uZW50XG4gKiB9KVxuICoqL1xuXG53aW5kb3cuYy5Qcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmRGaW5pc2hlZCA9ICgobSwgYywgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0VHJhbnNmZXIgPSBhcmdzLnByb2plY3RUcmFuc2ZlcjtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnUtbWFyZ2luYm90dG9tLTIwJywge3NyYzogJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTZjMzUxMWVlN2QxMzZhMDE2YmMzNGZhX3N1Y2Nlc2Z1bC1pY29uLnBuZycsIHdpZHRoOiA5NH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTIwJywgJ0JvYSBzb3J0ZSBubyBzZXUgcHJvamV0byEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1RyYWJhbGhlIHNlbXByZSBvIHJlbGFjaW9uYW1lbnRvIGNvbSBzZXVzIGFwb2lhZG9yZXMhIE1hbnRlbmhhIGVsZXMgaW5mb3JtYWRvcyBkbyBhbmRhbWVudG8gZG8gc2V1IHByb2pldG8uIE7Do28gZGVpeGUgZGUgb2xoYXIgYSBzZcOnw6NvIGRlIHDDs3MtcHJvamV0byBkbyBHdWlhIGRvcyBSZWFsaXphZG9yZXMhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuUHJvamVjdFN1Y2Nlc3NmdWxPbmJvYXJkUGVuZGluZ1RyYW5zZmVyIGNvbXBvbmVudFxuICogcmVuZGVyIG1lc3NhZ2UgYWJvdXQgcGVuZGluZyB0cmFuc2ZlclxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLlByb2plY3RTdWNjZXNzZnVsT25ib2FyZFBlbmRpbmdUcmFuc2Zlciwge1xuICogICAgIHByb2plY3RUcmFuc2ZlcjogcHJvamVjdFRyYW5zZmVyLFxuICogICAgIHNldFN0YWdlOiBzZXRTdGFnZSAvLyBzZXRTdGFnZSBpcyBkZWZpbmVkIG9uIFByb2plY3RTdWNjZXNzZnVsT25ib2FyZCBjb21wb25lbnRcbiAqIH0pXG4gKiovXG5cbndpbmRvdy5jLlByb2plY3RTdWNjZXNzZnVsT25ib2FyZFBlbmRpbmdUcmFuc2ZlciA9ICgobSwgYywgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0VHJhbnNmZXIgPSBhcmdzLnByb2plY3RUcmFuc2ZlcixcbiAgICAgICAgICAgICAgICAgIHByb2plY3RBY2NvdW50ID0gYXJncy5wcm9qZWN0QWNjb3VudDtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnUtbWFyZ2luYm90dG9tLTIwJywge3NyYzogJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTZjMzUwYzVlN2QxMzZhMDE2YmMzNGE0X3RyYW5zZmVyLW9rLWljb24ucG5nJywgd2lkdGg6IDk0fSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMjAnLCAnVHJhbnNmZXLDqm5jaWEgYmFuY8OhcmlhIGVtIGFuZGFtZW50bycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgQXTDqSBvIGRpYSAke3Byb2plY3RBY2NvdW50LnRyYW5zZmVyX2xpbWl0X2RhdGV9LCBSJCR7aC5mb3JtYXROdW1iZXIocHJvamVjdFRyYW5zZmVyLnRvdGFsX2Ftb3VudCwgMil9ICh0YXhhcyBqw6EgZGVzY29udGFkYXMpIGVzdGFyw6NvIGVtIHN1YSBjb250YSBCYW5jbyAke3Byb2plY3RBY2NvdW50LmJhbmtfbmFtZX0sIEFnw6puY2lhOiR7cHJvamVjdEFjY291bnQuYWdlbmN5fSR7KF8uaXNFbXB0eShwcm9qZWN0QWNjb3VudC5hZ2VuY3lfZGlnaXQpID8gJycgOiBgLSR7cHJvamVjdEFjY291bnQuYWdlbmN5X2RpZ2l0fWApfSwgQ29udGE6JHtwcm9qZWN0QWNjb3VudC5hY2NvdW50fS0ke3Byb2plY3RBY2NvdW50LmFjY291bnRfZGlnaXR9LiBGaXF1ZSBhdGVudG8gbm8gZW1haWwgJHtwcm9qZWN0QWNjb3VudC51c2VyX2VtYWlsfSAsIHBvaXMgbm9zc2EgZXF1aXBlIHBvZGUgZW50cmFyIGVtIGNvbnRhdG8gY29tIHZvY8OqIHNlIG9jb3JyZXIgYWxndW0gcHJvYmxlbWEgY29tIG8gYmFuY28hYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMnKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmRTdGFydCBjb21wb25lbnRcbiAqIHJlbmRlciBjb25ncmF0dWxhdGlvbnMgbWVzc2FnZSB3aGVuIHByb2plY3QgaXMgc3VjY2Vzc2Z1bCBhbmQgXG4gKiBidXR0b24gdG8gY29uZmlybSB0aGUgYmFuayBkYXRhXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuUHJvamVjdFN1Y2Nlc3NmdWxPbmJvYXJkU3RhcnQsIHtcbiAqICAgICBwcm9qZWN0VHJhbnNmZXI6IHByb2plY3RUcmFuc2ZlcixcbiAqICAgICBzZXRTdGFnZTogc2V0U3RhZ2UgLy8gc2V0U3RhZ2UgaXMgZGVmaW5lZCBvbiBQcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmQgY29tcG9uZW50XG4gKiB9KVxuICoqL1xuXG53aW5kb3cuYy5Qcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmRTdGFydCA9ICgobSwgYywgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0VHJhbnNmZXIgPSBhcmdzLnByb2plY3RUcmFuc2ZlcjtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnUtbWFyZ2luYm90dG9tLTIwJywge3NyYzogJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTZjMzUwOGRiZmM1MGFlZjUwOTVjNjZhX2ZpbmlzaC1pY29uLnBuZycsIHdpZHRoOiA5NH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTIwJywgJ1BhcmFiw6lucyEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1NldSBwcm9qZXRvIGZvaSBmaW5hbGl6YWRvIGNvbSBzdWNlc3NvIGUgdm9jw6ogdGVtICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIGBSJCR7aC5mb3JtYXROdW1iZXIocHJvamVjdFRyYW5zZmVyLnRvdGFsX2Ftb3VudCwgMil9IGApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAncGFyYSByZWNlYmVyICh0YXhhcyBqw6EgZGVzY29udGFkYXMpISBQYXJhIGVmZXR1YXJtb3MgYSB0cmFuc2ZlcsOqbmNpYSwgcHJlY2lzYW1vcyBxdWUgdm9jw6ogbm9zIGNvbmZpcm1lIHNldXMgZGFkb3MgYmFuY8Ohcmlvcy4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5idG4uYnRuLWxhcmdlLmJ0bi1pbmxpbmUnLCB7aHJlZjogJ2pzOnZvaWQoMCk7Jywgb25jbGljazogYXJncy5zZXRTdGFnZSgnY29uZmlybV9hY2NvdW50Jyl9LCAnQ29uZmlybWFyIGRhZG9zIGJhbmPDoXJpb3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuUHJvamVjdFN1Y2Nlc3NmdWxPbmJvYXJkIGNvbXBvbmVudFxuICogcmVuZGVyIGZpcnN0IGludGVyYWN0aW9uIG9mIHN1Y2Nlc3NmdWwgcHJvamVjdCBvbmJvYXJkaW5nXG4gKiB1c2VkIHdoZW4gcHJvamVjdCBpcyBzdWNjZXNzZnVsIGFuZCB3YW50cyB0byBjb25maXJtIGJhbmsgZGF0YSBhbmQgcmVxdWVzdCB0cmFuc2ZlclxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLlByb2plY3RTdWNjZXNzZnVsT25ib2FyZCwge3Byb2plY3Q6IHByb2plY3R9KVxuICoqL1xuXG53aW5kb3cuYy5Qcm9qZWN0U3VjY2Vzc2Z1bE9uYm9hcmQgPSAoKG0sIGMsIG1vZGVscywgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0SWRWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7cHJvamVjdF9pZDogJ2VxJ30pLFxuICAgICAgICAgICAgICAgICAgcHJvamVjdEFjY291bnRzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICAgIHByb2plY3RUcmFuc2ZlcnMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgICAgb25ib2FyZFN0YWdlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAnc3RhcnQnOiAnUHJvamVjdFN1Y2Nlc3NmdWxPbmJvYXJkU3RhcnQnLFxuICAgICAgICAgICAgICAgICAgICAgICdjb25maXJtX2FjY291bnQnOiAnUHJvamVjdFN1Y2Nlc3NmdWxPbmJvYXJkQ29uZmlybUFjY291bnQnLFxuICAgICAgICAgICAgICAgICAgICAgICdlcnJvcl9hY2NvdW50JzogJ1Byb2plY3RTdWNjZXNzZnVsT25ib2FyZEVycm9yQWNjb3VudCcsXG4gICAgICAgICAgICAgICAgICAgICAgJ3BlbmRpbmdfdHJhbnNmZXInOiAnUHJvamVjdFN1Y2Nlc3NmdWxPbmJvYXJkUGVuZGluZ1RyYW5zZmVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAnZmluaXNoZWQnOiAnUHJvamVjdFN1Y2Nlc3NmdWxPbmJvYXJkRmluaXNoZWQnXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgY3VycmVudFN0YWdlID0gbS5wcm9wKG9uYm9hcmRTdGFnZXNbJ3N0YXJ0J10pLFxuICAgICAgICAgICAgICAgICAgbG9hZGVyID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuLFxuICAgICAgICAgICAgICAgICAgZGVjbGluZUFjY291bnRMb2FkZXIgPSAoZXJyb3JNc2cpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYSA9IF8uZmlyc3QocHJvamVjdEFjY291bnRzKCkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWxzLnByb2plY3RBY2NvdW50RXJyb3IucG9zdE9wdGlvbnMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogYXJncy5wcm9qZWN0LmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uOiBlcnJvck1zZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgYWNjZXB0QWNjb3VudExvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihcbiAgICAgICAgICAgICAgICAgICAgICBtb2RlbHMucHJvamVjdEFjY291bnQucG9zdE9wdGlvbnMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiBhcmdzLnByb2plY3QuaWRcbiAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcHJvamVjdElkVk0ucHJvamVjdF9pZChhcmdzLnByb2plY3QuaWQpO1xuXG4gICAgICAgICAgICBjb25zdCBsUHJvamVjdEFjY291bnQgPSBsb2FkZXIobW9kZWxzLnByb2plY3RBY2NvdW50LmdldFJvd09wdGlvbnMocHJvamVjdElkVk0ucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICBsUHJvamVjdEFjY291bnQubG9hZCgpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBwcm9qZWN0QWNjb3VudHMoZGF0YSk7XG4gICAgICAgICAgICAgICAgbG9hZEN1cnJlbnRTdGFnZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGxQcm9qZWN0VHJhbnNmZXIgPSBsb2FkZXIobW9kZWxzLnByb2plY3RUcmFuc2Zlci5nZXRSb3dPcHRpb25zKHByb2plY3RJZFZNLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgbFByb2plY3RUcmFuc2Zlci5sb2FkKCkudGhlbihwcm9qZWN0VHJhbnNmZXJzKTtcblxuICAgICAgICAgICAgY29uc3Qgc2V0U3RhZ2UgPSAoc3RhZ2UpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RhZ2Uob25ib2FyZFN0YWdlc1tzdGFnZV0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50U3RhZ2UoKTtcbiAgICAgICAgICAgICAgICB9O30sXG5cbiAgICAgICAgICAgICAgICAgIGxvYWRDdXJyZW50U3RhZ2UgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKCFsUHJvamVjdEFjY291bnQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYSA9IF8uZmlyc3QocHJvamVjdEFjY291bnRzKCkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfLmlzTnVsbChwYS5lcnJvcl9yZWFzb24pICYmIF8uaXNOdWxsKHBhLnRyYW5zZmVyX3N0YXRlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldFN0YWdlKCdzdGFydCcpKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIV8uaXNOdWxsKHBhLmVycm9yX3JlYXNvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRTdGFnZSgnZXJyb3JfYWNjb3VudCcpKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIV8uaXNOdWxsKHBhLnRyYW5zZmVyX3N0YXRlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldFN0YWdlKCdwZW5kaW5nX3RyYW5zZmVyJykoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2b2lkKDApO1xuICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgLy8gVE9ETzogbmVlZCB0byBhZGQgYW4gZXJyb3IgdmFsaWRhdGlvbiB0byBub3QgbnVsbFxuICAgICAgICAgICAgICAgICAgYWRkRXJyb3JSZWFzb24gPSAoZXJyb3JQcm9wKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZm4gPSBkZWNsaW5lQWNjb3VudExvYWRlcihlcnJvclByb3AoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGZuLmxvYWQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFN0YWdlKCdlcnJvcl9hY2NvdW50JykoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZvaWQoMCk7XG4gICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgIGFjY2VwdEFjY291bnQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgYWNjZXB0QWNjb3VudExvYWRlci5sb2FkKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNldFN0YWdlKCdwZW5kaW5nX3RyYW5zZmVyJykoKTtcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2b2lkKDApO1xuICAgICAgICAgICAgICAgICAgfTtcblxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHByb2plY3RBY2NvdW50czogcHJvamVjdEFjY291bnRzLFxuICAgICAgICAgICAgICAgIHByb2plY3RUcmFuc2ZlcnM6IHByb2plY3RUcmFuc2ZlcnMsXG4gICAgICAgICAgICAgICAgbFByb2plY3RBY2NvdW50OiBsUHJvamVjdEFjY291bnQsXG4gICAgICAgICAgICAgICAgbFByb2plY3RUcmFuc2ZlcjogbFByb2plY3RUcmFuc2ZlcixcbiAgICAgICAgICAgICAgICBzZXRTdGFnZTogc2V0U3RhZ2UsXG4gICAgICAgICAgICAgICAgY3VycmVudFN0YWdlOiBjdXJyZW50U3RhZ2UsXG4gICAgICAgICAgICAgICAgYWRkRXJyb3JSZWFzb246IGFkZEVycm9yUmVhc29uLFxuICAgICAgICAgICAgICAgIGFjY2VwdEFjY291bnQ6IGFjY2VwdEFjY291bnQsXG4gICAgICAgICAgICAgICAgYWNjZXB0QWNjb3VudExvYWRlcjogYWNjZXB0QWNjb3VudExvYWRlcixcbiAgICAgICAgICAgICAgICBkZWNsaW5lQWNjb3VudExvYWRlcjogZGVjbGluZUFjY291bnRMb2FkZXIsXG4gICAgICAgICAgICAgICAgbG9hZEN1cnJlbnRTdGFnZTogbG9hZEN1cnJlbnRTdGFnZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdEFjY291bnQgPSBfLmZpcnN0KGN0cmwucHJvamVjdEFjY291bnRzKCkpLFxuICAgICAgICAgICAgICAgICAgcHJvamVjdFRyYW5zZmVyID0gXy5maXJzdChjdHJsLnByb2plY3RUcmFuc2ZlcnMoKSksXG4gICAgICAgICAgICAgICAgICBscGEgPSBjdHJsLmxQcm9qZWN0QWNjb3VudCxcbiAgICAgICAgICAgICAgICAgIGxwdCA9IGN0cmwubFByb2plY3RUcmFuc2ZlcjtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAoIWxwYSgpICYmICFscHQoKSA/XG4gICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGNbY3RybC5jdXJyZW50U3RhZ2UoKV0sIHtcbiAgICAgICAgICAgICAgICAgICAgIHByb2plY3RUcmFuc2ZlcjogcHJvamVjdFRyYW5zZmVyLFxuICAgICAgICAgICAgICAgICAgICAgcHJvamVjdEFjY291bnQ6IHByb2plY3RBY2NvdW50LFxuICAgICAgICAgICAgICAgICAgICAgc2V0U3RhZ2U6IGN0cmwuc2V0U3RhZ2UsXG4gICAgICAgICAgICAgICAgICAgICBhZGRFcnJvclJlYXNvbjogY3RybC5hZGRFcnJvclJlYXNvbixcbiAgICAgICAgICAgICAgICAgICAgIGFjY2VwdEFjY291bnQ6IGN0cmwuYWNjZXB0QWNjb3VudCxcbiAgICAgICAgICAgICAgICAgICAgIGFjY2VwdEFjY291bnRMb2FkZXI6IGN0cmwuYWNjZXB0QWNjb3VudExvYWRlclxuICAgICAgICAgICAgICAgICB9KSA6IGgubG9hZGVyKCkpXG5cbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3RTdWdnZXN0ZWRDb250cmlidXRpb25zIGNvbXBvbmVudFxuICogQSBQcm9qZWN0LXNob3cgcGFnZSBoZWxwZXIgdG8gc2hvdyBzdWdnZXN0ZWQgYW1vdW50cyBvZiBjb250cmlidXRpb25zXG4gKlxuICogRXhhbXBsZSBvZiB1c2U6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgIC4uLlxuICogICBtLmNvbXBvbmVudChjLlByb2plY3RTdWdnZXN0ZWRDb250cmlidXRpb25zLCB7cHJvamVjdDogcHJvamVjdH0pXG4gKiAgIC4uLlxuICogfVxuICovXG5cbndpbmRvdy5jLlByb2plY3RTdWdnZXN0ZWRDb250cmlidXRpb25zID0gKGZ1bmN0aW9uKG0sIGMsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgICAgICAgIGxldCBzdWdnZXN0aW9uVXJsID0gKGFtb3VudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBgL3Byb2plY3RzLyR7cHJvamVjdC5wcm9qZWN0X2lkfS9jb250cmlidXRpb25zL25ldz9hbW91bnQ9JHthbW91bnR9YDtcbiAgICAgICAgICAgIH0sIHN1Z2dlc3RlZFZhbHVlcyA9IFsxMCwgMjUsIDUwLCAxMDBdO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnI3N1Z2dlc3Rpb25zJywgXy5tYXAoc3VnZ2VzdGVkVmFsdWVzLCAoYW1vdW50KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oYGFbaHJlZj1cIiR7c3VnZ2VzdGlvblVybChhbW91bnQpfVwiXS5jYXJkLXJld2FyZC5jYXJkLWJpZy5jYXJkLXNlY29uZGFyeS51LW1hcmdpbmJvdHRvbS0yMGAsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlcicsIGBSJMKgJHthbW91bnR9YClcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlByb2plY3RUYWJzID0gKChtLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBpc0ZpeGVkID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFBvc2l0aW9uID0gbS5wcm9wKC0xKTtcblxuICAgICAgICAgICAgY29uc3QgZml4T25TY3JvbGwgPSAoZWwpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdmlld3BvcnRPZmZzZXQgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93LnNjcm9sbFkgPD0gb3JpZ2luYWxQb3NpdGlvbigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFBvc2l0aW9uKC0xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzRml4ZWQoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh2aWV3cG9ydE9mZnNldC50b3AgPCAwIHx8ICh3aW5kb3cuc2Nyb2xsWSA+IG9yaWdpbmFsUG9zaXRpb24oKSAmJiBvcmlnaW5hbFBvc2l0aW9uKCkgPiAwKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0ZpeGVkKCkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsUG9zaXRpb24od2luZG93LnNjcm9sbFkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRml4ZWQodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBuYXZEaXNwbGF5ID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpeE5hdkJhciA9IGZpeE9uU2Nyb2xsKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGZpeE5hdkJhcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBuYXZEaXNwbGF5OiBuYXZEaXNwbGF5LFxuICAgICAgICAgICAgICAgIGlzRml4ZWQ6IGlzRml4ZWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIHJld2FyZHMgPSBhcmdzLnJld2FyZERldGFpbHM7XG5cbiAgICAgICAgICAgIGxldCBtYWluQ2xhc3MgPSAoIWN0cmwuaXNGaXhlZCgpIHx8IHByb2plY3QoKS5pc19vd25lcl9vcl9hZG1pbikgPyAnLnctc2VjdGlvbi5wcm9qZWN0LW5hdicgOiAnLnctc2VjdGlvbi5wcm9qZWN0LW5hdi5wcm9qZWN0LW5hdi1maXhlZCc7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCduYXYtd3JhcHBlcicsIHByb2plY3QoKSA/IFtcbiAgICAgICAgICAgICAgICBtKG1haW5DbGFzcywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwubmF2RGlzcGxheVxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgWyFfLmlzRW1wdHkocmV3YXJkcygpKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaWQ9XCJyZXdhcmRzLWxpbmtcIl1bY2xhc3M9XCJ3LWhpZGRlbi1tYWluIHctaGlkZGVuLW1lZGl1bSBkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI3Jld2FyZHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjcmV3YXJkc1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnZmxvYXQ6IGxlZnQ7J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnUmVjb21wZW5zYXMnKSA6IG0oJ2FbaWQ9XCJyZXdhcmRzLWxpbmtcIl1bY2xhc3M9XCJ3LWhpZGRlbi1tYWluIHctaGlkZGVuLW1lZGl1bSBkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI2NvbnRyaWJ1dGlvbl9zdWdnZXN0aW9ucycpID8gJ3NlbGVjdGVkJyA6ICcnKSArICdcIl1baHJlZj1cIiNjb250cmlidXRpb25fc3VnZ2VzdGlvbnNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ1ZhbG9yZXMgU3VnZXJpZG9zJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaWQ9XCJhYm91dC1saW5rXCJdW2NsYXNzPVwiZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNhYm91dCcpIHx8IGguaGFzaE1hdGNoKCcnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnIFwiXVtocmVmPVwiI2Fib3V0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdTb2JyZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwicG9zdHMtbGlua1wiXVtjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjcG9zdHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjcG9zdHNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ05vdmlkYWRlcyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZScsIHByb2plY3QoKSA/IHByb2plY3QoKS5wb3N0c19jb3VudCA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtpZD1cImNvbnRyaWJ1dGlvbnMtbGlua1wiXVtjbGFzcz1cInctaGlkZGVuLXNtYWxsIHctaGlkZGVuLXRpbnkgZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNjb250cmlidXRpb25zJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI2NvbnRyaWJ1dGlvbnNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0Fwb2lvcyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZS53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgcHJvamVjdCgpID8gcHJvamVjdCgpLnRvdGFsX2NvbnRyaWJ1dGlvbnMgOiAnLScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwiY29tbWVudHMtbGlua1wiXVtjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjY29tbWVudHMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjY29tbWVudHNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbWVudMOhcmlvcyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdCgpID8gbSgnZmI6Y29tbWVudHMtY291bnRbaHJlZj1cImh0dHA6Ly93d3cuY2F0YXJzZS5tZS8nICsgcHJvamVjdCgpLnBlcm1hbGluayArICdcIl1bY2xhc3M9XCJiYWRnZSBwcm9qZWN0LWZiLWNvbW1lbnQgdy1oaWRkZW4tc21hbGwgdy1oaWRkZW4tdGlueVwiXVtzdHlsZT1cImRpc3BsYXk6IGlubGluZVwiXScsIG0udHJ1c3QoJyZuYnNwOycpKSA6ICctJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0KCkgPyBtKCcudy1jb2wudy1jb2wtNC53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgcHJvamVjdCgpLm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy5wcm9qZWN0LW5hdi1iYWNrLWJ1dHRvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02LnctY29sLW1lZGl1bS04JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Eudy1idXR0b24uYnRuW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QoKS5pZCArICcvY29udHJpYnV0aW9ucy9uZXdcIl0nLCAnQXBvaWFywqDigI1lc3RlwqBwcm9qZXRvJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYudy1jb2wtbWVkaXVtLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmVtaW5kZXIsIHtwcm9qZWN0OiBwcm9qZWN0LCB0eXBlOiAnYnV0dG9uJywgaGlkZVRleHRPbk1vYmlsZTogdHJ1ZX0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJykgOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAoY3RybC5pc0ZpeGVkKCkgJiYgIXByb2plY3QoKS5pc19vd25lcl9vcl9hZG1pbikgPyBtKCcudy1zZWN0aW9uLnByb2plY3QtbmF2JykgOiAnJ1xuICAgICAgICAgICAgXSA6ICcnKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0VXNlckNhcmQgPSAoKG0sIF8sIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJyN1c2VyLWNhcmQnLCBfLm1hcChhcmdzLnVzZXJEZXRhaWxzKCksICh1c2VyRGV0YWlsKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJy51LW1hcmdpbmJvdHRvbS0zMC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi51LW1hcmdpbmJvdHRvbS0zMC51LXJvdW5kW3dpZHRoPVwiMTAwXCJdW2l0ZW1wcm9wPVwiaW1hZ2VcIl1bc3JjPVwiJyArIHVzZXJEZXRhaWwucHJvZmlsZV9pbWdfdGh1bWJuYWlsICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5saW5rLWhpZGRlbi5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmxpbmVoZWlnaHQtdGlnaHRbaXRlbXByb3A9XCJuYW1lXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIvdXNlcnMvJyArIHVzZXJEZXRhaWwuaWQgKyAnXCJdJywgdXNlckRldGFpbC5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaC5wbHVyYWxpemUodXNlckRldGFpbC50b3RhbF9wdWJsaXNoZWRfcHJvamVjdHMsICcgY3JpYWRvJywgJyBjcmlhZG9zJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJyZuYnNwOyZuYnNwO3wmbmJzcDsmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaC5wbHVyYWxpemUodXNlckRldGFpbC50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cywgJyBhcG9pYWRvJywgJyBhcG9pYWRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgndWwudy1oaWRkZW4tdGlueS53LWhpZGRlbi1zbWFsbC53LWxpc3QtdW5zdHlsZWQuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLmZhY2Vib29rX2xpbmspID8gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCInICsgdXNlckRldGFpbC5mYWNlYm9va19saW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnUGVyZmlsIG5vIEZhY2Vib29rJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksICghXy5pc0VtcHR5KHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSkgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vJyArIHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBUd2l0dGVyJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKHVzZXJEZXRhaWwubGlua3MsIChsaW5rKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFyc2VkTGluayA9IGgucGFyc2VVcmwobGluayk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoIV8uaXNFbXB0eShwYXJzZWRMaW5rLmhvc3RuYW1lKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyBsaW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBwYXJzZWRMaW5rLmhvc3RuYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksICghXy5pc0VtcHR5KHVzZXJEZXRhaWwuZW1haWwpID8gbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuZm9udHNpemUtc21hbGxlc3QuYWx0LWxpbmsuZm9udHdlaWdodC1zZW1pYm9sZFtpdGVtcHJvcD1cImVtYWlsXCJdW3RhcmdldD1cIl9ibGFua1wiXScsIHVzZXJEZXRhaWwuZW1haWwpIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuU2xpZGVyIGNvbXBvbmVudFxuICogQnVpbGQgYSBzbGlkZXIgZnJvbSBhbnkgYXJyYXkgb2YgbWl0aHJpbCBlbGVtZW50c1xuICpcbiAqIEV4YW1wbGUgb2YgdXNlOlxuICogdmlldzogKCkgPT4ge1xuICogICAgIC4uLlxuICogICAgIG0uY29tcG9uZW50KGMuU2xpZGVyLCB7XG4gKiAgICAgICAgIHNsaWRlczogW20oJ3NsaWRlMScpLCBtKCdzbGlkZTInKSwgbSgnc2xpZGUzJyldLFxuICogICAgICAgICB0aXRsZTogJ08gcXVlIGVzdMOjbyBkaXplbmRvIHBvciBhw60uLi4nXG4gKiAgICAgfSlcbiAqICAgICAuLi5cbiAqIH1cbiAqL1xud2luZG93LmMuU2xpZGVyID0gKChtLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBpbnRlcnZhbDtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkU2xpZGVJZHggPSBtLnByb3AoMCksXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRpb25TaXplID0gbS5wcm9wKDE2MDApLFxuICAgICAgICAgICAgICAgIGRlY3JlbWVudFNsaWRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRTbGlkZUlkeCgpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRTbGlkZUlkeChzZWxlY3RlZFNsaWRlSWR4KCkgLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkU2xpZGVJZHgoYXJncy5zbGlkZXMubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGluY3JlbWVudFNsaWRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRTbGlkZUlkeCgpIDwgKGFyZ3Muc2xpZGVzLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFNsaWRlSWR4KHNlbGVjdGVkU2xpZGVJZHgoKSArIDEpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRTbGlkZUlkeCgwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3RhcnRTbGlkZXJUaW1lciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNyZW1lbnRTbGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgNjUwMCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZXNldFNsaWRlclRpbWVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRTbGlkZXJUaW1lcigpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29uZmlnID0gKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblNpemUoTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLCB3aW5kb3cuaW5uZXJXaWR0aCB8fCAwKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQub251bmxvYWQgPSAoKSA9PiBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzdGFydFNsaWRlclRpbWVyKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRTbGlkZUlkeDogc2VsZWN0ZWRTbGlkZUlkeCxcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblNpemU6IHRyYW5zbGF0aW9uU2l6ZSxcbiAgICAgICAgICAgICAgICBkZWNyZW1lbnRTbGlkZTogZGVjcmVtZW50U2xpZGUsXG4gICAgICAgICAgICAgICAgaW5jcmVtZW50U2xpZGU6IGluY3JlbWVudFNsaWRlLFxuICAgICAgICAgICAgICAgIHJlc2V0U2xpZGVyVGltZXI6IHJlc2V0U2xpZGVyVGltZXJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzbGlkZXJDbGljayA9IChmbiwgcGFyYW0pID0+IHtcbiAgICAgICAgICAgICAgICBmbihwYXJhbSk7XG4gICAgICAgICAgICAgICAgY3RybC5yZXNldFNsaWRlclRpbWVyKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctc2xpZGVyLnNsaWRlLXRlc3RpbW9uaWFscycsIHtcbiAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwuY29uZmlnXG4gICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlcicsIGFyZ3MudGl0bGUpLFxuICAgICAgICAgICAgICAgIG0oJy53LXNsaWRlci1tYXNrJywgW1xuICAgICAgICAgICAgICAgICAgICBfLm1hcChhcmdzLnNsaWRlcywgKHNsaWRlLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0cmFuc2xhdGVWYWx1ZSA9IChpZHggLSBjdHJsLnNlbGVjdGVkU2xpZGVJZHgoKSkgKiBjdHJsLnRyYW5zbGF0aW9uU2l6ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVN0ciA9IGB0cmFuc2xhdGUzZCgke3RyYW5zbGF0ZVZhbHVlfXB4LCAwLCAwKWA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcuc2xpZGUudy1zbGlkZS5zbGlkZS10ZXN0aW1vbmlhbHMtY29udGVudCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogYHRyYW5zZm9ybTogJHt0cmFuc2xhdGVTdHJ9OyAtd2Via2l0LXRyYW5zZm9ybTogJHt0cmFuc2xhdGVTdHJ9OyAtbXMtdHJhbnNmb3JtOiR7dHJhbnNsYXRlU3RyfTtgXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC53LWNvbC1wdXNoLTInLCBzbGlkZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcjc2xpZGUtcHJldi53LXNsaWRlci1hcnJvdy1sZWZ0LnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiAoKSA9PiBzbGlkZXJDbGljayhjdHJsLmRlY3JlbWVudFNsaWRlKVxuICAgICAgICAgICAgICAgICAgICB9LFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWljb24tc2xpZGVyLWxlZnQuZmEuZmEtbGcuZmEtYW5nbGUtbGVmdC5mb250Y29sb3ItdGVyY2lhcnknKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnI3NsaWRlLW5leHQudy1zbGlkZXItYXJyb3ctcmlnaHQudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6ICgpID0+IHNsaWRlckNsaWNrKGN0cmwuaW5jcmVtZW50U2xpZGUpXG4gICAgICAgICAgICAgICAgICAgIH0sW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaWNvbi1zbGlkZXItcmlnaHQuZmEuZmEtbGcuZmEtYW5nbGUtcmlnaHQuZm9udGNvbG9yLXRlcmNpYXJ5JylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXNsaWRlci1uYXYudy1zbGlkZXItbmF2LWludmVydC53LXJvdW5kLnNsaWRlLW5hdicsIF8oYXJncy5zbGlkZXMubGVuZ3RoKS50aW1lcygoaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbShgLnNsaWRlLWJ1bGxldC53LXNsaWRlci1kb3Qke2N0cmwuc2VsZWN0ZWRTbGlkZUlkeCgpID09PSBpZHggPyAnLnctYWN0aXZlJyA6ICcnfWAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiAoKSA9PiBzbGlkZXJDbGljayhjdHJsLnNlbGVjdGVkU2xpZGVJZHgsIGlkeClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlRlYW1NZW1iZXJzID0gKGZ1bmN0aW9uKF8sIG0sIG1vZGVscykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHZtID0ge1xuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBtLnByb3AoW10pXG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGdyb3VwQ29sbGVjdGlvbiA9IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIGdyb3VwVG90YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8ubWFwKF8ucmFuZ2UoTWF0aC5jZWlsKGNvbGxlY3Rpb24ubGVuZ3RoIC8gZ3JvdXBUb3RhbCkpLCBmdW5jdGlvbihpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbi5zbGljZShpICogZ3JvdXBUb3RhbCwgKGkgKyAxKSAqIGdyb3VwVG90YWwpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBtb2RlbHMudGVhbU1lbWJlci5nZXRQYWdlKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgdm0uY29sbGVjdGlvbihncm91cENvbGxlY3Rpb24oZGF0YSwgNCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdm06IHZtXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjdGVhbS1tZW1iZXJzLXN0YXRpYy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIF8ubWFwKGN0cmwudm0uY29sbGVjdGlvbigpLCBmdW5jdGlvbihncm91cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGdyb3VwLCBmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy50ZWFtLW1lbWJlci53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL3VzZXJzLycgKyBtZW1iZXIuaWQgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi5iaWcudS1yb3VuZC51LW1hcmdpbmJvdHRvbS0xMFtzcmM9XCInICsgbWVtYmVyLmltZyArICdcIl0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1iYXNlJywgbWVtYmVyLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0Fwb2lvdSAnICsgbWVtYmVyLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cuXywgd2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMuVGVhbVRvdGFsID0gKGZ1bmN0aW9uKG0sIGgsIG1vZGVscykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHZtID0ge1xuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IG0ucHJvcChbXSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIG1vZGVscy50ZWFtVG90YWwuZ2V0Um93KCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgdm0uY29sbGVjdGlvbihkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHZtOiB2bVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3RlYW0tdG90YWwtc3RhdGljLnctc2VjdGlvbi5zZWN0aW9uLW9uZS1jb2x1bW4uc2VjdGlvbi51LW1hcmdpbnRvcC00MC51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgIGN0cmwudm0uY29sbGVjdGlvbigpLm1hcChmdW5jdGlvbih0ZWFtVG90YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS0zMCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSG9qZSBzb21vcyAnICsgdGVhbVRvdGFsLm1lbWJlcl9jb3VudCArICcgcGVzc29hcyBlc3BhbGhhZGFzIHBvciAnICsgdGVhbVRvdGFsLnRvdGFsX2NpdGllcyArICcgY2lkYWRlcyBlbSAnICsgdGVhbVRvdGFsLmNvdW50cmllcy5sZW5ndGggK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyBwYcOtc2VzICgnICsgdGVhbVRvdGFsLmNvdW50cmllcy50b1N0cmluZygpICsgJykhIE8gQ2F0YXJzZSDDqSBpbmRlcGVuZGVudGUsIHNlbSBpbnZlc3RpZG9yZXMsIGRlIGPDs2RpZ28gYWJlcnRvIGUgY29uc3RydcOtZG8gY29tIGFtb3IuIE5vc3NhIHBhaXjDo28gw6kgY29uc3RydWlyIHVtIGFtYmllbnRlIG9uZGUgY2FkYSB2ZXogbWFpcyBwcm9qZXRvcyBwb3NzYW0gZ2FuaGFyIHZpZGEuJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC10aWdodC50ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ05vc3NhIGVxdWlwZSwganVudGEsIGrDoSBhcG9pb3UgUiQnICsgaC5mb3JtYXROdW1iZXIodGVhbVRvdGFsLnRvdGFsX2Ftb3VudCkgKyAnIHBhcmEgJyArIHRlYW1Ub3RhbC50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyArICcgcHJvamV0b3MhJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlRvb2x0aXAgY29tcG9uZW50XG4gKiBBIGNvbXBvbmVudCB0aGF0IGFsbG93cyB5b3UgdG8gc2hvdyBhIHRvb2x0aXAgb25cbiAqIGEgc3BlY2lmaWVkIGVsZW1lbnQgaG92ZXIuIEl0IHJlY2VpdmVzIHRoZSBlbGVtZW50IHlvdSB3YW50XG4gKiB0byB0cmlnZ2VyIHRoZSB0b29sdGlwIGFuZCBhbHNvIHRoZSB0ZXh0IHRvIGRpc3BsYXkgYXMgdG9vbHRpcC5cbiAqXG4gKiBFeGFtcGxlIG9mIHVzZTpcbiAqIHZpZXc6ICgpID0+IHtcbiAqICAgICBsZXQgdG9vbHRpcCA9IChlbCkgPT4ge1xuICogICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuVG9vbHRpcCwge1xuICogICAgICAgICAgICAgIGVsOiBlbCxcbiAqICAgICAgICAgICAgICB0ZXh0OiAndGV4dCB0byB0b29sdGlwJyxcbiAqICAgICAgICAgICAgICB3aWR0aDogMzAwXG4gKiAgICAgICAgICB9KVxuICogICAgIH1cbiAqXG4gKiAgICAgcmV0dXJuIHRvb2x0aXAoJ2EjbGluay13dGgtdG9vbHRpcFtocmVmPVwiI1wiXScpO1xuICpcbiAqIH1cbiAqL1xud2luZG93LmMuVG9vbHRpcCA9ICgobSwgYywgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgcGFyZW50SGVpZ2h0ID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgICAgIHdpZHRoID0gbS5wcm9wKGFyZ3Mud2lkdGggfHwgMjgwKSxcbiAgICAgICAgICAgICAgICB0b3AgPSBtLnByb3AoMCksXG4gICAgICAgICAgICAgICAgbGVmdCA9IG0ucHJvcCgwKSxcbiAgICAgICAgICAgICAgICBvcGFjaXR5ID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldCA9IG0ucHJvcCh7dG9wOiAwLCBsZWZ0OiAwfSksXG4gICAgICAgICAgICAgICAgdG9vbHRpcCA9IGgudG9nZ2xlUHJvcCgwLCAxKSxcbiAgICAgICAgICAgICAgICB0b2dnbGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXAudG9nZ2xlKCk7XG4gICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3Qgc2V0UGFyZW50UG9zaXRpb24gPSAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXQoaC5jdW11bGF0aXZlT2Zmc2V0KGVsKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXRQb3NpdGlvbiA9IChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVsVG9wID0gZWwub2Zmc2V0SGVpZ2h0ICsgZWwub2Zmc2V0UGFyZW50Lm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgKGVsLm9mZnNldFdpZHRoICsgMiAqIHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ0xlZnQpICsgMzApKXsgLy8zMCBoZXJlIGlzIGEgc2FmZSBtYXJnaW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gMzA7IC8vQWRkaW5nIHRoZSBzYWZlIG1hcmdpblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQoLXBhcmVudE9mZnNldCgpLmxlZnQgKyAxNSk7IC8vcG9zaXRpb25pbmcgY2VudGVyIG9mIHdpbmRvdywgY29uc2lkZXJpbmcgbWFyZ2luXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKChwYXJlbnRPZmZzZXQoKS5sZWZ0ICsgKGVsLm9mZnNldFdpZHRoIC8gMikpIDw9IHdpbmRvdy5pbm5lcldpZHRoICYmIChwYXJlbnRPZmZzZXQoKS5sZWZ0IC0gKGVsLm9mZnNldFdpZHRoIC8gMikpID49IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQoLWVsLm9mZnNldFdpZHRoIC8gMik7IC8vUG9zaXRpb25pbmcgdG8gdGhlIGNlbnRlclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICgocGFyZW50T2Zmc2V0KCkubGVmdCArIChlbC5vZmZzZXRXaWR0aCAvIDIpKSA+IHdpbmRvdy5pbm5lcldpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCgtZWwub2Zmc2V0V2lkdGggKyBlbC5vZmZzZXRQYXJlbnQub2Zmc2V0V2lkdGgpOyAvL1Bvc2l0aW9uaW5nIHRvIHRoZSBsZWZ0XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKChwYXJlbnRPZmZzZXQoKS5sZWZ0IC0gKGVsLm9mZnNldFdpZHRoIC8gMikpIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQoLWVsLm9mZnNldFBhcmVudC5vZmZzZXRXaWR0aCk7IC8vUG9zaXRpb25pbmcgdG8gdGhlIHJpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AoLWVsVG9wKTsgLy9TZXR0aW5nIHRvcCBwb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiBvcGFjaXR5LFxuICAgICAgICAgICAgICAgIHRvb2x0aXA6IHRvb2x0aXAsXG4gICAgICAgICAgICAgICAgdG9nZ2xlOiB0b2dnbGUsXG4gICAgICAgICAgICAgICAgc2V0UG9zaXRpb246IHNldFBvc2l0aW9uLFxuICAgICAgICAgICAgICAgIHNldFBhcmVudFBvc2l0aW9uOiBzZXRQYXJlbnRQb3NpdGlvblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCB3aWR0aCA9IGN0cmwud2lkdGgoKTtcbiAgICAgICAgICAgIHJldHVybiBtKGFyZ3MuZWwsIHtcbiAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZSxcbiAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwuc2V0UGFyZW50UG9zaXRpb24sXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJ31cbiAgICAgICAgICAgIH0sIGN0cmwudG9vbHRpcCgpID8gW1xuICAgICAgICAgICAgICAgIG0oYC50b29sdGlwLmRhcmtbc3R5bGU9XCJ3aWR0aDogJHt3aWR0aH1weDsgdG9wOiAke2N0cmwudG9wKCl9cHg7IGxlZnQ6ICR7Y3RybC5sZWZ0KCl9cHg7XCJdYCwge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwuc2V0UG9zaXRpb25cbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIGFyZ3MudGV4dClcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSA6ICcnKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Vc2VyQmFsYW5jZVJlcXVlc3RNb2RhbENvbnRlbnQgY29tcG9uZW50XG4gKiBSZW5kZXIgdGhlIGN1cnJlbnQgdXNlciBiYW5rIGFjY291bnQgdG8gY29uZmlybSBmdW5kIHJlcXVlc3RcbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5Vc2VyQmFsYW5jZVJlcXVlc3RNb2RlbENvbnRlbnQsIHtcbiAqICAgICBiYWxhbmNlOiB7dXNlcl9pZDogMTIzLCBhbW91bnQ6IDEyM30gLy8gdXNlckJhbGFuY2Ugc3RydWN0XG4gKiB9KVxuICovXG53aW5kb3cuYy5Vc2VyQmFsYW5jZVJlcXVlc3RNb2RhbENvbnRlbnQgPSAoKG0sIGgsIF8sIG1vZGVscywgSTE4bikgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3VzZXJzLmJhbGFuY2UnKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7dXNlcl9pZDogJ2VxJ30pLFxuICAgICAgICAgICAgICAgICAgYmFsYW5jZSA9IGFyZ3MuYmFsYW5jZSxcbiAgICAgICAgICAgICAgICAgIGxvYWRlck9wdHMgPSBtb2RlbHMuYmFsYW5jZVRyYW5zZmVyLnBvc3RPcHRpb25zKHtcbiAgICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiBiYWxhbmNlLnVzZXJfaWR9KSxcbiAgICAgICAgICAgICAgICAgIHJlcXVlc3RMb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obG9hZGVyT3B0cyksXG4gICAgICAgICAgICAgICAgICBkaXNwbGF5RG9uZSA9IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgICByZXF1ZXN0RnVuZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0TG9hZGVyLmxvYWQoKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MuYmFsYW5jZU1hbmFnZXIubG9hZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBhcmdzLmJhbGFuY2VUcmFuc2FjdGlvbk1hbmFnZXIubG9hZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5RG9uZS50b2dnbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGFyZ3MuYmFua0FjY291bnRNYW5hZ2VyLmxvYWQoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0TG9hZGVyOiByZXF1ZXN0TG9hZGVyLFxuICAgICAgICAgICAgICAgIHJlcXVlc3RGdW5kOiByZXF1ZXN0RnVuZCxcbiAgICAgICAgICAgICAgICBiYW5rQWNjb3VudHM6IGFyZ3MuYmFua0FjY291bnRNYW5hZ2VyLmNvbGxlY3Rpb24sXG4gICAgICAgICAgICAgICAgZGlzcGxheURvbmU6IGRpc3BsYXlEb25lLFxuICAgICAgICAgICAgICAgIGxvYWRCYW5rQTogYXJncy5iYW5rQWNjb3VudE1hbmFnZXIubG9hZGVyXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IGJhbGFuY2UgPSBhcmdzLmJhbGFuY2U7XG5cbiAgICAgICAgICAgIHJldHVybiAoY3RybC5sb2FkQmFua0EoKSA/IGgubG9hZGVyKCkgOiBtKCdkaXYnLCBfLm1hcChjdHJsLmJhbmtBY2NvdW50cygpLCAoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5tb2RhbC1kaWFsb2ctaGVhZGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCBJMThuLnQoJ3dpdGhkcmF3JywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgKGN0cmwuZGlzcGxheURvbmUoKSA/IG0oJy5tb2RhbC1kaWFsb2ctY29udGVudC51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZhLmZhLWNoZWNrLWNpcmNsZS5mYS01eC50ZXh0LXN1Y2Nlc3MudS1tYXJnaW5ib3R0b20tNDAnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtbGFyZ2UnLCBJMThuLnQoJ3N1Y2Vzc19tZXNzYWdlJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICBdKSA6IG0oJy5tb2RhbC1kaWFsb2ctY29udGVudCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsICdWYWxvcjonKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCcmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLnRleHQtc3VjY2VzcycsIGBSJCAke2guZm9ybWF0TnVtYmVyKGJhbGFuY2UuYW1vdW50LCAyLCAzKX1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuJywge3N0eWxlOiB7J2ZvbnQtd2VpZ2h0JzogJyA2MDAnfX0sIEkxOG4udCgnYmFuay5hY2NvdW50JywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRjb2xvci1zZWNvbmRhcnknLCBJMThuLnQoJ2JhbmsubmFtZScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJyZuYnNwOycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLm93bmVyX25hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgnYmFuay5jcGZfY25waicsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJyZuYnNwOycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLm93bmVyX2RvY3VtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRjb2xvci1zZWNvbmRhcnknLCBJMThuLnQoJ2JhbmsuYmFua19uYW1lJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnJm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uYmFua19uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRjb2xvci1zZWNvbmRhcnknLCBJMThuLnQoJ2JhbmsuYWdlbmN5JywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnJm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2l0ZW0uYWdlbmN5fS0ke2l0ZW0uYWdlbmN5X2RpZ2l0fWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgnYmFuay5hY2NvdW50JywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnJm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2l0ZW0uYWNjb3VudH0tJHtpdGVtLmFjY291bnRfZGlnaXR9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgXSkpLFxuICAgICAgICAgICAgICAgICAgICAoIWN0cmwuZGlzcGxheURvbmUoKSA/XG4gICAgICAgICAgICAgICAgICAgICBtKCcubW9kYWwtZGlhbG9nLW5hdi1ib3R0b20nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjdHJsLnJlcXVlc3RMb2FkZXIoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaC5sb2FkZXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogbSgnYS5idG4uYnRuLWxhcmdlLmJ0bi1yZXF1ZXN0LWZ1bmRbaHJlZj1cImpzOnZvaWQoMCk7XCJdJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge29uY2xpY2s6IGN0cmwucmVxdWVzdEZ1bmR9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnU29saWNpdGFyIHNhcXVlJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH0pKSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Ll8sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LkkxOG4pKTtcbiIsIndpbmRvdy5jLlVzZXJCYWxhbmNlVHJhbnNhY3Rpb25Sb3cgPSAoKG0sIGgpID0+IHtcbiAgICBjb25zdCBJMThuU2NvcGUgPSBfLnBhcnRpYWwoaC5pMThuU2NvcGUsICd1c2Vycy5iYWxhbmNlJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXhwYW5kZWQgPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICBpZiAoYXJncy5pbmRleCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgZXhwYW5kZWQudG9nZ2xlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXhwYW5kZWQ6IGV4cGFuZGVkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaXRlbSA9IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdCA9IGgubW9tZW50RnJvbVN0cmluZyhpdGVtLmNyZWF0ZWRfYXQsICdZWVlZLU1NLUREJyk7XG5cbiAgICAgICAgICAgIHJldHVybiBtKGBkaXZbY2xhc3M9J2JhbGFuY2UtY2FyZCAkeyhjdHJsLmV4cGFuZGVkKCkgPyAnY2FyZC1kZXRhaWxlZC1vcGVuJyA6ICcnKX0nXWAsXG4gICAgICAgICAgICAgICAgICAgICBtKCcudy1jbGVhcmZpeC5jYXJkLmNhcmQtY2xpY2thYmxlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtdGlueS0yJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmxpbmVoZWlnaHQtdGlnaHRlc3QnLCBjcmVhdGVkQXQuZm9ybWF0KCdEIE1NTScpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3ItdGVyY2lhcnknLCBjcmVhdGVkQXQuZm9ybWF0KCdZWVlZJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAudy1jb2wtdGlueS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1zbWFsbGVyLmZvbnRjb2xvci1zZWNvbmRhcnknLCBJMThuLnQoJ2RlYml0JywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJyZuYnNwOycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1iYXNlLnRleHQtZXJyb3InLCBgUiQgJHtoLmZvcm1hdE51bWJlcihNYXRoLmFicyhpdGVtLmRlYml0KSwgMiwgMyl9YClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1zbWFsbGVyLmZvbnRjb2xvci1zZWNvbmRhcnknLCBJMThuLnQoJ2NyZWRpdCcsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCcmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHNpemUtYmFzZS50ZXh0LXN1Y2Nlc3MnLCBgUiQgJHtoLmZvcm1hdE51bWJlcihpdGVtLmNyZWRpdCwgMiwgMyl9YClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1zbWFsbGVyLmZvbnRjb2xvci1zZWNvbmRhcnknLCBJMThuLnQoJ3RvdGFscycsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCcmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHNpemUtYmFzZScsIGBSJCAke2guZm9ybWF0TnVtYmVyKGl0ZW0udG90YWxfYW1vdW50LCAyLCAzKX1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGEudy1pbmxpbmUtYmxvY2suYXJyb3ctYWRtaW4uJHsoY3RybC5leHBhbmRlZCgpID8gJ2Fycm93LWFkbWluLW9wZW5lZCcgOiAnJyl9LmZhLmZhLWNoZXZyb24tZG93bi5mb250Y29sb3Itc2Vjb25kYXJ5W2hyZWY9XCJqczoodm9pZCgwKSk7XCJdYCwge29uY2xpY2s6IGN0cmwuZXhwYW5kZWQudG9nZ2xlfSlcbiAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgKGN0cmwuZXhwYW5kZWQoKSA/IG0oJy5jYXJkJywgXy5tYXAoaXRlbS5zb3VyY2UsICh0cmFuc2FjdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwb3MgPSB0cmFuc2FjdGlvbi5hbW91bnQgPj0gMDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCdkaXYnLFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LmZvbnRzaXplLXNtYWxsLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgLnRleHQtJHsocG9zID8gJ3N1Y2Nlc3MnIDogJ2Vycm9yJyl9YCwgYCR7cG9zID8gJysnIDogJy0nfSBSJCAke2guZm9ybWF0TnVtYmVyKE1hdGguYWJzKHRyYW5zYWN0aW9uLmFtb3VudCksIDIsIDMpfWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBgJHt0cmFuc2FjdGlvbi5ldmVudF9uYW1lfSAke3RyYW5zYWN0aW9uLm9yaWdpbl9vYmplY3QubmFtZX1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2luYm90dG9tLTEwJylcbiAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgIH0pKSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlVzZXJCYWxhbmNlVHJhbnNhY3Rpb25zID0gKChtLCBoLCBtb2RlbHMsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgYXJncy5iYWxhbmNlVHJhbnNhY3Rpb25NYW5hZ2VyLmxvYWQoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBsaXN0OiBhcmdzLmJhbGFuY2VUcmFuc2FjdGlvbk1hbmFnZXIubGlzdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBjdHJsLmxpc3Q7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1zZWN0aW9uLnNlY3Rpb24uY2FyZC10ZXJjaWFyeS5iZWZvcmUtZm9vdGVyLmJhbGFuY2UtdHJhbnNhY3Rpb25zLWFyZWEnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgXy5tYXAobGlzdC5jb2xsZWN0aW9uKCksIChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBjLlVzZXJCYWxhbmNlVHJhbnNhY3Rpb25Sb3csIHtpdGVtOiBpdGVtLCBpbmRleDogaW5kZXh9KTtcbiAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgbSgnLmNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2ludG9wLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtcHVzaC01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICFsaXN0LmlzTG9hZGluZygpID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LmlzTGFzdFBhZ2UoKSA/ICcnIDogbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBsaXN0Lm5leHRQYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdDYXJyZWdhciBtYWlzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5fKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlVzZXJCYWxhbmNlIGNvbXBvbmVudFxuICogUmVuZGVyIHRoZSBjdXJyZW50IHVzZXIgdG90YWwgYmFsYW5jZSBhbmQgcmVxdWVzdCBmdW5kIGFjdGlvblxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLlVzZXJCYWxhbmNlLCB7XG4gKiAgICAgdXNlcl9pZDogMTIzLFxuICogfSlcbiAqL1xud2luZG93LmMuVXNlckJhbGFuY2UgPSAoKG0sIGgsIF8sIG1vZGVscywgYykgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3VzZXJzLmJhbGFuY2UnKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgZGlzcGxheU1vZGFsID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKTtcblxuICAgICAgICAgICAgYXJncy5iYWxhbmNlTWFuYWdlci5sb2FkKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXNlckJhbGFuY2VzOiBhcmdzLmJhbGFuY2VNYW5hZ2VyLmNvbGxlY3Rpb24sXG4gICAgICAgICAgICAgICAgZGlzcGxheU1vZGFsOiBkaXNwbGF5TW9kYWxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgYmFsYW5jZSA9IF8uZmlyc3QoY3RybC51c2VyQmFsYW5jZXMoKSksXG4gICAgICAgICAgICAgICAgYmFsYW5jZVJlcXVlc3RNb2RhbEMgPSBbXG4gICAgICAgICAgICAgICAgICAgICdVc2VyQmFsYW5jZVJlcXVlc3RNb2RhbENvbnRlbnQnLFxuICAgICAgICAgICAgICAgICAgICBfLmV4dGVuZCh7fSwge2JhbGFuY2U6IGJhbGFuY2V9LCBhcmdzKVxuICAgICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1zZWN0aW9uLnNlY3Rpb24udXNlci1iYWxhbmNlLXNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgKGN0cmwuZGlzcGxheU1vZGFsKCkgPyBtLmNvbXBvbmVudChjLk1vZGFsQm94LCB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlNb2RhbDogY3RybC5kaXNwbGF5TW9kYWwsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGJhbGFuY2VSZXF1ZXN0TW9kYWxDXG4gICAgICAgICAgICAgICAgfSkgOiAnJyksXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHkudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSTE4bi50KCd0b3RhbHMnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udGV4dC1zdWNjZXNzJywgYFIkICR7aC5mb3JtYXROdW1iZXIoYmFsYW5jZS5hbW91bnQsIDIsIDMpfWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYVtjbGFzcz1cInItZnVuZC1idG4gdy1idXR0b24gYnRuIGJ0bi1tZWRpdW0gdS1tYXJnaW5ib3R0b20tMTAgJHsoYmFsYW5jZS5hbW91bnQgPD0gMCA/ICdidG4taW5hY3RpdmUnIDogJycpfVwiXVtocmVmPVwianM6dm9pZCgwKTtcIl1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge29uY2xpY2s6IChiYWxhbmNlLmFtb3VudCA+IDAgPyBjdHJsLmRpc3BsYXlNb2RhbC50b2dnbGUgOiAnanM6dm9pZCgwKTsnKX0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJMThuLnQoJ3dpdGhkcmF3X2N0YScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5Vc2VyQ2FyZCA9IChmdW5jdGlvbihtLCBfLCBtb2RlbHMsIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgdm0gPSBoLmlkVk0sXG4gICAgICAgICAgICAgICAgdXNlckRldGFpbHMgPSBtLnByb3AoW10pO1xuXG4gICAgICAgICAgICB2bS5pZChhcmdzLnVzZXJJZCk7XG5cbiAgICAgICAgICAgIC8vRklYTUU6IGNhbiBjYWxsIGFub24gcmVxdWVzdHMgd2hlbiB0b2tlbiBmYWlscyAocmVxdWVzdE1heWJlV2l0aFRva2VuKVxuICAgICAgICAgICAgbW9kZWxzLnVzZXJEZXRhaWwuZ2V0Um93V2l0aFRva2VuKHZtLnBhcmFtZXRlcnMoKSkudGhlbih1c2VyRGV0YWlscyk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdXNlckRldGFpbHM6IHVzZXJEZXRhaWxzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3VzZXItY2FyZCcsIF8ubWFwKGN0cmwudXNlckRldGFpbHMoKSwgZnVuY3Rpb24odXNlckRldGFpbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcuY2FyZC5jYXJkLXVzZXIudS1yYWRpdXMudS1tYXJnaW5ib3R0b20tMzBbaXRlbXByb3A9XCJhdXRob3JcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LncuY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLnUtcm91bmRbd2lkdGg9XCIxMDBcIl1baXRlbXByb3A9XCJpbWFnZVwiXVtzcmM9XCInICsgdXNlckRldGFpbC5wcm9maWxlX2ltZ190aHVtYm5haWwgKyAnXCJdJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtc21hbGwtOC53LWNvbC10aW55LTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQubGluZWhlaWdodC10aWdodGVyW2l0ZW1wcm9wPVwibmFtZVwiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiL3VzZXJzLycgKyB1c2VyRGV0YWlsLmlkICsgJ1wiXScsIHVzZXJEZXRhaWwubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXJbaXRlbXByb3A9XCJhZGRyZXNzXCJdJywgdXNlckRldGFpbC5hZGRyZXNzX2NpdHkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIHVzZXJEZXRhaWwudG90YWxfcHVibGlzaGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcyBjcmlhZG9zJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgJ2Fwb2lvdSAnICsgdXNlckRldGFpbC50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyArICcgcHJvamV0b3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1hdXRob3ItY29udGFjdHMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCd1bC53LWxpc3QtdW5zdHlsZWQuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICghXy5pc0VtcHR5KHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluaykgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiJyArIHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBGYWNlYm9vaycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksICghXy5pc0VtcHR5KHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSkgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiaHR0cHM6Ly90d2l0dGVyLmNvbS8nICsgdXNlckRldGFpbC50d2l0dGVyX3VzZXJuYW1lICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnUGVyZmlsIG5vIFR3aXR0ZXInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKHVzZXJEZXRhaWwubGlua3MsIGZ1bmN0aW9uKGxpbmspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiJyArIGxpbmsgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsIGxpbmspXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksICghXy5pc0VtcHR5KHVzZXJEZXRhaWwuZW1haWwpID8gbSgnYS5idG4uYnRuLW1lZGl1bS5idG4tbWVzc2FnZVtocmVmPVwibWFpbHRvOicgKyB1c2VyRGV0YWlsLmVtYWlsICsgJ1wiXVtpdGVtcHJvcD1cImVtYWlsXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnZpYXIgbWVuc2FnZW0nKSA6ICcnKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMueW91dHViZUxpZ2h0Ym94IGNvbXBvbmVudFxuICogQSB2aXN1YWwgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgYSBsaWdodGJveCB3aXRoIGEgeW91dHViZSB2aWRlb1xuICpcbiAqIEV4YW1wbGU6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgIC4uLlxuICogICAgICBtLmNvbXBvbmVudChjLnlvdXR1YmVMaWdodGJveCwge3NyYzogJ2h0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9RmxGVGNEU0tuTE0nfSlcbiAqICAgICAgLi4uXG4gKiAgfVxuICovXG53aW5kb3cuYy5Zb3V0dWJlTGlnaHRib3ggPSAoKG0sIGMsIGgsIG1vZGVscykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgcGxheWVyO1xuICAgICAgICAgICAgY29uc3Qgc2hvd0xpZ2h0Ym94ID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKSxcbiAgICAgICAgICAgICAgICBzZXRZb3V0dWJlID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RTY3JpcHRUYWcgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWcuc3JjID0gJ2h0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2lmcmFtZV9hcGknO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RTY3JpcHRUYWcucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGFnLCBmaXJzdFNjcmlwdFRhZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cub25Zb3VUdWJlSWZyYW1lQVBJUmVhZHkgPSBjcmVhdGVQbGF5ZXI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNsb3NlVmlkZW8gPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChwbGF5ZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXIucGF1c2VWaWRlbygpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc2hvd0xpZ2h0Ym94LnRvZ2dsZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNyZWF0ZVBsYXllciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyID0gbmV3IFlULlBsYXllcigneXR2aWRlbycsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzUyOCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzk0MCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWRlb0lkOiBhcmdzLnNyYyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllclZhcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93SW5mbzogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2Rlc3RCcmFuZGluZzogMFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdvblN0YXRlQ2hhbmdlJzogKHN0YXRlKSA9PiAoc3RhdGUuZGF0YSA9PT0gMCkgPyBjbG9zZVZpZGVvKCkgOiBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNob3dMaWdodGJveDogc2hvd0xpZ2h0Ym94LFxuICAgICAgICAgICAgICAgIHNldFlvdXR1YmU6IHNldFlvdXR1YmUsXG4gICAgICAgICAgICAgICAgY2xvc2VWaWRlbzogY2xvc2VWaWRlb1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjeW91dHViZS1saWdodGJveCcsIFtcbiAgICAgICAgICAgICAgICBtKCdhI3lvdXR1YmUtcGxheS53LWxpZ2h0Ym94LnctaW5saW5lLWJsb2NrLmZhLmZhLXBsYXktY2lyY2xlLmZvbnRjb2xvci1uZWdhdGl2ZS5mYS01eFtocmVmPVxcJ2phdmFzY3JpcHQ6dm9pZCgwKTtcXCddJywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnNob3dMaWdodGJveC50b2dnbGVcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtKGAjbGlnaHRib3gudy1saWdodGJveC1iYWNrZHJvcFtzdHlsZT1cImRpc3BsYXk6JHtjdHJsLnNob3dMaWdodGJveCgpID8gJ2Jsb2NrJyA6ICdub25lJ31cIl1gLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWxpZ2h0Ym94LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWxpZ2h0Ym94LWNvbnRlbnQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctbGlnaHRib3gtdmlldycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctbGlnaHRib3gtZnJhbWUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdmaWd1cmUudy1saWdodGJveC1maWd1cmUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnctbGlnaHRib3gtaW1nLnctbGlnaHRib3gtaW1hZ2Vbc3JjPVxcJ2RhdGE6aW1hZ2Uvc3ZnK3htbDtjaGFyc2V0PXV0Zi04LCUzQ3N2ZyUyMHhtbG5zPSUyMmh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJTIyJTIwd2lkdGg9JTIyOTQwJTIyJTIwaGVpZ2h0PSUyMjUyOCUyMi8lM0VcXCddJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI3l0dmlkZW8uZW1iZWRseS1lbWJlZC53LWxpZ2h0Ym94LWVtYmVkJywge2NvbmZpZzogY3RybC5zZXRZb3V0dWJlfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctbGlnaHRib3gtc3Bpbm5lci53LWxpZ2h0Ym94LWhpZGUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1jb250cm9sLnctbGlnaHRib3gtbGVmdC53LWxpZ2h0Ym94LWluYWN0aXZlJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctbGlnaHRib3gtY29udHJvbC53LWxpZ2h0Ym94LXJpZ2h0LnctbGlnaHRib3gtaW5hY3RpdmUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjeW91dHViZS1jbG9zZS53LWxpZ2h0Ym94LWNvbnRyb2wudy1saWdodGJveC1jbG9zZScsIHtvbmNsaWNrOiBjdHJsLmNsb3NlVmlkZW99KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1zdHJpcCcpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLmFkbWluLkNvbnRyaWJ1dGlvbnMgPSAoZnVuY3Rpb24obSwgYywgaCkge1xuICAgIHZhciBhZG1pbiA9IGMuYWRtaW47XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbGlzdFZNID0gYWRtaW4uY29udHJpYnV0aW9uTGlzdFZNLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNID0gYWRtaW4uY29udHJpYnV0aW9uRmlsdGVyVk0sXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoJycpLFxuICAgICAgICAgICAgICAgIGZpbHRlckJ1aWxkZXIgPSBbeyAvL2Z1bGxfdGV4dF9pbmRleFxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJNYWluJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmZ1bGxfdGV4dF9pbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnQnVzcXVlIHBvciBwcm9qZXRvLCBlbWFpbCwgSWRzIGRvIHVzdcOhcmlvIGUgZG8gYXBvaW8uLi4nXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB7IC8vc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyRHJvcGRvd24nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0NvbSBvIGVzdGFkbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc3RhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLnN0YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnUXVhbHF1ZXIgdW0nXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdwYWlkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdwYWlkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncmVmdXNlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAncmVmdXNlZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3BlbmRpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ3BlbmRpbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdwZW5kaW5nX3JlZnVuZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAncGVuZGluZ19yZWZ1bmQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdyZWZ1bmRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAncmVmdW5kZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdjaGFyZ2ViYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdjaGFyZ2ViYWNrJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnZGVsZXRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnZGVsZXRlZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB7IC8vZ2F0ZXdheVxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEcm9wZG93bicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnZ2F0ZXdheScsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZ2F0ZXdheScsXG4gICAgICAgICAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uZ2F0ZXdheSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ1F1YWxxdWVyIHVtJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnUGFnYXJtZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnUGFnYXJtZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ01vSVAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ01vSVAnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdQYXlQYWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ1BheVBhbCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ0NyZWRpdHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ0Nyw6lkaXRvcydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB7IC8vdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyTnVtYmVyUmFuZ2UnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1ZhbG9yZXMgZW50cmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3Q6IGZpbHRlclZNLnZhbHVlLmd0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Q6IGZpbHRlclZNLnZhbHVlLmx0ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgeyAvL2NyZWF0ZWRfYXRcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyRGF0ZVJhbmdlJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdQZXLDrW9kbyBkbyBhcG9pbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdDogZmlsdGVyVk0uY3JlYXRlZF9hdC5ndGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0OiBmaWx0ZXJWTS5jcmVhdGVkX2F0Lmx0ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpLnRoZW4obnVsbCwgZnVuY3Rpb24oc2VydmVyRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKHNlcnZlckVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZmlsdGVyVk06IGZpbHRlclZNLFxuICAgICAgICAgICAgICAgIGZpbHRlckJ1aWxkZXI6IGZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgbGlzdFZNOiB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3Q6IGxpc3RWTSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQXBvaW9zJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VibWl0OiBzdWJtaXRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluRmlsdGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm06IGN0cmwuZmlsdGVyVk0uZm9ybURlc2NyaWJlcixcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlcjogY3RybC5maWx0ZXJCdWlsZGVyLFxuICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbkxpc3QsIHtcbiAgICAgICAgICAgICAgICAgICAgdm06IGN0cmwubGlzdFZNLFxuICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbTogYy5BZG1pbkNvbnRyaWJ1dGlvbkl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIGxpc3REZXRhaWw6IGMuQWRtaW5Db250cmlidXRpb25EZXRhaWxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuYWRtaW4uVXNlcnMgPSAoZnVuY3Rpb24obSwgYywgaCkge1xuICAgIHZhciBhZG1pbiA9IGMuYWRtaW47XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbGlzdFZNID0gYWRtaW4udXNlckxpc3RWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTSA9IGFkbWluLnVzZXJGaWx0ZXJWTSxcbiAgICAgICAgICAgICAgICBlcnJvciA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgICAgICAgaXRlbUJ1aWxkZXIgPSBbe1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pblVzZXInLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyID0gW3sgLy9uYW1lXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uZnVsbF90ZXh0X2luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdCdXNxdWUgcG9yIG5vbWUsIGUtbWFpbCwgSWRzIGRvIHVzdcOhcmlvLi4uJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LCB7IC8vc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlckRyb3Bkb3duJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdDb20gbyBlc3RhZG8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXg6ICdzdGF0dXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2RlYWN0aXZhdGVkX2F0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5kZWFjdGl2YXRlZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ1F1YWxxdWVyIHVtJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ2F0aXZvJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAhbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdkZXNhdGl2YWRvJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgIHN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkudGhlbihudWxsLCBmdW5jdGlvbihzZXJ2ZXJFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3Ioc2VydmVyRXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTTogZmlsdGVyVk0sXG4gICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlcjogZmlsdGVyQnVpbGRlcixcbiAgICAgICAgICAgICAgICBsaXN0Vk06IHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdDogbGlzdFZNLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIGNvbnN0IGxhYmVsID0gJ1VzdcOhcmlvcyc7XG5cbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbkZpbHRlciwge1xuICAgICAgICAgICAgICAgICAgICBmb3JtOiBjdHJsLmZpbHRlclZNLmZvcm1EZXNjcmliZXIsXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlckJ1aWxkZXI6IGN0cmwuZmlsdGVyQnVpbGRlcixcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbkxpc3QsIHtcbiAgICAgICAgICAgICAgICAgICAgdm06IGN0cmwubGlzdFZNLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtOiBjLkFkbWluVXNlckl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIGxpc3REZXRhaWw6IGMuQWRtaW5Vc2VyRGV0YWlsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLnZtcy5wcm9qZWN0RmlsdGVycyA9ICgobSwgaCwgbW9tZW50KSA9PiB7XG4gICAgcmV0dXJuICgpID0+e1xuICAgICAgICBjb25zdCBmaWx0ZXJzID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNLFxuXG4gICAgICAgICAgICAgIG5lYXJNZSA9IGZpbHRlcnMoe1xuICAgICAgICAgICAgICAgICAgbmVhcl9tZTogJ2VxJyxcbiAgICAgICAgICAgICAgICAgIG9wZW5fZm9yX2NvbnRyaWJ1dGlvbnM6ICdlcSdcbiAgICAgICAgICAgICAgfSkub3Blbl9mb3JfY29udHJpYnV0aW9ucygndHJ1ZScpLm5lYXJfbWUodHJ1ZSksXG5cbiAgICAgICAgICAgICAgZXhwaXJpbmcgPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgIGV4cGlyZXNfYXQ6ICdsdGUnLFxuICAgICAgICAgICAgICAgICAgb3Blbl9mb3JfY29udHJpYnV0aW9uczogJ2VxJ1xuICAgICAgICAgICAgICB9KS5vcGVuX2Zvcl9jb250cmlidXRpb25zKCd0cnVlJykuZXhwaXJlc19hdChtb21lbnQoKS5hZGQoMTQsICdkYXlzJykuZm9ybWF0KCdZWVlZLU1NLUREJykpLFxuXG4gICAgICAgICAgICAgIHJlY2VudCA9IGZpbHRlcnMoe1xuICAgICAgICAgICAgICAgICAgb25saW5lX2RhdGU6ICdndGUnLFxuICAgICAgICAgICAgICAgICAgb3Blbl9mb3JfY29udHJpYnV0aW9uczogJ2VxJ1xuICAgICAgICAgICAgICB9KS5vcGVuX2Zvcl9jb250cmlidXRpb25zKCd0cnVlJykub25saW5lX2RhdGUobW9tZW50KCkuc3VidHJhY3QoNSwgJ2RheXMnKS5mb3JtYXQoJ1lZWVktTU0tREQnKSksXG5cbiAgICAgICAgICAgICAgcmVjb21tZW5kZWQgPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgIHJlY29tbWVuZGVkOiAnZXEnLFxuICAgICAgICAgICAgICAgICAgb3Blbl9mb3JfY29udHJpYnV0aW9uczogJ2VxJ1xuICAgICAgICAgICAgICB9KS5yZWNvbW1lbmRlZCgndHJ1ZScpLm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMoJ3RydWUnKSxcblxuICAgICAgICAgICAgICBvbmxpbmUgPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgIG9wZW5fZm9yX2NvbnRyaWJ1dGlvbnM6ICdlcSdcbiAgICAgICAgICAgICAgfSkub3Blbl9mb3JfY29udHJpYnV0aW9ucygndHJ1ZScpLFxuXG4gICAgICAgICAgICAgIHN1Y2Nlc3NmdWwgPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgIHN0YXRlOiAnZXEnXG4gICAgICAgICAgICAgIH0pLnN0YXRlKCdzdWNjZXNzZnVsJyk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlY29tbWVuZGVkOiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdSZWNvbWVuZGFkb3MnLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogcmVjb21tZW5kZWRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbmxpbmU6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ05vIGFyJyxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IG9ubGluZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGV4cGlyaW5nOiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdSZXRhIGZpbmFsJyxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IGV4cGlyaW5nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VjY2Vzc2Z1bDoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnQmVtLXN1Y2VkaWRvcycsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBzdWNjZXNzZnVsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVjZW50OiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdSZWNlbnRlcycsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiByZWNlbnRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBuZWFyX21lOiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdQcsOzeGltb3MgYSBtaW0nLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogbmVhck1lXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5tb21lbnQpKTtcbiIsIndpbmRvdy5jLnZtcy5wcm9qZWN0ID0gKChtLCBoLCBfLCBtb2RlbHMpID0+IHtcbiAgICByZXR1cm4gKHByb2plY3RfaWQsIHByb2plY3RfdXNlcl9pZCkgPT4ge1xuICAgICAgICBjb25zdCB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnXG4gICAgICAgIH0pLFxuICAgICAgICAgICAgICBpZFZNID0gaC5pZFZNLFxuICAgICAgICAgICAgICBwcm9qZWN0RGV0YWlscyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgIHVzZXJEZXRhaWxzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgcmV3YXJkRGV0YWlscyA9IG0ucHJvcChbXSk7XG5cbiAgICAgICAgdm0ucHJvamVjdF9pZChwcm9qZWN0X2lkKTtcbiAgICAgICAgaWRWTS5pZChwcm9qZWN0X3VzZXJfaWQpO1xuXG4gICAgICAgIGNvbnN0IGxQcm9qZWN0ID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKG1vZGVscy5wcm9qZWN0RGV0YWlsLmdldFJvd09wdGlvbnModm0ucGFyYW1ldGVycygpKSksXG4gICAgICAgICAgICAgIGxVc2VyID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKG1vZGVscy51c2VyRGV0YWlsLmdldFJvd09wdGlvbnMoaWRWTS5wYXJhbWV0ZXJzKCkpKSxcbiAgICAgICAgICAgICAgbFJld2FyZCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihtb2RlbHMucmV3YXJkRGV0YWlsLmdldFBhZ2VPcHRpb25zKHZtLnBhcmFtZXRlcnMoKSkpLFxuICAgICAgICAgICAgICBpc0xvYWRpbmcgPSAoKSA9PiB7IHJldHVybiAobFByb2plY3QoKSB8fCBsVXNlcigpIHx8IGxSZXdhcmQoKSk7IH07XG5cbiAgICAgICAgbFByb2plY3QubG9hZCgpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGxVc2VyLmxvYWQoKS50aGVuKHVzZXJEZXRhaWxzKTtcbiAgICAgICAgICAgIGxSZXdhcmQubG9hZCgpLnRoZW4ocmV3YXJkRGV0YWlscyk7XG5cbiAgICAgICAgICAgIHByb2plY3REZXRhaWxzKGRhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcHJvamVjdERldGFpbHM6IF8uY29tcG9zZShfLmZpcnN0LCBwcm9qZWN0RGV0YWlscyksXG4gICAgICAgICAgICB1c2VyRGV0YWlsczogdXNlckRldGFpbHMsXG4gICAgICAgICAgICByZXdhcmREZXRhaWxzOiByZXdhcmREZXRhaWxzLFxuICAgICAgICAgICAgaXNMb2FkaW5nOiBpc0xvYWRpbmdcbiAgICAgICAgfTtcbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Ll8sIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMudm1zLnN0YXJ0ID0gKChfKSA9PiB7XG4gICAgcmV0dXJuIChJMThuKSA9PiB7XG4gICAgICAgIGNvbnN0IGkxOG5TdGFydCA9IEkxOG4udHJhbnNsYXRpb25zW0kxOG4uY3VycmVudExvY2FsZSgpXS5wYWdlcy5zdGFydCxcbiAgICAgICAgICAgIHRlc3RpbW9uaWFscyA9IGkxOG5TdGFydC50ZXN0aW1vbmlhbHMsXG4gICAgICAgICAgICBjYXRlZ29yeVByb2plY3RzID0gaTE4blN0YXJ0LmNhdGVnb3J5UHJvamVjdHMsXG4gICAgICAgICAgICBwYW5lcyA9IGkxOG5TdGFydC5wYW5lcyxcbiAgICAgICAgICAgIHFhID0gaTE4blN0YXJ0LnFhO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0ZXN0aW1vbmlhbHM6IF8ubWFwKHRlc3RpbW9uaWFscywgKHRlc3RpbW9uaWFsKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdGh1bWJVcmw6IHRlc3RpbW9uaWFsLnRodW1iLFxuICAgICAgICAgICAgICAgICAgICBjb250ZW50OiB0ZXN0aW1vbmlhbC5jb250ZW50LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiB0ZXN0aW1vbmlhbC5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB0b3RhbHM6IHRlc3RpbW9uaWFsLnRvdGFsc1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHBhbmVzOiBfLm1hcChwYW5lcywgKHBhbmUpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBsYWJlbDogcGFuZS5sYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgc3JjOiBwYW5lLnNyY1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHF1ZXN0aW9uczoge1xuICAgICAgICAgICAgICAgIGNvbF8xOiBfLm1hcChxYS5jb2xfMSwgKHF1ZXN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogcXVlc3Rpb24ucXVlc3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6IHF1ZXN0aW9uLmFuc3dlclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGNvbF8yOiBfLm1hcChxYS5jb2xfMiwgKHF1ZXN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogcXVlc3Rpb24ucXVlc3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6IHF1ZXN0aW9uLmFuc3dlclxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2F0ZWdvcnlQcm9qZWN0czogXy5tYXAoY2F0ZWdvcnlQcm9qZWN0cywgKGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlJZDogY2F0ZWdvcnkuY2F0ZWdvcnlfaWQsXG4gICAgICAgICAgICAgICAgICAgIHNhbXBsZVByb2plY3RzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeS5zYW1wbGVfcHJvamVjdF9pZHMucHJpbWFyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5LnNhbXBsZV9wcm9qZWN0X2lkcy5zZWNvbmRhcnlcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KVxuICAgICAgICB9O1xuICAgIH07XG59KHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5jb250cmlidXRpb25GaWx0ZXJWTSA9IChmdW5jdGlvbihtLCBoLCByZXBsYWNlRGlhY3JpdGljcykge1xuICAgIHZhciB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICBmdWxsX3RleHRfaW5kZXg6ICdAQCcsXG4gICAgICAgICAgICBzdGF0ZTogJ2VxJyxcbiAgICAgICAgICAgIGdhdGV3YXk6ICdlcScsXG4gICAgICAgICAgICB2YWx1ZTogJ2JldHdlZW4nLFxuICAgICAgICAgICAgY3JlYXRlZF9hdDogJ2JldHdlZW4nXG4gICAgICAgIH0pLFxuXG4gICAgICAgIHBhcmFtVG9TdHJpbmcgPSBmdW5jdGlvbihwKSB7XG4gICAgICAgICAgICByZXR1cm4gKHAgfHwgJycpLnRvU3RyaW5nKCkudHJpbSgpO1xuICAgICAgICB9O1xuXG4gICAgLy8gU2V0IGRlZmF1bHQgdmFsdWVzXG4gICAgdm0uc3RhdGUoJycpO1xuICAgIHZtLmdhdGV3YXkoJycpO1xuICAgIHZtLm9yZGVyKHtcbiAgICAgICAgaWQ6ICdkZXNjJ1xuICAgIH0pO1xuXG4gICAgdm0uY3JlYXRlZF9hdC5sdGUudG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uY3JlYXRlZF9hdC5sdGUoKSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXIgJiYgaC5tb21lbnRGcm9tU3RyaW5nKGZpbHRlcikuZW5kT2YoJ2RheScpLmZvcm1hdCgnJyk7XG4gICAgfTtcblxuICAgIHZtLmNyZWF0ZWRfYXQuZ3RlLnRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmNyZWF0ZWRfYXQuZ3RlKCkpO1xuICAgICAgICByZXR1cm4gZmlsdGVyICYmIGgubW9tZW50RnJvbVN0cmluZyhmaWx0ZXIpLmZvcm1hdCgpO1xuICAgIH07XG5cbiAgICB2bS5mdWxsX3RleHRfaW5kZXgudG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uZnVsbF90ZXh0X2luZGV4KCkpO1xuICAgICAgICByZXR1cm4gZmlsdGVyICYmIHJlcGxhY2VEaWFjcml0aWNzKGZpbHRlcikgfHwgdW5kZWZpbmVkO1xuICAgIH07XG5cbiAgICByZXR1cm4gdm07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cucmVwbGFjZURpYWNyaXRpY3MpKTtcbiIsIndpbmRvdy5jLmFkbWluLmNvbnRyaWJ1dGlvbkxpc3RWTSA9IChmdW5jdGlvbihtLCBtb2RlbHMpIHtcbiAgICByZXR1cm4gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy5jb250cmlidXRpb25EZXRhaWwsICdpZC5kZXNjJywgeydQcmVmZXInOiAnY291bnQ9ZXhhY3QnfSk7XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLmFkbWluLnVzZXJGaWx0ZXJWTSA9IChmdW5jdGlvbihtLCByZXBsYWNlRGlhY3JpdGljcykge1xuICAgIHZhciB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICBmdWxsX3RleHRfaW5kZXg6ICdAQCcsXG4gICAgICAgICAgICBkZWFjdGl2YXRlZF9hdDogJ2lzLm51bGwnXG4gICAgICAgIH0pLFxuXG4gICAgICAgIHBhcmFtVG9TdHJpbmcgPSBmdW5jdGlvbihwKSB7XG4gICAgICAgICAgICByZXR1cm4gKHAgfHwgJycpLnRvU3RyaW5nKCkudHJpbSgpO1xuICAgICAgICB9O1xuXG4gICAgLy8gU2V0IGRlZmF1bHQgdmFsdWVzXG4gICAgdm0uZGVhY3RpdmF0ZWRfYXQobnVsbCkub3JkZXIoe1xuICAgICAgICBpZDogJ2Rlc2MnXG4gICAgfSk7XG5cbiAgICB2bS5kZWFjdGl2YXRlZF9hdC50b0ZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZmlsdGVyID0gSlNPTi5wYXJzZSh2bS5kZWFjdGl2YXRlZF9hdCgpKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICB9O1xuXG4gICAgdm0uZnVsbF90ZXh0X2luZGV4LnRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmZ1bGxfdGV4dF9pbmRleCgpKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlciAmJiByZXBsYWNlRGlhY3JpdGljcyhmaWx0ZXIpIHx8IHVuZGVmaW5lZDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHZtO1xufSh3aW5kb3cubSwgd2luZG93LnJlcGxhY2VEaWFjcml0aWNzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi51c2VyTGlzdFZNID0gKGZ1bmN0aW9uKG0sIG1vZGVscykge1xuICAgIHJldHVybiBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0obW9kZWxzLnVzZXIsICdpZC5kZXNjJywgeydQcmVmZXInOiAnY291bnQ9ZXhhY3QnfSk7XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
