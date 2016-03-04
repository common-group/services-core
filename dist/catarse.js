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
        scrollTo: scrollTo
    };
})(window.m, window.moment, window.I18n);
'use strict';

window.c.models = (function (m) {
    var contributionDetail = m.postgrest.model('contribution_details'),
        contributionActivity = m.postgrest.model('contribution_activities'),
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
    contributionActivity.pageSize(40);

    return {
        contributionDetail: contributionDetail,
        contributionActivity: contributionActivity,
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
            return [m('.w-section.hero-full.hero-zelo', [m('.w-container.u-text-center', [m('img.logo-flex-home[src=\'/assets/logo-flex.png\'][width=\'359\']'), m('.w-row', [m('.w-col.fontsize-large.u-marginbottom-60.w-col-push-2.w-col-8', 'Vamos construir uma nova modalidade de crowdfunding! Inscreva seu email e saiba como inscrever o seu projeto no flex!')]), m('.w-row', [m('.w-col.w-col-2'), m.component(c.landingSignup, {
                builder: ctrl.builder
            }), m('.w-col.w-col-2')])])]), [m('.section', [m('.w-container', [m('.fontsize-largest.u-margintop-40.u-text-center', 'Pra quem será?'), m('.fontsize-base.u-text-center.u-marginbottom-60', 'Iniciaremos a fase de testes com categorias de projetos específicas'), m('div', [m('.w-row.u-marginbottom-60', [m('.w-col.w-col-6', [m('.u-text-center.u-marginbottom-20', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e393a01b66e250aca67cb_icon-zelo-com.png\'][width=\'210\']'), m('.fontsize-largest.lineheight-loose', 'Causas')]), m('p.fontsize-base', 'Flexibilidade para causas de impacto! Estaremos abertos a campanhas de organizações ou pessoas físicas para arrecadação de recursos para causas pessoais, projetos assistenciais, saúde, ajudas humanitárias, proteção aos animais, empreendedorismo socioambiental, ativismo ou qualquer coisa que una as pessoas para fazer o bem.')]), m('.w-col.w-col-6', [m('.u-text-center.u-marginbottom-20', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e3929a0daea230a5f12cd_icon-zelo-pessoal.png\'][width=\'210\']'), m('.fontsize-largest.lineheight-loose', 'Vaquinhas')]), m('p.fontsize-base', 'Campanhas simples que precisam de flexibilidade para arrecadar dinheiro com pessoas próximas. Estaremos abertos a uma variedade de campanhas pessoais que podem ir desde cobrir custos de estudos a ajudar quem precisa de tratamento médico. De juntar a grana para fazer aquela festa a comprar presentes para alguém com a ajuda da galera. ')])])])])]), m('.w-section.section.bg-greenlime.fontcolor-negative', [m('.w-container', [m('.fontsize-largest.u-margintop-40.u-marginbottom-60.u-text-center', 'Como funcionará?'), m('.w-row.u-marginbottom-40', [m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39c578b284493e2a428a_zelo-money.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Fique com quanto arrecadar'), m('p.u-text-center.fontsize-base', 'O flex é para impulsionar campanhas onde todo dinheiro é bem vindo! Você fica com tudo que conseguir arrecadar.')]), m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39d37c013d4a3ee687d2_icon-reward.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Não precisa de recompensas'), m('p.u-text-center.fontsize-base', 'No flex oferecer recompensas é opcional. Você escolhe se oferecê-las faz sentido para o seu projeto e campanha.')])]), m('.w-row.u-marginbottom-40', [m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39fb01b66e250aca67e3_icon-curad.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Você mesmo publica seu projeto'), m('p.u-text-center.fontsize-base', 'Todos os projetos inscritos no flex entram no ar. Agilidade e facilidade para você captar recursos através da internet.')]), m('.w-col.w-col-6', [m('.u-text-center', [m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39e77c013d4a3ee687d4_icon-time.png\'][width=\'180\']')]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Encerre a campanha quando quiser'), m('p.u-text-center.fontsize-base', 'Não há limite de tempo de captação. Você escolhe  quando encerrar sua campanha e receber os valores arrecadados.')])])])]), m('.w-section.section', [m('.w-container', [m('.w-editable.fontsize-larger.u-margintop-40.u-margin-bottom-40.u-text-center', 'Conheça alguns dos primeiros projetos flex'), ctrl.projectsLoader() ? h.loader() : m.component(c.ProjectRow, { collection: ctrl.projects, ref: 'ctrse_flex', wrapper: '.w-row.u-margintop-40' })])]), m('.w-section.divider'), m('.w-section.section', [m('.w-container', [m('.fontsize-larger.u-text-center.u-marginbottom-60.u-margintop-40', 'Dúvidas'), m('.w-row.u-marginbottom-60', [m('.w-col.w-col-6', [m.component(c.landingQA, {
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
                answer: 'Sim. Ainda estamos em teste, mas você já é super bem vindo! Inscreva seu email e saiba como inscrever o seu projeto no flex!'
            }), m.component(c.landingQA, {
                question: 'Por quê vocês querem fazer o Catarse flex?',
                answer: 'Acreditamos que o ambiente do crowdfunding brasileiro ainda tem espaço para muitas ações, testes e experimentações para entender de fato o que as pessoas precisam. Sonhamos com tornar o financiamento coletivo um hábito no Brasil. O Catarse flex é mais um passo nessa direção.'
            }), m.component(c.landingQA, {
                question: 'Quando vocês irão lançar o Catarse flex?',
                answer: 'Ainda não sabemos quando abriremos o flex para o público. Iremos primeiramente passar por um período de testes e depois estabelecer uma data de lançamento. Se você deseja acompanhar e receber notícias sobre essa caminhada, inscreva seu email nessa página.'
            })])])])]), m('.w-section.section-large.u-text-center.bg-purple', [m('.w-container.fontcolor-negative', [m('.fontsize-largest', 'Inscreva seu projeto!'), m('.fontsize-base.u-marginbottom-60', 'Inscreva seu email e saiba como inscrever o seu projeto no flex!'), m('.w-row', [m('.w-col.w-col-2'), m.component(c.landingSignup, {
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
                    var re = /(ctrse_[\w]*)/,
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
            }) : '', m('.w-container', [m('.w-row.u-marginbottom-40', [m('.w-col.w-col-2'), m('.w-col.w-col-8.dashboard-header.u-text-center', [m('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10', I18n.t('campaign_title', I18nScope())), m.component(c.AdminProjectDetailsCard, {
                resource: project
            }), m('p.' + project.state + '-project-text.fontsize-small.lineheight-loose', [project.mode === 'flex' && _.isNull(project.expires_at) && project.state !== 'draft' ? m('span', [I18n.t('finish_explanation', I18nScope()), m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/206507863-Catarse-flex-Principais-perguntas-e-respostas-"][target="_blank"]', I18n.t('know_more', I18nScope()))]) : m.trust(I18n.t('campaign.' + project.mode + '.' + project.state, I18nScope({ username: project.user.name, expires_at: h.momentify(project.zone_expires_at), sent_to_analysis_at: h.momentify(project.sent_to_analysis_at) })))])]), m('.w-col.w-col-2')])]), project.is_published ? [m('.divider'), m('.w-section.section-one-column.section.bg-gray.before-footer', [m('.w-container', [m('.w-row', [m('.w-col.w-col-12.u-text-center', {
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
            return [m('.w-section.hero-search', [m.component(c.Search), m('.w-container.u-marginbottom-10', [m('.u-text-center.u-marginbottom-40', [m('a#explore-open.link-hidden-white.fontweight-light.fontsize-larger[href="javascript:void(0);"]', { onclick: function onclick() {
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

window.c.root.ProjectsHome = (function (m, c, moment, h, _, I18n) {
    var I18nScope = _.partial(h.i18nScope, 'projects.home');

    return {
        controller: function controller() {
            var sample6 = _.partial(_.sample, _, 6),
                loader = m.postgrest.loader,
                project = c.models.project,
                filters = c.vms.projectFilters(),
                vm = c.vms.home();

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
                collections: collections,
                slidesContent: vm.banners
            };
        },

        view: function view(ctrl) {
            var slides = function slides() {
                return _.map(ctrl.slidesContent, function (slide) {
                    var customStyle = 'background-image: url(' + slide.image + ');';
                    var content = m('.w-container.u-text-center', [m('.w-row.u-marginbottom-40', [m('h1.fontcolor-negative.fontsize-megajumbo.u-marginbottom-20', slide.title), m('h2.fontcolor-negative.fontsize-large', m.trust(slide.subtitle))]), m('a.btn.btn-large.u-marginbottom-10.btn-inline', { href: slide.link }, slide.cta)]);

                    return {
                        content: content,
                        customStyle: customStyle
                    };
                });
            };

            return [m.component(c.Slider, {
                slides: slides(),
                effect: 'fade',
                slideClass: 'hero-slide start',
                wrapperClass: 'hero-full hero-full-slide',
                sliderTime: 10000
            }), _.map(ctrl.collections, function (collection) {
                return m.component(c.ProjectRow, {
                    collection: collection,
                    ref: 'home_' + collection.hash
                });
            }), m.component(c.ContributionActivities)];
        }
    };
})(window.m, window.c, window.moment, window.c.h, window._, window.I18n);
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
                    var content = m('.card.u-radius.card-big.card-terciary', [m('.u-text-center.u-marginbottom-20', [m('img.thumb-testimonial.u-round.u-marginbottom-20[src="' + testimonial.thumbUrl + '"]')]), m('p.fontsize-large.u-marginbottom-30', '"' + testimonial.content + '"'), m('.u-text-center', [m('.fontsize-large.fontweight-semibold', testimonial.name), m('.fontsize-base', testimonial.totals)])]);

                    return {
                        content: content
                    };
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
                title: I18n.t('testimonials_title', I18nScope()),
                slideClass: 'slide-testimonials-content',
                wrapperClass: 'slide-testimonials'
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

window.c.ContributionActivities = (function (m, h, models, _) {
    return {
        controller: function controller(args) {
            var interval = undefined;
            var collection = m.prop([]),
                resource = m.prop(),
                collectionIndex = m.prop(0),
                collectionSize = m.prop(),
                collectionL = m.postgrest.loader(models.contributionActivity.getPageOptions()),
                nextResource = function nextResource() {
                if (collectionIndex() + 1 > collectionSize()) {
                    collectionIndex(0);
                }

                collectionIndex(collectionIndex() + 1);
                resource(collection()[collectionIndex()]);
                m.redraw();
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
                resource(_.first(data));
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
            if (!ctrl.collectionL() && !_.isUndefined(ctrl.resource()) && (ctrl.collectionSize() || 0) > 0) {
                var resource = ctrl.resource(),
                    elapsed = h.translatedTime(resource.elapsed_time),
                    project_link = 'https://catarse.me/' + resource.permalink + '?ref=ctrse_home_activities';

                return m('.w-section.section.bg-backs-carrosel', { config: ctrl.startConfig }, [m('.w-container.u-text-center.fontcolor-negative', [m('.fontsize-large.u-marginbottom-30', 'há ' + elapsed.total + ' ' + elapsed.unit + '...'), m('.w-clearfix.w-inline-block.u-marginbottom-10', [m('a', { href: project_link }, [m('img.thumb-author.u-round', { src: resource.thumbnail, width: 80 })]), m('img.thumb-author.u-round', { src: 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56d646f7710a7126338b46ff_logo-catarse-back-carrosel.png' }), m('a', { href: project_link }, [m('img.thumb-author.u-round', { src: resource.project_thumbnail, width: 80, style: 'margin-right: 0;' })])]), m('.fontsize-large', resource.name + ' apoiou'), m('.fontsize-larger', [m('a.link-hidden-white', { href: project_link }, resource.project_name)])])]);
            } else {
                return m('div');
            }
        }
    };
})(window.m, window.c.h, window.c.models, window._);
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
                project: args.project,
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
            }), m('.project-blurb', project().headline), m('.u-text-center-small-only.u-marginbottom-30', [!_.isNull(address) ? m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light.u-marginbottom-10[href="/pt/explore?pg_search=' + address.state_acronym + '"]', [m('span.fa.fa-map-marker'), ' ' + address.city + ', ' + address.state_acronym]) : '', m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light[href="/pt/explore#by_category_id/' + project().category_id + '"]', [m('span.fa.fa-tag'), ' ', project().category_name]), m('button#share-box.btn.btn-small.btn-terciary.btn-inline', {
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

        view: function view(ctrl, args) {
            return m('section.section[itemtype="http://schema.org/CreativeWork"]', [m('.w-container', [m('.w-row', args.project() ? ctrl.displayTabContent() : '')])]);
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
            }), m('.w-row', [m('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? list.isLastPage() ? 'Nenhuma novidade.' : m('button#load-more.btn.btn-medium.btn-terciary', {
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
                var contributionUrlWithReward = '/projects/' + project().id + '/contributions/new?reward_id=' + reward.id;

                return m('a[class="' + (h.rewardSouldOut(reward) ? 'card-gone' : 'card-reward ' + (project().open_for_contributions ? 'clickable' : '')) + ' card card-secondary u-marginbottom-10"][href="' + (project().open_for_contributions && !h.rewardSouldOut(reward) ? contributionUrlWithReward : 'js:void(0);') + '"]', [m('.u-marginbottom-20', [m('.fontsize-base.fontweight-semibold', 'Para R$ ' + h.formatNumber(reward.minimum_value) + ' ou mais'), m('.fontsize-smaller.fontweight-semibold', h.pluralize(reward.paid_count, ' apoio', ' apoios')), reward.maximum_contributions > 0 ? [reward.waiting_payment_count > 0 ? m('.maximum_contributions.in_time_to_confirm.clearfix', [m('.pending.fontsize-smallest.fontcolor-secondary', h.pluralize(reward.waiting_payment_count, ' apoio em prazo de confirmação', ' apoios em prazo de confirmação.'))]) : '', h.rewardSouldOut(reward) ? m('.u-margintop-10', [m('span.badge.badge-gone.fontsize-smaller', 'Esgotada')]) : m('.u-margintop-10', [m('span.badge.badge-attention.fontsize-smaller', [m('span.fontweight-bold', 'Limitada'), ' (' + h.rewardRemaning(reward) + ' de ' + reward.maximum_contributions + ' disponíveis)'])])] : '']), m('.fontsize-smaller.u-margintop-20', m.trust(h.simpleFormat(reward.description))), !_.isEmpty(reward.deliver_at) ? m('.fontsize-smaller', [m('b', 'Estimativa de Entrega: '), h.momentify(reward.deliver_at, 'MMM/YYYY')]) : '', project().open_for_contributions && !h.rewardSouldOut(reward) ? m('.project-reward-box-hover', [m('.project-reward-box-select-text.u-text-center', 'Selecione essa recompensa')]) : '']);
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

            return m('#project-sidebar.aside', [m('.project-stats', [m('.project-stats-inner', [m('.project-stats-info', [m('.u-marginbottom-20', [m('#pledged.fontsize-largest.fontweight-semibold.u-text-center-small-only', 'R$ ' + (project().pledged ? h.formatNumber(project().pledged) : '0')), m('.fontsize-small.u-text-center-small-only', [I18n.t('contributors_call', I18nScope()), m('span#contributors.fontweight-semibold', I18n.t('contributors_count', I18nScope({ count: project().total_contributors }))), !project().expires_at && elapsed ? ' em ' + I18n.t('datetime.distance_in_words.x_' + elapsed.unit, { count: elapsed.total }, I18nScope()) : ''])]), m('.meter', [m('#progressBar.meter-fill', {
                style: {
                    width: project().progress + '%'
                }
            })]), m('.w-row.u-margintop-10', [m('.w-col.w-col-5.w-col-small-6.w-col-tiny-6', [m('.fontsize-small.fontweight-semibold.lineheight-tighter', (project().progress ? parseInt(project().progress) : '0') + '%')]), m('.w-col.w-col-7.w-col-small-6.w-col-tiny-6.w-clearfix', [m('.u-right.fontsize-small.lineheight-tighter', remaining && remaining.total ? [m('span.fontweight-semibold', remaining.total), I18n.t('remaining_time.' + remaining.unit, I18nScope({ count: remaining.total }))] : '')])])]), m('.w-row', [m.component(c.ProjectMode, {
                project: project
            })])]), project().open_for_contributions ? m('a#contribute_project_form.btn.btn-large.u-marginbottom-20[href="/projects/' + project().id + '/contributions/new"]', I18n.t('submit', I18nScope())) : '', project().open_for_contributions ? m.component(c.ProjectReminder, {
                project: project,
                type: 'link'
            }) : '', m('div[class="fontsize-smaller u-marginbottom-30 ' + displayCardClass() + '"]', displayStatusText())]), m('.user-c', m.component(c.ProjectUserCard, {
                userDetails: args.userDetails
            }))]);
        }
    };
})(window.m, window.c.h, window.c, window._, window.I18n);
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
 * window.c.Search component
 * Returns a search input
 *
 * Example:
 * m.component(c.Search, {action: '/search', method: 'GET'})
 */

'use strict';

window.c.Search = (function (m) {
    return {
        view: function view(ctrl) {
            var args = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            var action = args.action || '/pt/explore',
                method = args.method || 'GET';

            return m('#search.w-container.w-hidden-main.w-hidden-medium', [m('.w-row', [m('.w-col.w-col-10.u-marginbottom-20', [m('.w-form', [m('form#email-form', { action: action, method: method }, [m('.w-row', [m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [m('input[type="text"][name="pg_search"][placeholder="Busque projetos"]#pg_search_inside.w-input.text-field.negative.prefix')]), m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [m('button.w-inline-block.btn.btn-dark.btn-attached.postfix', [m('img.header-lupa[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/54e44178b2135fce2b6cd235_lupa.png"]')])])])])])])])]);
        }
    };
})(window.m);
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
                    m.redraw();
                }, sliderTime);
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

            return m('.w-slider.' + wrapperClass, {
                config: ctrl.config
            }, [m('.fontsize-larger', args.title), m('.w-slider-mask', [_.map(args.slides, function (slide, idx) {
                var translateValue = (idx - ctrl.selectedSlideIdx()) * ctrl.translationSize(),
                    translateStr = 'translate3d(' + translateValue + 'px, 0, 0)';

                return m('.slide.w-slide.' + slideClass, {
                    style: effectStyle(idx, translateStr) + ' ' + slide.customStyle
                }, [m('.w-container', [m('.w-row', [m('.w-col.w-col-8.w-col-push-2', slide.content)])])]);
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
"use strict";

window.c.vms.home = (function (I18n) {
    return function () {
        var i18nStart = I18n.translations[I18n.currentLocale()].projects.home,
            banners = i18nStart.banners;

        return {
            banners: banners
        };
    };
})(window.I18n);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImMuanMiLCJoLmpzIiwibW9kZWxzLmpzIiwiZmxleC5qcyIsImluc2lnaHRzLmpzIiwiam9icy5qcyIsImxpdmUtc3RhdGlzdGljcy5qcyIsInByb2plY3RzLWRhc2hib2FyZC5qcyIsInByb2plY3RzLWV4cGxvcmUuanMiLCJwcm9qZWN0cy1ob21lLmpzIiwicHJvamVjdHMtc2hvdy5qcyIsInN0YXJ0LmpzIiwidGVhbS5qcyIsInVzZXJzLWJhbGFuY2UuanMiLCJhZG1pbi1jb250cmlidXRpb24tZGV0YWlsLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLWl0ZW0uanMiLCJhZG1pbi1jb250cmlidXRpb24tdXNlci5qcyIsImFkbWluLWNvbnRyaWJ1dGlvbi5qcyIsImFkbWluLWV4dGVybmFsLWFjdGlvbi5qcyIsImFkbWluLWZpbHRlci5qcyIsImFkbWluLWlucHV0LWFjdGlvbi5qcyIsImFkbWluLWl0ZW0uanMiLCJhZG1pbi1saXN0LmpzIiwiYWRtaW4tbm90aWZpY2F0aW9uLWhpc3RvcnkuanMiLCJhZG1pbi1wcm9qZWN0LWRldGFpbHMtY2FyZC5qcyIsImFkbWluLXByb2plY3QuanMiLCJhZG1pbi1yYWRpby1hY3Rpb24uanMiLCJhZG1pbi1yZXNldC1wYXNzd29yZC5qcyIsImFkbWluLXJld2FyZC5qcyIsImFkbWluLXRyYW5zYWN0aW9uLWhpc3RvcnkuanMiLCJhZG1pbi10cmFuc2FjdGlvbi5qcyIsImFkbWluLXVzZXItZGV0YWlsLmpzIiwiYWRtaW4tdXNlci1pdGVtLmpzIiwiYWRtaW4tdXNlci5qcyIsImNhdGVnb3J5LWJ1dHRvbi5qcyIsImNvbnRyaWJ1dGlvbi1hY3Rpdml0aWVzLmpzIiwiZHJvcGRvd24uanMiLCJmaWx0ZXItYnV0dG9uLmpzIiwiZmlsdGVyLWRhdGUtcmFuZ2UuanMiLCJmaWx0ZXItZHJvcGRvd24uanMiLCJmaWx0ZXItbWFpbi5qcyIsImZpbHRlci1udW1iZXItcmFuZ2UuanMiLCJsYW5kaW5nLXFhLmpzIiwibGFuZGluZy1zaWdudXAuanMiLCJtb2RhbC1ib3guanMiLCJwYXltZW50LXN0YXR1cy5qcyIsInBvcC1ub3RpZmljYXRpb24uanMiLCJwcm9qZWN0LWFib3V0LmpzIiwicHJvamVjdC1jYXJkLmpzIiwicHJvamVjdC1jb21tZW50cy5qcyIsInByb2plY3QtY29udHJpYnV0aW9ucy5qcyIsInByb2plY3QtZGFzaGJvYXJkLW1lbnUuanMiLCJwcm9qZWN0LWRhdGEtY2hhcnQuanMiLCJwcm9qZWN0LWRhdGEtdGFibGUuanMiLCJwcm9qZWN0LWhlYWRlci5qcyIsInByb2plY3QtaGlnaGxpZ2h0LmpzIiwicHJvamVjdC1tYWluLmpzIiwicHJvamVjdC1tb2RlLmpzIiwicHJvamVjdC1wb3N0cy5qcyIsInByb2plY3QtcmVtaW5kZXItY291bnQuanMiLCJwcm9qZWN0LXJlbWluZGVyLmpzIiwicHJvamVjdC1yZXdhcmQtbGlzdC5qcyIsInByb2plY3Qtcm93LmpzIiwicHJvamVjdC1zaGFyZS1ib3guanMiLCJwcm9qZWN0LXNpZGViYXIuanMiLCJwcm9qZWN0LXN1Z2dlc3RlZC1jb250cmlidXRpb25zLmpzIiwicHJvamVjdC10YWJzLmpzIiwicHJvamVjdC11c2VyLWNhcmQuanMiLCJzZWFyY2guanMiLCJzbGlkZXIuanMiLCJ0ZWFtLW1lbWJlcnMuanMiLCJ0ZWFtLXRvdGFsLmpzIiwidG9vbHRpcC5qcyIsInVzZXItYmFsYW5jZS1yZXF1ZXN0LW1vZGFsLWNvbnRlbnQuanMiLCJ1c2VyLWJhbGFuY2UtdHJhbnNhY3Rpb24tcm93LmpzIiwidXNlci1iYWxhbmNlLXRyYW5zYWN0aW9ucy5qcyIsInVzZXItYmFsYW5jZS5qcyIsInVzZXItY2FyZC5qcyIsInlvdXR1YmUtbGlnaHRib3guanMiLCJhZG1pbi9jb250cmlidXRpb25zLmpzIiwiYWRtaW4vdXNlcnMuanMiLCJ2bXMvaG9tZS5qcyIsInZtcy9wcm9qZWN0LWZpbHRlcnMuanMiLCJ2bXMvcHJvamVjdC5qcyIsInZtcy9zdGFydC5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMvY29udHJpYnV0aW9uLWZpbHRlci12bS5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMvY29udHJpYnV0aW9uLWxpc3Qtdm0uanMiLCJhZG1pbi91c2Vycy91c2VyLWZpbHRlci12bS5qcyIsImFkbWluL3VzZXJzL3VzZXItbGlzdC12bS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sQ0FBQyxDQUFDLEdBQUksQ0FBQSxZQUFNO0FBQ2QsV0FBTztBQUNILGNBQU0sRUFBRSxFQUFFO0FBQ1YsWUFBSSxFQUFFLEVBQUU7QUFDUixXQUFHLEVBQUUsRUFBRTtBQUNQLGFBQUssRUFBRSxFQUFFO0FBQ1QsU0FBQyxFQUFFLEVBQUU7S0FDUixDQUFDO0NBQ0wsQ0FBQSxFQUFFLEFBQUMsQ0FBQzs7O0FDUkwsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFLOzs7QUFHL0IsUUFBTSxTQUFTLEdBQUcsU0FBWixTQUFTLENBQUksR0FBRyxFQUFLO0FBQUUsZUFBTyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxHQUFHLENBQUM7S0FBRTtRQUMvRCxXQUFXLEdBQUcsU0FBZCxXQUFXLENBQUksSUFBSSxFQUFLO0FBQ3BCLFlBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDO1lBQ2pFLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEdBQUcsVUFBVSxHQUFHLFdBQVcsQ0FBQztZQUN2RCxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUMsZUFBTyxPQUFPLEtBQUssSUFBSSxHQUFHLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQ3JGO1FBQ1AsV0FBVyxHQUFHLFNBQWQsV0FBVyxDQUFJLEdBQUcsRUFBc0I7WUFBcEIsVUFBVSx5REFBRyxFQUFFOztBQUNqQyxlQUFPLEdBQUcsR0FBRyxHQUFHLEdBQUcsVUFBVSxDQUFDO0tBQy9CO1FBQ0ssa0JBQWtCLEdBQUcsU0FBckIsa0JBQWtCLEdBQVM7QUFDdkIsY0FBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7QUFDWix1QkFBVyxFQUFFLGlEQUFpRCxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7U0FDNUUsQ0FBQyxDQUFDO0tBQ1Y7UUFDRCxNQUFNLEdBQUcsU0FBVCxNQUFNLENBQUksQ0FBQyxFQUFLO0FBQ1osZUFBTyxDQUFDLElBQUksSUFBSSxDQUFDO0tBQ3BCO1FBRUQsU0FBUyxHQUFHLFNBQVosU0FBUyxDQUFJLElBQUksRUFBRSxNQUFNLEVBQUs7QUFDMUIsY0FBTSxHQUFHLE1BQU0sSUFBSSxZQUFZLENBQUM7QUFDaEMsZUFBTyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0tBQ3RFO1FBRUQsV0FBVyxHQUFHLFNBQWQsV0FBVyxDQUFJLE1BQU0sRUFBSztBQUN0QixZQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUNqQyxtQkFBTyxjQUFjLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztTQUNqRDtLQUNKO1FBRUQsZ0JBQWdCLEdBQUcsU0FBbkIsZ0JBQWdCLENBQUksTUFBTSxFQUFFLElBQUksRUFBSztBQUNqQyxZQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDaEMsZ0JBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNaLG1CQUFPLGNBQWMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDNUM7S0FDSjtRQUVELE9BQU8sR0FBRyxTQUFWLE9BQU8sQ0FBSSxJQUFJLEVBQUUsVUFBVSxFQUFLO0FBQzVCLFlBQU0sQ0FBQyxHQUFHLFFBQVE7WUFDZCxDQUFDLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNsQyxjQUFNLENBQUMsYUFBYSxHQUFHLFlBQVc7QUFDOUIsZ0JBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztBQUNyQixnQkFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1NBQ3JDLENBQUM7QUFDRixTQUFDLENBQUMsR0FBRyxHQUFHLG1DQUFtQyxDQUFDO0FBQzVDLFNBQUMsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7QUFDOUMsU0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUEsQ0FBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEMsZUFBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDaEI7UUFFRCxnQkFBZ0IsR0FBRyxTQUFuQixnQkFBZ0IsQ0FBSSxJQUFJLEVBQUUsTUFBTSxFQUFLO0FBQ2pDLFlBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxJQUFJLFlBQVksQ0FBQyxDQUFDO0FBQ3RELGVBQU8sUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDdkQ7UUFFRCxtQkFBbUIsR0FBRztBQUNsQixZQUFJLEVBQUUsTUFBTTtBQUNaLGVBQU8sRUFBRSxTQUFTO0FBQ2xCLGFBQUssRUFBRSxPQUFPO0FBQ2QsZUFBTyxFQUFFLFVBQVU7S0FDdEI7OztBQUVELGtCQUFjLEdBQUcsd0JBQUMsSUFBSSxFQUFLO0FBQ3ZCLFlBQU0sY0FBYyxHQUFHLG1CQUFtQjtZQUN0QyxJQUFJLEdBQUcsU0FBUCxJQUFJLEdBQVM7QUFDVCxnQkFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksU0FBUyxDQUFDLENBQUM7O0FBRXhELG1CQUFPLEFBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEdBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUM7U0FDL0QsQ0FBQzs7QUFFTixlQUFPO0FBQ0gsZ0JBQUksRUFBRSxJQUFJLEVBQUU7QUFDWixpQkFBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1NBQ3BCLENBQUM7S0FDTDs7O0FBR0Qsd0JBQW9CLEdBQUcsU0FBdkIsb0JBQW9CLENBQUksQ0FBQyxFQUFFLENBQUMsRUFBSztBQUM3QixlQUFPLFVBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDckIsZ0JBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQ3JCLHVCQUFPLElBQUksQ0FBQzthQUNmOztBQUVELGdCQUFNLEVBQUUsR0FBRyxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQSxBQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQSxBQUFDLEdBQUcsR0FBRztnQkFDckUsR0FBRyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsbUJBQU8sQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBLENBQUUsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQSxBQUFDLENBQUMsQ0FBQztTQUMxRixDQUFDO0tBQ0w7UUFDRCxZQUFZLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztRQUU3QyxVQUFVLEdBQUcsU0FBYixVQUFVLENBQUksWUFBWSxFQUFFLGNBQWMsRUFBSztBQUMzQyxZQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQy9CLFNBQUMsQ0FBQyxNQUFNLEdBQUcsWUFBTTtBQUNiLG1CQUFPLENBQUMsQ0FBRSxBQUFDLENBQUMsRUFBRSxLQUFLLGNBQWMsR0FBSSxZQUFZLEdBQUcsY0FBYyxDQUFFLENBQUM7U0FDeEUsQ0FBQzs7QUFFRixlQUFPLENBQUMsQ0FBQztLQUNaO1FBRUQsSUFBSSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO0FBQ3pCLFVBQUUsRUFBRSxJQUFJO0tBQ1gsQ0FBQztRQUVGLE9BQU8sR0FBRyxTQUFWLE9BQU8sR0FBUztBQUNaLFlBQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUM7WUFDOUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ25ELFlBQUksSUFBSSxFQUFFO0FBQ04sbUJBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMzQixNQUFNO0FBQ0gsbUJBQU8sS0FBSyxDQUFDO1NBQ2hCO0tBQ0o7UUFFRCxtQkFBbUIsR0FBRyxTQUF0QixtQkFBbUIsQ0FBSSxNQUFNLEVBQUs7QUFDOUIsWUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdELGVBQU8sTUFBTSxLQUFLLEdBQUcsQ0FBQztLQUN6QjtRQUVELGtCQUFrQixHQUFHLFNBQXJCLGtCQUFrQixDQUFJLFVBQVUsRUFBSztBQUNqQyxlQUFPLFVBQVUsSUFBSSxvQ0FBb0MsQ0FBQztLQUM3RDs7O0FBR0QsVUFBTSxHQUFHLFNBQVQsTUFBTSxHQUFTO0FBQ1gsZUFBTyxDQUFDLENBQUMsaURBQWlELEVBQUUsQ0FDeEQsQ0FBQyxDQUFDLDRFQUE0RSxDQUFDLENBQ2xGLENBQUMsQ0FBQztLQUNOO1FBRUQsZUFBZSxHQUFHLFNBQWxCLGVBQWUsR0FBUztBQUNwQixlQUFPLENBQUMsQ0FBQyx3Q0FBd0MsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQztLQUM1RjtRQUVELE9BQU8sR0FBRyxTQUFWLE9BQU8sR0FBUztBQUNaLFlBQU0sUUFBUSxHQUFHLFNBQVgsUUFBUSxHQUFTO0FBQ25CLGdCQUFJO0FBQ0Esc0JBQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQzNCLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDUix1QkFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNsQjtTQUNKLENBQUM7O0FBRUYsZUFBTyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztLQUMzQztRQUVELFNBQVMsR0FBRyxTQUFaLFNBQVMsQ0FBSSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUN6QixlQUFRLEtBQUssR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFFO0tBQzlDO1FBRUQsWUFBWSxHQUFHLFNBQWYsWUFBWSxHQUFpQjtZQUFiLEdBQUcseURBQUcsRUFBRTs7QUFDcEIsV0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pDLFlBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDaEIsZUFBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3ZDLGVBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNuQyxlQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUM7U0FDOUI7QUFDRCxlQUFPLEdBQUcsQ0FBQztLQUNkO1FBRUQsY0FBYyxHQUFHLFNBQWpCLGNBQWMsQ0FBSSxNQUFNLEVBQUs7QUFDekIsZUFBUSxNQUFNLENBQUMscUJBQXFCLEdBQUcsQ0FBQyxHQUNuQyxNQUFNLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsSUFBSSxNQUFNLENBQUMscUJBQXFCLEdBQUksS0FBSyxDQUFFO0tBQ25HO1FBRUQsY0FBYyxHQUFHLFNBQWpCLGNBQWMsQ0FBSSxNQUFNLEVBQUs7QUFDekIsZUFBTyxNQUFNLENBQUMscUJBQXFCLElBQUksTUFBTSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMscUJBQXFCLENBQUEsQUFBQyxDQUFDO0tBQzVGO1FBRUQsUUFBUSxHQUFHLFNBQVgsUUFBUSxDQUFJLElBQUksRUFBSztBQUNqQixZQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLFNBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2QsZUFBTyxDQUFDLENBQUM7S0FDWjtRQUVELFFBQVEsR0FBRyxTQUFYLFFBQVEsR0FBUztBQUNiLGVBQU8sVUFBQyxFQUFFLEVBQUUsYUFBYSxFQUFLO0FBQzFCLGdCQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsRUFBRTtBQUNyQixzQkFBTSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNqRDtTQUNKLENBQUM7S0FDTDtRQUVELFFBQVEsR0FBRyxTQUFYLFFBQVEsR0FBUztBQUNiLGVBQU8sVUFBQyxFQUFFLEVBQUUsYUFBYSxFQUFLO0FBQzFCLGdCQUFJLENBQUMsYUFBYSxFQUFDO0FBQ2Ysb0JBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QyxvQkFBSSxJQUFJLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNoQiwwQkFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQzFCLDhCQUFVLENBQUMsWUFBVTtBQUNqQiw4QkFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztxQkFDaEMsQ0FBQyxDQUFDO2lCQUNOO2FBQ0o7U0FDSixDQUFDO0tBQ0w7UUFFRCxhQUFhLEdBQUcsU0FBaEIsYUFBYSxDQUFJLEtBQUssRUFBSztBQUN2QixZQUFNLEVBQUUsR0FBRyxzSEFBc0gsQ0FBQztBQUNsSSxlQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDekI7UUFFRCxnQkFBZ0IsR0FBRyxTQUFuQixnQkFBZ0IsR0FBUztBQUNyQixjQUFNLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxXQUFXLENBQUM7QUFDbkMsZUFBTyxLQUFLLENBQUM7S0FDaEI7UUFFRCxnQkFBZ0IsR0FBRyxTQUFuQixnQkFBZ0IsQ0FBSSxPQUFPLEVBQUs7QUFDNUIsWUFBSSxHQUFHLEdBQUcsQ0FBQztZQUFFLElBQUksR0FBRyxDQUFDLENBQUM7QUFDdEIsV0FBRztBQUNDLGVBQUcsSUFBSSxPQUFPLENBQUMsU0FBUyxJQUFLLENBQUMsQ0FBQztBQUMvQixnQkFBSSxJQUFJLE9BQU8sQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDO0FBQ2hDLG1CQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztTQUNsQyxRQUFRLE9BQU8sRUFBRTs7QUFFbEIsZUFBTztBQUNILGVBQUcsRUFBRSxHQUFHO0FBQ1IsZ0JBQUksRUFBRSxJQUFJO1NBQ2IsQ0FBQztLQUNMO1FBRUQsVUFBVSxHQUFHLFNBQWIsVUFBVSxHQUFTO0FBQ2YsWUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNELFlBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBQztBQUNoQixjQUFFLENBQUMsT0FBTyxHQUFHLFVBQUMsS0FBSyxFQUFLO0FBQ3BCLHFCQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7O0FBRXZCLHdCQUFRLENBQUMsc0JBQXNCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQzthQUMvRSxDQUFDO1NBQ0wsQ0FBQztLQUNMO1FBRUQsVUFBVSxHQUFHLFNBQWIsVUFBVSxHQUFTO0FBQ2YsWUFBSSxFQUFFLEdBQUcsUUFBUSxDQUFDLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFELFlBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBQztBQUNoQixjQUFFLENBQUMsT0FBTyxHQUFHLFVBQUMsS0FBSyxFQUFLO0FBQ3BCLHFCQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7O0FBRXZCLGtCQUFFLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQzdCLENBQUM7U0FDTCxDQUFDO0tBQ0w7UUFFRCxTQUFTLEdBQUcsU0FBWixTQUFTLENBQUksS0FBSyxFQUFFLEdBQUcsRUFBSztBQUN4QixXQUFHLEdBQUcsR0FBRyxJQUFJLEVBQUUsQ0FBQztBQUNoQixlQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO0tBQzVDO1FBRUQsZ0JBQWdCLEdBQUcsU0FBbkIsZ0JBQWdCLENBQUksTUFBTSxFQUFLO0FBQzNCLFlBQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQzNCLFlBQU07QUFDRixrQkFBTSxFQUFFLENBQUM7QUFDVCxhQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDZCxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7O0FBRXZCLGNBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQzFEO1FBRUQsaUJBQWlCLEdBQUcsU0FBcEIsaUJBQWlCLEdBQVM7QUFDdEIsWUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO0FBQ3JFLGVBQU8sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO0tBQzFDO1FBQ0QsZUFBZSxHQUFHLFNBQWxCLGVBQWUsQ0FBSSxFQUFFLEVBQUs7QUFDdEIsWUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQzs7QUFFOUIsWUFBTSxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRztZQUNuQyxRQUFRLEdBQUcsR0FBRztZQUNkLE1BQU0sR0FBRyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUEsR0FBSSxRQUFROzs7QUFFdkMsYUFBSyxHQUFHLFNBQVIsS0FBSyxDQUFJLENBQUM7bUJBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLElBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUEsQUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEFBQUMsR0FBRyxDQUFDO1NBQUE7WUFDL0UsU0FBUyxHQUFHLFdBQVcsQ0FBQyxZQUFNO0FBQzFCLGdCQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxHQUFHLFFBQVEsQ0FBQzs7QUFFOUMsa0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOztBQUV4QixnQkFBSSxRQUFRLElBQUksTUFBTSxFQUFFO0FBQ3BCLDZCQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDNUI7O0FBRUQsb0JBQVEsR0FBRyxRQUFRLEdBQUcsTUFBTSxDQUFDO1NBQ2hDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDYjtRQUNELFFBQVEsR0FBRyxTQUFYLFFBQVEsR0FBUztBQUNiLFlBQU0sVUFBVSxHQUFHLFNBQWIsVUFBVSxDQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUs7QUFDakMsY0FBRSxDQUFDLE9BQU8sR0FBRyxZQUFNO0FBQ2Ysb0JBQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRW5ELG9CQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDdkIsbUNBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDN0I7O0FBRUQsdUJBQU8sS0FBSyxDQUFDO2FBQ2hCLENBQUM7U0FDTCxDQUFDOztBQUVGLGVBQU8sVUFBQyxFQUFFLEVBQUUsYUFBYSxFQUFLO0FBQzFCLGdCQUFJLENBQUMsYUFBYSxFQUFFO0FBQ2hCLDBCQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDcEM7U0FDSixDQUFDO0tBQ0wsQ0FBQzs7QUFFTixzQkFBa0IsRUFBRSxDQUFDO0FBQ3JCLGNBQVUsRUFBRSxDQUFDO0FBQ2IsY0FBVSxFQUFFLENBQUM7O0FBRWIsV0FBTztBQUNILHlCQUFpQixFQUFFLGlCQUFpQjtBQUNwQyx3QkFBZ0IsRUFBRSxnQkFBZ0I7QUFDbEMsZUFBTyxFQUFFLE9BQU87QUFDaEIsY0FBTSxFQUFFLE1BQU07QUFDZCxxQkFBYSxFQUFFLGFBQWE7QUFDNUIsaUJBQVMsRUFBRSxTQUFTO0FBQ3BCLHdCQUFnQixFQUFFLGdCQUFnQjtBQUNsQyxvQkFBWSxFQUFFLFlBQVk7QUFDMUIsWUFBSSxFQUFFLElBQUk7QUFDVixlQUFPLEVBQUUsT0FBTztBQUNoQixrQkFBVSxFQUFFLFVBQVU7QUFDdEIsY0FBTSxFQUFFLE1BQU07QUFDZCx1QkFBZSxFQUFFLGVBQWU7QUFDaEMsZUFBTyxFQUFFLE9BQU87QUFDaEIsaUJBQVMsRUFBRSxTQUFTO0FBQ3BCLG9CQUFZLEVBQUUsWUFBWTtBQUMxQixzQkFBYyxFQUFFLGNBQWM7QUFDOUIsc0JBQWMsRUFBRSxjQUFjO0FBQzlCLHNCQUFjLEVBQUUsY0FBYztBQUM5QixnQkFBUSxFQUFFLFFBQVE7QUFDbEIsaUJBQVMsRUFBRSxTQUFTO0FBQ3BCLHdCQUFnQixFQUFFLGdCQUFnQjtBQUNsQywwQkFBa0IsRUFBRSxrQkFBa0I7QUFDdEMsMkJBQW1CLEVBQUUsbUJBQW1CO0FBQ3hDLHdCQUFnQixFQUFFLGdCQUFnQjtBQUNsQyxtQkFBVyxFQUFFLFdBQVc7QUFDeEIsd0JBQWdCLEVBQUUsZ0JBQWdCO0FBQ2xDLGdCQUFRLEVBQUUsUUFBUTtBQUNsQixnQkFBUSxFQUFFLFFBQVE7QUFDbEIsbUJBQVcsRUFBRSxXQUFXO0FBQ3hCLGlCQUFTLEVBQUUsU0FBUztBQUNwQixtQkFBVyxFQUFFLFdBQVc7QUFDeEIsZ0JBQVEsRUFBRSxRQUFRO0tBQ3JCLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQUFBQyxDQUFDOzs7QUN2VnpDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUU7QUFDM0IsUUFBSSxrQkFBa0IsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQztRQUM5RCxvQkFBb0IsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQztRQUNuRSxhQUFhLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUM7UUFDcEQsVUFBVSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQztRQUM5QyxPQUFPLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO1FBQ3ZDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDO1FBQzlELGVBQWUsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQztRQUN4RCxJQUFJLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ2pDLFdBQVcsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUM7UUFDaEQsWUFBWSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDO1FBQ2xELGVBQWUsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQztRQUN4RCxhQUFhLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO1FBQ2xELFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7UUFDNUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUM7UUFDaEUsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUM7UUFDOUQsMEJBQTBCLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUM7UUFDL0UsK0JBQStCLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsb0NBQW9DLENBQUM7UUFDekYsMEJBQTBCLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUM7UUFDL0UsT0FBTyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztRQUN2QyxhQUFhLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUM7UUFDdkQsUUFBUSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQztRQUMxQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUM7UUFDckQsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUM7UUFDMUQsVUFBVSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQztRQUM5QyxZQUFZLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO1FBQ2pELFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFaEQsY0FBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4QixnQkFBWSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QixXQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3JCLFlBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsd0JBQW9CLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUVsQyxXQUFPO0FBQ0gsMEJBQWtCLEVBQUUsa0JBQWtCO0FBQ3RDLDRCQUFvQixFQUFFLG9CQUFvQjtBQUMxQyxxQkFBYSxFQUFFLGFBQWE7QUFDNUIsa0JBQVUsRUFBRSxVQUFVO0FBQ3RCLGVBQU8sRUFBRSxPQUFPO0FBQ2hCLDBCQUFrQixFQUFFLGtCQUFrQjtBQUN0Qyx1QkFBZSxFQUFFLGVBQWU7QUFDaEMsbUJBQVcsRUFBRSxXQUFXO0FBQ3hCLFlBQUksRUFBRSxJQUFJO0FBQ1Ysb0JBQVksRUFBRSxZQUFZO0FBQzFCLHFCQUFhLEVBQUUsYUFBYTtBQUM1QixpQkFBUyxFQUFFLFNBQVM7QUFDcEIsa0JBQVUsRUFBRSxVQUFVO0FBQ3RCLGVBQU8sRUFBRSxPQUFPO0FBQ2hCLHFCQUFhLEVBQUUsYUFBYTtBQUM1QixnQkFBUSxFQUFFLFFBQVE7QUFDbEIsc0JBQWMsRUFBRSxjQUFjO0FBQzlCLHdCQUFnQixFQUFFLGdCQUFnQjtBQUNsQyxrQ0FBMEIsRUFBRSwwQkFBMEI7QUFDdEQsdUNBQStCLEVBQUUsK0JBQStCO0FBQ2hFLGtDQUEwQixFQUFFLDBCQUEwQjtBQUN0RCwyQkFBbUIsRUFBRSxtQkFBbUI7QUFDeEMseUJBQWlCLEVBQUUsaUJBQWlCO0FBQ3BDLHVCQUFlLEVBQUUsZUFBZTtBQUNoQyxvQkFBWSxFQUFFLFlBQVk7QUFDMUIsaUJBQVMsRUFBRSxTQUFTO0tBQ3ZCLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQzlEYixNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRTtBQUM1QyxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxzQkFBVztBQUNuQixnQkFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3BCLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDckIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUU7Z0JBQ1osT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNuQyxPQUFPLEdBQUc7QUFDTiw0QkFBWSxFQUFFLDRGQUE0RjthQUM3RztnQkFDRCxTQUFTLEdBQUcsU0FBWixTQUFTLENBQUksRUFBRSxFQUFFLGFBQWEsRUFBSztBQUMvQixvQkFBSSxDQUFDLGFBQWEsRUFBRTtBQUNoQixxQkFBQyxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDckQ7YUFDSjtnQkFDRCxNQUFNLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7QUFDM0Isb0JBQUksRUFBRSxJQUFJO0FBQ1YscUJBQUssRUFBRSxJQUFJO0FBQ1gsMkJBQVcsRUFBRSxJQUFJO2FBQ3BCLENBQUM7Z0JBQ0YsV0FBVyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQzs7QUFFaEYsa0JBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFdEQsZ0JBQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRTlGLHVCQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUUvQiwwQkFBYyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDOztBQUV6RCxtQkFBTztBQUNILHlCQUFTLEVBQUUsU0FBUztBQUNwQix1QkFBTyxFQUFFLE9BQU87QUFDaEIsMkJBQVcsRUFBRSxXQUFXO0FBQ3hCLHFCQUFLLEVBQUUsS0FBSztBQUNaLDhCQUFjLEVBQUUsY0FBYztBQUM5Qix3QkFBUSxFQUFFO0FBQ04sMEJBQU0sRUFBRSxjQUFjO0FBQ3RCLDhCQUFVLEVBQUUsUUFBUTtpQkFDdkI7YUFDSixDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ2xDLG1CQUFPLENBQ0gsQ0FBQyxDQUFDLGdDQUFnQyxFQUFFLENBQ2hDLENBQUMsQ0FBQyw0QkFBNEIsRUFBRSxDQUM1QixDQUFDLENBQUMsa0VBQWtFLENBQUMsRUFDckUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQyw4REFBOEQsRUFBRSx1SEFBdUgsQ0FBQyxDQUM3TCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUNuQixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUU7QUFDekIsdUJBQU8sRUFBRSxJQUFJLENBQUMsT0FBTzthQUN4QixDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQ3RCLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUFFLENBQ0EsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUNWLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FDZCxDQUFDLENBQUMsZ0RBQWdELEVBQUUsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUMsZ0RBQWdELEVBQUUscUVBQXFFLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQ3hNLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxDQUMxQixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLGtDQUFrQyxFQUFFLENBQ2xDLENBQUMsQ0FBQyxzSUFBc0ksQ0FBQyxFQUFFLENBQUMsQ0FBQyxvQ0FBb0MsRUFBRSxRQUFRLENBQUMsQ0FDL0wsQ0FBQyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxzVUFBc1UsQ0FBQyxDQUNuVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ3BCLENBQUMsQ0FBQyxrQ0FBa0MsRUFBRSxDQUNsQyxDQUFDLENBQUMsMElBQTBJLENBQUMsRUFBRSxDQUFDLENBQUMsb0NBQW9DLEVBQUUsV0FBVyxDQUFDLENBQ3RNLENBQUMsRUFBRSxDQUFDLENBQUMsaUJBQWlCLEVBQUUsaVZBQWlWLENBQUMsQ0FDOVcsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFBRSxDQUFDLENBQUMsb0RBQW9ELEVBQUUsQ0FDeEQsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUNkLENBQUMsQ0FBQyxrRUFBa0UsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxDQUNySCxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxtSUFBbUksQ0FBQyxDQUN6SSxDQUFDLEVBQUUsQ0FBQyxDQUFDLHFFQUFxRSxFQUFFLDRCQUE0QixDQUFDLEVBQUUsQ0FBQyxDQUFDLCtCQUErQixFQUFFLGlIQUFpSCxDQUFDLENBQ3BRLENBQUMsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDcEIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxvSUFBb0ksQ0FBQyxDQUMxSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLHFFQUFxRSxFQUFFLDRCQUE0QixDQUFDLEVBQUUsQ0FBQyxDQUFDLCtCQUErQixFQUFFLGlIQUFpSCxDQUFDLENBQ3BRLENBQUMsQ0FDTCxDQUFDLEVBQUUsQ0FBQyxDQUFDLDBCQUEwQixFQUFFLENBQzlCLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLG1JQUFtSSxDQUFDLENBQ3pJLENBQUMsRUFBRSxDQUFDLENBQUMscUVBQXFFLEVBQUUsZ0NBQWdDLENBQUMsRUFBRSxDQUFDLENBQUMsK0JBQStCLEVBQUUseUhBQXlILENBQUMsQ0FDaFIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNwQixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLGtJQUFrSSxDQUFDLENBQ3hJLENBQUMsRUFBRSxDQUFDLENBQUMscUVBQXFFLEVBQUUsa0NBQWtDLENBQUMsRUFBRSxDQUFDLENBQUMsK0JBQStCLEVBQUUsa0hBQWtILENBQUMsQ0FDM1EsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxDQUNwQixDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLDZFQUE2RSxFQUFFLDRDQUE0QyxDQUFDLEVBQzlILElBQUksQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUMsQ0FBQyxDQUNuSixDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxFQUN2QixDQUFDLENBQUMsb0JBQW9CLEVBQUUsQ0FDcEIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUNkLENBQUMsQ0FBQyxpRUFBaUUsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsMEJBQTBCLEVBQUUsQ0FDM0csQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRTtBQUNyQix3QkFBUSxFQUFFLDZDQUE2QztBQUN2RCxzQkFBTSxFQUFFLDZJQUE2STthQUN4SixDQUFDLEVBQ0YsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFO0FBQ3JCLHdCQUFRLEVBQUUsd0NBQXdDO0FBQ2xELHNCQUFNLEVBQUUsMFBBQTBQO2FBQ3JRLENBQUMsRUFDRixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUU7QUFDckIsd0JBQVEsRUFBRSx1REFBdUQ7QUFDakUsc0JBQU0sRUFBRSx1Y0FBdWM7YUFDbGQsQ0FBQyxDQUNMLENBQUMsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDcEIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFO0FBQ3JCLHdCQUFRLEVBQUUseURBQXlEO0FBQ25FLHNCQUFNLEVBQUUsOEhBQThIO2FBQ3pJLENBQUMsRUFDRixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUU7QUFDckIsd0JBQVEsRUFBRSw0Q0FBNEM7QUFDdEQsc0JBQU0sRUFBRSxxUkFBcVI7YUFDaFMsQ0FBQyxFQUNGLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRTtBQUNyQix3QkFBUSxFQUFFLDBDQUEwQztBQUNwRCxzQkFBTSxFQUFFLGlRQUFpUTthQUM1USxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxrREFBa0QsRUFBRSxDQUNsRCxDQUFDLENBQUMsaUNBQWlDLEVBQUUsQ0FDakMsQ0FBQyxDQUFDLG1CQUFtQixFQUFFLHVCQUF1QixDQUFDLEVBQUUsQ0FBQyxDQUFDLGtDQUFrQyxFQUFFLGtFQUFrRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNwSyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsRUFDbkIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFO0FBQ3pCLHVCQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87YUFDeEIsQ0FBQyxFQUNGLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUN0QixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFBRSxDQUFDLENBQUMsd0ZBQXdGLEVBQUUsQ0FDNUYsQ0FBQyxDQUFDLDRCQUE0QixFQUFFLENBQzVCLENBQUMsQ0FBQyxtRkFBbUYsRUFBRSw4RkFBOEYsQ0FBQyxFQUN0TCxDQUFDLENBQUMsc0JBQXNCLEVBQUUsQUFBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQzFELENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsK0NBQStDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGdEQUFnRCxFQUFFLHNEQUFzRCxDQUFDLENBQ2xOLENBQUMsRUFDRixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLCtDQUErQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxnREFBZ0QsRUFBRSwwQ0FBMEMsQ0FBQyxDQUMxTSxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQywrQ0FBK0MsRUFBRSxLQUFLLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsZ0RBQWdELEVBQUUsa0RBQWtELENBQUMsQ0FDM04sQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxtREFBbUQsRUFBRSxDQUNuRCxDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLGlEQUFpRCxFQUFFLHdDQUF3QyxDQUFDLEVBQzlGLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsZ0JBQWdCLENBQUMsRUFDbkIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsNERBQTRELEVBQUUsQ0FDNUQsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUNMLENBQUMsQ0FBQyx3SUFBd0ksQ0FBQyxFQUMzSSxDQUFDLENBQUMsbUlBQW1JLEdBQUcsa0JBQWtCLENBQUMsOEJBQThCLENBQUMsR0FBRyxxQkFBcUIsRUFBRSxjQUFjLENBQUMsQ0FDdE8sQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsMkNBQTJDLEVBQUUsQ0FDM0MsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUNMLENBQUMsQ0FBQyx1SUFBdUksQ0FBQyxFQUMxSSxDQUFDLENBQUMsc0VBQXNFLEdBQUcsa0JBQWtCLENBQUMseUdBQXlHLENBQUMsR0FBRyw0REFBNEQsRUFBRSxRQUFRLENBQUMsQ0FDclIsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUN0QixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFBRSxDQUFDLENBQUMsdUNBQXVDLEVBQUUsQ0FDM0MsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUNkLENBQUMsQ0FBQyxvQ0FBb0MsRUFBRSxFQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUMsRUFBRSxDQUM1RCxDQUFDLENBQUMsd0NBQXdDLEVBQUMseUJBQXlCLENBQUMsRUFBRSxDQUFDLENBQUMscURBQXFELEVBQUUsb0VBQW9FLENBQUMsQ0FDeE0sQ0FBQyxFQUNGLENBQUMsQ0FBQyx5REFBeUQsRUFBRTtBQUN6RCxzQkFBTSxFQUFFLElBQUksQ0FBQyxTQUFTO2FBQ3pCLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQ0osQ0FBQztTQUNMO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQUFBQyxDQUFDOzs7QUM3TXBELE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUs7QUFDcEQsUUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLG1CQUFtQixDQUFDLENBQUM7O0FBRTlELFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFDLElBQUksRUFBSztBQUNsQixnQkFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7QUFDOUIsMEJBQVUsRUFBRSxJQUFJO2FBQ25CLENBQUM7Z0JBQ0YsVUFBVSxHQUFHLENBQUMsQ0FBQyxVQUFVO2dCQUN6QixjQUFjLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQzNCLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNoQyx3QkFBd0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDckMsTUFBTSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDOztBQUV6QyxxQkFBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDOztBQUV4RCxnQkFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDN0UsYUFBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFFOUIsZ0JBQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM3RyxnQ0FBb0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7QUFFdEQsZ0JBQUksNkJBQTZCLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO0FBQ3ZGLGdCQUFNLHFCQUFxQixHQUFHLFNBQXhCLHFCQUFxQixDQUFJLGFBQWEsRUFBSztBQUM3Qyx1QkFBTyxBQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLFVBQUMsWUFBWSxFQUFLO0FBQ3hGLHdCQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7O0FBRWhCLDBCQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLElBQUksYUFBYSxDQUFDLENBQUM7QUFDekQsMEJBQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDOUMsMEJBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLEVBQUM7QUFDeEMscUJBQUMsa0NBQWdDLFlBQVksQ0FBQyxpQkFBaUIsT0FBSSxFQUNuRSxLQUFLLEVBQ0wsQ0FBQyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNwRCxDQUFDLENBQUMsbUNBQW1DLEVBQUUsSUFBSSxHQUFHLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQ3BHLENBQUMsQ0FBQyxDQUFDO0FBQ0osMkJBQU8sNkJBQTZCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUNyRCxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQ1gsQ0FBQzs7QUFFRixnQkFBTSx5QkFBeUIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLCtCQUErQixDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZILHFDQUF5QixDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUU3RCxnQkFBSSx3QkFBd0IsR0FBRyxDQUFDLENBQzVCLElBQUksQ0FBQyxDQUFDLENBQUMseUJBQXlCLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFDOUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxnQ0FBZ0MsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUNyRCxJQUFJLENBQUMsQ0FBQyxDQUFDLHlCQUF5QixFQUFFLFNBQVMsRUFBRSxDQUFDLENBQ2pELENBQUMsQ0FBQztBQUNILGdCQUFNLGdCQUFnQixHQUFHLFNBQW5CLGdCQUFnQixDQUFJLGFBQWEsRUFBSztBQUN4Qyx1QkFBTyxBQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLFVBQUMsWUFBWSxFQUFLO0FBQ3hGLHdCQUFNLEVBQUUsR0FBRyxlQUFlO3dCQUN0QixJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7O0FBRS9DLHdCQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7O0FBRWhCLHdCQUFJLElBQUksRUFBQztBQUNMLG9DQUFZLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDeEM7O0FBRUQsMEJBQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxZQUFZLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxFQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsYUFBYSxFQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNMLDBCQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoQywwQkFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUMsQ0FDbkMsQ0FBQyxrQ0FBZ0MsWUFBWSxDQUFDLGlCQUFpQixPQUFJLEVBQ25FLEtBQUssRUFDTCxDQUFDLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUMvQyxDQUFDLENBQUMsbUNBQW1DLEVBQUUsSUFBSSxHQUFHLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQ3BHLENBQUMsQ0FBQyxDQUFDO0FBQ0osMkJBQU8sd0JBQXdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUNoRCxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQ1gsQ0FBQzs7QUFFRixnQkFBTSxvQkFBb0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLDBCQUEwQixDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzdHLGdDQUFvQixDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOztBQUVuRCxnQkFBTSx3QkFBd0IsR0FBRyxTQUEzQix3QkFBd0IsQ0FBSSxXQUFXLEVBQUs7QUFDOUMsb0JBQU0sS0FBSyxHQUFHO0FBQ1YseUJBQUssRUFBRSxDQUFDLENBQUMsaUNBQWlDO0FBQzFDLDBCQUFNLEVBQUUsQ0FBQyxDQUFDLGtDQUFrQztpQkFDL0MsQ0FBQzs7QUFFRix1QkFBTyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDN0IsQ0FBQzs7QUFFRixtQkFBTztBQUNILGlCQUFDLEVBQUUsQ0FBQztBQUNKLG9DQUFvQixFQUFFLG9CQUFvQjtBQUMxQyx5Q0FBeUIsRUFBRSx5QkFBeUI7QUFDcEQsb0NBQW9CLEVBQUUsb0JBQW9CO0FBQzFDLHlCQUFTLEVBQUUsU0FBUztBQUNwQiw4QkFBYyxFQUFFLGNBQWM7QUFDOUIsbUNBQW1CLEVBQUUsbUJBQW1CO0FBQ3hDLDZDQUE2QixFQUFFLDZCQUE2QjtBQUM1RCx3Q0FBd0IsRUFBRSx3QkFBd0I7QUFDbEQsd0NBQXdCLEVBQUUsd0JBQXdCO2FBQ3JELENBQUM7U0FDTDtBQUNELFlBQUksRUFBRSxjQUFDLElBQUksRUFBSztBQUNaLGdCQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDMUMsT0FBTyxHQUFHLFNBQVYsT0FBTyxDQUFJLEVBQUUsRUFBSztBQUNkLHVCQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtBQUMxQixzQkFBRSxFQUFFLEVBQUU7QUFDTix3QkFBSSxFQUFFLENBQ0YsMkhBQTJILEVBQzNILENBQUMsY0FBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxDQUFDLDRCQUF1QixPQUFPLENBQUMsQ0FDeEY7QUFDRCx5QkFBSyxFQUFFLEdBQUc7aUJBQ2IsQ0FBQyxDQUFDO2FBQ04sQ0FBQzs7QUFFTixtQkFBTyxDQUFDLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FDckMsT0FBTyxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixFQUFFO0FBQzdELHVCQUFPLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7YUFDM0IsQ0FBQyxHQUFHLEVBQUUsRUFDUCxDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLDBCQUEwQixFQUFFLENBQzFCLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUNuQixDQUFDLENBQUMsK0NBQStDLEVBQUUsQ0FDL0MsQ0FBQyxDQUFDLDBFQUEwRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUNwSCxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsRUFBRTtBQUNuQyx3QkFBUSxFQUFFLE9BQU87YUFDcEIsQ0FBQyxFQUNGLENBQUMsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssR0FBRywrQ0FBK0MsRUFBRSxDQUN0RSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxPQUFPLENBQUMsS0FBSyxLQUFLLE9BQU8sR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUN4SSxDQUFDLENBQUMsMElBQTBJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLGVBQWEsT0FBTyxDQUFDLElBQUksU0FBSSxPQUFPLENBQUMsS0FBSyxFQUFJLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUNqWixDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUN0QixDQUFDLENBQ0wsQ0FBQyxFQUFFLEFBQUMsT0FBTyxDQUFDLFlBQVksR0FBSSxDQUN6QixDQUFDLENBQUMsVUFBVSxDQUFDLEVBQ2IsQ0FBQyxDQUFDLDZEQUE2RCxFQUFFLENBQzdELENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FDZCxDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLCtCQUErQixFQUFFO0FBQy9CLHFCQUFLLEVBQUU7QUFDSCxnQ0FBWSxFQUFFLE9BQU87aUJBQ3hCO2FBQ0osRUFBRSxDQUNDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUU7QUFDM0QsMEJBQVUsRUFBRSxJQUFJLENBQUMsbUJBQW1CO0FBQ3BDLHFCQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUNsRCx1QkFBTyxFQUFFLGNBQWM7QUFDdkIscUJBQUssRUFBRSxlQUFDLElBQUk7MkJBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO2lCQUFBO2FBQzdDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQ2xCLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQywrQkFBK0IsRUFBRTtBQUMvQixxQkFBSyxFQUFFO0FBQ0gsZ0NBQVksRUFBRSxPQUFPO2lCQUN4QjthQUNKLEVBQUUsQ0FDQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFO0FBQzNELDBCQUFVLEVBQUUsSUFBSSxDQUFDLG1CQUFtQjtBQUNwQyxxQkFBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsNkJBQTZCLEVBQUUsU0FBUyxFQUFFLENBQUM7QUFDekQsdUJBQU8sRUFBRSxPQUFPO0FBQ2hCLHFCQUFLLEVBQUUsZUFBQyxJQUFJOzJCQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztpQkFBQTthQUM3QyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUNsQixDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsK0JBQStCLEVBQUUsQ0FDL0IsQ0FBQyxDQUFDLGdDQUFnQyxFQUFFLENBQ2hDLENBQUMsQ0FBQyxxRUFBcUUsRUFBRSxDQUNyRSxJQUFJLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQ3ZDLENBQUMsQ0FBQyxlQUFlLEVBQUUsRUFDbkIsT0FBTyxDQUFDLGtGQUFrRixDQUFDLENBQzlGLENBQUMsRUFDRixDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFO0FBQzNELHFCQUFLLEVBQUUsSUFBSSxDQUFDLHdCQUF3QjtBQUNwQyxnQ0FBZ0IsRUFBRSxDQUFDLENBQUM7YUFDdkIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FDbEIsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQywrQkFBK0IsRUFBRSxDQUMvQixDQUFDLENBQUMsZ0NBQWdDLEVBQUUsQ0FDaEMsQ0FBQyxDQUFDLHFFQUFxRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUN0SCxDQUFDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFO0FBQ2hFLHFCQUFLLEVBQUUsSUFBSSxDQUFDLDZCQUE2QjtBQUN6QyxnQ0FBZ0IsRUFBRSxDQUFDLENBQUM7YUFDdkIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FDbEIsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQywrQkFBK0IsRUFBRSxDQUMvQixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsRUFBRTtBQUNoQyx3QkFBUSxFQUFFLE9BQU87YUFDcEIsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxHQUFHLEVBQUUsQ0FDVCxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQ25CO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEFBQUMsQ0FBQzs7O0FDdE0zRSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFLO0FBQ2xDLFFBQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQzs7QUFFdkQsV0FBTztBQUNILFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7O0FBRWxCLG1CQUFPLENBQ0gsQ0FBQyxDQUFDLGtDQUFrQyxFQUFFLENBQ2xDLENBQUMsQ0FBQywyQkFBMkIsRUFBQyxDQUMxQixDQUFDLENBQUMsNkNBQTZDLENBQUMsRUFDaEQsQ0FBQyxDQUFDLG1EQUFtRCxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FDdkYsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsb0JBQW9CLEVBQUUsQ0FDcEIsQ0FBQyxDQUFDLDZCQUE2QixFQUFFLENBQzdCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsMkNBQTJDLEVBQUUsQ0FDM0MsQ0FBQyxDQUFDLG1DQUFtQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFDbkUsQ0FBQyxDQUFDLDJEQUEyRCxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FDN0YsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUM7U0FDTDtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDMUJ0QyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUs7QUFDdkQsV0FBTztBQUNILGtCQUFVLEVBQUUsc0JBQWU7Z0JBQWQsSUFBSSx5REFBRyxFQUFFOztBQUNsQixnQkFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQzNCLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRWxDLGtCQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQzs7O0FBRy9DLGdCQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzdDLG9CQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxVQUFDLEdBQUcsRUFBSztBQUM5QyxvQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQzFDLDBCQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUMvQyxxQkFBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2lCQUNkLENBQUMsQ0FBQzthQUNOOztBQUVELG1CQUFPO0FBQ0gsOEJBQWMsRUFBRSxjQUFjO0FBQzlCLGdDQUFnQixFQUFFLGdCQUFnQjthQUNyQyxDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUs7QUFDWixnQkFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7O0FBRW5DLG1CQUFPLENBQUMsQ0FBQyw0Q0FBNEMsRUFBRSxDQUNuRCxDQUFDLENBQUMsNEJBQTRCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDbkUsdUJBQU8sQ0FBQyxDQUFDLENBQUMsd0lBQXdJLENBQUMsRUFDL0ksQ0FBQyxDQUFDLHVDQUF1QyxFQUFFLENBQ3ZDLENBQUMsQ0FBQyx5Q0FBeUMsRUFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQ2xHLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSwwQ0FBMEMsQ0FBQyxDQUNuRSxDQUFDLEVBQ0YsQ0FBQyxDQUFDLHVDQUF1QyxFQUFFLENBQ3ZDLENBQUMsQ0FBQyx5Q0FBeUMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFDckUsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLHFEQUFxRCxDQUFDLENBQzlFLENBQUMsQ0FDTCxDQUFDO2FBQ0wsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FDdkMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUNMLENBQUMsQ0FBQyx5Q0FBeUMsRUFBRSxDQUN6QyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsOEJBQThCLEVBQUUsQ0FDOUIsQ0FBQyxDQUFDLHlCQUF5QixHQUFHLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQzlFLENBQUMsRUFDRixDQUFDLENBQUMsOEJBQThCLEVBQUUsQ0FDOUIsQ0FBQyxDQUFDLGtDQUFrQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FDeEQsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLDJEQUEyRCxFQUFFLENBQzNELENBQUMsQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLENBQUMsQ0FDakMsQ0FBQyxFQUNGLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLDhCQUE4QixFQUFFLENBQzlCLENBQUMsQ0FBQyxrQ0FBa0MsR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLGdCQUFnQixDQUFDLENBQ2hGLENBQUMsRUFDRixDQUFDLENBQUMsOEJBQThCLEVBQUUsQ0FDOUIsQ0FBQyxDQUFDLGtDQUFrQyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FDM0QsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxHQUFHLEVBQUUsRUFDUCxDQUFDLENBQUMsb0VBQW9FLEVBQUUsQ0FDcEUsQ0FBQyxDQUFDLHNGQUFzRixFQUFFLENBQ3RGLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLENBQUMsRUFBRSw0QkFBNEIsQ0FDNUQsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQUFBQyxDQUFDOzs7Ozs7Ozs7OztBQ3BFakUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUs7QUFDcEQsV0FBTzs7QUFFSCxrQkFBVSxFQUFFLG9CQUFDLElBQUksRUFBSztBQUNsQixtQkFBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQzdEOztBQUVELFlBQUksRUFBRSxjQUFDLElBQUksRUFBSztBQUNaLGdCQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO0FBQ3BDLG1CQUFPLE9BQU8sRUFBRSxDQUFDLGlCQUFpQixHQUM5QixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUNwRTtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQUFBQyxDQUFDOzs7Ozs7Ozs7OztBQ2IzRCxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUs7QUFDckQsV0FBTzs7QUFFSCxrQkFBVSxFQUFFLHNCQUFNO0FBQ2QsZ0JBQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUztnQkFDL0IsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCO2dCQUNsQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUU7Z0JBQ25DLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDOzs7QUFFL0Isb0JBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLHFCQUFNO0FBQUUsMkJBQU8sSUFBSSxDQUFDO2lCQUFFLEVBQUUsVUFBVSxFQUFFLHNCQUFNO0FBQUUsMkJBQU8sSUFBSSxDQUFDO2lCQUFFLEVBQUMsQ0FBQztnQkFDbEgsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUU7Z0JBQ2hCLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFO2dCQUNyQixZQUFZLEdBQUcsU0FBZixZQUFZLENBQUksRUFBRSxFQUFLO0FBQ25CLHVCQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxVQUFTLENBQUMsRUFBQztBQUFFLDJCQUFPLENBQUMsQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUFFLENBQUMsQ0FBQzthQUNyRjtnQkFDRCxRQUFRLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDO2dCQUU5QyxjQUFjLEdBQUcsU0FBakIsY0FBYyxHQUFTO0FBQ25CLHVCQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQ3JIO2dCQUVELGNBQWMsR0FBRyxTQUFqQixjQUFjLENBQUksRUFBRSxFQUFLO0FBQ3JCLHVCQUFPLFlBQU07QUFDVCwwQkFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFDLFdBQVcsRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUM3RCwyQkFBTyxLQUFLLENBQUM7aUJBQ2hCLENBQUM7YUFDTDtnQkFDRCxnQkFBZ0IsR0FBRyxTQUFuQixnQkFBZ0IsQ0FBSSxFQUFFLEVBQUs7QUFDdkIsdUJBQU8sWUFBTTtBQUNULDBCQUFNLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN2RywyQkFBTyxLQUFLLENBQUM7aUJBQ2hCLENBQUM7YUFDTDtnQkFFRCxTQUFTLEdBQUcsU0FBWixTQUFTLEdBQVM7QUFDZCxvQkFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDO29CQUV6RCxHQUFHLEdBQUcsS0FBSyxJQUNQLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFDUixZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUUxQixlQUFlLEdBQUksU0FBbkIsZUFBZSxHQUFTO0FBQ3BCLHdCQUFNLFVBQVUsR0FBRyxPQUFPLENBQUM7QUFDdkIsbUNBQVcsRUFBRSxLQUFLO0FBQ2xCLG1DQUFXLEVBQUUsSUFBSTtxQkFDcEIsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFNUIsMkJBQU8sS0FBSyxJQUNSLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFDUixVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQ3BCLEdBQUcsSUFDSCxFQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDO2lCQUNqRTtvQkFFRCxNQUFNLEdBQUcsZUFBZSxFQUFFLElBQUksVUFBVSxDQUFDLFdBQVc7b0JBQ3BELE1BQU0sR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQztvQkFFbkMsY0FBYyxHQUFHLFNBQWpCLGNBQWMsR0FBUztBQUNuQix3QkFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7d0JBQ3BGLElBQUksR0FBRztBQUNILGtDQUFVLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDdEIsaUNBQVMsRUFBRSxDQUFDO0FBQ1osa0NBQVUsRUFBRSxzQkFBTTtBQUFFLG1DQUFPLElBQUksQ0FBQzt5QkFBRTtBQUNsQyxnQ0FBUSxFQUFFLG9CQUFNO0FBQUUsbUNBQU8sS0FBSyxDQUFDO3lCQUFFO3FCQUNwQyxDQUFDO0FBQ1IscUJBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQy9CLDJCQUFPLElBQUksQ0FBQztpQkFDZjtvQkFFRCxZQUFZLEdBQUcsU0FBZixZQUFZLEdBQVM7QUFDakIsd0JBQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekQseUJBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDaEMsOENBQXNCLEVBQUUsTUFBTTtBQUM5QixtQ0FBVyxFQUFFLEtBQUs7QUFDbEIsNkJBQUssRUFBRSxNQUFNO0FBQ2IsbUNBQVcsRUFBRSxNQUFNO0FBQ25CLGtDQUFVLEVBQUUsTUFBTTtxQkFDckIsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDakIsMkJBQU8sS0FBSyxDQUFDO2lCQUNoQixDQUFDOztBQUVSLG9CQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtBQUMzRCx5QkFBSyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQztBQUN6Qiw0QkFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7aUJBQzlCLE1BQU07QUFDSCx5QkFBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNwQiw0QkFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7aUJBQzVCO0FBQ0QsMEJBQVUsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzFCLHFCQUFLLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7YUFFNUQ7Z0JBRUQsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRW5ELGtCQUFNLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLFlBQU07QUFDeEMseUJBQVMsRUFBRSxDQUFDO0FBQ1osaUJBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUNkLEVBQUUsS0FBSyxDQUFDLENBQUM7OztBQUdWLGFBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QiwwQkFBYyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUVqQyxtQkFBTztBQUNILDBCQUFVLEVBQUUsa0JBQWtCO0FBQzlCLDhCQUFjLEVBQUUsY0FBYztBQUM5QixnQ0FBZ0IsRUFBRSxnQkFBZ0I7QUFDbEMsd0JBQVEsRUFBRSxRQUFRO0FBQ2xCLHdCQUFRLEVBQUUsUUFBUTtBQUNsQixxQkFBSyxFQUFFLEtBQUs7QUFDWiwwQkFBVSxFQUFFLFVBQVU7QUFDdEIsZ0NBQWdCLEVBQUUsZ0JBQWdCO2FBQ3JDLENBQUM7U0FDTDs7QUFFRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUs7QUFDWixtQkFBTyxDQUNILENBQUMsQ0FBQyx3QkFBd0IsRUFBRSxDQUN4QixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFDckIsQ0FBQyxDQUFDLGdDQUFnQyxFQUFFLENBQ2hDLENBQUMsQ0FBQyxrQ0FBa0MsRUFBRSxDQUNsQyxDQUFDLENBQUMsK0ZBQStGLEVBQUMsRUFBQyxPQUFPLEVBQUU7MkJBQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRTtpQkFBQSxFQUFDLEVBQUUsQ0FBQyw2QkFBNkIsRUFBQyxDQUFDLHdDQUFxQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxTQUFTLEdBQUcsRUFBRSxDQUFBLEVBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUM1USxDQUFDLEVBQ0YsQ0FBQyxrQ0FBK0IsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsU0FBUyxHQUFHLEVBQUUsQ0FBQSxFQUFJLENBQ3hFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxVQUFDLFFBQVEsRUFBSztBQUNuQyx1QkFBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUUsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQzthQUM5RCxDQUFDLENBQ0wsQ0FBQyxFQUVGLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxDQUMxQixDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsVUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFLO0FBQ3JDLHVCQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxFQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO2FBQ3pFLENBQUMsQ0FFTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLEVBRUYsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUNaLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FDZCxDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLDJDQUEyQyxFQUFFLENBQzNDLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FDdEMsQ0FBQyxDQWVMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FBRUYsYUFBQyxDQUFDLG9CQUFvQixFQUFFLENBQ3BCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FDZCxDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxVQUFDLE9BQU8sRUFBSztBQUN6RCx1QkFBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxlQUFlLEVBQUMsQ0FBQyxDQUFDO2FBQy9FLENBQUMsQ0FBQyxFQUNILElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUNoRCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFFRixDQUFDLENBQUMsWUFBWSxFQUFFLENBQ1osQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUNkLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsZ0JBQWdCLENBQUMsRUFDbkIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2xCLEFBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLFVBQVUsRUFBRSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsbURBQW1ELEVBQUUsRUFBQyxPQUFPLEVBQUUsbUJBQU07QUFBRSx3QkFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEFBQUMsT0FBTyxLQUFLLENBQUM7aUJBQUUsRUFBQyxFQUFFLGVBQWUsQ0FBQyxDQUN4UCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQ3RCLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUFDLENBQUM7U0FDWDtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxBQUFDLENBQUM7OztBQ3JNNUQsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBSztBQUN6RCxRQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUM7O0FBRTFELFdBQU87QUFDSCxrQkFBVSxFQUFFLHNCQUFNO0FBQ2QsZ0JBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNuQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNO2dCQUMzQixPQUFPLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPO2dCQUMxQixPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUU7Z0JBQ2hDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDOztBQUV0QixnQkFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxFQUFFLFVBQUMsSUFBSSxFQUFLO0FBQ2pELG9CQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO29CQUNqQixPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO29CQUMvRCxVQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFOUIsdUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQzs7QUFFcEQsdUJBQU87QUFDSCx5QkFBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO0FBQ2Qsd0JBQUksRUFBRSxJQUFJO0FBQ1YsOEJBQVUsRUFBRSxVQUFVO0FBQ3RCLDBCQUFNLEVBQUUsT0FBTztpQkFDbEIsQ0FBQzthQUNMLENBQUMsQ0FBQzs7QUFFSCxtQkFBTztBQUNILDJCQUFXLEVBQUUsV0FBVztBQUN4Qiw2QkFBYSxFQUFFLEVBQUUsQ0FBQyxPQUFPO2FBQzVCLENBQUM7U0FDTDs7QUFFRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUs7QUFDWixnQkFBTSxNQUFNLEdBQUcsU0FBVCxNQUFNLEdBQVM7QUFDakIsdUJBQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ3hDLHdCQUFNLFdBQVcsOEJBQTRCLEtBQUssQ0FBQyxLQUFLLE9BQUksQ0FBQztBQUM3RCx3QkFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLDRCQUE0QixFQUFDLENBQzNDLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxDQUMxQixDQUFDLENBQUMsNERBQTRELEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUM1RSxDQUFDLENBQUMsc0NBQXNDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FDckUsQ0FBQyxFQUNGLENBQUMsQ0FBQyw4Q0FBOEMsRUFBQyxFQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUNsRixDQUFDLENBQUM7O0FBRUgsMkJBQU87QUFDSCwrQkFBTyxFQUFFLE9BQU87QUFDaEIsbUNBQVcsRUFBRSxXQUFXO3FCQUMzQixDQUFDO2lCQUNMLENBQUMsQ0FBQzthQUNOLENBQUM7O0FBRUYsbUJBQU8sQ0FDSCxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUU7QUFDbEIsc0JBQU0sRUFBRSxNQUFNLEVBQUU7QUFDaEIsc0JBQU0sRUFBRSxNQUFNO0FBQ2QsMEJBQVUsRUFBRSxrQkFBa0I7QUFDOUIsNEJBQVksRUFBRSwyQkFBMkI7QUFDekMsMEJBQVUsRUFBRSxLQUFLO2FBQ3BCLENBQUMsRUFDRixDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBQyxVQUFVLEVBQUs7QUFDcEMsdUJBQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFO0FBQzdCLDhCQUFVLEVBQUUsVUFBVTtBQUN0Qix1QkFBRyxZQUFVLFVBQVUsQ0FBQyxJQUFJLEFBQUU7aUJBQ2pDLENBQUMsQ0FBQzthQUNOLENBQUMsRUFDRixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUN4QyxDQUFDO1NBQ0w7S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxBQUFDLENBQUM7OztBQ3JFMUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFLO0FBQy9DLFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFDLElBQUksRUFBSztBQUNsQixtQkFBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQzdEOztBQUVELFlBQUksRUFBRSxjQUFDLElBQUksRUFBSztBQUNaLGdCQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDOztBQUVsQyxtQkFBTyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQ2xCLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBRTtBQUN6Qix1QkFBTyxFQUFFLE9BQU87QUFDaEIsMkJBQVcsRUFBRSxJQUFJLENBQUMsV0FBVzthQUNoQyxDQUFDLEVBQ0YsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFO0FBQ3ZCLHVCQUFPLEVBQUUsT0FBTztBQUNoQiw2QkFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO2FBQ3BDLENBQUMsRUFDRixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUU7QUFDdkIsdUJBQU8sRUFBRSxPQUFPO0FBQ2hCLDZCQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWE7YUFDcEMsQ0FBQyxFQUNELE9BQU8sRUFBRSxJQUFJLE9BQU8sRUFBRSxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixFQUFFO0FBQzVFLHVCQUFPLEVBQUUsT0FBTzthQUNuQixDQUFDLEdBQUcsRUFBRSxDQUNWLENBQUMsQ0FBQztTQUNWO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxBQUFDLENBQUM7OztBQzVCM0QsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFLO0FBQzlDLFFBQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQzs7QUFFeEQsV0FBTztBQUNILGtCQUFVLEVBQUUsc0JBQU07QUFDZCxnQkFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3BCLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDdkIsWUFBWSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixnQkFBZ0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDN0IsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQzdCLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hDLE9BQU8sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7Z0JBQzNCLE9BQU8sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVM7Z0JBQy9CLFVBQVUsR0FBRyxPQUFPLENBQUMsS0FBSztnQkFDMUIsVUFBVSxHQUFHLE9BQU8sQ0FBQztBQUNqQiwyQkFBVyxFQUFFLElBQUk7YUFDcEIsQ0FBQztnQkFDRixTQUFTLEdBQUcsT0FBTyxDQUFDO0FBQ2hCLDBCQUFVLEVBQUUsSUFBSTthQUNuQixDQUFDO2dCQUNGLE1BQU0sR0FBRyxPQUFPLENBQUM7QUFDYixrQkFBRSxFQUFFLElBQUk7YUFDWCxDQUFDO2dCQUNGLE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU07Z0JBQzNCLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDdEQsY0FBYyxHQUFHLFNBQWpCLGNBQWMsR0FBUztBQUNuQix1QkFBTyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUMvQyx3QkFBSSxFQUFFLEtBQUs7aUJBQ2QsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3JDO2dCQUNELFVBQVUsR0FBRyxTQUFiLFVBQVUsQ0FBSSxHQUFHLEVBQUs7QUFDbEIsdUJBQU8sWUFBTTtBQUNULGdDQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3JCLENBQUM7YUFDTDtnQkFDRCxTQUFTLEdBQUcsU0FBWixTQUFTLEdBQVM7QUFDZCx1QkFBTyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMvRTtnQkFDRCxRQUFRLEdBQUcsU0FBWCxRQUFRLEdBQVM7QUFDYix1QkFBTyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUM3RTtnQkFDRCxLQUFLLEdBQUcsU0FBUixLQUFLLEdBQVM7QUFDVix1QkFBTyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN2RTtnQkFDRCxjQUFjLEdBQUcsU0FBakIsY0FBYyxDQUFJLFFBQVEsRUFBSztBQUMzQix1QkFBTyxZQUFNO0FBQ1QsdUNBQW1CLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2pDLDhCQUFVLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQyxvQ0FBZ0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDN0IscUJBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNYLDZCQUFTLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztpQkFDakQsQ0FBQzthQUNMO2dCQUNELE9BQU8sR0FBRyxTQUFWLE9BQU8sQ0FBSSxJQUFJLEVBQUUsR0FBRyxFQUFLO0FBQ3JCLGdDQUFnQixFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUM1RCw2QkFBUyxFQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMscUJBQXFCO2lCQUNsRCxDQUFDLENBQUM7YUFDTjtnQkFDRCxVQUFVLEdBQUcsU0FBYixVQUFVLENBQUksT0FBTyxFQUFFLEdBQUcsRUFBSztBQUMzQixnQ0FBZ0IsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDM0Msc0JBQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEMscUJBQUssRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLElBQUk7MkJBQUssT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUM7aUJBQUEsQ0FBQyxDQUFDO2FBQ3JEO2dCQUNELG9CQUFvQixHQUFHLFNBQXZCLG9CQUFvQixDQUFJLFFBQVEsRUFBSztBQUNqQyxnQ0FBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMzQixvQkFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRTtBQUN6RCw4QkFBVSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVztpQkFDNUMsQ0FBQyxDQUFDO0FBQ0gsZ0NBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDckIsb0JBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7QUFDbEMscUJBQUMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLFVBQUMsVUFBVSxFQUFFLEdBQUcsRUFBSztBQUN4RCw0QkFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDNUIscUNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsb0NBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLE9BQU87dUNBQUssVUFBVSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUM7NkJBQUEsQ0FBQyxDQUFDO3lCQUNqRTtxQkFDSixDQUFDLENBQUM7aUJBQ047YUFDSixDQUFDOztBQUVOLHVCQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9CLDBCQUFjLEVBQUUsQ0FBQzs7QUFFakIsbUJBQU87QUFDSCxxQkFBSyxFQUFFLEtBQUs7QUFDWiwwQkFBVSxFQUFFLFVBQVU7QUFDdEIsMEJBQVUsRUFBRSxVQUFVO0FBQ3RCLDhCQUFjLEVBQUUsY0FBYztBQUM5QixnQ0FBZ0IsRUFBRSxnQkFBZ0I7QUFDbEMsbUNBQW1CLEVBQUUsbUJBQW1CO0FBQ3hDLDBCQUFVLEVBQUUsVUFBVTtBQUN0Qiw0QkFBWSxFQUFFLFlBQVk7QUFDMUIsZ0NBQWdCLEVBQUUsZ0JBQWdCO0FBQ2xDLDRCQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVk7QUFDbEMseUJBQVMsRUFBRSxPQUFPLENBQUMsU0FBUzthQUMvQixDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ2xDLGdCQUFNLFlBQVksR0FBRyxTQUFmLFlBQVksR0FBUztBQUN2Qix1QkFBTyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsVUFBQyxXQUFXLEVBQUs7QUFDN0Msd0JBQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyx1Q0FBdUMsRUFBRSxDQUN2RCxDQUFDLENBQUMsa0NBQWtDLEVBQUUsQ0FDbEMsQ0FBQywyREFBeUQsV0FBVyxDQUFDLFFBQVEsUUFBSyxDQUN0RixDQUFDLEVBQ0YsQ0FBQyxDQUFDLG9DQUFvQyxRQUFNLFdBQVcsQ0FBQyxPQUFPLE9BQUksRUFDbkUsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxxQ0FBcUMsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQzFELENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQzFDLENBQUMsQ0FDTCxDQUFDLENBQUM7O0FBRUgsMkJBQU87QUFDSCwrQkFBTyxFQUFFLE9BQU87cUJBQ25CLENBQUM7aUJBQ0wsQ0FBQyxDQUFDO2FBRU4sQ0FBQzs7QUFFRixtQkFBTyxDQUNILENBQUMsQ0FBQyxpQ0FBaUMsRUFBRSxDQUNqQyxDQUFDLENBQUMsNEJBQTRCLEVBQUUsQ0FDNUIsQ0FBQyxDQUFDLDJEQUEyRCxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFDN0YsQ0FBQyxDQUFDLDBCQUEwQixFQUFFLENBQzFCLENBQUMsQ0FBQyw2QkFBNkIsRUFBRSxDQUM3QixDQUFDLENBQUMsdURBQXVELEVBQUU7QUFDdkQsc0JBQU0sRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFO2FBQ3ZCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUNwQyxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FDaEMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxvQ0FBb0MsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDdkYsQ0FBQyxDQUFDLDhCQUE4QixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FDMUUsQ0FBQyxFQUNGLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsb0NBQW9DLEVBQUUsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEVBQ3BHLENBQUMsQ0FBQyw4QkFBOEIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQ3pFLENBQUMsRUFDRixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLG9DQUFvQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUMzRixDQUFDLENBQUMsOEJBQThCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQzNFLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsb0JBQW9CLEVBQUUsQ0FDcEIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUNkLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsNENBQTRDLEVBQUUsQ0FDNUMsQ0FBQyxDQUFDLHdEQUF3RCxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFDOUYsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FDN0QsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMscUJBQXFCLEVBQUUsQ0FDckIsQ0FBQyxDQUFDLDBDQUEwQyxFQUFFLENBQzFDLENBQUMsQ0FBQyx3QkFBd0IsRUFBRSxDQUN4QixDQUFDLENBQUMscUNBQXFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUN6RSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUN2RCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLHdCQUF3QixFQUFFLENBQ3hCLENBQUMsQ0FBQyxxQ0FBcUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQ3pFLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQ3ZELENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxFQUNoQixDQUFDLENBQUMsYUFBYSxFQUFFLENBQ2IsQ0FBQyxDQUFDLHFDQUFxQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFDekUsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFDcEQsQ0FBQyxDQUFDLG9EQUFvRCxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFDeEYsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FDdkQsQ0FBQyxFQUNGLENBQUMsQ0FBQywyQ0FBMkMsRUFBRSxDQUMzQyxDQUFDLENBQUMsd0JBQXdCLEVBQUUsQ0FDeEIsQ0FBQyxDQUFDLHFDQUFxQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFDekUsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FDdkQsQ0FBQyxFQUNGLENBQUMsQ0FBQyx3QkFBd0IsRUFBRSxDQUN4QixDQUFDLENBQUMscUNBQXFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUN6RSxDQUFDLENBQUMsZ0JBQWdCLEVBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUN4RCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxFQUN2QixDQUFDLENBQUMsMEJBQTBCLEVBQUUsQ0FDMUIsQ0FBQyxDQUFDLDhDQUE4QyxFQUFFLENBQzlDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FDTCxDQUFDLENBQUMsMkNBQTJDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQ3hGLENBQUMsRUFDRixDQUFDLENBQUMsZ0VBQWdFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQzdHLENBQUMsQ0FBQywrQ0FBK0MsRUFBRSxDQUMvQyxDQUFDLENBQUMsbUNBQW1DLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQ2pGLENBQUMsQ0FBQyxtQ0FBbUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFDakYsQ0FBQyxDQUFDLG1DQUFtQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsb0JBQW9CLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUNqRixDQUFDLENBQUMsbUNBQW1DLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQ2pGLENBQUMsQ0FBQyxtQ0FBbUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FDcEYsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLHNDQUFzQyxFQUFFLENBQ3RDLENBQUMsQ0FBQywyQkFBMkIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsVUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFLO0FBQ2pFLHVCQUFPLENBQUMsa0RBQStDLEFBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBSSxXQUFXLEdBQUcsRUFBRSxDQUFBLEVBQUk7QUFDdkcsMkJBQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztpQkFDaEMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDbEIsQ0FBQyxDQUFDLEVBQ0gsQ0FBQyxDQUFDLDhCQUE4QixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxVQUFDLElBQUksRUFBRSxHQUFHLEVBQUs7QUFDcEUsdUJBQU8sQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUNwQixDQUFDLGVBQWEsSUFBSSxDQUFDLEdBQUcsc0JBQWdCLEFBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBSSxXQUFXLEdBQUcsRUFBRSxDQUFBLENBQUcsQ0FDNUYsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxDQUFDLENBQ04sQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLHNDQUFzQyxFQUFFLENBQ3RDLENBQUMsQ0FBQyw0QkFBNEIsRUFBRSxDQUM1QixDQUFDLENBQUMsd0VBQXdFLEVBQUUsQ0FDeEUsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFDbEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUNQLElBQUksQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FDeEMsQ0FBQyxFQUNGLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRTtBQUMzQixtQkFBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLFNBQVMsRUFBRSxDQUFDO2FBQ3hDLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxrREFBa0QsRUFBRSxDQUNsRCxDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsOEJBQThCLEVBQUUsQ0FDOUIsQ0FBQyxDQUFDLHNEQUFzRCxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUNyRyxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsU0FBUyxFQUFFLENBQ1QsQ0FBQyxDQUFDLDJCQUEyQixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLFVBQUMsUUFBUSxFQUFLO0FBQ2xFLHVCQUFPLENBQUMsZ0VBQTZELEFBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEtBQUssUUFBUSxDQUFDLEVBQUUsR0FBSSxhQUFhLEdBQUcsRUFBRSxDQUFBLEVBQUk7QUFDdEksMkJBQU8sRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQztpQkFDekMsRUFBRSxDQUNDLENBQUMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUMxQixDQUFDLENBQUM7YUFDTixDQUFDLENBQUMsRUFDSCxDQUFDLENBQUMsK0JBQStCLEVBQUUsQ0FDL0IsQ0FBQyxDQUFDLDJCQUEyQixFQUFFLENBQzNCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQUFBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLFVBQUMsUUFBUSxFQUFLO0FBQzNGLHVCQUFPLENBQ0gsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxtQ0FBbUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQ3JELENBQUMsQ0FBQyxtRUFBbUUsRUFBRTtBQUNuRSwwQkFBTSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUU7aUJBQ3ZCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUNwQyxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyx3Q0FBd0MsV0FBUSxRQUFRLENBQUMsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQSxDQUFHLEVBQ3BKLENBQUMsQ0FBQyxtQ0FBbUMsRUFBRSxzQkFBc0IsQ0FBQyxFQUM5RCxDQUFDLENBQUMsd0NBQXdDLEVBQUUsQUFBQyxRQUFRLENBQUMsbUJBQW1CLEdBQUksUUFBUSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxFQUNsSCxDQUFDLENBQUMsbUNBQW1DLEVBQUUsc0JBQXNCLENBQUMsRUFDOUQsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxVQUFDLE9BQU8sRUFBSztBQUM5RSwyQkFBTyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLDBCQUEwQixFQUFFLENBQzNELENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLDJCQUF5QixDQUFDLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFLLENBQ3pFLENBQUMsRUFDRixDQUFDLENBQUMsaUJBQWlCLEVBQUUsQ0FDakIsQ0FBQyxDQUFDLG9DQUFvQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQzFELENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxDQUNwQixJQUFJLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLFNBQVMsQ0FBQyxFQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxZQUFZLEVBQUUsT0FBTyxDQUFDLGtCQUFrQixFQUFDLENBQUMsQ0FBQyxFQUM3SCxDQUFDLDJCQUF5QixPQUFPLENBQUMsU0FBUyxTQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FDakUsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLEdBQUcsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsNkJBQTZCLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUNoRixDQUFDLEdBQUcsRUFBRSxDQUNWLENBQUMsQ0FDTCxDQUFDO2FBQ0wsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUNYLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFO0FBQ2xCLHNCQUFNLEVBQUUsWUFBWSxFQUFFO0FBQ3RCLHFCQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUNoRCwwQkFBVSxFQUFFLDRCQUE0QjtBQUN4Qyw0QkFBWSxFQUFFLG9CQUFvQjthQUNyQyxDQUFDLEVBQ0YsQ0FBQyxDQUFDLG1DQUFtQyxDQUFDLEVBQ3RDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FDZCxDQUFDLENBQUMsaUVBQWlFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUNyRyxDQUFDLENBQUMsMEJBQTBCLEVBQUUsQ0FDMUIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsVUFBQyxRQUFRLEVBQUs7QUFDMUQsdUJBQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFO0FBQzVCLDRCQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7QUFDM0IsMEJBQU0sRUFBRSxRQUFRLENBQUMsTUFBTTtpQkFDMUIsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxDQUFDLEVBQ0gsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsVUFBQyxRQUFRLEVBQUs7QUFDMUQsdUJBQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFO0FBQzVCLDRCQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7QUFDM0IsMEJBQU0sRUFBRSxRQUFRLENBQUMsTUFBTTtpQkFDMUIsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxDQUFDLENBQ04sQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsMkVBQTJFLEVBQUUsQ0FDM0UsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUNkLENBQUMsQ0FBQyxzREFBc0QsRUFBRSxvQ0FBb0MsQ0FBQyxFQUMvRixDQUFDLENBQUMseURBQXlELEVBQUUsQ0FDekQsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQ25CLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsdURBQXVELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUM3RixDQUFDLENBQUMsOENBQThDLENBQUMsRUFDakQsQ0FBQyw2REFBMkQsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLFFBQUssRUFDdEYsQ0FBQyxDQUFDLGdFQUFnRSxFQUFFLEVBQUMsSUFBSSxFQUFFLGVBQWUsRUFBQyxDQUFDLEVBQzVGLENBQUMsQ0FBQyx1REFBdUQsRUFBRSxjQUFjLENBQUMsRUFDMUUsQ0FBQyxDQUFDLHFEQUFxRCxFQUFFLEVBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFDLEVBQUMsQ0FDcEYsQ0FBQyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMscUJBQXFCLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUNqRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxVQUFDLFFBQVEsRUFBSztBQUNuQyx1QkFBTyxDQUFDLG9CQUFrQixRQUFRLENBQUMsRUFBRSxTQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM3RCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsZ0JBQWdCLENBQUMsRUFDbkIsQ0FBQyxDQUFDLDBCQUEwQixFQUFFLENBQzFCLENBQUMsQ0FBQyw0Q0FBNEMsRUFBRSxDQUM1QyxDQUFDLGtDQUFnQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsQ0FBQywrQkFBNEIsQ0FDbEcsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDO1NBQ0w7S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEFBQUMsQ0FBQzs7O0FDOVVqRSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDakMsV0FBTztBQUNILFlBQUksRUFBRSxnQkFBVztBQUNiLG1CQUFPLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxDQUN6QixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFDeEIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQzdCLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7Ozs7Ozs7OztBQ0R2QixNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBSztBQUMvQyxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBQyxJQUFJLEVBQUs7QUFDbEIsZ0JBQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7O0FBRXhELG9CQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7O0FBRy9CLGdCQUFNLGNBQWMsR0FBRyxDQUFDLFlBQU07QUFDMUIsb0JBQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDO29CQUN6RCxJQUFJLEdBQUcsU0FBUCxJQUFJLEdBQVM7QUFDVCwwQkFBTSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUMxRSxDQUFDOztBQUVSLHVCQUFPO0FBQ0gsOEJBQVUsRUFBRSxVQUFVO0FBQ3RCLHdCQUFJLEVBQUUsSUFBSTtpQkFDYixDQUFDO2FBQ0wsQ0FBQSxFQUFHOzs7QUFHRSxxQ0FBeUIsR0FBRyxDQUFDLFlBQU07QUFDL0Isb0JBQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUNuQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsaUJBQWlCLENBQUM7b0JBQzNDLElBQUksR0FBRyxTQUFQLElBQUksR0FBUztBQUNULDBCQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO2lCQUMzQyxDQUFDOztBQUVSLHVCQUFPO0FBQ0gsd0JBQUksRUFBRSxJQUFJO0FBQ1Ysd0JBQUksRUFBRSxNQUFNO2lCQUNmLENBQUM7YUFDTCxDQUFBLEVBQUc7OztBQUdKLDhCQUFrQixHQUFHLENBQUMsWUFBTTtBQUN4QixvQkFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7b0JBQ3ZCLE1BQU0sR0FBRyxDQUFDLFlBQU07QUFDWiwyQkFBTyxDQUFDLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FDOUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQzVCLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ25DLENBQUEsRUFBRztvQkFDSixJQUFJLEdBQUcsU0FBUCxJQUFJLEdBQVM7QUFDVCwwQkFBTSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDbEMsQ0FBQzs7QUFFUix1QkFBTztBQUNILDhCQUFVLEVBQUUsVUFBVTtBQUN0Qix3QkFBSSxFQUFFLElBQUk7QUFDViwwQkFBTSxFQUFFLE1BQU07aUJBQ2pCLENBQUM7YUFDTCxDQUFBLEVBQUcsQ0FBQzs7QUFFWCxtQkFBTztBQUNILGtDQUFrQixFQUFFLGtCQUFrQjtBQUN0Qyw4QkFBYyxFQUFFLGNBQWM7QUFDOUIseUNBQXlCLEVBQUUseUJBQXlCO2FBQ3ZELENBQUM7U0FDTDtBQUNELFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsZ0JBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQyxtQkFBTyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQ3RCLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsRUFDaEMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUNiLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxFQUM1QyxDQUFDLENBQUMsb0JBQW9CLENBQUMsRUFDdkIsQ0FBQyxDQUFDLGdEQUFnRCxDQUFDLENBQ3RELENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxBQUFDLENBQUM7OztBQzlFbEQsTUFBTSxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3JELFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFTLElBQUksRUFBRTtBQUN2QixnQkFBSSxDQUFDLFlBQUEsQ0FBQztBQUNOLGdCQUFNLFVBQVUsR0FBRyxTQUFiLFVBQVUsR0FBUztBQUNyQixvQkFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZO29CQUMvQixTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTO29CQUMvQixJQUFJLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDN0QsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsaUJBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QyxvQkFBSSxTQUFTLEVBQUU7QUFDWCxxQkFBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDN0M7QUFDRCx1QkFBTyxNQUFNLENBQUM7YUFDakIsQ0FBQztBQUNGLGdCQUFNLE1BQU0sR0FBRyxVQUFVLEVBQUUsQ0FBQztBQUM1QixtQkFBTztBQUNILHNCQUFNLEVBQUUsTUFBTTtBQUNkLHVCQUFPLEVBQUU7QUFDTCw0QkFBUSxFQUFFO0FBQ04sZ0NBQVEsRUFBRSxTQUFTO0FBQ25CLGlDQUFTLEVBQUUsSUFBSTtBQUNmLG9DQUFZLEVBQUUsWUFBWTtBQUMxQixrQ0FBVSxFQUFFLHNCQUFzQjtBQUNsQyxrQ0FBVSxFQUFFLGtCQUFrQjtBQUM5QixtQ0FBVyxFQUFFLFlBQVk7QUFDekIsc0NBQWMsRUFBRSxnQ0FBZ0M7QUFDaEQsb0NBQVksRUFBRSw4QkFBOEI7QUFDNUMsNkJBQUssRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLGtCQUFrQjtxQkFDckM7QUFDRCwwQkFBTSxFQUFFO0FBQ0osOEJBQU0sRUFBRSxZQUFZO0FBQ3BCLGlDQUFTLEVBQUUsaUJBQWlCO0FBQzVCLGlDQUFTLEVBQUUsV0FBVztBQUN0Qiw4QkFBTSxFQUFFLFNBQVM7QUFDakIsb0NBQVksRUFBRSxvQkFBb0I7QUFDbEMsa0NBQVUsRUFBRSxZQUFZO0FBQ3hCLGdDQUFRLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZO0FBQy9CLG1DQUFXLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0I7QUFDeEMsb0NBQVksRUFBRSxNQUFNO0FBQ3BCLGdDQUFRLEVBQUUsa0JBQUMsT0FBTyxFQUFFLFdBQVcsRUFBSztBQUNoQyxnQ0FBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBQyxFQUFFLEVBQUUsV0FBVyxFQUFDLENBQUMsQ0FBQztBQUNyRCxtQ0FBTyxBQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxhQUFhLEdBQUksU0FBUyxHQUFHLG9FQUFvRSxDQUFDO3lCQUN2STtxQkFDSjtBQUNELDBCQUFNLEVBQUU7QUFDSixpQ0FBUyxFQUFFLElBQUk7QUFDZixvQ0FBWSxFQUFFLGtCQUFrQjtBQUNoQyxrQ0FBVSxFQUFFLCtDQUErQztBQUMzRCxrQ0FBVSxFQUFFLGtCQUFrQjtBQUM5Qiw2QkFBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsa0JBQWtCO3FCQUNyQztBQUNELDBCQUFNLEVBQUU7QUFDSixnQ0FBUSxFQUFFLE9BQU87QUFDakIsaUNBQVMsRUFBRSxJQUFJO0FBQ2Ysb0NBQVksRUFBRSxRQUFRO0FBQ3RCLGtDQUFVLEVBQUUsMkNBQTJDO0FBQ3ZELGtDQUFVLEVBQUUsY0FBYztBQUMxQixrQ0FBVSxFQUFFLFNBQVM7QUFDckIsc0NBQWMsRUFBRSw2QkFBNkI7QUFDN0Msb0NBQVksRUFBRSwyQkFBMkI7QUFDekMsNkJBQUssRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLGtCQUFrQjtxQkFDckM7aUJBQ0o7QUFDRCxpQkFBQyxFQUFFLENBQUM7YUFDUCxDQUFDO1NBQ0w7O0FBRUQsWUFBSSxFQUFFLGNBQVMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUN2QixnQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU87Z0JBQ3RCLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSTtnQkFDaEIsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7O0FBRXpCLGdCQUFNLFVBQVUsR0FBRyxTQUFiLFVBQVUsQ0FBSSxPQUFPLEVBQUUsRUFBRSxFQUFLO0FBQ2hDLHVCQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRTtBQUN6QixrQ0FBYyxFQUFFO0FBQ1osMkJBQUcsNEJBQTJCLEVBQUUsb0JBQWtCO0FBQ2xELDhCQUFNLEVBQUUsS0FBSztxQkFDaEI7aUJBQ0osQ0FBQyxDQUFDO2FBQ04sQ0FBQzs7QUFFRixtQkFBTyxDQUFDLENBQUMsZ0NBQWdDLEVBQUUsQ0FDdkMsQ0FBQyxDQUFDLDJDQUEyQyxDQUFDLEVBQzlDLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxDQUMxQixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRTtBQUM1QixvQkFBSSxFQUFFLE9BQU8sQ0FBQyxRQUFRO0FBQ3RCLG9CQUFJLEVBQUUsSUFBSTthQUNiLENBQUMsRUFDRixBQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBSSxDQUFDLENBQUMsTUFBTSxHQUNyQixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRTtBQUM1QixvQkFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNO0FBQ3BCLG9CQUFJLEVBQUUsTUFBTTtBQUNaLDJCQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVU7QUFDNUIsOEJBQWMsRUFBRSxJQUFJLENBQUMsZUFBZTthQUN2QyxDQUFDLEVBQ0YsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLEVBQUU7QUFDL0Isb0JBQUksRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ3pDLG9CQUFJLEVBQUUsSUFBSTthQUNiLENBQUMsRUFDRixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRTtBQUM1QixvQkFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNO0FBQ3BCLG9CQUFJLEVBQUUsSUFBSTthQUNiLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLG9DQUFvQyxFQUFFLENBQ3BDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFO0FBQzVCLDRCQUFZLEVBQUUsSUFBSTthQUNyQixDQUFDLEVBQ0YsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLEVBQUU7QUFDbkMsNEJBQVksRUFBRSxJQUFJO2FBQ3JCLENBQUMsRUFDRixBQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBSSxDQUFDLENBQUMsTUFBTSxHQUNyQixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUU7QUFDdkIsc0JBQU0sRUFBRSxNQUFNO0FBQ2QsbUJBQUcsRUFBRSxJQUFJLENBQUMsR0FBRzthQUNoQixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQ3pIN0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDaEQsV0FBTztBQUNILGtCQUFVLEVBQUUsc0JBQVc7QUFDbkIsbUJBQU87QUFDSCwyQkFBVyxFQUFFLENBQUM7QUFDViw2QkFBUyxFQUFFLHVCQUF1QjtBQUNsQyxnQ0FBWSxFQUFFLGdCQUFnQjtpQkFDakMsRUFBRTtBQUNDLDZCQUFTLEVBQUUsY0FBYztBQUN6QixnQ0FBWSxFQUFFLGdCQUFnQjtpQkFDakMsRUFBRTtBQUNDLDZCQUFTLEVBQUUsbUJBQW1CO0FBQzlCLGdDQUFZLEVBQUUsZ0JBQWdCO2lCQUNqQyxFQUFFO0FBQ0MsNkJBQVMsRUFBRSxlQUFlO0FBQzFCLGdDQUFZLEVBQUUsZ0JBQWdCO2lCQUNqQyxDQUFDO2FBQ0wsQ0FBQztTQUNMOztBQUVELFlBQUksRUFBRSxjQUFTLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDdkIsbUJBQU8sQ0FBQyxDQUNKLFFBQVEsRUFDUixDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBUyxLQUFLLEVBQUU7QUFDcEMsdUJBQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FDekIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQzVCLHdCQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7QUFDZix1QkFBRyxFQUFFLElBQUksQ0FBQyxHQUFHO2lCQUNoQixDQUFDLENBQ0wsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxDQUNMLENBQUM7U0FDTDtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbkJuQyxNQUFNLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUU7QUFDMUMsV0FBTztBQUNILFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsZ0JBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJO2dCQUNoQixJQUFJLEdBQUc7QUFDSCxxQ0FBcUIsRUFBRSxJQUFJLENBQUMsZ0JBQWdCO0FBQzVDLGtCQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU87QUFDaEIsb0JBQUksRUFBRSxJQUFJLENBQUMsU0FBUztBQUNwQixxQkFBSyxFQUFFLElBQUksQ0FBQyxLQUFLO2FBQ3BCLENBQUM7O0FBRVIsZ0JBQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyx3Q0FBd0MsRUFBRSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ25HLG1CQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBQyxDQUFDLENBQUM7U0FDbEY7S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7QUM5QmIsTUFBTSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN6QyxXQUFPO0FBQ0gsWUFBSSxFQUFFLGNBQVMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUN2QixnQkFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUM3QixtQkFBTyxDQUFDLENBQUMsMkJBQTJCLEVBQUUsQ0FDbEMsQ0FBQyxDQUFDLDBFQUEwRSxFQUFFLElBQUksR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQ3hHLENBQUMsQ0FBQyx3Q0FBd0MsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxFQUN4RyxDQUFDLENBQUMsb0JBQW9CLEVBQUUsQ0FDcEIsaUJBQWlCLEVBQ2pCLENBQUMsQ0FBQyw4RUFBOEUsR0FBRyxZQUFZLENBQUMsVUFBVSxHQUFHLElBQUksRUFBRSxZQUFZLENBQUMsVUFBVSxDQUFDLENBQzlJLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FDSHpCLE1BQU0sQ0FBQyxDQUFDLENBQUMsbUJBQW1CLEdBQUksQ0FBQyxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNsRCxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBUyxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJO2dCQUNuQixRQUFRLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ3hCLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDckIsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUNwQixJQUFJLEdBQUcsRUFBRTtnQkFDVCxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQzs7QUFFckIsbUJBQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLFVBQUMsR0FBRyxFQUFLO0FBQ3JDLG9CQUFJLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO0FBQ3ZCLHVCQUFHLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7aUJBQy9EO2FBQ0osQ0FBQzs7QUFFRixnQkFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO2dCQUNsRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFdEIsZ0JBQU0sVUFBVSxHQUFHLFNBQWIsVUFBVSxDQUFJLElBQUksRUFBSztBQUN6QixzQkFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQzdCLENBQUM7O0FBRUYsZ0JBQU0sWUFBWSxHQUFHLFNBQWYsWUFBWSxDQUFJLEdBQUcsRUFBSztBQUMxQixpQkFBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ1Qsd0JBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNmLHFCQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDZixDQUFDOztBQUVGLGdCQUFNLFVBQVUsR0FBRyxTQUFiLFVBQVUsQ0FBSSxHQUFHLEVBQUs7QUFDeEIsaUJBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLHdCQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDZixxQkFBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2hCLENBQUM7O0FBRUYsZ0JBQU0sTUFBTSxHQUFHLFNBQVQsTUFBTSxHQUFTO0FBQ2pCLGlCQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDUixpQkFBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUNqRSx1QkFBTyxLQUFLLENBQUM7YUFDaEIsQ0FBQzs7QUFFRixnQkFBTSxNQUFNLEdBQUcsU0FBVCxNQUFNLENBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUs7QUFDcEMsdUJBQU8sQ0FBQyxRQUFRLEdBQUcsWUFBVztBQUMxQiw0QkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hCLHlCQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ2hCLENBQUM7YUFDTCxDQUFDOztBQUVGLG1CQUFPO0FBQ0gsd0JBQVEsRUFBRSxRQUFRO0FBQ2xCLHFCQUFLLEVBQUUsS0FBSztBQUNaLGlCQUFDLEVBQUUsQ0FBQztBQUNKLHNCQUFNLEVBQUUsTUFBTTtBQUNkLHVCQUFPLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO0FBQ2xDLHNCQUFNLEVBQUUsTUFBTTthQUNqQixDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSTtnQkFDaEIsUUFBUSxHQUFHLEFBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFJLHVCQUF1QixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7O0FBRXhFLG1CQUFPLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUN2QixDQUFDLENBQUMsbUNBQW1DLEVBQUU7QUFDbkMsdUJBQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU07YUFDL0IsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQ3BDLENBQUMsQ0FBQyw2REFBNkQsRUFBRTtBQUM3RCxzQkFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2FBQ3RCLEVBQUUsQ0FDQyxDQUFDLENBQUMsYUFBYSxFQUFFO0FBQ2Isd0JBQVEsRUFBRSxJQUFJLENBQUMsTUFBTTthQUN4QixFQUFFLEFBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUksQ0FDcEIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQzNCLENBQUMsQ0FBQyxxREFBcUQsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQzdFLEdBQUcsQUFBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBSSxDQUNsQixDQUFDLENBQUMsc0NBQXNDLEVBQUUsQ0FDdEMsQ0FBQyxDQUFDLEdBQUcsRUFBRSwrQkFBK0IsQ0FBQyxDQUMxQyxDQUFDLENBQ0wsR0FBRyxDQUNBLENBQUMsQ0FBQyx1Q0FBdUMsRUFBRSxDQUN2QyxDQUFDLENBQUMsR0FBRyxFQUFFLGtDQUFrQyxDQUFDLENBQzdDLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxHQUFHLEVBQUUsQ0FDVixDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7QUNqRzlDLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDekMsV0FBTztBQUNILGtCQUFVLEVBQUUsc0JBQVc7QUFDbkIsbUJBQU87QUFDSCx1QkFBTyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQzthQUNyQyxDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYTtnQkFDbEMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJO2dCQUNoQixLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUN4QixJQUFJLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUU7QUFDOUIseUJBQVMsRUFBRSxZQUFZO2FBQzFCLENBQUMsQ0FBQzs7QUFFUCxtQkFBTyxDQUFDLENBQUMsbURBQW1ELEVBQUUsQ0FDMUQsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUNkLENBQUMsQ0FBQyxrREFBa0QsRUFBRSxLQUFLLENBQUMsRUFDNUQsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUNULENBQUMsQ0FBQyxNQUFNLEVBQUU7QUFDTix3QkFBUSxFQUFFLElBQUksQ0FBQyxNQUFNO2FBQ3hCLEVBQUUsQ0FDQyxBQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFO0FBQ3hCLHlCQUFTLEVBQUUsWUFBWTthQUMxQixDQUFDLEdBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQ3BELENBQUMsQ0FBQywwQkFBMEIsRUFDeEIsQ0FBQyxDQUFDLG9KQUFvSixFQUFFO0FBQ3BKLHVCQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNO2FBQy9CLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxFQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FDNUMsQ0FBQyxDQUFDLHNDQUFzQyxFQUFFLENBQ3RDLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQVMsQ0FBQyxFQUFFO0FBQzdCLHVCQUFPLEFBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxZQUFZLEdBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7YUFDcEYsQ0FBQyxDQUNMLENBQUMsR0FBRyxFQUFFLENBRWQsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDekM3QyxNQUFNLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUMzQyxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBUyxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJO2dCQUNuQixRQUFRLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ3hCLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDckIsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUNwQixJQUFJLEdBQUcsRUFBRTtnQkFDVCxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUk7Z0JBQ2hCLEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUTtnQkFDdEIsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLElBQUksSUFBSTtnQkFDdkMsUUFBUSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWxDLGFBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzs7QUFFbkMsZ0JBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzs7QUFFM0YsZ0JBQUksVUFBVSxHQUFHLFNBQWIsVUFBVSxDQUFZLEdBQUcsRUFBRTtBQUMzQixpQkFBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkIsd0JBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNmLHFCQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDaEIsQ0FBQzs7QUFFRixnQkFBSSxNQUFNLEdBQUcsU0FBVCxNQUFNLEdBQWM7QUFDcEIsb0JBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLEVBQUUsQ0FBQztBQUN2QixpQkFBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsWUFBVztBQUNqQyw0QkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2YseUJBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDZixDQUFDLENBQUM7QUFDSCx1QkFBTyxLQUFLLENBQUM7YUFDaEIsQ0FBQzs7QUFFRixnQkFBSSxNQUFNLEdBQUcsU0FBVCxNQUFNLENBQVksRUFBRSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUU7QUFDdkMsdUJBQU8sQ0FBQyxRQUFRLEdBQUcsWUFBVztBQUMxQiw0QkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hCLHlCQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDYiw0QkFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUN4QixDQUFDO2FBQ0wsQ0FBQzs7QUFFRixtQkFBTztBQUNILHdCQUFRLEVBQUUsUUFBUTtBQUNsQixxQkFBSyxFQUFFLEtBQUs7QUFDWixpQkFBQyxFQUFFLENBQUM7QUFDSix3QkFBUSxFQUFFLFFBQVE7QUFDbEIsc0JBQU0sRUFBRSxNQUFNO0FBQ2QsdUJBQU8sRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7QUFDbEMsc0JBQU0sRUFBRSxNQUFNO2FBQ2pCLENBQUM7U0FDTDtBQUNELFlBQUksRUFBRSxjQUFTLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJO2dCQUNoQixRQUFRLEdBQUcsQUFBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUksdUJBQXVCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQzs7QUFFeEUsbUJBQU8sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ3ZCLENBQUMsQ0FBQyxtQ0FBbUMsRUFBRTtBQUNuQyx1QkFBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTTthQUMvQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxBQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FDcEMsQ0FBQyxDQUFDLDZEQUE2RCxFQUFFO0FBQzdELHNCQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07YUFDdEIsRUFBRSxDQUNDLENBQUMsQ0FBQyxhQUFhLEVBQUU7QUFDYix3QkFBUSxFQUFFLElBQUksQ0FBQyxNQUFNO2FBQ3hCLEVBQUUsQUFBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBSSxDQUNwQixDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxBQUFDLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxHQUMzRCxDQUFDLENBQUMscURBQXFELEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEVBQUU7QUFDL0Usd0JBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQzVDLHFCQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTthQUN6QixDQUFDLEdBQUcsRUFBRSxFQUNQLENBQUMsQ0FBQyxxREFBcUQsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQzdFLEdBQUcsQUFBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBSSxDQUNsQixDQUFDLENBQUMsc0NBQXNDLEVBQUUsQ0FDdEMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQzlCLENBQUMsQ0FDTCxHQUFHLENBQ0EsQ0FBQyxDQUFDLHVDQUF1QyxFQUFFLENBQ3ZDLENBQUMsQ0FBQyxHQUFHLEVBQUUsbUNBQW1DLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUNsRSxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsR0FBRyxFQUFFLENBQ1YsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQ25GbkMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN2QyxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBUyxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRWpELG1CQUFPO0FBQ0gsZ0NBQWdCLEVBQUUsZ0JBQWdCO2FBQ3JDLENBQUM7U0FDTDs7QUFFRCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDOztBQUVyQixtQkFBTyxDQUFDLENBQUMsaUVBQWlFLEVBQUUsQ0FDeEUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ3ZCLG9CQUFJLEVBQUUsSUFBSTtBQUNWLG1CQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7YUFDaEIsQ0FBQyxFQUNGLENBQUMsQ0FBQywwRUFBMEUsRUFBRTtBQUMxRSx1QkFBTyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNO2FBQ3hDLENBQUMsRUFDRixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDbkQsb0JBQUksRUFBRSxJQUFJO0FBQ1YsbUJBQUcsRUFBRSxJQUFJLENBQUMsR0FBRzthQUNoQixDQUFDLEdBQUcsRUFBRSxDQUNWLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQzVCN0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3BDLFFBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDcEIsV0FBTztBQUNILGtCQUFVLEVBQUUsb0JBQVMsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztBQUN4QixnQkFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUM3QyxvQkFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBUyxXQUFXLEVBQUU7QUFDOUMsd0JBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDdEMsQ0FBQyxDQUFDO2FBQ047U0FDSjs7QUFFRCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUk7Z0JBQ25CLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUs7Z0JBQ3JCLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztBQUM3QixtQkFBTyxDQUFDLENBQUMsb0JBQW9CLEVBQUUsQ0FDM0IsQ0FBQyxDQUFDLGNBQWMsRUFDWixLQUFLLEVBQUUsR0FDUCxDQUFDLENBQUMsMkNBQTJDLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUN0RCxDQUFDLENBQUMsMEJBQTBCLEVBQUUsQ0FDMUIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxnQkFBZ0IsRUFDZCxJQUFJLENBQUMsU0FBUyxFQUFFLG1CQUNGLEtBQUssQ0FBQyxXQUFXLEVBQUUsV0FBUSxDQUFDLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBTSxLQUFLLENBQUMsV0FBVyxFQUFFLGtCQUFlLENBQ2hJLENBQ0osQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsdUNBQXVDLEVBQUUsQ0FDdkMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFTLElBQUksRUFBRTtBQUNqQyx1QkFBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUU7QUFDNUIsNEJBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtBQUN2Qiw4QkFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO0FBQzNCLHdCQUFJLEVBQUUsSUFBSTtBQUNWLHVCQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUU7aUJBQ2YsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxFQUNGLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxDQUNwQixDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQyw2QkFBNkIsRUFBRSxDQUM3QixJQUFJLENBQUMsU0FBUyxFQUFFLEdBQ2hCLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FDVixDQUFDLENBQUMsOENBQThDLEVBQUU7QUFDOUMsdUJBQU8sRUFBRSxJQUFJLENBQUMsUUFBUTthQUN6QixFQUFFLGVBQWUsQ0FBQyxDQUN0QixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQ0osQ0FDSixDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7Ozs7Ozs7Ozs7OztBQzlDbkMsTUFBTSxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFLO0FBQ3RELFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFDLElBQUksRUFBSztBQUNsQixnQkFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQzVCLGdCQUFnQixHQUFHLFNBQW5CLGdCQUFnQixDQUFJLElBQUksRUFBSztBQUN6QixvQkFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN2Qyw0QkFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO0FBQ2hELDJCQUFPLEVBQUUsSUFBSTtBQUNiLDJCQUFPLEVBQUUsU0FBUztpQkFDckIsQ0FBQyxDQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQ2hCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUNkLEtBQUssQ0FBQztBQUNILDJCQUFPLEVBQUUsTUFBTTtpQkFDbEIsQ0FBQyxDQUNELFVBQVUsRUFBRSxDQUFDLENBQ2IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQ3hCLENBQUM7O0FBRU4sNEJBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUU1QixtQkFBTztBQUNILDZCQUFhLEVBQUUsYUFBYTthQUMvQixDQUFDO1NBQ0w7O0FBRUQsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFLO0FBQ1osbUJBQU8sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ3ZCLENBQUMsQ0FBQyw0RUFBNEUsRUFBRSwyQkFBMkIsQ0FBQyxFQUM1RyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUMsTUFBTSxFQUFLO0FBQ2pDLHVCQUFPLENBQUMsQ0FBQyx1REFBdUQsRUFBRSxDQUM5RCxDQUFDLENBQUMsaUJBQWlCLEVBQUUsQ0FDakIsQ0FBQyxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxFQUN4RSxLQUFLLEVBQUUsTUFBTSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUM3RSxDQUFDLENBQ0wsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQUFBQyxDQUFDOzs7Ozs7Ozs7Ozs7QUN6Q3BELE1BQU0sQ0FBQyxDQUFDLENBQUMsdUJBQXVCLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFLO0FBQ2xELFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFDLElBQUksRUFBSztBQUNsQixnQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVE7Z0JBQ3ZCLGtCQUFrQixHQUFHLFNBQXJCLGtCQUFrQixHQUFTO0FBQ3ZCLG9CQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDMUIsVUFBVSxHQUFHO0FBQ1QsMEJBQU0sRUFBRTtBQUNKLGdDQUFRLEVBQUUsY0FBYztBQUN4Qiw0QkFBSSxFQUFFLE9BQU87cUJBQ2hCO0FBQ0QsOEJBQVUsRUFBRTtBQUNSLGdDQUFRLEVBQUUsY0FBYztBQUN4Qiw0QkFBSSxFQUFFLFlBQVk7cUJBQ3JCO0FBQ0QsMEJBQU0sRUFBRTtBQUNKLGdDQUFRLEVBQUUsWUFBWTtBQUN0Qiw0QkFBSSxFQUFFLGdCQUFnQjtxQkFDekI7QUFDRCxpQ0FBYSxFQUFFO0FBQ1gsZ0NBQVEsRUFBRSxjQUFjO0FBQ3hCLDRCQUFJLEVBQUUsWUFBWTtxQkFDckI7QUFDRCw0QkFBUSxFQUFFO0FBQ04sZ0NBQVEsRUFBRSxZQUFZO0FBQ3RCLDRCQUFJLEVBQUUsVUFBVTtxQkFDbkI7QUFDRCx5QkFBSyxFQUFFO0FBQ0gsZ0NBQVEsRUFBRSxFQUFFO0FBQ1osNEJBQUksRUFBRSxVQUFVO3FCQUNuQjtBQUNELCtCQUFXLEVBQUU7QUFDVCxnQ0FBUSxFQUFFLEVBQUU7QUFDWiw0QkFBSSxFQUFFLFlBQVk7cUJBQ3JCO0FBQ0QsNEJBQVEsRUFBRTtBQUNOLGdDQUFRLEVBQUUsY0FBYztBQUN4Qiw0QkFBSSxFQUFFLFVBQVU7cUJBQ25CO2lCQUNKLENBQUM7O0FBRU4sNkJBQWEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7O0FBRXpDLHVCQUFPLGFBQWEsQ0FBQzthQUN4QjtnQkFDRCxVQUFVLEdBQUcsU0FBYixVQUFVLEdBQVM7O0FBRWYsdUJBQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDdEcsQ0FBQztBQUNOLG1CQUFPO0FBQ0gsdUJBQU8sRUFBRSxPQUFPO0FBQ2hCLDZCQUFhLEVBQUUsa0JBQWtCLEVBQUU7QUFDbkMsZ0NBQWdCLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDO0FBQzFELDhCQUFjLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO0FBQ3RELDBCQUFVLEVBQUUsVUFBVTthQUN6QixDQUFDO1NBQ0w7O0FBRUQsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFLO0FBQ1osZ0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPO2dCQUN0QixRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDcEMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQjtnQkFDeEMsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7O0FBRXpDLG1CQUFPLENBQUMsQ0FBQyxxRUFBcUUsRUFBRSxDQUM1RSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQ0wsQ0FBQyxDQUFDLHFDQUFxQyxFQUFFLENBQ3JDLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQzdDLENBQUMsQ0FBQyxNQUFNLEVBQUU7QUFDTix5QkFBTyxhQUFhLENBQUMsUUFBUTthQUNoQyxFQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxPQUFPLENBQUMsc0JBQXNCLEdBQUcsWUFBWSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUUsRUFBRSxHQUFHLENBQ3JHLENBQUMsRUFBRyxDQUFBLFlBQU07QUFDUCxvQkFBSSxPQUFPLENBQUMsWUFBWSxFQUFFO0FBQ3RCLDJCQUFPLENBQ0gsQ0FBQyxDQUFDLHlDQUF5QyxFQUFFLENBQ3pDLENBQUMsQ0FBQyxhQUFhLEVBQUU7QUFDYiw2QkFBSyxFQUFFO0FBQ0gsaUNBQUssRUFBRSxDQUFDLFFBQVEsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLFFBQVEsQ0FBQSxHQUFJLEdBQUc7eUJBQ2pEO3FCQUNKLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQywyQ0FBMkMsRUFBRSxDQUMzQyxDQUFDLENBQUMsd0RBQXdELEVBQUUsWUFBWSxDQUFDLEVBQ3pFLENBQUMsQ0FBQyxzREFBc0QsRUFBRSxRQUFRLEdBQUcsR0FBRyxDQUFDLENBQzVFLENBQUMsRUFDRixDQUFDLENBQUMsMkNBQTJDLEVBQUUsQ0FDM0MsQ0FBQyxDQUFDLHdEQUF3RCxFQUFFLFlBQVksQ0FBQyxFQUN6RSxDQUFDLENBQUMsc0RBQXNELEVBQUUsQ0FDdEQsS0FBSyxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FDN0MsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsMkNBQTJDLEVBQUUsQ0FDM0MsQ0FBQyxDQUFDLHdEQUF3RCxFQUFFLFFBQVEsQ0FBQyxFQUNyRSxDQUFDLENBQUMsc0RBQXNELEVBQUUsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQ3pGLENBQUMsRUFDRixDQUFDLENBQUMsMkNBQTJDLEVBQUUsQ0FDMUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FDNUIsQ0FBQyxDQUFDLHdEQUF3RCxFQUFFLGFBQWEsQ0FBQyxFQUMxRSxDQUFDLENBQUMsc0RBQXNELEVBQUUsY0FBYyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUM5RyxHQUFHLENBQ0MsQ0FBQyxDQUFDLHdEQUF3RCxFQUFFLFFBQVEsQ0FBQyxFQUNyRSxDQUFDLENBQUMsc0RBQXNELEVBQUUsZ0JBQWdCLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FDbEgsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUM7aUJBQ0w7QUFDRCx1QkFBTyxFQUFFLENBQUM7YUFDYixDQUFBLEVBQUUsQ0FDTixDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxBQUFDLENBQUM7OztBQzVIeEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxZQUFZLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDcEMsV0FBTztBQUNILFlBQUksRUFBRSxjQUFTLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDeEIsbUJBQU8sQ0FBQyxDQUFDLHNCQUFzQixFQUFFLENBQzdCLENBQUMsQ0FBQyxnREFBZ0QsRUFBRSxDQUNoRCxDQUFDLENBQUMsaUNBQWlDLEdBQUcsT0FBTyxDQUFDLFdBQVcsR0FBRyxhQUFhLENBQUMsQ0FDN0UsQ0FBQyxFQUNGLENBQUMsQ0FBQyw4QkFBOEIsRUFBRSxDQUM5QixDQUFDLENBQUMsNEVBQTRFLEVBQUUsQ0FDNUUsQ0FBQyxDQUFDLHFDQUFxQyxHQUFHLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FDNUYsQ0FBQyxFQUNGLENBQUMsQ0FBQyx3Q0FBd0MsRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQ2xFLENBQUMsQ0FBQyx3Q0FBd0MsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQzFJLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQ2xCekIsTUFBTSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzlDLFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFTLElBQUksRUFBRTtBQUN2QixnQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUk7Z0JBQ25CLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDeEIsSUFBSSxHQUFHLEVBQUU7OztBQUVULGlCQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ3JCLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDcEIsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2xCLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDO2dCQUM1QyxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU07Z0JBQ3BCLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDbEIsU0FBUyxHQUFHLEVBQUU7Z0JBQ2QsU0FBUyxHQUFHLEVBQUU7Z0JBQ2QsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUU7Z0JBQ2pCLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTTtnQkFDeEIsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNO2dCQUN2QixXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVc7Z0JBQzlCLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUztnQkFDN0IsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjO2dCQUNwQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVE7Z0JBQzNCLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7QUFFcEQscUJBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDNUIsZ0JBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzdDLGlCQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7O0FBRWpDLHFCQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLGdCQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3QyxpQkFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUUzQixnQkFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFakcsZ0JBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUV4RyxnQkFBSSxVQUFVLEdBQUcsU0FBYixVQUFVLENBQVksSUFBSSxFQUFFO0FBQzVCLG9CQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ2pCLHdCQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxFQUFFO0FBQ2xDLDBCQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7cUJBQ2pDLENBQUMsQ0FBQztBQUNILGdDQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQ3pCLE1BQU07QUFDSCx5QkFBSyxDQUFDO0FBQ0YsK0JBQU8sRUFBRSx3QkFBd0I7cUJBQ3BDLENBQUMsQ0FBQztpQkFDTjtBQUNELHdCQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDbEIsQ0FBQzs7QUFFRixnQkFBTSxLQUFLLEdBQUcsU0FBUixLQUFLLEdBQWM7QUFDckIseUJBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3hDLENBQUM7O0FBRUYsZ0JBQUksTUFBTSxHQUFHLFNBQVQsTUFBTSxHQUFjO0FBQ3BCLG9CQUFJLEtBQUssRUFBRSxFQUFFO0FBQ1Qsd0JBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQzdDLHdCQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDM0IsNEJBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUM7QUFDbEMsaUNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO3FCQUM1QyxNQUFNO0FBQ0gsZ0NBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNmLDZCQUFLLENBQUM7QUFDRixtQ0FBTyxFQUFFLFVBQVU7eUJBQ3RCLENBQUMsQ0FBQztxQkFDTjtpQkFDSjtBQUNELHVCQUFPLEtBQUssQ0FBQzthQUNoQixDQUFDOztBQUVGLGdCQUFJLE1BQU0sR0FBRyxTQUFULE1BQU0sQ0FBWSxFQUFFLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRTtBQUN2Qyx1QkFBTyxDQUFDLFFBQVEsR0FBRyxZQUFXO0FBQzFCLDRCQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEIseUJBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNiLHlCQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ2IsQ0FBQzthQUNMLENBQUM7O0FBRUYsZ0JBQUksY0FBYyxHQUFHLFNBQWpCLGNBQWMsQ0FBWSxJQUFJLEVBQUU7QUFDaEMsMkJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsQixpQkFBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ2QsQ0FBQzs7QUFFRixpQkFBSyxFQUFFLENBQUM7O0FBRVIsbUJBQU87QUFDSCx3QkFBUSxFQUFFLFFBQVE7QUFDbEIsMkJBQVcsRUFBRSxXQUFXO0FBQ3hCLDhCQUFjLEVBQUUsY0FBYztBQUM5QixxQkFBSyxFQUFFLEtBQUs7QUFDWix5QkFBUyxFQUFFLFNBQVM7QUFDcEIseUJBQVMsRUFBRSxTQUFTO0FBQ3BCLHFCQUFLLEVBQUUsS0FBSztBQUNaLHNCQUFNLEVBQUUsTUFBTTtBQUNkLHVCQUFPLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO0FBQ2xDLHNCQUFNLEVBQUUsTUFBTTtBQUNkLHNCQUFNLEVBQUUsTUFBTTthQUNqQixDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSTtnQkFDaEIsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2xCLFFBQVEsR0FBRyxBQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUksdUJBQXVCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQzs7QUFFcEcsbUJBQU8sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ3ZCLENBQUMsQ0FBQyxtQ0FBbUMsRUFBRTtBQUNuQyx1QkFBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTTthQUMvQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxBQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FDcEMsQ0FBQyxDQUFDLDZEQUE2RCxFQUFFO0FBQzdELHNCQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07YUFDdEIsRUFBRSxDQUNDLENBQUMsQ0FBQyxhQUFhLEVBQUU7QUFDYix3QkFBUSxFQUFFLElBQUksQ0FBQyxNQUFNO2FBQ3hCLEVBQUUsQUFBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBSSxDQUNwQixBQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FDZCxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFTLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDeEMsb0JBQUksR0FBRyxHQUFHLFNBQU4sR0FBRyxHQUFjO0FBQ2pCLHdCQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNyQix3QkFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7aUJBQzFDLENBQUM7QUFDRixvQkFBSSxRQUFRLEdBQUcsQUFBQyxLQUFLLENBQUMsRUFBRSxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQSxBQUFDLEdBQUksSUFBSSxHQUFHLEtBQUssQ0FBQzs7QUFFL0UsdUJBQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUNqQixDQUFDLENBQUMsVUFBVSxHQUFHLEtBQUssR0FBRyx3REFBd0QsR0FBRyxLQUFLLENBQUMsRUFBRSxHQUFHLElBQUksSUFBSSxBQUFDLFFBQVEsR0FBSSxXQUFXLEdBQUcsRUFBRSxDQUFBLEFBQUMsRUFBRTtBQUNqSSwyQkFBTyxFQUFFLEdBQUc7aUJBQ2YsQ0FBQyxFQUNGLENBQUMsQ0FBQyw0QkFBNEIsR0FBRyxLQUFLLEdBQUcsSUFBSSxFQUFFLElBQUksR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQzdFLENBQUMsQ0FBQzthQUNOLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQ2YsQ0FBQyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsRUFDMUIsQ0FBQyxDQUFDLHFEQUFxRCxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FDN0UsR0FBRyxBQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFJLENBQ2xCLENBQUMsQ0FBQyxzQ0FBc0MsRUFBRSxDQUN0QyxDQUFDLENBQUMsR0FBRyxFQUFFLGtDQUFrQyxDQUFDLENBQzdDLENBQUMsQ0FDTCxHQUFHLENBQ0EsQ0FBQyxDQUFDLHVDQUF1QyxFQUFFLENBQ3ZDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUMvQixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsR0FBRyxFQUFFLENBQ1YsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7Ozs7Ozs7Ozs7OztBQ3ZJN0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsR0FBSSxDQUFDLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2pELFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFTLElBQUksRUFBRTtBQUN2QixnQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUk7Z0JBQ25CLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDeEIsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUNyQixJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ3BCLEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUTtnQkFDdEIsSUFBSSxHQUFHLEVBQUU7Z0JBQ1QsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7O0FBRXJCLG1CQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxVQUFDLEdBQUcsRUFBSztBQUNyQyxvQkFBSSxDQUFDLENBQUMsaUJBQWlCLEVBQUUsRUFBRTtBQUN2Qix1QkFBRyxDQUFDLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO2lCQUMvRDthQUNKLENBQUM7O0FBRUYsZ0JBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDNUUsV0FBVyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUN4QixhQUFhLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFL0IsZ0JBQU0sWUFBWSxHQUFHLFNBQWYsWUFBWSxDQUFJLEdBQUcsRUFBSztBQUMxQiw2QkFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3Qix3QkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2YscUJBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNmLENBQUM7QUFDRixnQkFBTSxVQUFVLEdBQUcsU0FBYixVQUFVLENBQUksR0FBRyxFQUFLO0FBQ3hCLGlCQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2Qix3QkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2YscUJBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNoQixDQUFDOztBQUVGLGdCQUFNLE1BQU0sR0FBRyxTQUFULE1BQU0sR0FBUztBQUNqQixvQkFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFdBQVcsRUFBRSxDQUFDO0FBQzFCLGlCQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUN4Qyx1QkFBTyxLQUFLLENBQUM7YUFDaEIsQ0FBQzs7QUFFRixnQkFBTSxNQUFNLEdBQUcsU0FBVCxNQUFNLENBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUs7QUFDcEMsdUJBQU8sQ0FBQyxRQUFRLEdBQUcsWUFBVztBQUMxQiw0QkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hCLHlCQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ2hCLENBQUM7YUFDTCxDQUFDOztBQUVGLG1CQUFPO0FBQ0gsd0JBQVEsRUFBRSxRQUFRO0FBQ2xCLHFCQUFLLEVBQUUsS0FBSztBQUNaLDZCQUFhLEVBQUUsYUFBYTtBQUM1QixpQkFBQyxFQUFFLENBQUM7QUFDSiwyQkFBVyxFQUFFLFdBQVc7QUFDeEIsc0JBQU0sRUFBRSxNQUFNO0FBQ2QsdUJBQU8sRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7QUFDbEMsc0JBQU0sRUFBRSxNQUFNO2FBQ2pCLENBQUM7U0FDTDtBQUNELFlBQUksRUFBRSxjQUFTLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJO2dCQUNoQixRQUFRLEdBQUcsQUFBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUksdUJBQXVCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQzs7QUFFeEUsbUJBQU8sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ3ZCLENBQUMsQ0FBQyxtQ0FBbUMsRUFBRTtBQUNuQyx1QkFBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTTthQUMvQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxBQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FDcEMsQ0FBQyxDQUFDLDZEQUE2RCxFQUFFO0FBQzdELHNCQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07YUFDdEIsRUFBRSxDQUNDLENBQUMsQ0FBQyxhQUFhLEVBQUU7QUFDYix3QkFBUSxFQUFFLElBQUksQ0FBQyxNQUFNO2FBQ3hCLEVBQUUsQUFBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBSSxDQUNwQixDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsRUFDM0IsQ0FBQyxDQUFDLDhDQUE4QyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEVBQUU7QUFDN0csd0JBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDO0FBQy9DLHFCQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRTthQUM1QixDQUFDLEVBQ0YsQ0FBQyxDQUFDLHFEQUFxRCxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FDN0UsR0FBRyxBQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFJLENBQ2xCLENBQUMsQ0FBQyxzQ0FBc0MsRUFBRSxDQUN0QyxDQUFDLENBQUMsR0FBRyxFQUFFLDZCQUE2QixDQUFDLENBQ3hDLENBQUMsQ0FDTCxHQUFHLENBQ0EsQ0FBQyxDQUFDLHVDQUF1QyxFQUFFLENBQ3ZDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQy9CLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxHQUFHLEVBQUUsQ0FDVixDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7QUNuRzlDLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDekMsV0FBTztBQUNILFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsZ0JBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ3hCLFNBQVMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7QUFFckYsbUJBQU8sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ3ZCLENBQUMsQ0FBQyw0RUFBNEUsRUFBRSxZQUFZLENBQUMsRUFDN0YsQ0FBQyxDQUFDLHNDQUFzQyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEdBQUcsQ0FDbEQsTUFBTSxHQUFHLE1BQU0sQ0FBQyxFQUFFLEVBQ2xCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFDUCxrQkFBa0IsR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUMvRCxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ1AsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsU0FBUyxHQUFHLEtBQUssSUFBSSxNQUFNLENBQUMscUJBQXFCLElBQUksU0FBUyxDQUFBLEFBQUMsQ0FBQyxFQUMxRixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ1AsMEJBQTBCLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixFQUN6RCxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ1AsYUFBYSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQ3JDLEdBQUcsc0JBQXNCLENBQUMsQ0FDOUIsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDdEI3QyxNQUFNLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNsRCxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBUyxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZO2dCQUNoQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2xCLG9CQUFJLEVBQUUsWUFBWSxDQUFDLE9BQU87QUFDMUIsb0JBQUksRUFBRSxrQkFBa0I7YUFDM0IsRUFBRTtBQUNDLG9CQUFJLEVBQUUsWUFBWSxDQUFDLGlCQUFpQjtBQUNwQyxvQkFBSSxFQUFFLHNCQUFzQjthQUMvQixFQUFFO0FBQ0Msb0JBQUksRUFBRSxZQUFZLENBQUMsV0FBVztBQUM5QixvQkFBSSxFQUFFLG1CQUFtQjthQUM1QixFQUFFO0FBQ0Msb0JBQUksRUFBRSxZQUFZLENBQUMsVUFBVTtBQUM3QixvQkFBSSxFQUFFLGNBQWM7YUFDdkIsRUFBRTtBQUNDLG9CQUFJLEVBQUUsWUFBWSxDQUFDLFVBQVU7QUFDN0Isb0JBQUksRUFBRSxpQkFBaUI7YUFDMUIsRUFBRTtBQUNDLG9CQUFJLEVBQUUsWUFBWSxDQUFDLFVBQVU7QUFDN0Isb0JBQUksRUFBRSxnQkFBZ0I7YUFDekIsRUFBRTtBQUNDLG9CQUFJLEVBQUUsWUFBWSxDQUFDLGFBQWE7QUFDaEMsb0JBQUksRUFBRSxZQUFZO2FBQ3JCLENBQUMsRUFBRSxVQUFTLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDckIsb0JBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7QUFDL0Msd0JBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUM5Qix3QkFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztBQUN4RCwyQkFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUM1Qjs7QUFFRCx1QkFBTyxJQUFJLENBQUM7YUFDZixFQUFFLEVBQUUsQ0FBQyxDQUFDOztBQUVYLG1CQUFPO0FBQ0gsNkJBQWEsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUM7YUFDckQsQ0FBQztTQUNMOztBQUVELFlBQUksRUFBRSxjQUFTLElBQUksRUFBRTtBQUNqQixtQkFBTyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDdkIsQ0FBQyxDQUFDLDRFQUE0RSxFQUFFLHdCQUF3QixDQUFDLEVBQ3pHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVMsTUFBTSxFQUFFO0FBQ3BDLHVCQUFPLENBQUMsQ0FBQyx1REFBdUQsRUFBRSxDQUM5RCxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FDekMsQ0FBQyxFQUNGLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FDeEIsQ0FBQyxDQUNMLENBQUMsQ0FBQzthQUNOLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDeERuQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3hDLFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQ3JDLG1CQUFPLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUN2QixDQUFDLENBQUMsNEVBQTRFLEVBQUUsbUJBQW1CLENBQUMsRUFDcEcsQ0FBQyxDQUFDLHNDQUFzQyxFQUFFLENBQ3RDLFdBQVcsR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN0RCxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ1AsVUFBVSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQzNELENBQUMsQ0FBQyxJQUFJLENBQUMsRUFDUCwwQkFBMEIsSUFBSSxZQUFZLENBQUMsZUFBZSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUEsQUFBQyxFQUMzRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ1AsV0FBVyxJQUFJLFlBQVksQ0FBQyxTQUFTLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQSxBQUFDLEVBQ3RELENBQUMsQ0FBQyxJQUFJLENBQUMsRUFDUCxnQkFBZ0IsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUMxQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ1AsU0FBUyxHQUFHLFlBQVksQ0FBQyxlQUFlLEVBQ3hDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFDUCxXQUFXLEVBQ1gsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUNQLFlBQVksQ0FBQyxHQUFHLEVBQ2hCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFDUCxRQUFRLEdBQUcsWUFBWSxDQUFDLE9BQU8sRUFDL0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUNQLGFBQWEsSUFBSSxZQUFZLENBQUMsWUFBWSxJQUFJLFlBQVksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFBLEFBQUMsRUFDdEYsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFHLENBQUEsWUFBVztBQUNqQixvQkFBSSxZQUFZLENBQUMsY0FBYyxFQUFFO0FBQzdCLDJCQUFPLENBQUMsQ0FBQyxDQUFDLHlCQUF5QixFQUFFLGlCQUFpQixDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztpQkFDNUY7YUFDSixDQUFBLEVBQUUsQ0FDTixDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7Ozs7Ozs7Ozs7O0FDekJ6QixNQUFNLENBQUMsQ0FBQyxDQUFDLGVBQWUsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUM7QUFDekMsV0FBTztBQUNILGtCQUFVLEVBQUUsc0JBQVU7QUFDbEIsbUJBQU87QUFDSCx1QkFBTyxFQUFFO0FBQ0wseUJBQUssRUFBRTtBQUNILGdDQUFRLEVBQUUsVUFBVTtBQUNwQixvQ0FBWSxFQUFFLFdBQVc7QUFDekIsa0NBQVUsRUFBRSx3QkFBd0I7QUFDcEMsa0NBQVUsRUFBRSxpQkFBaUI7QUFDN0IsbUNBQVcsRUFBRSxjQUFjO0FBQzNCLDZCQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJO3FCQUN2QjtBQUNELDhCQUFVLEVBQUU7QUFDUixnQ0FBUSxFQUFFLGdCQUFnQjtBQUMxQixpQ0FBUyxFQUFFLElBQUk7QUFDZixvQ0FBWSxFQUFFLFVBQVU7QUFDeEIsa0NBQVUsRUFBRSwrQ0FBK0M7QUFDM0Qsc0NBQWMsRUFBRSxnQ0FBZ0M7QUFDaEQsb0NBQVksRUFBRSxtQ0FBbUM7QUFDakQsa0NBQVUsRUFBRSxrQkFBa0I7QUFDOUIsa0NBQVUsRUFBRSxJQUFJO0FBQ2hCLDZCQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJO3FCQUN2QjtpQkFDSjthQUNKLENBQUM7U0FDTDs7QUFFRCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFDO0FBQ3RCLGdCQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTztnQkFDdEIsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJO2dCQUNoQixPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQzs7QUFFM0IsZ0JBQU0sVUFBVSxHQUFHLFNBQWIsVUFBVSxDQUFJLE9BQU8sRUFBRSxFQUFFLEVBQUs7QUFDaEMsdUJBQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFO0FBQ3pCLGtDQUFjLEVBQUU7QUFDWiwyQkFBRyxjQUFhLEVBQUUsa0JBQWdCO0FBQ2xDLDhCQUFNLEVBQUUsTUFBTTtxQkFDakI7aUJBQ0osQ0FBQyxDQUFDO2FBQ04sQ0FBQzs7QUFFRixtQkFBTyxDQUFDLENBQUMsZ0NBQWdDLEVBQUUsQ0FDdkMsQ0FBQyxDQUFDLDJDQUEyQyxDQUFDLEVBQzlDLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxDQUMxQixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsRUFBRTtBQUM5QixvQkFBSSxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDeEMsb0JBQUksRUFBRSxJQUFJO2FBQ2IsQ0FBQyxFQUNGLEFBQUMsSUFBSSxDQUFDLGNBQWMsR0FDaEIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsRUFBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDLENBQUMsR0FBRyxFQUFFLENBQ25GLENBQUMsRUFDRixDQUFDLENBQUMsb0NBQW9DLEVBQUUsQ0FDcEMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsd0JBQXdCLEVBQUU7QUFDcEMsb0JBQUksRUFBRSxJQUFJO2FBQ2IsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7QUN0RWpDLE1BQU0sQ0FBQyxDQUFDLENBQUMsYUFBYSxHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN4QyxXQUFPO0FBQ0gsWUFBSSxFQUFFLGNBQVMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUN2QixtQkFBTyxDQUFDLENBQ0osUUFBUSxFQUFFLENBQ04sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FDakMsQ0FBQyxDQUNMLENBQ0osQ0FBQztTQUNMO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7QUNabkMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDakMsV0FBTztBQUNILFlBQUksRUFBRSxjQUFTLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDckIsbUJBQU8sQ0FBQyxDQUFDLG1CQUFtQixFQUFFLENBQzFCLENBQUMsQ0FBQyxnREFBZ0QsRUFBRSxDQUNoRCxDQUFDLENBQUMsdUJBQXVCLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUN2RixDQUFDLEVBQ0YsQ0FBQyxDQUFDLDhCQUE4QixFQUFFLENBQzlCLENBQUMsQ0FBQyw0RUFBNEUsRUFBRSxDQUM1RSxDQUFDLENBQUMsMkNBQTJDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQ2hHLENBQUMsRUFDRixDQUFDLENBQUMsb0JBQW9CLEVBQUUsV0FBVyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsRUFDOUMsQ0FBQyxDQUFDLHdDQUF3QyxFQUFFLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQ25FLElBQUksQ0FBQyxlQUFlLENBQ3ZCLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTHpCLE1BQU0sQ0FBQyxDQUFDLENBQUMsY0FBYyxHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQ2pDLFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQy9CLG1CQUFPLENBQUMsQ0FBQywyQ0FBMkMsRUFBRSxDQUNsRCxDQUFDLG9DQUFpQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLEdBQUcsY0FBYyxHQUFHLEVBQUUsQ0FBQSxnQ0FBMEIsUUFBUSxDQUFDLEVBQUUsVUFDcEgsQ0FDSSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQ0wsUUFBUSxDQUFDLElBQUksRUFDYixDQUFDLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUNwRCxDQUFDLENBQ0wsQ0FBQyxDQUNQLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNqQnZCLE1BQU0sQ0FBQyxDQUFDLENBQUMsc0JBQXNCLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBSztBQUNwRCxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBQyxJQUFJLEVBQUs7QUFDbEIsZ0JBQUksUUFBUSxZQUFBLENBQUM7QUFDYixnQkFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZCLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFO2dCQUNuQixlQUFlLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLGNBQWMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFO2dCQUN6QixXQUFXLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQzVCLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDakQsWUFBWSxHQUFHLFNBQWYsWUFBWSxHQUFTO0FBQ2pCLG9CQUFJLEFBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxHQUFJLGNBQWMsRUFBRSxFQUFFO0FBQzVDLG1DQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3RCOztBQUVELCtCQUFlLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdkMsd0JBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUMsaUJBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUNkO2dCQUNELFdBQVcsR0FBRyxTQUFkLFdBQVcsQ0FBSSxFQUFFLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBSztBQUMxQyx1QkFBTyxDQUFDLFFBQVEsR0FBRzsyQkFBTSxhQUFhLENBQUMsUUFBUSxDQUFDO2lCQUFBLENBQUM7YUFDcEQ7Z0JBQ0QsVUFBVSxHQUFHLFNBQWIsVUFBVSxHQUFTO0FBQ2Ysd0JBQVEsR0FBRyxXQUFXLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQy9DLENBQUM7O0FBRVIsdUJBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDOUIsMEJBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQiw4QkFBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM1Qix3QkFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUMzQixDQUFDLENBQUM7O0FBRUgsc0JBQVUsRUFBRSxDQUFDOztBQUViLG1CQUFPO0FBQ0gsMEJBQVUsRUFBRSxVQUFVO0FBQ3RCLDJCQUFXLEVBQUUsV0FBVztBQUN4Qix3QkFBUSxFQUFFLFFBQVE7QUFDbEIsOEJBQWMsRUFBRSxjQUFjO2FBQ2pDLENBQUM7U0FDTDs7QUFFRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUEsR0FBSSxDQUFDLEVBQUU7QUFDNUYsb0JBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUU7b0JBQzFCLE9BQU8sR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUM7b0JBQ2pELFlBQVksMkJBQXlCLFFBQVEsQ0FBQyxTQUFTLCtCQUE0QixDQUFDOztBQUV4Rix1QkFBTyxDQUFDLENBQUMsc0NBQXNDLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBQyxFQUFFLENBQ3pFLENBQUMsQ0FBQywrQ0FBK0MsRUFBRSxDQUMvQyxDQUFDLENBQUMsbUNBQW1DLFVBQVEsT0FBTyxDQUFDLEtBQUssU0FBSSxPQUFPLENBQUMsSUFBSSxTQUFNLEVBQ2hGLENBQUMsQ0FBQyw4Q0FBOEMsRUFBRSxDQUM5QyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBQyxFQUFFLENBQ3pCLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxFQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUN0RSxDQUFDLEVBQ0YsQ0FBQyxDQUFDLDBCQUEwQixFQUFFLEVBQUMsR0FBRyxFQUFFLHVIQUF1SCxFQUFDLENBQUMsRUFDN0osQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFDLElBQUksRUFBRSxZQUFZLEVBQUMsRUFBRSxDQUN6QixDQUFDLENBQUMsMEJBQTBCLEVBQUUsRUFBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLGtCQUFrQixFQUFDLENBQUMsQ0FDekcsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsaUJBQWlCLEVBQUssUUFBUSxDQUFDLElBQUksYUFBVSxFQUMvQyxDQUFDLENBQUMsa0JBQWtCLEVBQUUsQ0FDbEIsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLEVBQUMsSUFBSSxFQUFFLFlBQVksRUFBQyxFQUFFLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FDeEUsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQUM7YUFDTixNQUFNO0FBQ0gsdUJBQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ25CO1NBQ0o7S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQ25GcEQsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ25DLFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLG1CQUFPLENBQUMsWUFDSyxJQUFJLENBQUMsT0FBTyxhQUFRLElBQUksQ0FBQyxFQUFFLFNBQ3BDO0FBQ0ksd0JBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQzdDLHFCQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRTthQUMxQixFQUNELENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFTLElBQUksRUFBRTtBQUMvQix1QkFBTyxDQUFDLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQy9ELENBQUMsQ0FDTCxDQUFDO1NBQ0w7S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FDSm5DLE1BQU0sQ0FBQyxDQUFDLENBQUMsWUFBWSxHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQy9CLFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSztnQkFDbEIsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDdkIsbUJBQU8sQ0FBQyxDQUFDLDJDQUEyQyxFQUFFLENBQ2xELENBQUMsNENBQXlDLEtBQUssQ0FBQyxNQUFNLEdBQUcsRUFBRSxHQUFHLGNBQWMsR0FBRyxFQUFFLENBQUEsaUJBQVcsSUFBSSxVQUFNLENBQ2xHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FDTCxLQUFLLENBQ1IsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDekJ2QixNQUFNLENBQUMsQ0FBQyxDQUFDLGVBQWUsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFO0FBQ3BDLFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLG1CQUFPLENBQUMsQ0FBQyw4QkFBOEIsRUFBRSxDQUNyQyxDQUFDLENBQUMsOEJBQThCLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUNqRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLDJDQUEyQyxFQUFFLENBQzNDLENBQUMsQ0FBQyx3Q0FBd0MsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLGlCQUFpQixFQUFFO0FBQ3pFLHdCQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN6QyxxQkFBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUU7YUFDdEIsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsMkNBQTJDLEVBQUUsQ0FDM0MsQ0FBQyxDQUFDLG1EQUFtRCxFQUFFLEdBQUcsQ0FBQyxDQUM5RCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLDJDQUEyQyxFQUFFLENBQzNDLENBQUMsQ0FBQyxnREFBZ0QsRUFBRTtBQUNoRCx3QkFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDeEMscUJBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFO2FBQ3JCLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDekJiLE1BQU0sQ0FBQyxDQUFDLENBQUMsY0FBYyxHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN6QyxXQUFPO0FBQ0gsWUFBSSxFQUFFLGNBQVMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUN2QixtQkFBTyxDQUFDLENBQUMsOEJBQThCLEVBQUUsQ0FDckMsQ0FBQyxDQUFDLDhCQUE4QixHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFDakUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO0FBQ3BCLGtCQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUs7QUFDZCx1QkFBTyxFQUFFLCtCQUErQjtBQUN4Qyx5QkFBUyxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQ2xCLHVCQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87YUFDeEIsQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQ2RqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFO0FBQy9CLFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLG1CQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDZixDQUFDLENBQUMsaUJBQWlCLEVBQUUsQ0FDakIsQ0FBQyxDQUFDLHdEQUF3RCxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsaUJBQWlCLEVBQUU7QUFDL0Ysd0JBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ3RDLHFCQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRTthQUNuQixDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsaUZBQWlGLENBQUMsQ0FDdkYsQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDaEJiLE1BQU0sQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRTtBQUN0QyxXQUFPO0FBQ0gsWUFBSSxFQUFFLGNBQVMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUN2QixtQkFBTyxDQUFDLENBQUMsOEJBQThCLEVBQUUsQ0FDckMsQ0FBQyxDQUFDLDhCQUE4QixHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFDakUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQywyQ0FBMkMsRUFBRSxDQUMzQyxDQUFDLENBQUMsd0NBQXdDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxpQkFBaUIsRUFBRTtBQUN6RSx3QkFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDekMscUJBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFO2FBQ3RCLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLDJDQUEyQyxFQUFFLENBQzNDLENBQUMsQ0FBQyxtREFBbUQsRUFBRSxHQUFHLENBQUMsQ0FDOUQsQ0FBQyxFQUNGLENBQUMsQ0FBQywyQ0FBMkMsRUFBRSxDQUMzQyxDQUFDLENBQUMsZ0RBQWdELEVBQUU7QUFDaEQsd0JBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3hDLHFCQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRTthQUNyQixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDWGIsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDakMsV0FBTztBQUNILGtCQUFVLEVBQUUsb0JBQUMsSUFBSSxFQUFLO0FBQ2xCLG1CQUFPO0FBQ0gsMEJBQVUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7YUFDeEMsQ0FBQztTQUNMO0FBQ0QsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFFLElBQUksRUFBSztBQUNsQixtQkFBTyxDQUFDLENBQUMsdURBQXVELEVBQUMsQ0FDN0QsQ0FBQyxDQUFDLGdCQUFnQixFQUFFO0FBQ2hCLHVCQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNO2FBQ2xDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUNqQixJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDLGlDQUFpQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUN0RixDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNkekIsTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDckMsV0FBTztBQUNILGtCQUFVLEVBQUUsb0JBQUMsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTztnQkFDeEIsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNsQixLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ3JCLE1BQU0sR0FBRyxTQUFULE1BQU0sR0FBUztBQUNYLG9CQUFJLENBQUMsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBQztBQUN6QiwyQkFBTyxJQUFJLENBQUM7aUJBQ2YsTUFBTTtBQUNILHlCQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDWiwyQkFBTyxLQUFLLENBQUM7aUJBQ2hCO2FBQ0osQ0FBQztBQUNOLG1CQUFPO0FBQ0gscUJBQUssRUFBRSxLQUFLO0FBQ1osc0JBQU0sRUFBRSxNQUFNO0FBQ2QscUJBQUssRUFBRSxLQUFLO2FBQ2YsQ0FBQztTQUNMO0FBQ0QsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFFLElBQUksRUFBSztBQUNsQixnQkFBSSxZQUFZLEdBQUcsQUFBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUksaUJBQWlCLEdBQUcsRUFBRSxDQUFDO0FBQzFELG1CQUFPLENBQUMsQ0FBQyxzREFBc0QsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxJQUFJLEVBQUM7QUFDL0Ysd0JBQVEsRUFBRSxJQUFJLENBQUMsTUFBTTthQUN4QixFQUFDLENBQ0UsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsV0FBUyxZQUFZLDRGQUF5RjtBQUMzRyx3QkFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDekMscUJBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFO2FBQ3RCLENBQUMsRUFDRCxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLGtDQUFrQyxFQUFFLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUNoRixDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxnRUFBZ0UsQ0FBQyxDQUN0RSxDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdEN6QixNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDOUIsV0FBTztBQUNILFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsbUJBQU8sQ0FBQyxDQUFDLGlCQUFpQixFQUFFLENBQ3hCLENBQUMsQ0FBQyxxQkFBcUIsRUFBRSxDQUNyQixDQUFDLENBQUMsd0NBQXdDLEVBQUUsQ0FDeEMsQ0FBQyxDQUFDLG9FQUFvRSxFQUFFO0FBQ3BFLHVCQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNO2FBQ3BDLENBQUMsRUFDRixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNuRCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQy9CakMsTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRTtBQUNsQyxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBUyxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJO2dCQUNuQixJQUFJLEdBQUcsSUFBSTtnQkFDWCxvQkFBb0I7Z0JBQUUsa0JBQWtCO2dCQUFFLFVBQVUsQ0FBQzs7QUFFekQsZ0JBQUksR0FBRyxZQUFXO0FBQ2Qsb0JBQUksT0FBTyxDQUFDLFlBQVksRUFBRTtBQUN0Qiw0QkFBUSxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRTtBQUNqQyw2QkFBSyxNQUFNO0FBQ1AsbUNBQU87QUFDSCw0Q0FBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsVUFBVTtBQUM3QywyQ0FBVyxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsWUFBWTtBQUM5QyxxQ0FBSyxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsZUFBZTs2QkFDOUMsQ0FBQztBQUFBLEFBQ04sNkJBQUssU0FBUztBQUNWLG1DQUFPO0FBQ0gsNENBQVksRUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLGlCQUFpQjtBQUNwRCwyQ0FBVyxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsZ0JBQWdCO0FBQ2xELHFDQUFLLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxVQUFVOzZCQUN6QyxDQUFDO0FBQUEscUJBQ1Q7aUJBQ0o7YUFDSixDQUFDOztBQUVGLGdDQUFvQixHQUFHLFlBQVc7QUFDOUIsd0JBQVEsT0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUU7QUFDeEMseUJBQUssZ0JBQWdCO0FBQ2pCLCtCQUFPLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUFBLEFBQ3ZDLHlCQUFLLGlCQUFpQjtBQUNsQiw0QkFBSSxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUM7QUFDdEIsNEJBQUksUUFBUSxFQUFFO0FBQ1YsbUNBQU8sQ0FBQyxDQUFDLDJFQUEyRSxFQUFFLENBQ2xGLFFBQVEsQ0FBQyxZQUFZLEdBQUcsUUFBUSxHQUFHLFFBQVEsQ0FBQyxXQUFXLEVBQ3ZELENBQUMsQ0FBQyxJQUFJLENBQUMsRUFDUCxRQUFRLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FDcEQsQ0FBQyxDQUFDO3lCQUNOO0FBQ0QsK0JBQU8sRUFBRSxDQUFDO0FBQUEsaUJBQ2pCO2FBQ0osQ0FBQzs7QUFFRiw4QkFBa0IsR0FBRyxZQUFXO0FBQzVCLHdCQUFRLE9BQU8sQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFO0FBQ3hDLHlCQUFLLGdCQUFnQjtBQUNqQiwrQkFBTyxhQUFhLENBQUM7QUFBQSxBQUN6Qix5QkFBSyxpQkFBaUI7QUFDbEIsK0JBQU8saUJBQWlCLENBQUM7QUFBQSxBQUM3QjtBQUNJLCtCQUFPLGNBQWMsQ0FBQztBQUFBLGlCQUM3QjthQUNKLENBQUM7O0FBRUYsc0JBQVUsR0FBRyxZQUFXO0FBQ3BCLHdCQUFRLE9BQU8sQ0FBQyxLQUFLO0FBQ2pCLHlCQUFLLE1BQU07QUFDUCwrQkFBTyxlQUFlLENBQUM7QUFBQSxBQUMzQix5QkFBSyxVQUFVO0FBQ1gsK0JBQU8sZ0JBQWdCLENBQUM7QUFBQSxBQUM1Qix5QkFBSyxTQUFTLENBQUM7QUFDZix5QkFBSyxnQkFBZ0I7QUFDakIsK0JBQU8sZUFBZSxDQUFDO0FBQUEsQUFDM0I7QUFDSSwrQkFBTyxhQUFhLENBQUM7QUFBQSxpQkFDNUI7YUFDSixDQUFDOztBQUVGLG1CQUFPO0FBQ0gsb0NBQW9CLEVBQUUsb0JBQW9CO0FBQzFDLGtDQUFrQixFQUFFLGtCQUFrQjtBQUN0QywwQkFBVSxFQUFFLFVBQVU7YUFDekIsQ0FBQztTQUNMOztBQUVELFlBQUksRUFBRSxjQUFTLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDeEIsbUJBQU8sQ0FBQyxDQUFDLHVCQUF1QixFQUFFLENBQzlCLENBQUMsQ0FBQywwREFBMEQsRUFBRSxDQUMxRCxDQUFDLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQ2xFLENBQUMsRUFDRixDQUFDLENBQUMsd0NBQXdDLEVBQUUsQ0FDeEMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMseUJBQXlCLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUN0RyxDQUFDLEVBQ0YsQ0FBQyxDQUFDLHlEQUF5RCxFQUFFLENBQ3pELElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUM5QixDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7QUMxRmIsTUFBTSxDQUFDLENBQUMsQ0FBQyxlQUFlLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDbEMsV0FBTztBQUNILGtCQUFVLEVBQUUsc0JBQU07QUFDZCxnQkFBSSxtQkFBbUIsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFcEQsbUJBQU87QUFDSCxtQ0FBbUIsRUFBRSxtQkFBbUI7YUFDM0MsQ0FBQztTQUNMO0FBQ0QsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFFLElBQUksRUFBSztBQUNsQixtQkFBUSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLENBQUMsNkRBQTZELEVBQUUsQ0FDbEcsQ0FBQyxDQUFDLGlGQUFpRixFQUFFO0FBQ2pGLHVCQUFPLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU07YUFDM0MsQ0FBQyxFQUNGLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQ3JDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUU7U0FDbkI7S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7QUNsQnpCLE1BQU0sQ0FBQyxDQUFDLENBQUMsWUFBWSxHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUNsQyxXQUFPO0FBQ0gsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFFLElBQUksRUFBSztBQUNsQixnQkFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUU7Z0JBQ2hDLFVBQVUsR0FBRyxTQUFiLFVBQVUsR0FBUztBQUNmLG9CQUFJLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7b0JBQzdFLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVyQyx1QkFBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7YUFDeEMsQ0FBQztBQUNOLGdCQUFJLGFBQWEsR0FBRyxTQUFoQixhQUFhLEdBQVM7QUFDdEIsdUJBQU8sQUFBQyxPQUFPLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxHQUFJLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUN0RixDQUFDLENBQUMsOERBQThELEVBQUUscUJBQXFCLENBQUMsRUFDeEYsQ0FBQyxDQUFDLDBDQUEwQyxFQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFdBQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLFVBQUssVUFBVSxFQUFFLFlBQVMsQ0FDN0osQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUNYLENBQUM7O0FBRUYsbUJBQU8sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ3ZCLENBQUMsQ0FBQyw4QkFBOEIsRUFBRTtBQUM5QixzQkFBTSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUU7YUFDdkIsRUFBRSxDQUNDLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUNqQixDQUFDLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUMzQixDQUFDLEVBQ0YsQ0FBQyxDQUFDLGtDQUFrQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFDeEYsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUNiLENBQUMsQ0FBQyxxQ0FBcUMsRUFBRSxXQUFXLENBQUMsRUFDckQsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQ2hELEdBQUcsRUFBRSxDQUNULENBQUMsRUFDRixDQUFDLENBQUMsNkNBQTZDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxHQUFHLENBQ2hGLENBQUMsQ0FBQyxzREFBc0QsRUFBRSxhQUFhLENBQUMsRUFDeEUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEVBQUU7QUFDN0IsdUJBQU8sRUFBRSxJQUFJLENBQUMsT0FBTztBQUNyQiw2QkFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO2FBQ3BDLENBQUMsRUFBRSxhQUFhLEVBQUUsQ0FDdEIsR0FBRyxDQUNBLENBQUMsQ0FBQyxzREFBc0QsRUFBRSxvQkFBb0IsQ0FBQyxFQUMvRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyw2QkFBNkIsRUFBRSxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsQ0FBQyxFQUNoRSxhQUFhLEVBQUUsQ0FDbEIsQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7QUM1Q25DLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUs7QUFDNUMsUUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDOztBQUUxRCxXQUFPO0FBQ0gsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFFLElBQUksRUFBSztBQUNsQixnQkFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU87Z0JBQ3hCLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQztnQkFDM0QsSUFBSSxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFBLEFBQUMsQ0FBQzs7QUFFMUUsbUJBQU8sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ3ZCLENBQUMsQ0FBQyw2QkFBNkIsRUFBRSxDQUM3QixDQUFDLGlDQUErQixJQUFJLFNBQU07QUFDdEMscUJBQUssRUFBRTtBQUNILHNDQUFrQixXQUFTLE9BQU8sQ0FBQyxXQUFXLE1BQUc7QUFDakQsNkJBQVMsRUFBRSxPQUFPO2lCQUNyQjthQUNKLENBQUMsRUFDRixDQUFDLENBQUMsK0JBQStCLEVBQUUsQ0FDL0IsQ0FBQyxDQUFDLGdHQUFnRyxFQUFFLENBQ2hHLENBQUMsMEJBQXdCLElBQUksU0FBTSxPQUFPLENBQUMsWUFBWSxDQUFDLENBQzNELENBQUMsRUFDRixDQUFDLENBQUMsdUZBQXVGLEVBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsU0FBSSxPQUFPLENBQUMsVUFBVSxDQUFHLEVBQ2hKLENBQUMsQ0FBQyxvRUFBb0UsRUFBRSxDQUNwRSxDQUFDLDBCQUF3QixJQUFJLFNBQU0sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUN2RCxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyx3REFBd0QsRUFBRSxDQUN4RCxDQUFDLENBQUMsd0NBQXdDLEVBQUUsQ0FBQyxDQUFDLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxDQUFDLFNBQU0sT0FBTyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQSxXQUFLLE9BQU8sQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUEsQ0FBRyxDQUFDLENBQy9MLENBQUMsRUFDRixDQUFDLDBCQUF3QixPQUFPLENBQUMsS0FBSyxFQUFJLENBQ3RDLEFBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFlBQVksRUFBRSxRQUFRLEVBQUUsZUFBZSxDQUFDLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUNqRSxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEdBQUcsT0FBTyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEdBQ3BFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsYUFBYSxFQUFFO0FBQ2IscUJBQUssRUFBRTtBQUNILHlCQUFLLEdBQU0sUUFBUSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsUUFBUSxDQUFBLE1BQUk7aUJBQ2pEO2FBQ0osQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLENBQ3JCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsMkNBQTJDLEVBQUUsQ0FDM0MsQ0FBQyxDQUFDLG9DQUFvQyxFQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFJLENBQzdFLENBQUMsRUFDRixDQUFDLENBQUMsb0VBQW9FLEVBQUUsQ0FDcEUsQ0FBQyxDQUFDLHVDQUF1QyxVQUFRLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFHLEVBQ25GLENBQUMsQ0FBQyx3Q0FBd0MsRUFBRSxZQUFZLENBQUMsQ0FDNUQsQ0FBQyxFQUNGLENBQUMsQ0FBQyx3REFBd0QsRUFBRSxPQUFPLENBQUMsVUFBVSxHQUFHLENBQzdFLENBQUMsQ0FBQyx1Q0FBdUMsRUFBSyxnQkFBZ0IsQ0FBQyxLQUFLLFNBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFHLEVBQ2hHLENBQUMsQ0FBQyx3Q0FBd0MsRUFBRSxBQUFDLGdCQUFnQixDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQyxDQUN2RyxHQUFHLENBQ0EsQ0FBQyxDQUFDLHFDQUFxQyxFQUFFLENBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBQyxRQUFRLENBQUMsQ0FBQyxDQUMxRSxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEFBQUMsQ0FBQzs7O0FDOURoRCxNQUFNLENBQUMsQ0FBQyxDQUFDLGVBQWUsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDMUMsV0FBTztBQUNILGtCQUFVLEVBQUUsc0JBQU07QUFDZCxnQkFBTSxZQUFZLEdBQUcsU0FBZixZQUFZLENBQUksRUFBRSxFQUFFLGFBQWEsRUFBSztBQUN4Qyx1QkFBTyxVQUFDLEVBQUUsRUFBRSxhQUFhLEVBQUs7QUFDMUIsd0JBQUksYUFBYSxFQUFFO0FBQUMsK0JBQU87cUJBQUM7QUFDNUIscUJBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztpQkFDZixDQUFDO2FBQ0wsQ0FBQzs7QUFFRixtQkFBTyxFQUFDLFlBQVksRUFBRSxZQUFZLEVBQUMsQ0FBQztTQUN2Qzs7QUFFRCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDN0IsbUJBQU8sQ0FBQyxDQUFDLGdEQUFnRCxHQUFHLE9BQU8sQ0FBQyxTQUFTLEdBQUcseUNBQXlDLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFDLENBQUMsQ0FBQztTQUM3SjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDbEJuQyxNQUFNLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDbEQsV0FBTztBQUNILGtCQUFVLEVBQUUsb0JBQUMsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUM7Z0JBQy9ELFFBQVEsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztBQUM3QiwwQkFBVSxFQUFFLElBQUk7QUFDaEIsK0JBQWUsRUFBRSxJQUFJO2FBQ3hCLENBQUM7Z0JBQ0YsYUFBYSxHQUFHLFNBQWhCLGFBQWEsR0FBd0I7b0JBQXBCLE9BQU8seURBQUcsS0FBSzs7QUFDNUIsdUJBQU8sWUFBTTtBQUNULDRCQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2xDLDBCQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO2lCQUMzQyxDQUFDO2FBQ0wsQ0FBQzs7QUFFTixvQkFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUU5RCxnQkFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxNQUFNLEVBQUU7QUFDN0Isc0JBQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7YUFDM0M7O0FBRUQsbUJBQU87QUFDSCxzQkFBTSxFQUFFLE1BQU07QUFDZCx3QkFBUSxFQUFFLFFBQVE7QUFDbEIsNkJBQWEsRUFBRSxhQUFhO2FBQy9CLENBQUM7U0FDTDtBQUNELFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsZ0JBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDekIsbUJBQU8sQ0FBQyxDQUFDLCtDQUErQyxFQUFFLENBQ3JELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxpQkFBaUIsR0FDN0IsQ0FBQyxDQUFDLDBCQUEwQixFQUFFLENBQzFCLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsd0lBQXdJLEVBQUU7QUFDeEksdUJBQU8sRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFO2FBQ2hDLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxvREFBb0QsRUFBRSxhQUFhLENBQUMsQ0FDekUsQ0FBQyxFQUNGLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMseUhBQXlILEVBQUU7QUFDekgsdUJBQU8sRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQzthQUNwQyxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsc0RBQXNELEVBQUUsV0FBVyxDQUFDLENBQ3pFLENBQUMsQ0FDTCxDQUFDLEdBQUcsRUFBRSxFQUNYLENBQUMsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxVQUFDLFlBQVksRUFBSztBQUNuRSx1QkFBTyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQ3BCLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxDQUMxQixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLGlCQUFpQixHQUFHLFlBQVksQ0FBQyxPQUFPLEdBQUcsSUFBSSxFQUFFLENBQy9DLENBQUMsQ0FBQyxxREFBcUQsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsWUFBWSxDQUFDLHFCQUFxQixHQUFHLG9DQUFvQyxDQUFBLEFBQUMsR0FBRyxnQ0FBZ0MsQ0FBQyxDQUM3TixDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUNqQixDQUFDLENBQUMsb0NBQW9DLEVBQUUsQ0FDcEMsQ0FBQyxDQUFDLGtDQUFrQyxHQUFHLFlBQVksQ0FBQyxPQUFPLEdBQUcsSUFBSSxFQUFFLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRyxZQUFZLENBQUMsaUJBQWlCLEdBQ3hILENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUNuQixLQUFLLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRyxZQUFZLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQy9JLENBQUMsR0FBRyxFQUFFLEVBQ1gsQ0FBQyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUN2RixDQUFDLENBQUMsbUJBQW1CLEVBQUcsWUFBWSxDQUFDLDBCQUEwQixHQUFHLENBQUMsR0FBRyw0QkFBNEIsR0FBRyxZQUFZLENBQUMsMEJBQTBCLEdBQUcsV0FBVyxHQUFHLHVDQUF1QyxDQUFFLENBQ3pNLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUNsQyxDQUFDLENBQUM7YUFDTixDQUFDLENBQUMsRUFDSCxDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLDZCQUE2QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQzlDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLDhDQUE4QyxFQUFFO0FBQ3hFLHVCQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVE7YUFDekIsRUFBRSxlQUFlLENBQUMsR0FDbkIsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUNiLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7QUN4RXBELE1BQU0sQ0FBQyxDQUFDLENBQUMsb0JBQW9CLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBSztBQUNoRCxRQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsd0JBQXdCLENBQUMsQ0FBQzs7QUFFbkUsV0FBTztBQUNILGtCQUFVLEVBQUUsb0JBQUMsSUFBSSxFQUFLO0FBQ2xCLGdCQUFJLElBQUksR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDO2dCQUMzQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUFFLHFCQUFxQixDQUFDLENBQUM7O0FBRWhGLGdCQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUU7QUFDN0IsK0JBQWUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDakM7O0FBRUQsbUJBQU87QUFDSCxvQkFBSSxFQUFFLElBQUk7QUFDViwrQkFBZSxFQUFFLGVBQWU7QUFDaEMsZ0NBQWdCLEVBQUUsZ0JBQWdCO2FBQ3JDLENBQUM7U0FDTDtBQUNELFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsZ0JBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ3hCLFlBQVksR0FBRyxZQUFZLEdBQUcsT0FBTyxDQUFDLEVBQUU7Z0JBQ3hDLFNBQVMsR0FBRyxZQUFZLEdBQUcsT0FBTztnQkFDbEMsYUFBYSxHQUFHLDBCQUEwQixJQUFJLE9BQU8sQ0FBQyxZQUFZLEdBQUcsUUFBUSxHQUFHLEVBQUUsQ0FBQSxBQUFDLENBQUM7QUFDMUYsZ0JBQUksV0FBVyxHQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxHQUFHLENBQUMsQ0FBQyw0Q0FBNEMsRUFBRSxhQUFhLENBQUMsR0FBRyxFQUFFLEFBQUMsQ0FBQzs7QUFFbEgsZ0JBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDOztBQUU5QyxtQkFBTyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQ3JCLENBQUMsQ0FBQyxzQkFBc0IsRUFBRSxDQUN0QixDQUFDLENBQUMsa0NBQWtDLEVBQUUsQ0FDbEMsQ0FBQyxDQUFDLHVFQUF1RSxJQUFJLE9BQU8sQ0FBQyxZQUFZLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxHQUFHLFVBQVUsQ0FBQSxBQUFDLEdBQUcsSUFBSSxFQUFFLENBQzFKLENBQUMsQ0FBQyxtQ0FBbUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRywyQkFBMkIsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFBLEFBQUMsR0FBRyxpQkFBaUIsQ0FBQyxFQUNoSixDQUFDLENBQUMscURBQXFELEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUN0RSxDQUFDLDhEQUE0RCxPQUFPLENBQUMsSUFBSSx3QkFBcUIsQ0FFakcsQ0FBQyxFQUNGLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FDYixDQUFDLENBQUMsdURBQXVELElBQUksQ0FBQyxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxHQUFHLFVBQVUsR0FBRyxFQUFFLENBQUEsQUFBQyxHQUFHLFdBQVcsR0FBRyxZQUFZLEdBQUcsYUFBYSxFQUFFLENBQzVKLENBQUMsQ0FBQyxrQ0FBa0MsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQzFFLENBQUMsRUFBRyxPQUFPLENBQUMsWUFBWSxHQUFHLENBQ3hCLENBQUMsQ0FBQyx5REFBeUQsR0FBRyxTQUFTLEdBQUcsVUFBVSxHQUFHLElBQUksRUFBRSxDQUN6RixDQUFDLENBQUMsaUNBQWlDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUMzRSxDQUFDLEVBQ0YsQ0FBQyxDQUFDLDJFQUEyRSxHQUFHLFNBQVMsR0FBRyxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQ3pHLENBQUMsQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLENBQy9HLENBQUMsQ0FDTCxHQUFHLEVBQUUsQ0FDVCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLG1CQUFtQixFQUFFLENBQ2xCLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLGlEQUFpRCxFQUFFO0FBQy9FLHVCQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNO2FBQ3ZDLEVBQUUsQ0FDQyxDQUFDLENBQUMsK0JBQStCLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUMxRSxDQUFDLEVBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxDQUNqRCxDQUFDLENBQUMsa0JBQWtCLEVBQUUsQ0FDakIsQUFBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLElBQUksT0FBTyxDQUFDLGFBQWEsR0FBSSxDQUNoRCxDQUFDLENBQUMsdUJBQXVCLEdBQUcsYUFBYSxHQUFHLFdBQVcsR0FBRyxTQUFTLEdBQUcsU0FBUyxHQUFHLElBQUksRUFBRSxRQUFRLENBQUMsRUFDakcsQ0FBQyxDQUFDLHFCQUFxQixHQUFHLGFBQWEsR0FBRyxXQUFXLEdBQUcsU0FBUyxHQUFHLE9BQU8sR0FBRyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQ3ZHLEdBQUcsRUFBRSxFQUNOLENBQUMsQ0FBQyw0QkFBNEIsR0FBRyxhQUFhLEdBQUcsV0FBVyxHQUFHLFNBQVMsR0FBRyxjQUFjLEdBQUcsSUFBSSxFQUFFLFdBQVcsQ0FBQyxFQUM5RyxDQUFDLENBQUMsc0JBQXNCLEdBQUcsYUFBYSxHQUFHLFdBQVcsR0FBRyxTQUFTLEdBQUcsUUFBUSxHQUFHLElBQUksRUFBRSxDQUNsRixPQUFPLEVBQUUsV0FBVyxDQUN2QixDQUFDLEVBQ0YsQ0FBQyxDQUFDLHVCQUF1QixHQUFHLGFBQWEsR0FBRyxXQUFXLEdBQUcsU0FBUyxHQUFHLFNBQVMsR0FBRyxJQUFJLEVBQUUsQ0FDcEYsV0FBVyxFQUFFLFdBQVcsQ0FDM0IsQ0FBQyxFQUNGLENBQUMsQ0FBQyxxQkFBcUIsR0FBRyxhQUFhLEdBQUcsV0FBVyxHQUFHLFNBQVMsR0FBRyxPQUFPLEdBQUcsSUFBSSxFQUFFLGlCQUFpQixDQUFDLEVBQ3RHLENBQUMsQ0FBQyxpQ0FBaUMsR0FBRyxhQUFhLEdBQUcsV0FBVyxHQUFHLFNBQVMsR0FBRyxTQUFTLEdBQUcsSUFBSSxFQUFFLENBQzlGLGFBQWEsRUFBRSxXQUFXLENBQzdCLENBQUMsRUFDRixDQUFDLENBQUMscUNBQXFDLEdBQUcsYUFBYSxHQUFHLFdBQVcsR0FBRyxTQUFTLEdBQUcsYUFBYSxHQUFHLElBQUksRUFBRSxZQUFZLENBQUMsRUFBRyxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sSUFBSyxPQUFPLENBQUMsWUFBWSxJQUFJLE9BQU8sQ0FBQyxLQUFLLEtBQUssVUFBVSxBQUFDLElBQUksT0FBTyxDQUFDLGFBQWEsR0FBRyxDQUNuTyxDQUFDLENBQUMsd0NBQXdDLEdBQUcsYUFBYSxHQUFHLFdBQVcsR0FBRyxTQUFTLEdBQUcsZ0JBQWdCLEdBQUcsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUMzSCxHQUFHLEVBQUUsRUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsQ0FDOUIsQ0FBQyxDQUFDLGtDQUFrQyxHQUFHLGFBQWEsR0FBRyxXQUFXLEdBQUcsU0FBUyxHQUFHLFVBQVUsR0FBRyxJQUFJLEVBQUUsQ0FDaEcsQ0FBQyxDQUFDLDRCQUE0QixDQUFDLEVBQUUsVUFBVSxDQUM5QyxDQUFDLENBQ0wsR0FBRyxFQUFFLENBQ1QsQ0FBQyxDQUNMLENBQUMsR0FBRyxFQUFFLEVBQ04sQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLENBQ3JCLENBQUMsQ0FBQyx1QkFBdUIsRUFDdEIsT0FBTyxDQUFDLElBQUksS0FBSyxLQUFLLEdBQUcsQ0FDckIsT0FBTyxDQUFDLEtBQUssS0FBSyxPQUFPLEdBQUcsQ0FBQyxDQUFDLG1DQUFtQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLEdBQUcscUJBQXFCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFDekksT0FBTyxDQUFDLEtBQUssS0FBSyxVQUFVLEdBQUcsQ0FBQyxDQUFDLG1DQUFtQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLEdBQUcsWUFBWSxFQUFFLENBQy9GLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUMsMEJBQTBCLENBQUMsQ0FDekYsQ0FBQyxHQUFHLEVBQUUsQ0FDVixHQUFHLENBQ0MsT0FBTyxDQUFDLEtBQUssS0FBSyxPQUFPLEdBQUcsQ0FBQyxDQUFDLG1DQUFtQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLEdBQUcsaUJBQWlCLEVBQUUsQ0FDakcsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxDQUN6RixDQUFDLEdBQUcsRUFBRSxDQUNWLENBQ0QsQ0FDTCxHQUFHLENBQ0MsT0FBTyxDQUFDLElBQUksS0FBSyxNQUFNLEdBQUcsQ0FDdkIsQ0FBQyxDQUFDLHVCQUF1QixFQUN0QixDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsK0RBQStELEdBQUcsT0FBTyxDQUFDLEVBQUUsR0FBRyw2QkFBNkIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUUsQ0FDdk0sR0FBRyxFQUFFLENBQ1QsQ0FDSixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsb0NBQW9DLEVBQUU7QUFDcEMsdUJBQU8sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTTthQUN4QyxFQUFFLENBQ0MsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQzdCLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQUFBQyxDQUFDOzs7Ozs7Ozs7Ozs7O0FDOUdoRCxNQUFNLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBSztBQUMxQyxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBQyxJQUFJLEVBQUs7QUFDbEIsZ0JBQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNyQyxNQUFNLEdBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsRUFBRSxBQUFDO2dCQUU1RCxZQUFZLEdBQUcsU0FBZixZQUFZLEdBQVM7QUFDakIsdUJBQU8sQ0FBQztBQUNKLDZCQUFTLEVBQUUsc0JBQXNCO0FBQ2pDLCtCQUFXLEVBQUUsb0JBQW9CO0FBQ2pDLDhCQUFVLEVBQUUsb0JBQW9CO0FBQ2hDLG9DQUFnQixFQUFFLE1BQU07QUFDeEIsc0NBQWtCLEVBQUUsTUFBTTtBQUMxQix3Q0FBb0IsRUFBRSxxQkFBcUI7QUFDM0Msd0JBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFDLElBQUksRUFBSztBQUMxQiwrQkFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3FCQUM3QixDQUFDO2lCQUNMLENBQUMsQ0FBQzthQUNOO2dCQUNELFdBQVcsR0FBRyxTQUFkLFdBQVcsQ0FBSSxPQUFPLEVBQUUsYUFBYSxFQUFLO0FBQ3RDLG9CQUFJLENBQUMsYUFBYSxFQUFFO0FBQ2hCLHdCQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVyQyx3QkFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ2hCLDhCQUFNLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDNUIsbUNBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzt5QkFDM0IsQ0FBQztBQUNGLGdDQUFRLEVBQUUsWUFBWSxFQUFFO3FCQUMzQixDQUFDLENBQUM7aUJBQ047YUFFSixDQUFDOztBQUVOLG1CQUFPO0FBQ0gsMkJBQVcsRUFBRSxXQUFXO2FBQzNCLENBQUM7U0FDTDtBQUNELFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsbUJBQU8sQ0FBQyxDQUFDLHlDQUF5QyxFQUFFLENBQ2hELENBQUMsQ0FBQyxxRUFBcUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQ3BGLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsK0JBQStCLEVBQUUsQ0FDL0IsQ0FBQyxDQUFDLCtDQUErQyxFQUFFO0FBQy9DLHNCQUFNLEVBQUUsSUFBSSxDQUFDLFdBQVc7YUFDM0IsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNyQ3JDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUM5QyxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBQyxJQUFJLEVBQUs7QUFDbEIsZ0JBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDMUIsU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFM0IsZ0JBQU0sVUFBVSxHQUFHLFNBQWIsVUFBVSxDQUFJLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDekIsb0JBQUksR0FBRyxHQUFHLFNBQVMsRUFBRTs7O0FBRWpCLGlCQUFDLEdBQUcsQUFBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUNqRSxDQUFDLEdBQUcsQUFBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRXRFLG9CQUFJLENBQUMsR0FBRyxDQUFDLEVBQUM7QUFDTiwyQkFBTyxDQUFDLENBQUMsQ0FBQztpQkFDYjtBQUNELG9CQUFJLENBQUMsR0FBRyxDQUFDLEVBQUM7QUFDTiwyQkFBTyxDQUFDLENBQUM7aUJBQ1o7QUFDRCx1QkFBTyxDQUFDLENBQUM7YUFDWixDQUFDOztBQUVGLGdCQUFNLFNBQVMsR0FBRyxTQUFaLFNBQVMsQ0FBSSxHQUFHLEVBQUs7QUFDdkIsb0JBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ3pCLElBQUksWUFBQSxDQUFDO0FBQ1Qsb0JBQUksU0FBUyxFQUFFLEtBQUssR0FBRyxFQUFDO0FBQ3BCLHdCQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO2lCQUNwQyxNQUFNO0FBQ0gsNkJBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNmLHdCQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDM0M7O0FBRUQscUJBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNqQyxDQUFDOztBQUVGLHFCQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7QUFFaEQsZ0JBQUksSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsRUFBQztBQUMxQix5QkFBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDbkQ7O0FBRUQsbUJBQU87QUFDSCxxQkFBSyxFQUFFLEtBQUs7QUFDWix5QkFBUyxFQUFFLFNBQVM7YUFDdkIsQ0FBQztTQUNMO0FBQ0QsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFFLElBQUksRUFBSztBQUNsQixnQkFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQzlCLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ2hDLG1CQUFPLENBQUMsQ0FBQyxnQ0FBZ0MsRUFBRSxDQUN2QyxDQUFDLENBQUMsOERBQThELEVBQzVELENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQUMsT0FBTyxFQUFFLEdBQUcsRUFBSztBQUM1QixvQkFBSSxJQUFJLEdBQUcsU0FBUCxJQUFJOzJCQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDO2lCQUFBLENBQUM7QUFDckMsdUJBQU8sQ0FBQyxDQUFDLHFEQUFxRCxFQUFFLENBQzVELENBQUMsQ0FBQywyQ0FBMkMsRUFBRTtBQUMzQywyQkFBTyxFQUFFLElBQUk7aUJBQ2hCLEVBQUUsQ0FDSSxPQUFPLFFBQUssQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQ3RDLENBQUMsQ0FDTCxDQUFDLENBQUM7YUFDTixDQUFDLENBQ0wsRUFBRSxDQUFDLENBQUMsNkJBQTZCLEVBQzlCLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFVBQUMsT0FBTyxFQUFLO0FBQ3JCLHVCQUFPLENBQUMsQ0FBQyxrQkFBa0IsRUFDdkIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsVUFBQyxHQUFHLEVBQUs7O0FBRXBCLHVCQUFHLEdBQUcsQUFBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDeEQsMkJBQU8sQ0FBQyxDQUFDLHFEQUFxRCxFQUFFLENBQzVELENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQ2hCLENBQUMsQ0FBQztpQkFDTixDQUFDLENBQ0wsQ0FBQzthQUNMLENBQUMsQ0FDTCxDQUNKLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7QUNuR3BELE1BQU0sQ0FBQyxDQUFDLENBQUMsYUFBYSxHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDdEMsV0FBTztBQUNILFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsZ0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7O0FBRTNCLGdCQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBQztBQUN6Qix1QkFBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDeEI7O0FBRUQsbUJBQU8sQ0FBQyxDQUFDLGlCQUFpQixFQUFFLENBQ3hCLENBQUMsQ0FBQyw2QkFBNkIsR0FBRyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFDakQsQ0FBQyxDQUFDLHNDQUFzQyxFQUFFLENBQ3RDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FDZCxDQUFDLENBQUMsc0VBQXNFLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUN4RyxDQUFDLENBQUMsdURBQXVELEVBQUUsQUFBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLEdBQUksQ0FDMUUsTUFBTSxFQUNOLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQ3RCLEdBQUcsRUFBRSxDQUFDLENBQ1YsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMseUJBQXlCLEVBQUUsQ0FDekIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUNkLENBQUMsQ0FBQyxxQkFBcUIsRUFBRSxDQUNyQixDQUFDLENBQUMsa0NBQWtDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUU7QUFDbEUsdUJBQU8sRUFBRSxPQUFPO2FBQ25CLENBQUMsQ0FBQyxFQUNILENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUU7QUFDOUMsdUJBQU8sRUFBRSxPQUFPO0FBQ2hCLDJCQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7YUFDaEMsQ0FBQyxDQUFDLENBQ04sQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDcEM3QyxNQUFNLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDekMsV0FBTztBQUNILGtCQUFVLEVBQUUsc0JBQU07QUFDZCxnQkFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRWhELG1CQUFPO0FBQ0gsK0JBQWUsRUFBRSxlQUFlO2FBQ25DLENBQUM7U0FDTDtBQUNELFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsZ0JBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPO2dCQUN4QixPQUFPLEdBQUcsT0FBTyxFQUFFLENBQUMsT0FBTyxJQUFJLEVBQUMsYUFBYSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFDLENBQUM7O0FBRWpFLG1CQUFPLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxDQUMxQixPQUFPLEVBQUUsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLGdDQUFnQyxFQUFFO0FBQzdELHFCQUFLLEVBQUUsb0JBQW9CO2FBQzlCLEVBQUUsQ0FDQyxDQUFDLENBQUMsOENBQThDLEdBQUcsT0FBTyxFQUFFLENBQUMsZUFBZSxHQUFHLHNDQUFzQyxDQUFDLENBQ3pILENBQUMsR0FBRyxDQUFDLENBQUMsZ0JBQWdCLEVBQUU7QUFDckIscUJBQUssRUFBRSx1QkFBdUIsR0FBRyxPQUFPLEVBQUUsQ0FBQyxjQUFjLEdBQUcsSUFBSTthQUNuRSxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUN2QyxDQUFDLENBQUMsNkNBQTZDLEVBQUUsQ0FDNUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUNsQixDQUFDLGlIQUErRyxPQUFPLENBQUMsYUFBYSxTQUFNLENBQ3BJLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFNLE9BQU8sQ0FBQyxJQUFJLFVBQUssT0FBTyxDQUFDLGFBQWEsQ0FDekUsQ0FBQyxHQUFHLEVBQUUsRUFFWCxDQUFDLG9HQUFrRyxPQUFPLEVBQUUsQ0FBQyxXQUFXLFNBQU0sQ0FDMUgsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsR0FBRyxFQUN4QixPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQzFCLENBQUMsRUFDRixDQUFDLENBQUMsd0RBQXdELEVBQUU7QUFDeEQsdUJBQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU07YUFDdkMsRUFBRSxjQUFjLENBQUMsRUFBRyxJQUFJLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFO0FBQ3pFLHVCQUFPLEVBQUUsT0FBTztBQUNoQiwrQkFBZSxFQUFFLElBQUksQ0FBQyxlQUFlO2FBQ3hDLENBQUMsR0FBRyxFQUFFLENBQ1YsQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQzFDN0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUNwQyxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBQyxJQUFJLEVBQUs7QUFDbEIsZ0JBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPO2dCQUN0QixpQkFBaUIsR0FBRyxTQUFwQixpQkFBaUIsR0FBUztBQUN0QixvQkFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJO29CQUMzQixNQUFNLEdBQUc7QUFDTCwyQkFBTyxFQUFFLE9BQU87aUJBQ25CO29CQUNELElBQUksR0FBRztBQUNILDhCQUFVLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFO0FBQzNFLHFDQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWE7cUJBQ3BDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNaLCtDQUEyQixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLDZCQUE2QixFQUFFLE1BQU0sQ0FBQztBQUNqRixvQ0FBZ0IsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxNQUFNLENBQUM7QUFDN0QsNEJBQVEsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7QUFDL0MscUNBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtxQkFDcEMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNYLCtCQUFXLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQztBQUNuRCw0QkFBUSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUM7aUJBQ2hELENBQUM7O0FBRVIsb0JBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxVQUFVLEVBQUU7QUFDM0QsMkJBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUN6Qjs7QUFFRCx1QkFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDckIsQ0FBQzs7QUFFUixhQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzs7QUFFckIsbUJBQU87QUFDSCxpQ0FBaUIsRUFBRSxpQkFBaUI7YUFDdkMsQ0FBQztTQUNMOztBQUVELFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsbUJBQU8sQ0FBQyxDQUFDLDREQUE0RCxFQUFFLENBQ25FLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FDZCxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FDOUQsQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FDakM3QyxNQUFNLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQ3BDLFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUN4QixJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUk7Z0JBQ25CLFVBQVUsR0FBRyxBQUFDLElBQUksS0FBSyxLQUFLLEdBQUksdUJBQXVCLEdBQUcsd0JBQXdCO2dCQUNsRixTQUFTLEdBQUcsQUFBQyxJQUFJLEtBQUssS0FBSyxHQUFJLHdCQUF3QixHQUFHLG9CQUFvQjtnQkFDOUUsSUFBSSxHQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLGNBQWMsR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQUFBQztnQkFDL0UsT0FBTyxHQUFHLFNBQVYsT0FBTyxDQUFJLEVBQUUsRUFBSztBQUNkLHVCQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtBQUMxQixzQkFBRSxFQUFFLEVBQUU7QUFDTix3QkFBSSxFQUFFLEFBQUMsSUFBSSxLQUFLLEtBQUssZ0ZBQStFLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsU0FBTSw2R0FBNkc7QUFDelEseUJBQUssRUFBRSxHQUFHO2lCQUNiLENBQUMsQ0FBQzthQUNOLENBQUM7O0FBRU4sbUJBQU8sQ0FBQyxPQUFLLElBQUksYUFBVSxDQUN2QixDQUFDLENBQUMsMkNBQTJDLEVBQUUsQ0FDM0MsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBYSxVQUFVLHNCQUFpQixHQUFHLEVBQUUsQ0FDdkUsQ0FBQyxFQUNGLENBQUMsQ0FBQyw4Q0FBOEMsRUFBRSxDQUM5QyxDQUFDLENBQUMsdUNBQXVDLEVBQUUsVUFBVSxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQ2xGLENBQUMsQ0FBQyxtREFBbUQsRUFBRSxDQUNuRCxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsU0FBUyxHQUFHLEVBQUUsRUFDcEMsT0FBTyxDQUFDLCtFQUErRSxDQUFDLENBQzNGLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDekM3QyxNQUFNLENBQUMsQ0FBQyxDQUFDLFlBQVksR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQzFDLFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFDLElBQUksRUFBSztBQUNsQixnQkFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDO2dCQUM3RCxRQUFRLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7QUFDN0IsMEJBQVUsRUFBRSxJQUFJO2FBQ25CLENBQUMsQ0FBQzs7QUFFUCxvQkFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRXZDLGdCQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLE1BQU0sRUFBRTtBQUM3QixzQkFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQzthQUMzQzs7QUFFRCxtQkFBTztBQUNILHNCQUFNLEVBQUUsTUFBTTtBQUNkLHdCQUFRLEVBQUUsUUFBUTthQUNyQixDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTTtnQkFDcEIsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7O0FBRW5DLG1CQUFPLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxDQUNqQyxDQUFDLENBQUMsNkJBQTZCLEVBQUUsQ0FDNUIsT0FBTyxDQUFDLGlCQUFpQixHQUFHLENBQ3pCLEFBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQ2pCLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLCtCQUErQixFQUFFLENBQy9ELENBQUMsQ0FBQyxpREFBaUQsRUFBRSx1UEFBdVAsQ0FBQyxDQUNoVCxDQUFDLEdBQUcsRUFBRSxHQUFJLEVBQUUsRUFDYixDQUFDLENBQUMsMEJBQTBCLEVBQUUsQ0FDMUIsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQ25CLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLG1EQUFnRCxPQUFPLENBQUMsRUFBRSxxQkFBaUIsbUJBQW1CLENBQUMsQ0FDbkcsQ0FBQyxFQUNGLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUN0QixDQUFDLENBQ0wsR0FBRyxFQUFFLEVBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDekMsdUJBQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNmLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUNuQixDQUFDLENBQUMsaUJBQWlCLEVBQUUsQ0FDakIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUNQLENBQUMsQ0FBQyxnQ0FBZ0MsRUFBRSxDQUNoQyxDQUFDLENBQUMsbURBQW1ELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsRUFDcEYsQ0FBQyxDQUFDLHNFQUFzRSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxpQ0FBaUMsQ0FBQyxDQUNuTyxDQUFDLEVBQ0YsQ0FBQyxDQUFDLDRCQUE0QixDQUFDLENBQ2xDLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQ3RCLENBQUMsQ0FBQzthQUNOLENBQUMsRUFDRixDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLDZCQUE2QixFQUFFLENBQzVCLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUNiLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxtQkFBbUIsR0FBRyxDQUFDLENBQUMsOENBQThDLEVBQUU7QUFDekYsdUJBQU8sRUFBRSxJQUFJLENBQUMsUUFBUTthQUN6QixFQUFFLGVBQWUsQ0FBQyxHQUNuQixDQUFDLENBQUMsTUFBTSxFQUFFLENBQ2pCLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7QUNqRXBELE1BQU0sQ0FBQyxDQUFDLENBQUMsb0JBQW9CLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRTtBQUN6QyxXQUFPO0FBQ0gsWUFBSSxFQUFFLGNBQVMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUN2QixnQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUM1QixtQkFBTyxDQUFDLENBQUMsOEVBQThFLEVBQUUsQ0FDckYsQ0FBQyxDQUFDLHFDQUFxQyxFQUFFLG1EQUFtRCxDQUFDLEVBQzdGLENBQUMsQ0FBQyxxQ0FBcUMsRUFBRSwyRUFBMkUsQ0FBQyxFQUNySCxDQUFDLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUMvQyxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7QUNEYixNQUFNLENBQUMsQ0FBQyxDQUFDLGVBQWUsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQzdDLFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFDLElBQUksRUFBSztBQUNsQixnQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU87Z0JBQ3RCLFFBQVEsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztBQUM3QiwwQkFBVSxFQUFFLElBQUk7YUFDbkIsQ0FBQztnQkFDRixpQkFBaUIsR0FBRyxTQUFTLEdBQUcsT0FBTyxFQUFFLENBQUMsRUFBRTtnQkFDNUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUNqQixlQUFlLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQy9CLGNBQWMsR0FBRyxTQUFqQixjQUFjLEdBQVM7QUFDbkIsb0JBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDZCxxQkFBQyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUNqRCwyQkFBTyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztpQkFDL0I7QUFDRCxvQkFBSSxVQUFVLEdBQUcsT0FBTyxFQUFFLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDO0FBQ3RJLDhCQUFVLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRTtpQkFDM0IsQ0FBQyxDQUFDO0FBQ0gsaUJBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFNUMsaUJBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUNoQiwyQkFBTyxFQUFFLENBQUMsV0FBVyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDOztBQUUvQyx3QkFBSSxPQUFPLEVBQUUsQ0FBQyxXQUFXLEVBQUU7QUFDdkIsdUNBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QixrQ0FBVSxDQUFDLFlBQU07QUFDYiwyQ0FBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3ZCLDZCQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7eUJBQ2QsRUFBRSxJQUFJLENBQUMsQ0FBQztxQkFDWixNQUFNO0FBQ0gsdUNBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDMUI7aUJBQ0osQ0FBQyxDQUFDO2FBQ04sQ0FBQzs7QUFFTixhQUFDLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDdEQsb0JBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRWxDLG1CQUFPO0FBQ0gsaUJBQUMsRUFBRSxDQUFDO0FBQ0osOEJBQWMsRUFBRSxjQUFjO0FBQzlCLCtCQUFlLEVBQUUsZUFBZTthQUNuQyxDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLFNBQVMsR0FBRyxBQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxHQUFJLEVBQUUsR0FBRyxrQ0FBa0M7Z0JBQ2hGLFdBQVcsR0FBRyxBQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxHQUFJLHlDQUF5QyxHQUFHLHFDQUFxQztnQkFDMUgsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixJQUFJLEtBQUs7Z0JBQ2pELE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDOztBQUUzQixtQkFBTyxDQUFDLHVCQUFxQixTQUFTLEVBQUksQ0FDdEMsQ0FBQyxvQkFBa0IsV0FBVyxVQUFLLE9BQU8sRUFBRSxDQUFDLFdBQVcsR0FBRyxxQkFBcUIsR0FBRyxxQkFBcUIsQ0FBQSw2QkFBMkI7QUFDL0gsdUJBQU8sRUFBRSxJQUFJLENBQUMsY0FBYzthQUMvQixFQUFFLENBQ0UsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLGFBQWEsR0FBRyxDQUFDLENBQUMsb0JBQW9CLEVBQUUsQ0FDaEQsQ0FBQyxXQUFRLGdCQUFnQixHQUFHLGtCQUFrQixHQUFHLEVBQUUsQ0FBQSxFQUFJLE9BQU8sRUFBRSxDQUFDLFdBQVcsR0FBRyxpQkFBaUIsR0FBRyxhQUFhLENBQUMsQ0FDcEgsQ0FBQyxDQUNMLENBQUMsRUFBRyxJQUFJLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFO0FBQ3pELHVCQUFPLEVBQUUsOEVBQThFO2FBQzFGLENBQUMsR0FBRyxFQUFFLENBQ1YsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQ3pFcEQsTUFBTSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDdkMsV0FBTztBQUNILFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7OztBQUdsQixnQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUMzQixtQkFBTyxDQUFDLENBQUMsNEJBQTRCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsVUFBQyxNQUFNLEVBQUs7QUFDM0Usb0JBQUkseUJBQXlCLEdBQUcsWUFBWSxHQUFHLE9BQU8sRUFBRSxDQUFDLEVBQUUsR0FBRywrQkFBK0IsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDOztBQUUxRyx1QkFBTyxDQUFDLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsV0FBVyxHQUFHLGNBQWMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxzQkFBc0IsR0FBRyxXQUFXLEdBQUcsRUFBRSxDQUFBLEFBQUMsQ0FBQSxBQUFDLEdBQUcsaURBQWlELElBQUksT0FBTyxFQUFFLENBQUMsc0JBQXNCLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLHlCQUF5QixHQUFHLGFBQWEsQ0FBQSxBQUFDLEdBQUcsSUFBSSxFQUFFLENBQy9TLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxDQUNwQixDQUFDLENBQUMsb0NBQW9DLEVBQUUsVUFBVSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxFQUN2RyxDQUFDLENBQUMsdUNBQXVDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFHLE1BQU0sQ0FBQyxxQkFBcUIsR0FBRyxDQUFDLEdBQUcsQ0FDaEksTUFBTSxDQUFDLHFCQUFxQixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsb0RBQW9ELEVBQUUsQ0FDeEYsQ0FBQyxDQUFDLGdEQUFnRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLGdDQUFnQyxFQUFFLGtDQUFrQyxDQUFDLENBQUMsQ0FDdkssQ0FBQyxHQUFHLEVBQUUsRUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUN2RCxDQUFDLENBQUMsd0NBQXdDLEVBQUUsVUFBVSxDQUFDLENBQzFELENBQUMsR0FBRyxDQUFDLENBQUMsaUJBQWlCLEVBQUUsQ0FDdEIsQ0FBQyxDQUFDLDZDQUE2QyxFQUFFLENBQzdDLENBQUMsQ0FBQyxzQkFBc0IsRUFBRSxVQUFVLENBQUMsRUFDckMsSUFBSSxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsR0FBRyxlQUFlLENBQzVGLENBQUMsQ0FDTCxDQUFDLENBQ0wsR0FBRyxFQUFFLENBQ1QsQ0FBQyxFQUNGLENBQUMsQ0FBQyxrQ0FBa0MsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUM5RyxDQUFDLENBQUMsbUJBQW1CLEVBQUUsQ0FDbkIsQ0FBQyxDQUFDLEdBQUcsRUFBRSx5QkFBeUIsQ0FBQyxFQUNqQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQzdDLENBQUMsR0FBRyxFQUFFLEVBQUksT0FBTyxFQUFFLENBQUMsc0JBQXNCLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUN4RSxDQUFDLENBQUMsMkJBQTJCLEVBQUUsQ0FDM0IsQ0FBQyxDQUFDLCtDQUErQyxFQUFFLDJCQUEyQixDQUFDLENBQ2xGLENBQUMsR0FBRyxFQUFFLENBQ2QsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxDQUFDLENBQUM7U0FDUDtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDckNuQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDaEMsV0FBTztBQUNILFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsZ0JBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVO2dCQUM5QixHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUc7Z0JBQ2QsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksc0NBQXNDLENBQUM7O0FBRXJFLGdCQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztBQUMxRCx1QkFBTyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQ2QsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUNkLEFBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFJLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxDQUNsRyxDQUFDLENBQUMsNENBQTRDLEVBQUUsQ0FDNUMsQ0FBQyxDQUFDLG1DQUFtQyxFQUFFLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FDM0QsQ0FBQyxFQUNGLENBQUMsQ0FBQywyQ0FBMkMsRUFBRSxDQUMzQyxDQUFDLHlEQUF1RCxHQUFHLFNBQUksVUFBVSxDQUFDLElBQUksU0FBTSxXQUFXLENBQUMsQ0FDbkcsQ0FBQyxDQUNMLENBQUMsR0FBRyxFQUFFLEVBQ1AsVUFBVSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxFQUFFLFVBQUMsT0FBTyxFQUFLO0FBQ3ZGLDJCQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRTtBQUM5QiwrQkFBTyxFQUFFLE9BQU87QUFDaEIsMkJBQUcsRUFBRSxHQUFHO3FCQUNYLENBQUMsQ0FBQztpQkFDTixDQUFDLENBQUMsQ0FDTixDQUFDLENBQ0wsQ0FBQyxDQUFDO2FBQ04sTUFBTTtBQUNILHVCQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNuQjtTQUNKO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7QUMvQm5DLE1BQU0sQ0FBQyxDQUFDLENBQUMsZUFBZSxHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQ2xDLFdBQU87QUFDSCxrQkFBVSxFQUFFLHNCQUFNO0FBQ2QsbUJBQU87QUFDSCw0QkFBWSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQzthQUMxQyxDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLG1CQUFPLENBQUMsQ0FBQyxZQUFZLEVBQUU7QUFDbkIscUJBQUssRUFBRSxpQkFBaUI7YUFDM0IsRUFBRSxDQUNDLENBQUMsQ0FBQywyQ0FBMkMsRUFBRSxDQUMzQyxDQUFDLENBQUMsaURBQWlELEVBQUU7QUFDakQsdUJBQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU07YUFDdkMsRUFBRSxRQUFRLENBQUMsRUFDWixDQUFDLENBQUMsdURBQXVELEVBQUUsMEJBQTBCLENBQUMsQ0FDekYsQ0FBQyxFQUNGLENBQUMsQ0FBQyxzRUFBc0UsRUFBRSxDQUN0RSxDQUFDLENBQUMsd2RBQXdkLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFNBQVMsR0FBRywrREFBK0QsQ0FBQyxDQUMzakIsQ0FBQyxFQUNGLENBQUMsQ0FBQyxxRUFBcUUsRUFBRSxDQUNyRSxDQUFDLENBQUMsd1RBQXdULEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFNBQVMsR0FBRyx1Q0FBdUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxHQUFHLHdFQUF3RSxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxTQUFTLEdBQUcsZ0NBQWdDLENBQUMsQ0FDbGlCLENBQUMsRUFDRixDQUFDLENBQUMsZ0hBQWdILEVBQUU7QUFDaEgsdUJBQU8sRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU07YUFDcEMsRUFBRSxXQUFXLENBQUMsRUFBRyxJQUFJLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFDLGdDQUFnQyxFQUFFLENBQ3hFLENBQUMsQ0FBQyx1REFBdUQsRUFBRSw4QkFBOEIsQ0FBQyxFQUMxRixDQUFDLENBQUMsU0FBUyxFQUFFLENBQ1QsQ0FBQyxDQUFDLG1IQUFtSCxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUcsa0RBQWtELENBQUMsQ0FDbE0sQ0FBQyxFQUNGLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FDYixDQUFDLENBQUMseURBQXlELEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsR0FBRyx5Q0FBeUMsQ0FBQyxDQUMvSCxDQUFDLENBQ0wsQ0FBQyxHQUFHLEVBQUUsRUFDUCxDQUFDLENBQUMsbUpBQW1KLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLFNBQVMsR0FBRyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxHQUFHLHFCQUFxQixFQUFFLENBQ3JQLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLGNBQWMsQ0FDM0MsQ0FBQyxFQUNGLENBQUMsQ0FBQyx5SUFBeUksR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxHQUFHLHlCQUF5QixHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxTQUFTLEdBQUcsa0NBQWtDLEVBQUUsQ0FDM1AsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLEVBQUUsUUFBUSxDQUNwQyxDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7QUMzQ3pCLE1BQU0sQ0FBQyxDQUFDLENBQUMsY0FBYyxHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFLO0FBQzdDLFFBQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDOztBQUVyRSxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBQyxJQUFJLEVBQUs7QUFDbEIsZ0JBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPO2dCQUN4QixlQUFlLEdBQUcsU0FBbEIsZUFBZSxDQUFJLEVBQUUsRUFBRSxhQUFhLEVBQUs7QUFDckMsb0JBQUksQ0FBQyxhQUFhLEVBQUU7O0FBQ2hCLDRCQUFJLFNBQVMsWUFBQTs0QkFBRSxRQUFRLEdBQUcsQ0FBQzs0QkFDdkIsT0FBTyxHQUFHLENBQUM7NEJBQ1gsWUFBWSxHQUFHLENBQUM7NEJBQ2hCLGdCQUFnQixHQUFHLE9BQU8sRUFBRSxDQUFDLE9BQU8sR0FBRyxPQUFPLEVBQUUsQ0FBQyxRQUFROzRCQUN6RCxxQkFBcUIsR0FBRyxPQUFPLEVBQUUsQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7O0FBRTlFLDRCQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQzs0QkFDdEQsU0FBUyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDOzRCQUM5QyxjQUFjLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUM7NEJBQ3hELE9BQU8sR0FBRyxTQUFWLE9BQU8sR0FBUztBQUNaLHFDQUFTLEdBQUcsV0FBVyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFDO3lCQUNsRDs0QkFDRCxpQkFBaUIsR0FBRyxTQUFwQixpQkFBaUIsR0FBUztBQUN0QixnQ0FBSSxRQUFRLElBQUksUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQzFDLDJDQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBTSxRQUFRLE1BQUcsQ0FBQztBQUN6Qyx5Q0FBUyxDQUFDLFNBQVMsV0FBUyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxBQUFFLENBQUM7QUFDdEQsOENBQWMsQ0FBQyxTQUFTLEdBQU0sUUFBUSxDQUFDLFlBQVksQ0FBQyxhQUFVLENBQUM7QUFDL0Qsa0NBQUUsQ0FBQyxTQUFTLEdBQU0sUUFBUSxNQUFHLENBQUM7QUFDOUIsdUNBQU8sR0FBRyxPQUFPLEdBQUcsZ0JBQWdCLENBQUM7QUFDckMsNENBQVksR0FBRyxZQUFZLEdBQUcscUJBQXFCLENBQUM7QUFDcEQsd0NBQVEsR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFDOzZCQUMzQixNQUFNO0FBQ0gsNkNBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQzs2QkFDNUI7eUJBQ0osQ0FBQzs7QUFFTixrQ0FBVSxDQUFDLFlBQU07QUFDYixtQ0FBTyxFQUFFLENBQUM7eUJBQ2IsRUFBRSxJQUFJLENBQUMsQ0FBQzs7aUJBQ1o7YUFDSixDQUFDOztBQUVOLG1CQUFPO0FBQ0gsK0JBQWUsRUFBRSxlQUFlO2FBQ25DLENBQUM7U0FDTDs7QUFFRCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTztnQkFDdEIsT0FBTyxHQUFHLE9BQU8sRUFBRSxDQUFDLFlBQVk7Z0JBQ2hDLFNBQVMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxjQUFjO2dCQUNwQyxnQkFBZ0IsR0FBRyxTQUFuQixnQkFBZ0IsR0FBUztBQUNyQixvQkFBTSxNQUFNLEdBQUc7QUFDWCxtQ0FBZSxFQUFFLGNBQWM7QUFDL0IsZ0NBQVksRUFBRSxjQUFjO0FBQzVCLDRCQUFRLEVBQUUsWUFBWTtBQUN0QiwyQkFBTyxFQUFFLFdBQVc7QUFDcEIsaUNBQWEsRUFBRSxXQUFXO0FBQzFCLDhCQUFVLEVBQUUsV0FBVztpQkFDMUIsQ0FBQzs7QUFFRix1QkFBUSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsMEJBQTBCLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBRTthQUNoRztnQkFDRCxpQkFBaUIsR0FBRyxTQUFwQixpQkFBaUIsR0FBUztBQUN0QixvQkFBTSxNQUFNLEdBQUc7QUFDWCw4QkFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMseUJBQXlCLEVBQUUsU0FBUyxFQUFFLENBQUM7QUFDMUQsNEJBQVEsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsdUJBQXVCLEVBQUUsU0FBUyxDQUFDLEVBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRTtBQUMvSSw0QkFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsdUJBQXVCLEVBQUUsU0FBUyxDQUFDLEVBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLElBQUksRUFBQyxDQUFDLENBQUM7QUFDMUgsOEJBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLHlCQUF5QixFQUFFLFNBQVMsRUFBRSxDQUFDO0FBQzFELGlDQUFhLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyw0QkFBNEIsRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUNoRSxnQ0FBWSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsMkJBQTJCLEVBQUUsU0FBUyxDQUFDLEVBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0FBQzVHLG1DQUFlLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyw4QkFBOEIsRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUNwRSwyQkFBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsc0JBQXNCLEVBQUUsU0FBUyxFQUFFLENBQUM7aUJBQ3ZELENBQUM7O0FBRUYsdUJBQU8sTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2xDLENBQUM7O0FBRU4sbUJBQU8sQ0FBQyxDQUFDLHdCQUF3QixFQUFFLENBQy9CLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsc0JBQXNCLEVBQUUsQ0FDdEIsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLENBQ3JCLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxDQUNwQixDQUFDLENBQUMsd0VBQXdFLFdBQVEsT0FBTyxFQUFFLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFBLENBQUcsRUFDaEosQ0FBQyxDQUFDLDBDQUEwQyxFQUFFLENBQzFDLElBQUksQ0FBQyxDQUFDLENBQUMsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFDeEMsQ0FBQyxDQUFDLHVDQUF1QyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsb0JBQW9CLEVBQUUsU0FBUyxDQUFDLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLGtCQUFrQixFQUFDLENBQUMsQ0FBQyxDQUFDLEVBQzFILEFBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxVQUFVLElBQUksT0FBTyxHQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLCtCQUErQixHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUNqSixDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMseUJBQXlCLEVBQUU7QUFDekIscUJBQUssRUFBRTtBQUNILHlCQUFLLEVBQUssT0FBTyxFQUFFLENBQUMsUUFBUSxNQUFHO2lCQUNsQzthQUNKLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLHVCQUF1QixFQUFFLENBQ3ZCLENBQUMsQ0FBQywyQ0FBMkMsRUFBRSxDQUMzQyxDQUFDLENBQUMsd0RBQXdELEdBQUssT0FBTyxFQUFFLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUEsT0FBSSxDQUM3SCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLHNEQUFzRCxFQUFFLENBQ3RELENBQUMsQ0FBQyw0Q0FBNEMsRUFBRSxTQUFTLElBQUksU0FBUyxDQUFDLEtBQUssR0FBRyxDQUMzRSxDQUFDLENBQUMsMEJBQTBCLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsRUFBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FDbEksR0FBRyxFQUFFLENBQUMsQ0FDVixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFO0FBQ3ZCLHVCQUFPLEVBQUUsT0FBTzthQUNuQixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFDQyxPQUFPLEVBQUUsQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLENBQUMsNEVBQTRFLEdBQUcsT0FBTyxFQUFFLENBQUMsRUFBRSxHQUFHLHNCQUFzQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUksQUFBQyxPQUFPLEVBQUUsQ0FBQyxzQkFBc0IsR0FBSSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUU7QUFDclEsdUJBQU8sRUFBRSxPQUFPO0FBQ2hCLG9CQUFJLEVBQUUsTUFBTTthQUNmLENBQUMsR0FBRyxFQUFFLEVBQ1AsQ0FBQyxDQUFDLGdEQUFnRCxHQUFHLGdCQUFnQixFQUFFLEdBQUcsSUFBSSxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FDdkcsQ0FBQyxFQUNGLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFO0FBQ3hDLDJCQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7YUFDaEMsQ0FBQyxDQUFDLENBQ04sQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQUFBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNoSDFELE1BQU0sQ0FBQyxDQUFDLENBQUMsNkJBQTZCLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3hELFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQzdCLGdCQUFJLGFBQWEsR0FBRyxTQUFoQixhQUFhLENBQUksTUFBTSxFQUFLO0FBQzVCLHNDQUFvQixPQUFPLENBQUMsVUFBVSxrQ0FBNkIsTUFBTSxDQUFHO2FBQy9FO2dCQUFFLGVBQWUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDOztBQUV2QyxtQkFBTyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFVBQUMsTUFBTSxFQUFLO0FBQ3hELHVCQUFPLENBQUMsY0FBWSxhQUFhLENBQUMsTUFBTSxDQUFDLCtEQUE0RCxDQUNqRyxDQUFDLENBQUMsa0JBQWtCLFVBQVEsTUFBTSxDQUFHLENBQ3hDLENBQUMsQ0FBQzthQUNOLENBQUMsQ0FBQyxDQUFDO1NBQ1A7S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDM0JqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUM5QixXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBQyxJQUFJLEVBQUs7QUFDbEIsZ0JBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUN2QixnQkFBZ0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWxDLGdCQUFNLFdBQVcsR0FBRyxTQUFkLFdBQVcsQ0FBSSxFQUFFLEVBQUs7QUFDeEIsdUJBQU8sWUFBTTtBQUNULHdCQUFJLGNBQWMsR0FBRyxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQzs7QUFFaEQsd0JBQUksTUFBTSxDQUFDLE9BQU8sSUFBSSxnQkFBZ0IsRUFBRSxFQUFFO0FBQ3RDLHdDQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsK0JBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNmLHlCQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7cUJBQ2Q7O0FBRUQsd0JBQUksY0FBYyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUssTUFBTSxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsRUFBRSxJQUFJLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxBQUFDLEVBQUU7QUFDM0YsNEJBQUksQ0FBQyxPQUFPLEVBQUUsRUFBQztBQUNYLDRDQUFnQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNqQyxtQ0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2QsNkJBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt5QkFDZDtxQkFDSjtpQkFDSixDQUFDO2FBQ0wsQ0FBQzs7QUFFRixnQkFBTSxVQUFVLEdBQUcsU0FBYixVQUFVLENBQUksRUFBRSxFQUFFLGFBQWEsRUFBSztBQUN0QyxvQkFBSSxDQUFDLGFBQWEsRUFBRTtBQUNoQix3QkFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2xDLDBCQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2lCQUNoRDthQUNKLENBQUM7O0FBRUYsbUJBQU87QUFDSCwwQkFBVSxFQUFFLFVBQVU7QUFDdEIsdUJBQU8sRUFBRSxPQUFPO2FBQ25CLENBQUM7U0FDTDtBQUNELFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsZ0JBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPO2dCQUN4QixPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQzs7QUFFakMsZ0JBQUksU0FBUyxHQUFHLEFBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksT0FBTyxFQUFFLENBQUMsaUJBQWlCLEdBQUksd0JBQXdCLEdBQUcsMENBQTBDLENBQUM7O0FBRXpJLG1CQUFPLENBQUMsQ0FBQyxhQUFhLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FDaEMsQ0FBQyxDQUFDLFNBQVMsRUFBRTtBQUNULHNCQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVU7YUFDMUIsRUFBRSxDQUNDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FDZCxDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQ3RDLENBQUMsQ0FBQyxrRkFBa0YsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLFVBQVUsR0FBRyxFQUFFLENBQUEsQUFBQyxHQUFHLHFCQUFxQixFQUFFO0FBQ3hKLHFCQUFLLEVBQUUsY0FBYzthQUN4QixFQUFFLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxrRkFBa0YsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLDJCQUEyQixDQUFDLEdBQUcsVUFBVSxHQUFHLEVBQUUsQ0FBQSxBQUFDLEdBQUcsc0NBQXNDLEVBQUU7QUFDOU0scUJBQUssRUFBRSxjQUFjO2FBQ3hCLEVBQUUsbUJBQW1CLENBQUMsRUFDdkIsQ0FBQyxDQUFDLGtEQUFrRCxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLEdBQUcsRUFBRSxDQUFBLEFBQUMsR0FBRyxvQkFBb0IsRUFBRTtBQUN4SSxxQkFBSyxFQUFFLGNBQWM7YUFDeEIsRUFBRSxPQUFPLENBQUMsRUFDWCxDQUFDLENBQUMsa0RBQWtELElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxVQUFVLEdBQUcsRUFBRSxDQUFBLEFBQUMsR0FBRyxtQkFBbUIsRUFBRTtBQUNwSCxxQkFBSyxFQUFFLGNBQWM7YUFDeEIsRUFBRSxDQUNDLFlBQVksRUFDWixDQUFDLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxHQUFHLE9BQU8sRUFBRSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsQ0FDMUQsQ0FBQyxFQUNGLENBQUMsQ0FBQyx1RkFBdUYsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsVUFBVSxHQUFHLEVBQUUsQ0FBQSxBQUFDLEdBQUcsMkJBQTJCLEVBQUU7QUFDeksscUJBQUssRUFBRSxjQUFjO2FBQ3hCLEVBQUUsQ0FDQyxTQUFTLEVBQ1QsQ0FBQyxDQUFDLHlDQUF5QyxFQUFFLE9BQU8sRUFBRSxHQUFHLE9BQU8sRUFBRSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsQ0FBQyxDQUNoRyxDQUFDLEVBQ0YsQ0FBQyxDQUFDLHFEQUFxRCxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsVUFBVSxHQUFHLEVBQUUsQ0FBQSxBQUFDLEdBQUcsc0JBQXNCLEVBQUU7QUFDN0gscUJBQUssRUFBRSxjQUFjO2FBQ3hCLEVBQUUsQ0FDQyxjQUFjLEVBQ2QsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLGdEQUFnRCxHQUFHLE9BQU8sRUFBRSxDQUFDLFNBQVMsR0FBRyw0RkFBNEYsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUNoTixDQUFDLENBQ0wsQ0FBQyxFQUNGLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyw2Q0FBNkMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxzQkFBc0IsR0FBRyxDQUM1RixDQUFDLENBQUMsZ0NBQWdDLEVBQUUsQ0FDaEMsQ0FBQyxDQUFDLCtCQUErQixFQUFFLENBQy9CLENBQUMsQ0FBQyxpQ0FBaUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEdBQUcsc0JBQXNCLEVBQUUsc0JBQXNCLENBQUMsQ0FDdkcsQ0FBQyxFQUNGLENBQUMsQ0FBQywrQkFBK0IsRUFBRSxDQUMvQixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FDN0YsQ0FBQyxDQUNMLENBQUMsQ0FDTCxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FDZixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFDRixBQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLGlCQUFpQixHQUFJLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsQ0FDdEYsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUNYO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDL0Z6QixNQUFNLENBQUMsQ0FBQyxDQUFDLGVBQWUsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDckMsV0FBTztBQUNILFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsbUJBQU8sQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxVQUFDLFVBQVUsRUFBSztBQUM3RCx1QkFBTyxDQUFDLENBQUMsNkNBQTZDLEVBQUUsQ0FDcEQsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsMEVBQTBFLEdBQUcsVUFBVSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxDQUMxSCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxxR0FBcUcsRUFBRSxDQUNyRyxDQUFDLENBQUMsNkJBQTZCLEdBQUcsVUFBVSxDQUFDLEVBQUUsR0FBRyxJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUMzRSxDQUFDLEVBQ0YsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLENBQ3BCLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLHdCQUF3QixFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsRUFDdkUsQ0FBQyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxFQUNwQyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQywwQkFBMEIsRUFBRSxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQzlFLENBQUMsRUFDRixDQUFDLENBQUMsdUhBQXVILEVBQUUsQ0FDdEgsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQzVDLENBQUMsQ0FBQyxzQ0FBc0MsR0FBRyxVQUFVLENBQUMsYUFBYSxHQUFHLHFCQUFxQixFQUFFLG9CQUFvQixDQUFDLENBQ3JILENBQUMsR0FBRyxFQUFFLEVBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FDekQsQ0FBQyxDQUFDLDBEQUEwRCxHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxxQkFBcUIsRUFBRSxtQkFBbUIsQ0FBQyxDQUMzSSxDQUFDLEdBQUcsRUFBRSxFQUNQLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxVQUFDLElBQUksRUFBSztBQUM5Qix3QkFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFbEMsMkJBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQzlDLENBQUMsQ0FBQyxzQ0FBc0MsR0FBRyxJQUFJLEdBQUcscUJBQXFCLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUNoRyxDQUFDLEdBQUcsRUFBRSxDQUFFO2lCQUNaLENBQUMsQ0FDTCxDQUFDLEVBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsaUhBQWlILEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FDbEwsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQUM7YUFDTixDQUFDLENBQUMsQ0FBQztTQUNQO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7Ozs7Ozs7OztBQzlCbkMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBSztBQUN0QixXQUFPO0FBQ0gsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFnQjtnQkFBZCxJQUFJLHlEQUFHLEVBQUU7O0FBQ2xCLGdCQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLGFBQWE7Z0JBQ3pDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQzs7QUFFOUIsbUJBQU8sQ0FBQyxDQUFDLG1EQUFtRCxFQUFFLENBQzFELENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsbUNBQW1DLEVBQUUsQ0FDbkMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUNULENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBQyxFQUFFLENBQ25ELENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsOENBQThDLEVBQUUsQ0FDOUMsQ0FBQyxDQUFDLHlIQUF5SCxDQUFDLENBQy9ILENBQUMsRUFDRixDQUFDLENBQUMsMkNBQTJDLEVBQUUsQ0FDM0MsQ0FBQyxDQUFDLHlEQUF5RCxFQUFFLENBQ3pELENBQUMsQ0FBQyx3SEFBd0gsQ0FBQyxDQUM5SCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3RCYixNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUN6QixXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBQyxJQUFJLEVBQUs7QUFDbEIsZ0JBQUksUUFBUSxZQUFBLENBQUM7QUFDYixnQkFBTSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDOUIsZUFBZSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUM5QixVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJO2dCQUNwQyxjQUFjLEdBQUcsU0FBakIsY0FBYyxHQUFTO0FBQ25CLG9CQUFJLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxFQUFFO0FBQ3hCLG9DQUFnQixDQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQzVDLE1BQU07QUFDSCxvQ0FBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDNUM7YUFDSjtnQkFDRCxjQUFjLEdBQUcsU0FBakIsY0FBYyxHQUFTO0FBQ25CLG9CQUFJLGdCQUFnQixFQUFFLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxBQUFDLEVBQUU7QUFDL0Msb0NBQWdCLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDNUMsTUFBTTtBQUNILG9DQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN2QjthQUNKO2dCQUNELGdCQUFnQixHQUFHLFNBQW5CLGdCQUFnQixHQUFTO0FBQ3JCLHdCQUFRLEdBQUcsV0FBVyxDQUFDLFlBQU07QUFDekIsa0NBQWMsRUFBRSxDQUFDO0FBQ2pCLHFCQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBQ2QsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUNsQjtnQkFDRCxnQkFBZ0IsR0FBRyxTQUFuQixnQkFBZ0IsR0FBUztBQUNyQiw2QkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3hCLGdDQUFnQixFQUFFLENBQUM7YUFDdEI7Z0JBQ0QsTUFBTSxHQUFHLFNBQVQsTUFBTSxDQUFJLEVBQUUsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFLO0FBQ3JDLG9CQUFJLENBQUMsYUFBYSxFQUFDO0FBQ2YsbUNBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4RixxQkFBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2lCQUNkLENBQUM7O0FBRUYsdUJBQU8sQ0FBQyxRQUFRLEdBQUc7MkJBQU0sYUFBYSxDQUFDLFFBQVEsQ0FBQztpQkFBQSxDQUFDO2FBQ3BELENBQUM7O0FBRU4sNEJBQWdCLEVBQUUsQ0FBQzs7QUFFbkIsbUJBQU87QUFDSCxzQkFBTSxFQUFFLE1BQU07QUFDZCxnQ0FBZ0IsRUFBRSxnQkFBZ0I7QUFDbEMsK0JBQWUsRUFBRSxlQUFlO0FBQ2hDLDhCQUFjLEVBQUUsY0FBYztBQUM5Qiw4QkFBYyxFQUFFLGNBQWM7QUFDOUIsZ0NBQWdCLEVBQUUsZ0JBQWdCO2FBQ3JDLENBQUM7U0FDTDtBQUNELFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsZ0JBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRTtnQkFDcEMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLElBQUksRUFBRTtnQkFDdEMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTztnQkFDL0IsV0FBVyxHQUFHLFNBQWQsV0FBVyxDQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUs7QUFDekIsa0JBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNWLG9CQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzthQUMzQjtnQkFDRCxXQUFXLEdBQUcsU0FBZCxXQUFXLENBQUksR0FBRyxFQUFFLFlBQVksRUFBSztBQUNqQyxvQkFBTSxPQUFPLG1CQUFpQixZQUFZLDZCQUF3QixZQUFZLHdCQUFtQixZQUFZLEFBQUU7b0JBQzNHLE1BQU0sR0FBRyxHQUFHLEtBQUssSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsa0NBQWtDLEdBQUcsaUNBQWlDLENBQUM7O0FBRXRILHVCQUFPLE1BQU0sS0FBSyxNQUFNLEdBQUcsTUFBTSxHQUFHLE9BQU8sQ0FBQzthQUMvQyxDQUFDOztBQUVOLG1CQUFPLENBQUMsZ0JBQWMsWUFBWSxFQUFJO0FBQ2xDLHNCQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07YUFDdEIsRUFBRSxDQUNDLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQ2pDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFLO0FBQy9CLG9CQUFJLGNBQWMsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQSxHQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7b0JBQ3pFLFlBQVksb0JBQWtCLGNBQWMsY0FBVyxDQUFDOztBQUU1RCx1QkFBTyxDQUFDLHFCQUFtQixVQUFVLEVBQUk7QUFDckMseUJBQUssRUFBSyxXQUFXLENBQUMsR0FBRyxFQUFFLFlBQVksQ0FBQyxTQUFJLEtBQUssQ0FBQyxXQUFXLEFBQUU7aUJBQ2xFLEVBQUUsQ0FDQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQyw2QkFBNkIsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQ2xELENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxFQUNGLENBQUMsQ0FBQyw4REFBOEQsRUFBRTtBQUM5RCx1QkFBTyxFQUFFOzJCQUFNLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO2lCQUFBO2FBQ2xELEVBQUMsQ0FDRSxDQUFDLENBQUMsK0RBQStELENBQUMsQ0FDckUsQ0FBQyxFQUNGLENBQUMsQ0FBQywrREFBK0QsRUFBRTtBQUMvRCx1QkFBTyxFQUFFOzJCQUFNLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO2lCQUFBO2FBQ2xELEVBQUMsQ0FDRSxDQUFDLENBQUMsaUVBQWlFLENBQUMsQ0FDdkUsQ0FBQyxFQUNGLENBQUMsQ0FBQyxxREFBcUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQyxHQUFHLEVBQUs7QUFDMUYsdUJBQU8sQ0FBQyxpQ0FBOEIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEtBQUssR0FBRyxHQUFHLFdBQVcsR0FBRyxFQUFFLENBQUEsRUFBSTtBQUN4RiwyQkFBTyxFQUFFOytCQUFNLFdBQVcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDO3FCQUFBO2lCQUN6RCxDQUFDLENBQUM7YUFDTixDQUFDLENBQUMsQ0FDTixDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQ3RIdkIsTUFBTSxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFO0FBQzNDLFdBQU87QUFDSCxrQkFBVSxFQUFFLHNCQUFXO0FBQ25CLGdCQUFJLEVBQUUsR0FBRztBQUNELDBCQUFVLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7YUFDekI7Z0JBRUQsZUFBZSxHQUFHLFNBQWxCLGVBQWUsQ0FBWSxVQUFVLEVBQUUsVUFBVSxFQUFFO0FBQy9DLHVCQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLENBQUMsRUFBRSxVQUFTLENBQUMsRUFBRTtBQUN6RSwyQkFBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEdBQUksVUFBVSxDQUFDLENBQUM7aUJBQ2pFLENBQUMsQ0FBQzthQUNOLENBQUM7O0FBRU4sa0JBQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVMsSUFBSSxFQUFFO0FBQzVDLGtCQUFFLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMzQyxDQUFDLENBQUM7O0FBRUgsbUJBQU87QUFDSCxrQkFBRSxFQUFFLEVBQUU7YUFDVCxDQUFDO1NBQ0w7O0FBRUQsWUFBSSxFQUFFLGNBQVMsSUFBSSxFQUFFO0FBQ2pCLG1CQUFPLENBQUMsQ0FBQyx3Q0FBd0MsRUFBRSxDQUMvQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxFQUFFLFVBQVMsS0FBSyxFQUFFO0FBQ3hDLHVCQUFPLENBQUMsQ0FBQyxzQkFBc0IsRUFBRSxDQUM3QixDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxVQUFTLE1BQU0sRUFBRTtBQUMxQiwyQkFBTyxDQUFDLENBQUMseUVBQXlFLEVBQUUsQ0FDaEYsQ0FBQyxDQUFDLDBCQUEwQixHQUFHLE1BQU0sQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQzdDLENBQUMsQ0FBQywrQ0FBK0MsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUN0RSxDQUFDLENBQUMsb0NBQW9DLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUN2RCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLHdDQUF3QyxFQUFFLFNBQVMsR0FBRyxNQUFNLENBQUMsMEJBQTBCLEdBQUcsV0FBVyxDQUFDLENBQzNHLENBQUMsQ0FBQztpQkFDTixDQUFDLENBQ0wsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEFBQUMsQ0FBQzs7O0FDMUN4QyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUU7QUFDekMsV0FBTztBQUNILGtCQUFVLEVBQUUsc0JBQVc7QUFDbkIsZ0JBQUksRUFBRSxHQUFHO0FBQ0wsMEJBQVUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzthQUN6QixDQUFDOztBQUVGLGtCQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFTLElBQUksRUFBRTtBQUMxQyxrQkFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN2QixDQUFDLENBQUM7O0FBRUgsbUJBQU87QUFDSCxrQkFBRSxFQUFFLEVBQUU7YUFDVCxDQUFDO1NBQ0w7O0FBRUQsWUFBSSxFQUFFLGNBQVMsSUFBSSxFQUFFO0FBQ2pCLG1CQUFPLENBQUMsQ0FBQyx3R0FBd0csRUFBRSxDQUMvRyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFTLFNBQVMsRUFBRTtBQUN6Qyx1QkFBTyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQ3JCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsZ0JBQWdCLENBQUMsRUFDbkIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxrQ0FBa0MsRUFDaEMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxZQUFZLEdBQUcsMEJBQTBCLEdBQUcsU0FBUyxDQUFDLFlBQVksR0FBRyxjQUFjLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQzFJLFdBQVcsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxHQUFHLDZLQUE2SyxDQUFDLEVBQ2pPLENBQUMsQ0FBQyxnREFBZ0QsRUFDOUMsbUNBQW1DLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsUUFBUSxHQUFHLFNBQVMsQ0FBQywwQkFBMEIsR0FBRyxZQUFZLENBQUMsQ0FDckosQ0FBQyxFQUNGLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUN0QixDQUFDLENBQ0wsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEFBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoQjFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUM3QixXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBQyxJQUFJLEVBQUs7QUFDbEIsZ0JBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQztnQkFDakMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNmLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDaEIsT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixZQUFZLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBQyxDQUFDO2dCQUN4QyxPQUFPLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM1QixNQUFNLEdBQUcsU0FBVCxNQUFNLEdBQVM7QUFDWCx1QkFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2pCLGlCQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDZCxDQUFDOztBQUVOLGdCQUFNLGlCQUFpQixHQUFHLFNBQXBCLGlCQUFpQixDQUFJLEVBQUUsRUFBRSxhQUFhLEVBQUs7QUFDN0Msb0JBQUksQ0FBQyxhQUFhLEVBQUM7QUFDZixnQ0FBWSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUN4QzthQUNKO2dCQUNHLFdBQVcsR0FBRyxTQUFkLFdBQVcsQ0FBSSxFQUFFLEVBQUUsYUFBYSxFQUFLO0FBQ2pDLG9CQUFJLENBQUMsYUFBYSxFQUFDO0FBQ2Ysd0JBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUM7QUFDM0Qsd0JBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFeEMsd0JBQUksTUFBTSxDQUFDLFVBQVUsR0FBSSxFQUFFLENBQUMsV0FBVyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQUFBQyxFQUFDOztBQUM5RSwwQkFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDeEMsNEJBQUksQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztxQkFDbkMsTUFBTSxJQUFJLEFBQUMsWUFBWSxFQUFFLENBQUMsSUFBSSxHQUFJLEVBQUUsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxBQUFDLElBQUssTUFBTSxDQUFDLFVBQVUsSUFBSSxBQUFDLFlBQVksRUFBRSxDQUFDLElBQUksR0FBSSxFQUFFLENBQUMsV0FBVyxHQUFHLENBQUMsQUFBQyxJQUFLLENBQUMsRUFBQztBQUM5SCxnQ0FBSSxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQzt5QkFDN0IsTUFBTSxJQUFJLEFBQUMsWUFBWSxFQUFFLENBQUMsSUFBSSxHQUFJLEVBQUUsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxBQUFDLEdBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtBQUN6RSxvQ0FBSSxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDOzZCQUN2RCxNQUFNLElBQUksQUFBQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLEdBQUksRUFBRSxDQUFDLFdBQVcsR0FBRyxDQUFDLEFBQUMsR0FBSSxDQUFDLEVBQUU7QUFDekQsd0NBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7aUNBQ3RDO0FBQ0QsdUJBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNmO2FBQ0osQ0FBQzs7QUFFTixtQkFBTztBQUNILHFCQUFLLEVBQUUsS0FBSztBQUNaLG1CQUFHLEVBQUUsR0FBRztBQUNSLG9CQUFJLEVBQUUsSUFBSTtBQUNWLHVCQUFPLEVBQUUsT0FBTztBQUNoQix1QkFBTyxFQUFFLE9BQU87QUFDaEIsc0JBQU0sRUFBRSxNQUFNO0FBQ2QsMkJBQVcsRUFBRSxXQUFXO0FBQ3hCLGlDQUFpQixFQUFFLGlCQUFpQjthQUN2QyxDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDekIsbUJBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUU7QUFDZCx1QkFBTyxFQUFFLElBQUksQ0FBQyxNQUFNO0FBQ3BCLHNCQUFNLEVBQUUsSUFBSSxDQUFDLGlCQUFpQjtBQUM5QixxQkFBSyxFQUFFLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFBQzthQUM3QixFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUNoQixDQUFDLGtDQUFnQyxLQUFLLGlCQUFZLElBQUksQ0FBQyxHQUFHLEVBQUUsa0JBQWEsSUFBSSxDQUFDLElBQUksRUFBRSxZQUFTO0FBQ3pGLHNCQUFNLEVBQUUsSUFBSSxDQUFDLFdBQVc7YUFDM0IsRUFBRSxDQUNDLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQ3JDLENBQUMsQ0FDTCxHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQ1g7S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7Ozs7Ozs7Ozs7OztBQzVFbkMsTUFBTSxDQUFDLENBQUMsQ0FBQyw4QkFBOEIsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBSztBQUNsRSxRQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUM7O0FBRTFELFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFDLElBQUksRUFBSztBQUNsQixnQkFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFDLENBQUM7Z0JBQzNDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTztnQkFDdEIsVUFBVSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDO0FBQzVDLHVCQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBQyxDQUFDO2dCQUM5QixhQUFhLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDO2dCQUN2RCxXQUFXLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO2dCQUN2QyxXQUFXLEdBQUcsU0FBZCxXQUFXLEdBQVM7QUFDaEIsNkJBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDaEMsd0JBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDM0Isd0JBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN0QywrQkFBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO2lCQUN4QixDQUFDLENBQUM7YUFDTixDQUFDOztBQUVSLGdCQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLENBQUM7O0FBRS9CLG1CQUFPO0FBQ0gsNkJBQWEsRUFBRSxhQUFhO0FBQzVCLDJCQUFXLEVBQUUsV0FBVztBQUN4Qiw0QkFBWSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVO0FBQ2hELDJCQUFXLEVBQUUsV0FBVztBQUN4Qix5QkFBUyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNO2FBQzVDLENBQUM7U0FDTDtBQUNELFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsZ0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7O0FBRTNCLG1CQUFRLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxVQUFDLElBQUksRUFBSztBQUNsRix1QkFBTyxDQUNILENBQUMsQ0FBQyxzQkFBc0IsRUFBRSxDQUN0QixDQUFDLENBQUMsK0JBQStCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUN0RSxDQUFDLEVBQ0QsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQyxxQ0FBcUMsRUFBRSxDQUMzRCxDQUFDLENBQUMsMERBQTBELENBQUMsRUFDN0QsQ0FBQyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUMvRCxDQUFDLEdBQUcsQ0FBQyxDQUFDLHVCQUF1QixFQUFFLENBQzVCLENBQUMsQ0FBQyxrQ0FBa0MsRUFBRSxDQUNsQyxDQUFDLENBQUMsMEJBQTBCLEVBQUUsUUFBUSxDQUFDLEVBQ3ZDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQ2pCLENBQUMsQ0FBQyxtQkFBbUIsVUFBUSxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFHLENBQ3ZFLENBQUMsRUFDRixDQUFDLENBQUMsa0NBQWtDLEVBQUUsQ0FDbEMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFDLEtBQUssRUFBRSxFQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUMsRUFBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FDbkYsQ0FBQyxFQUNGLENBQUMsQ0FBQyxtQ0FBbUMsRUFBRSxDQUNuQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQ0wsQ0FBQyxDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFDL0QsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFDakIsSUFBSSxDQUFDLFVBQVUsQ0FDbEIsQ0FBQyxFQUNGLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FDTCxDQUFDLENBQUMsMEJBQTBCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUNuRSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUNqQixJQUFJLENBQUMsY0FBYyxDQUN0QixDQUFDLEVBQ0YsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUNMLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFDcEUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFDakIsSUFBSSxDQUFDLFNBQVMsQ0FDakIsQ0FBQyxFQUNGLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FDTCxDQUFDLENBQUMsMEJBQTBCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUNqRSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUNkLElBQUksQ0FBQyxNQUFNLFNBQUksSUFBSSxDQUFDLFlBQVksQ0FDdEMsQ0FBQyxFQUNGLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FDTCxDQUFDLENBQUMsMEJBQTBCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUNsRSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUNkLElBQUksQ0FBQyxPQUFPLFNBQUksSUFBSSxDQUFDLGFBQWEsQ0FDeEMsQ0FBQyxDQUNMLENBQUMsQ0FDSixDQUFDLEVBQ0YsQ0FBQyxJQUFJLENB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LEdBQUcsWUFBVztBQUNwQyxZQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO0FBQzdDLGVBQU8sTUFBTSxDQUFDO0tBQ2pCLENBQUM7O0FBRUYsTUFBRSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEdBQUcsWUFBVztBQUNyQyxZQUFJLE1BQU0sR0FBRyxhQUFhLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7QUFDakQsZUFBTyxNQUFNLElBQUksaUJBQWlCLENBQUMsTUFBTSxDQUFDLElBQUksU0FBUyxDQUFDO0tBQzNELENBQUM7O0FBRUYsV0FBTyxFQUFFLENBQUM7Q0FDYixDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsQUFBQyxDQUFDOzs7QUMxQnZDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLE1BQU0sRUFBRTtBQUM3QyxXQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUMsUUFBUSxFQUFFLGFBQWEsRUFBQyxDQUFDLENBQUM7Q0FDdEYsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQUFBQyxDQUFDIiwiZmlsZSI6ImNhdGFyc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ3aW5kb3cuYyA9ICgoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbW9kZWxzOiB7fSxcbiAgICAgICAgcm9vdDoge30sXG4gICAgICAgIHZtczoge30sXG4gICAgICAgIGFkbWluOiB7fSxcbiAgICAgICAgaDoge31cbiAgICB9O1xufSgpKTtcbiIsIndpbmRvdy5jLmggPSAoKG0sIG1vbWVudCwgSTE4bikgPT4ge1xuICAgIC8vRGF0ZSBIZWxwZXJzXG5cbiAgICBjb25zdCBoYXNoTWF0Y2ggPSAoc3RyKSA9PiB7IHJldHVybiB3aW5kb3cubG9jYXRpb24uaGFzaCA9PT0gc3RyOyB9LFxuICAgICAgICBwYXJhbUJ5TmFtZSA9IChuYW1lKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub3JtYWxOYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sICdcXFxcWycpLnJlcGxhY2UoL1tcXF1dLywgJ1xcXFxdJyksXG4gICAgICAgICAgICAgICAgcmVnZXggPSBuZXcgUmVnRXhwKCdbXFxcXD8mXScgKyBub3JtYWxOYW1lICsgJz0oW14mI10qKScpLFxuICAgICAgICAgICAgICAgIHJlc3VsdHMgPSByZWdleC5leGVjKGxvY2F0aW9uLnNlYXJjaCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cyA9PT0gbnVsbCA/ICcnIDogZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMV0ucmVwbGFjZSgvXFwrL2csICcgJykpO1xuICAgICAgICB9LFxuXHRcdHNlbGZPckVtcHR5ID0gKG9iaiwgZW1wdHlTdGF0ZSA9ICcnKSA9PiB7XG4gICAgcmV0dXJuIG9iaiA/IG9iaiA6IGVtcHR5U3RhdGU7XG5cdFx0fSxcbiAgICAgICAgc2V0TW9tZW50aWZ5TG9jYWxlID0gKCkgPT4ge1xuICAgICAgICAgICAgbW9tZW50LmxvY2FsZSgncHQnLCB7XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoc1Nob3J0OiAnamFuX2Zldl9tYXJfYWJyX21haV9qdW5fanVsX2Fnb19zZXRfb3V0X25vdl9kZXonLnNwbGl0KCdfJylcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZXhpc3R5ID0gKHgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB4ICE9IG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW9tZW50aWZ5ID0gKGRhdGUsIGZvcm1hdCkgPT4ge1xuICAgICAgICAgICAgZm9ybWF0ID0gZm9ybWF0IHx8ICdERC9NTS9ZWVlZJztcbiAgICAgICAgICAgIHJldHVybiBkYXRlID8gbW9tZW50KGRhdGUpLmxvY2FsZSgncHQnKS5mb3JtYXQoZm9ybWF0KSA6ICdubyBkYXRlJztcbiAgICAgICAgfSxcblxuICAgICAgICBzdG9yZUFjdGlvbiA9IChhY3Rpb24pID0+IHtcbiAgICAgICAgICAgIGlmICghc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShhY3Rpb24pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oYWN0aW9uLCBhY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNhbGxTdG9yZWRBY3Rpb24gPSAoYWN0aW9uLCBmdW5jKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShhY3Rpb24pKSB7XG4gICAgICAgICAgICAgICAgZnVuYy5jYWxsKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oYWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkaXNjdXNzID0gKHBhZ2UsIGlkZW50aWZpZXIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGQgPSBkb2N1bWVudCxcbiAgICAgICAgICAgICAgICBzID0gZC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgICAgIHdpbmRvdy5kaXNxdXNfY29uZmlnID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYWdlLnVybCA9IHBhZ2U7XG4gICAgICAgICAgICAgICAgdGhpcy5wYWdlLmlkZW50aWZpZXIgPSBpZGVudGlmaWVyO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHMuc3JjID0gJy8vY2F0YXJzZWZsZXguZGlzcXVzLmNvbS9lbWJlZC5qcyc7XG4gICAgICAgICAgICBzLnNldEF0dHJpYnV0ZSgnZGF0YS10aW1lc3RhbXAnLCArbmV3IERhdGUoKSk7XG4gICAgICAgICAgICAoZC5oZWFkIHx8IGQuYm9keSkuYXBwZW5kQ2hpbGQocyk7XG4gICAgICAgICAgICByZXR1cm4gbSgnJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW9tZW50RnJvbVN0cmluZyA9IChkYXRlLCBmb3JtYXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGV1cm9wZWFuID0gbW9tZW50KGRhdGUsIGZvcm1hdCB8fCAnREQvTU0vWVlZWScpO1xuICAgICAgICAgICAgcmV0dXJuIGV1cm9wZWFuLmlzVmFsaWQoKSA/IGV1cm9wZWFuIDogbW9tZW50KGRhdGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRyYW5zbGF0ZWRUaW1lVW5pdHMgPSB7XG4gICAgICAgICAgICBkYXlzOiAnZGlhcycsXG4gICAgICAgICAgICBtaW51dGVzOiAnbWludXRvcycsXG4gICAgICAgICAgICBob3VyczogJ2hvcmFzJyxcbiAgICAgICAgICAgIHNlY29uZHM6ICdzZWd1bmRvcydcbiAgICAgICAgfSxcbiAgICAgICAgLy9PYmplY3QgbWFuaXB1bGF0aW9uIGhlbHBlcnNcbiAgICAgICAgdHJhbnNsYXRlZFRpbWUgPSAodGltZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRlZFRpbWUgPSB0cmFuc2xhdGVkVGltZVVuaXRzLFxuICAgICAgICAgICAgICAgIHVuaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb2pVbml0ID0gdHJhbnNsYXRlZFRpbWVbdGltZS51bml0IHx8ICdzZWNvbmRzJ107XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICh0aW1lLnRvdGFsIDw9IDEpID8gcHJvalVuaXQuc2xpY2UoMCwgLTEpIDogcHJvalVuaXQ7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1bml0OiB1bml0KCksXG4gICAgICAgICAgICAgICAgdG90YWw6IHRpbWUudG90YWxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy9OdW1iZXIgZm9ybWF0dGluZyBoZWxwZXJzXG4gICAgICAgIGdlbmVyYXRlRm9ybWF0TnVtYmVyID0gKHMsIGMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAobnVtYmVyLCBuLCB4KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFfLmlzTnVtYmVyKG51bWJlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgcmUgPSAnXFxcXGQoPz0oXFxcXGR7JyArICh4IHx8IDMpICsgJ30pKycgKyAobiA+IDAgPyAnXFxcXEQnIDogJyQnKSArICcpJyxcbiAgICAgICAgICAgICAgICAgICAgbnVtID0gbnVtYmVyLnRvRml4ZWQoTWF0aC5tYXgoMCwgfn5uKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChjID8gbnVtLnJlcGxhY2UoJy4nLCBjKSA6IG51bSkucmVwbGFjZShuZXcgUmVnRXhwKHJlLCAnZycpLCAnJCYnICsgKHMgfHwgJywnKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBmb3JtYXROdW1iZXIgPSBnZW5lcmF0ZUZvcm1hdE51bWJlcignLicsICcsJyksXG5cbiAgICAgICAgdG9nZ2xlUHJvcCA9IChkZWZhdWx0U3RhdGUsIGFsdGVybmF0ZVN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwID0gbS5wcm9wKGRlZmF1bHRTdGF0ZSk7XG4gICAgICAgICAgICBwLnRvZ2dsZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcCgoKHAoKSA9PT0gYWx0ZXJuYXRlU3RhdGUpID8gZGVmYXVsdFN0YXRlIDogYWx0ZXJuYXRlU3RhdGUpKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlkVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgaWQ6ICdlcSdcbiAgICAgICAgfSksXG5cbiAgICAgICAgZ2V0VXNlciA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpLFxuICAgICAgICAgICAgICAgIGRhdGEgPSBfLmZpcnN0KGJvZHkpLmdldEF0dHJpYnV0ZSgnZGF0YS11c2VyJyk7XG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9jYXRpb25BY3Rpb25NYXRjaCA9IChhY3Rpb24pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFjdCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpLnNsaWNlKC0xKVswXTtcbiAgICAgICAgICAgIHJldHVybiBhY3Rpb24gPT09IGFjdDtcbiAgICAgICAgfSxcblxuICAgICAgICB1c2VBdmF0YXJPckRlZmF1bHQgPSAoYXZhdGFyUGF0aCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGF2YXRhclBhdGggfHwgJy9hc3NldHMvY2F0YXJzZV9ib290c3RyYXAvdXNlci5qcGcnO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vVGVtcGxhdGVzXG4gICAgICAgIGxvYWRlciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudS10ZXh0LWNlbnRlci51LW1hcmdpbnRvcC0zMCB1LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICBtKCdpbWdbYWx0PVwiTG9hZGVyXCJdW3NyYz1cImh0dHBzOi8vczMuYW1hem9uYXdzLmNvbS9jYXRhcnNlLmZpbGVzL2xvYWRlci5naWZcIl0nKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmV3RmVhdHVyZUJhZGdlID0gKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJ3NwYW4uYmFkZ2UuYmFkZ2Utc3VjY2Vzcy5tYXJnaW4tc2lkZS01JywgSTE4bi50KCdwcm9qZWN0cy5uZXdfZmVhdHVyZV9iYWRnZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmYlBhcnNlID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHJ5UGFyc2UgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LkZCLlhGQk1MLnBhcnNlKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gd2luZG93LnNldFRpbWVvdXQodHJ5UGFyc2UsIDUwMCk7IC8vdXNlIHRpbWVvdXQgdG8gd2FpdCBhc3luYyBvZiBmYWNlYm9va1xuICAgICAgICB9LFxuXG4gICAgICAgIHBsdXJhbGl6ZSA9IChjb3VudCwgcywgcCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChjb3VudCA+IDEgPyBjb3VudCArIHAgOiBjb3VudCArIHMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNpbXBsZUZvcm1hdCA9IChzdHIgPSAnJykgPT4ge1xuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcclxcbj8vLCAnXFxuJyk7XG4gICAgICAgICAgICBpZiAoc3RyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxuXFxuKy9nLCAnPC9wPjxwPicpO1xuICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXG4vZywgJzxiciAvPicpO1xuICAgICAgICAgICAgICAgIHN0ciA9ICc8cD4nICsgc3RyICsgJzwvcD4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgfSxcblxuICAgICAgICByZXdhcmRTb3VsZE91dCA9IChyZXdhcmQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAocmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyA+IDAgP1xuICAgICAgICAgICAgICAgIChyZXdhcmQucGFpZF9jb3VudCArIHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQgPj0gcmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucykgOiBmYWxzZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmV3YXJkUmVtYW5pbmcgPSAocmV3YXJkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyAtIChyZXdhcmQucGFpZF9jb3VudCArIHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNlVXJsID0gKGhyZWYpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICBsLmhyZWYgPSBocmVmO1xuICAgICAgICAgICAgcmV0dXJuIGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgVUlIZWxwZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkICYmICQpIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LlVJSGVscGVyLnNldHVwUmVzcG9uc2l2ZUlmcmFtZXMoJChlbCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9BbmNob3IgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cigxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhc2ggPT09IGVsLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZWwuaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmFsaWRhdGVFbWFpbCA9IChlbWFpbCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmUgPSAvXigoW148PigpW1xcXVxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFtePD4oKVtcXF1cXC4sOzpcXHNAXFxcIl0rXFwuKStbXjw+KClbXFxdXFwuLDs6XFxzQFxcXCJdezIsfSkkL2k7XG4gICAgICAgICAgICByZXR1cm4gcmUudGVzdChlbWFpbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmF2aWdhdGVUb0RldmlzZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9wdC9sb2dpbic7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3VtdWxhdGl2ZU9mZnNldCA9IChlbGVtZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdG9wID0gMCwgbGVmdCA9IDA7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgdG9wICs9IGVsZW1lbnQub2Zmc2V0VG9wICB8fCAwO1xuICAgICAgICAgICAgICAgIGxlZnQgKz0gZWxlbWVudC5vZmZzZXRMZWZ0IHx8IDA7XG4gICAgICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQub2Zmc2V0UGFyZW50O1xuICAgICAgICAgICAgfSB3aGlsZSAoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgbGVmdDogbGVmdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBjbG9zZU1vZGFsID0gKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbW9kYWwtY2xvc2UnKVswXTtcbiAgICAgICAgICAgIGlmIChfLmlzRWxlbWVudChlbCkpe1xuICAgICAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdtb2RhbC1iYWNrZHJvcCcpWzBdLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xvc2VGbGFzaCA9ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2ljb24tY2xvc2UnKVswXTtcbiAgICAgICAgICAgIGlmIChfLmlzRWxlbWVudChlbCkpe1xuICAgICAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgICAgICBlbC5wYXJlbnRFbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGkxOG5TY29wZSA9IChzY29wZSwgb2JqKSA9PiB7XG4gICAgICAgICAgICBvYmogPSBvYmogfHwge307XG4gICAgICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIG9iaiwge3Njb3BlOiBzY29wZX0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlZHJhd0hhc2hDaGFuZ2UgPSAoYmVmb3JlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYWxsYmFjayA9IF8uaXNGdW5jdGlvbihiZWZvcmUpID9cbiAgICAgICAgICAgICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJlZm9yZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICAgIH0gOiBtLnJlZHJhdztcblxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGF1dGhlbnRpY2l0eVRva2VuID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWV0YSA9IF8uZmlyc3QoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW25hbWU9Y3NyZi10b2tlbl0nKSk7XG4gICAgICAgICAgICByZXR1cm4gbWV0YSA/IG1ldGEuY29udGVudCA6IHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgYW5pbWF0ZVNjcm9sbFRvID0gKGVsKSA9PiB7XG4gICAgICAgICAgICBsZXQgc2Nyb2xsZWQgPSB3aW5kb3cuc2Nyb2xsWTtcblxuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gY3VtdWxhdGl2ZU9mZnNldChlbCkudG9wLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID0gMzAwLFxuICAgICAgICAgICAgICAgIGRGcmFtZSA9IChvZmZzZXQgLSBzY3JvbGxlZCkgLyBkdXJhdGlvbixcbiAgICAgICAgICAgICAgICAvL0Vhc2VJbk91dEN1YmljIGVhc2luZyBmdW5jdGlvbi4gV2UnbGwgYWJzdHJhY3QgYWxsIGFuaW1hdGlvbiBmdW5zIGxhdGVyLlxuICAgICAgICAgICAgICAgIGVhc2VkID0gKHQpID0+IHQgPCAuNSA/IDQgKiB0ICogdCAqIHQgOiAodCAtIDEpICogKDIgKiB0IC0gMikgKiAoMiAqIHQgLSAyKSArIDEsXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcG9zID0gZWFzZWQoc2Nyb2xsZWQgLyBvZmZzZXQpICogc2Nyb2xsZWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnNjcm9sbFRvKDAsIHBvcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNjcm9sbGVkID49IG9mZnNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChhbmltYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsZWQgPSBzY3JvbGxlZCArIGRGcmFtZTtcbiAgICAgICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2Nyb2xsVG8gPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZXRUcmlnZ2VyID0gKGVsLCBhbmNob3JJZCkgPT4ge1xuICAgICAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFuY2hvckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYW5jaG9ySWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChfLmlzRWxlbWVudChhbmNob3JFbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGVTY3JvbGxUbyhhbmNob3JFbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VHJpZ2dlcihlbCwgZWwuaGFzaC5zbGljZSgxKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgIHNldE1vbWVudGlmeUxvY2FsZSgpO1xuICAgIGNsb3NlRmxhc2goKTtcbiAgICBjbG9zZU1vZGFsKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhdXRoZW50aWNpdHlUb2tlbjogYXV0aGVudGljaXR5VG9rZW4sXG4gICAgICAgIGN1bXVsYXRpdmVPZmZzZXQ6IGN1bXVsYXRpdmVPZmZzZXQsXG4gICAgICAgIGRpc2N1c3M6IGRpc2N1c3MsXG4gICAgICAgIGV4aXN0eTogZXhpc3R5LFxuICAgICAgICB2YWxpZGF0ZUVtYWlsOiB2YWxpZGF0ZUVtYWlsLFxuICAgICAgICBtb21lbnRpZnk6IG1vbWVudGlmeSxcbiAgICAgICAgbW9tZW50RnJvbVN0cmluZzogbW9tZW50RnJvbVN0cmluZyxcbiAgICAgICAgZm9ybWF0TnVtYmVyOiBmb3JtYXROdW1iZXIsXG4gICAgICAgIGlkVk06IGlkVk0sXG4gICAgICAgIGdldFVzZXI6IGdldFVzZXIsXG4gICAgICAgIHRvZ2dsZVByb3A6IHRvZ2dsZVByb3AsXG4gICAgICAgIGxvYWRlcjogbG9hZGVyLFxuICAgICAgICBuZXdGZWF0dXJlQmFkZ2U6IG5ld0ZlYXR1cmVCYWRnZSxcbiAgICAgICAgZmJQYXJzZTogZmJQYXJzZSxcbiAgICAgICAgcGx1cmFsaXplOiBwbHVyYWxpemUsXG4gICAgICAgIHNpbXBsZUZvcm1hdDogc2ltcGxlRm9ybWF0LFxuICAgICAgICB0cmFuc2xhdGVkVGltZTogdHJhbnNsYXRlZFRpbWUsXG4gICAgICAgIHJld2FyZFNvdWxkT3V0OiByZXdhcmRTb3VsZE91dCxcbiAgICAgICAgcmV3YXJkUmVtYW5pbmc6IHJld2FyZFJlbWFuaW5nLFxuICAgICAgICBwYXJzZVVybDogcGFyc2VVcmwsXG4gICAgICAgIGhhc2hNYXRjaDogaGFzaE1hdGNoLFxuICAgICAgICByZWRyYXdIYXNoQ2hhbmdlOiByZWRyYXdIYXNoQ2hhbmdlLFxuICAgICAgICB1c2VBdmF0YXJPckRlZmF1bHQ6IHVzZUF2YXRhck9yRGVmYXVsdCxcbiAgICAgICAgbG9jYXRpb25BY3Rpb25NYXRjaDogbG9jYXRpb25BY3Rpb25NYXRjaCxcbiAgICAgICAgbmF2aWdhdGVUb0RldmlzZTogbmF2aWdhdGVUb0RldmlzZSxcbiAgICAgICAgc3RvcmVBY3Rpb246IHN0b3JlQWN0aW9uLFxuICAgICAgICBjYWxsU3RvcmVkQWN0aW9uOiBjYWxsU3RvcmVkQWN0aW9uLFxuICAgICAgICBVSUhlbHBlcjogVUlIZWxwZXIsXG4gICAgICAgIHRvQW5jaG9yOiB0b0FuY2hvcixcbiAgICAgICAgcGFyYW1CeU5hbWU6IHBhcmFtQnlOYW1lLFxuICAgICAgICBpMThuU2NvcGU6IGkxOG5TY29wZSxcbiAgICAgICAgc2VsZk9yRW1wdHk6IHNlbGZPckVtcHR5LFxuICAgICAgICBzY3JvbGxUbzogc2Nyb2xsVG9cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Lm1vbWVudCwgd2luZG93LkkxOG4pKTtcbiIsIndpbmRvdy5jLm1vZGVscyA9IChmdW5jdGlvbihtKSB7XG4gICAgdmFyIGNvbnRyaWJ1dGlvbkRldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjb250cmlidXRpb25fZGV0YWlscycpLFxuICAgICAgICBjb250cmlidXRpb25BY3Rpdml0eSA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjb250cmlidXRpb25fYWN0aXZpdGllcycpLFxuICAgICAgICBwcm9qZWN0RGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfZGV0YWlscycpLFxuICAgICAgICB1c2VyRGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3VzZXJfZGV0YWlscycpLFxuICAgICAgICBiYWxhbmNlID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2JhbGFuY2VzJyksXG4gICAgICAgIGJhbGFuY2VUcmFuc2FjdGlvbiA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdiYWxhbmNlX3RyYW5zYWN0aW9ucycpLFxuICAgICAgICBiYWxhbmNlVHJhbnNmZXIgPSBtLnBvc3RncmVzdC5tb2RlbCgnYmFsYW5jZV90cmFuc2ZlcnMnKSxcbiAgICAgICAgdXNlciA9IG0ucG9zdGdyZXN0Lm1vZGVsKCd1c2VycycpLFxuICAgICAgICBiYW5rQWNjb3VudCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdiYW5rX2FjY291bnRzJyksXG4gICAgICAgIHJld2FyZERldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdyZXdhcmRfZGV0YWlscycpLFxuICAgICAgICBwcm9qZWN0UmVtaW5kZXIgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9yZW1pbmRlcnMnKSxcbiAgICAgICAgY29udHJpYnV0aW9ucyA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjb250cmlidXRpb25zJyksXG4gICAgICAgIHRlYW1Ub3RhbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCd0ZWFtX3RvdGFscycpLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9ucycpLFxuICAgICAgICBwcm9qZWN0UG9zdERldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X3Bvc3RzX2RldGFpbHMnKSxcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXkgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zX3Blcl9kYXknKSxcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbiA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2NvbnRyaWJ1dGlvbnNfcGVyX2xvY2F0aW9uJyksXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb25zUGVyUmVmID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9uc19wZXJfcmVmJyksXG4gICAgICAgIHByb2plY3QgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdHMnKSxcbiAgICAgICAgcHJvamVjdFNlYXJjaCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdycGMvcHJvamVjdF9zZWFyY2gnKSxcbiAgICAgICAgY2F0ZWdvcnkgPSBtLnBvc3RncmVzdC5tb2RlbCgnY2F0ZWdvcmllcycpLFxuICAgICAgICBjYXRlZ29yeVRvdGFscyA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjYXRlZ29yeV90b3RhbHMnKSxcbiAgICAgICAgY2F0ZWdvcnlGb2xsb3dlciA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjYXRlZ29yeV9mb2xsb3dlcnMnKSxcbiAgICAgICAgdGVhbU1lbWJlciA9IG0ucG9zdGdyZXN0Lm1vZGVsKCd0ZWFtX21lbWJlcnMnKSxcbiAgICAgICAgbm90aWZpY2F0aW9uID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ25vdGlmaWNhdGlvbnMnKSxcbiAgICAgICAgc3RhdGlzdGljID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3N0YXRpc3RpY3MnKTtcblxuICAgIHRlYW1NZW1iZXIucGFnZVNpemUoNDApO1xuICAgIHJld2FyZERldGFpbC5wYWdlU2l6ZShmYWxzZSk7XG4gICAgcHJvamVjdC5wYWdlU2l6ZSgzMCk7XG4gICAgY2F0ZWdvcnkucGFnZVNpemUoNTApO1xuICAgIGNvbnRyaWJ1dGlvbkFjdGl2aXR5LnBhZ2VTaXplKDQwKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyaWJ1dGlvbkRldGFpbDogY29udHJpYnV0aW9uRGV0YWlsLFxuICAgICAgICBjb250cmlidXRpb25BY3Rpdml0eTogY29udHJpYnV0aW9uQWN0aXZpdHksXG4gICAgICAgIHByb2plY3REZXRhaWw6IHByb2plY3REZXRhaWwsXG4gICAgICAgIHVzZXJEZXRhaWw6IHVzZXJEZXRhaWwsXG4gICAgICAgIGJhbGFuY2U6IGJhbGFuY2UsXG4gICAgICAgIGJhbGFuY2VUcmFuc2FjdGlvbjogYmFsYW5jZVRyYW5zYWN0aW9uLFxuICAgICAgICBiYWxhbmNlVHJhbnNmZXI6IGJhbGFuY2VUcmFuc2ZlcixcbiAgICAgICAgYmFua0FjY291bnQ6IGJhbmtBY2NvdW50LFxuICAgICAgICB1c2VyOiB1c2VyLFxuICAgICAgICByZXdhcmREZXRhaWw6IHJld2FyZERldGFpbCxcbiAgICAgICAgY29udHJpYnV0aW9uczogY29udHJpYnV0aW9ucyxcbiAgICAgICAgdGVhbVRvdGFsOiB0ZWFtVG90YWwsXG4gICAgICAgIHRlYW1NZW1iZXI6IHRlYW1NZW1iZXIsXG4gICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgIHByb2plY3RTZWFyY2g6IHByb2plY3RTZWFyY2gsXG4gICAgICAgIGNhdGVnb3J5OiBjYXRlZ29yeSxcbiAgICAgICAgY2F0ZWdvcnlUb3RhbHM6IGNhdGVnb3J5VG90YWxzLFxuICAgICAgICBjYXRlZ29yeUZvbGxvd2VyOiBjYXRlZ29yeUZvbGxvd2VyLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheTogcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXksXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb246IHByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb24sXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb25zUGVyUmVmOiBwcm9qZWN0Q29udHJpYnV0aW9uc1BlclJlZixcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbjogcHJvamVjdENvbnRyaWJ1dGlvbixcbiAgICAgICAgcHJvamVjdFBvc3REZXRhaWw6IHByb2plY3RQb3N0RGV0YWlsLFxuICAgICAgICBwcm9qZWN0UmVtaW5kZXI6IHByb2plY3RSZW1pbmRlcixcbiAgICAgICAgbm90aWZpY2F0aW9uOiBub3RpZmljYXRpb24sXG4gICAgICAgIHN0YXRpc3RpYzogc3RhdGlzdGljXG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLnJvb3QuRmxleCA9IChmdW5jdGlvbihtLCBjLCBoLCBtb2RlbHMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0cyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgbCA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgIHNhbXBsZTMgPSBfLnBhcnRpYWwoXy5zYW1wbGUsIF8sIDMpLFxuICAgICAgICAgICAgICAgIGJ1aWxkZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbUFjdGlvbjogJy8vY2F0YXJzZS51czUubGlzdC1tYW5hZ2UuY29tL3N1YnNjcmliZS9wb3N0P3U9ZWJmY2QwZDE2ZGJiMDAwMWEwYmVhMzYzOSZhbXA7aWQ9OGE0YzFhMzNjZSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFkZERpc3F1cyA9IChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGguZGlzY3VzcygnaHR0cHM6Ly9jYXRhcnNlLm1lL2ZsZXgnLCAnZmxleF9wYWdlJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZsZXhWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgIG1vZGU6ICdlcScsXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnZXEnLFxuICAgICAgICAgICAgICAgICAgICByZWNvbW1lbmRlZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHN0YXRzTG9hZGVyID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKG1vZGVscy5zdGF0aXN0aWMuZ2V0Um93T3B0aW9ucygpKTtcblxuICAgICAgICAgICAgZmxleFZNLm1vZGUoJ2ZsZXgnKS5zdGF0ZSgnb25saW5lJykucmVjb21tZW5kZWQodHJ1ZSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHByb2plY3RzTG9hZGVyID0gbS5wb3N0Z3Jlc3QubG9hZGVyKG1vZGVscy5wcm9qZWN0LmdldFBhZ2VPcHRpb25zKGZsZXhWTS5wYXJhbWV0ZXJzKCkpKTtcblxuICAgICAgICAgICAgc3RhdHNMb2FkZXIubG9hZCgpLnRoZW4oc3RhdHMpO1xuXG4gICAgICAgICAgICBwcm9qZWN0c0xvYWRlci5sb2FkKCkudGhlbihfLmNvbXBvc2UocHJvamVjdHMsIHNhbXBsZTMpKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBhZGREaXNxdXM6IGFkZERpc3F1cyxcbiAgICAgICAgICAgICAgICBidWlsZGVyOiBidWlsZGVyLFxuICAgICAgICAgICAgICAgIHN0YXRzTG9hZGVyOiBzdGF0c0xvYWRlcixcbiAgICAgICAgICAgICAgICBzdGF0czogc3RhdHMsXG4gICAgICAgICAgICAgICAgcHJvamVjdHNMb2FkZXI6IHByb2plY3RzTG9hZGVyLFxuICAgICAgICAgICAgICAgIHByb2plY3RzOiB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjogcHJvamVjdHNMb2FkZXIsXG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHByb2plY3RzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgbGV0IHN0YXRzID0gXy5maXJzdChjdHJsLnN0YXRzKCkpO1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLmhlcm8tZnVsbC5oZXJvLXplbG8nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLmxvZ28tZmxleC1ob21lW3NyYz1cXCcvYXNzZXRzL2xvZ28tZmxleC5wbmdcXCddW3dpZHRoPVxcJzM1OVxcJ10nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tNjAudy1jb2wtcHVzaC0yLnctY29sLTgnLCAnVmFtb3MgY29uc3RydWlyIHVtYSBub3ZhIG1vZGFsaWRhZGUgZGUgY3Jvd2RmdW5kaW5nISBJbnNjcmV2YSBzZXUgZW1haWwgZSBzYWliYSBjb21vIGluc2NyZXZlciBvIHNldSBwcm9qZXRvIG5vIGZsZXghJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nU2lnbnVwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkZXI6IGN0cmwuYnVpbGRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QudS1tYXJnaW50b3AtNDAudS10ZXh0LWNlbnRlcicsICdQcmEgcXVlbSBzZXLDoT8nKSwgbSgnLmZvbnRzaXplLWJhc2UudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS02MCcsICdJbmljaWFyZW1vcyBhIGZhc2UgZGUgdGVzdGVzIGNvbSBjYXRlZ29yaWFzIGRlIHByb2pldG9zIGVzcGVjw61maWNhcycpLCBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5M2EwMWI2NmUyNTBhY2E2N2NiX2ljb24temVsby1jb20ucG5nXFwnXVt3aWR0aD1cXCcyMTBcXCddJyksIG0oJy5mb250c2l6ZS1sYXJnZXN0LmxpbmVoZWlnaHQtbG9vc2UnLCAnQ2F1c2FzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgncC5mb250c2l6ZS1iYXNlJywgJ0ZsZXhpYmlsaWRhZGUgcGFyYSBjYXVzYXMgZGUgaW1wYWN0byEgRXN0YXJlbW9zIGFiZXJ0b3MgYSBjYW1wYW5oYXMgZGUgb3JnYW5pemHDp8O1ZXMgb3UgcGVzc29hcyBmw61zaWNhcyBwYXJhIGFycmVjYWRhw6fDo28gZGUgcmVjdXJzb3MgcGFyYSBjYXVzYXMgcGVzc29haXMsIHByb2pldG9zIGFzc2lzdGVuY2lhaXMsIHNhw7pkZSwgYWp1ZGFzIGh1bWFuaXTDoXJpYXMsIHByb3Rlw6fDo28gYW9zIGFuaW1haXMsIGVtcHJlZW5kZWRvcmlzbW8gc29jaW9hbWJpZW50YWwsIGF0aXZpc21vIG91IHF1YWxxdWVyIGNvaXNhIHF1ZSB1bmEgYXMgcGVzc29hcyBwYXJhIGZhemVyIG8gYmVtLicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZ1tzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NjBlMzkyOWEwZGFlYTIzMGE1ZjEyY2RfaWNvbi16ZWxvLXBlc3NvYWwucG5nXFwnXVt3aWR0aD1cXCcyMTBcXCddJyksIG0oJy5mb250c2l6ZS1sYXJnZXN0LmxpbmVoZWlnaHQtbG9vc2UnLCAnVmFxdWluaGFzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgncC5mb250c2l6ZS1iYXNlJywgJ0NhbXBhbmhhcyBzaW1wbGVzIHF1ZSBwcmVjaXNhbSBkZSBmbGV4aWJpbGlkYWRlIHBhcmEgYXJyZWNhZGFyIGRpbmhlaXJvIGNvbSBwZXNzb2FzIHByw7N4aW1hcy4gRXN0YXJlbW9zIGFiZXJ0b3MgYSB1bWEgdmFyaWVkYWRlIGRlIGNhbXBhbmhhcyBwZXNzb2FpcyBxdWUgcG9kZW0gaXIgZGVzZGUgY29icmlyIGN1c3RvcyBkZSBlc3R1ZG9zIGEgYWp1ZGFyIHF1ZW0gcHJlY2lzYSBkZSB0cmF0YW1lbnRvIG3DqWRpY28uIERlIGp1bnRhciBhIGdyYW5hIHBhcmEgZmF6ZXIgYXF1ZWxhIGZlc3RhIGEgY29tcHJhciBwcmVzZW50ZXMgcGFyYSBhbGd1w6ltIGNvbSBhIGFqdWRhIGRhIGdhbGVyYS4gJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1zZWN0aW9uLnNlY3Rpb24uYmctZ3JlZW5saW1lLmZvbnRjb2xvci1uZWdhdGl2ZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VzdC51LW1hcmdpbnRvcC00MC51LW1hcmdpbmJvdHRvbS02MC51LXRleHQtY2VudGVyJywgJ0NvbW8gZnVuY2lvbmFyw6E/JyksIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5YzU3OGIyODQ0OTNlMmE0MjhhX3plbG8tbW9uZXkucG5nXFwnXVt3aWR0aD1cXCcxODBcXCddJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAudS10ZXh0LWNlbnRlci5mb250d2VpZ2h0LXNlbWlib2xkJywgJ0ZpcXVlIGNvbSBxdWFudG8gYXJyZWNhZGFyJyksIG0oJ3AudS10ZXh0LWNlbnRlci5mb250c2l6ZS1iYXNlJywgJ08gZmxleCDDqSBwYXJhIGltcHVsc2lvbmFyIGNhbXBhbmhhcyBvbmRlIHRvZG8gZGluaGVpcm8gw6kgYmVtIHZpbmRvISBWb2PDqiBmaWNhIGNvbSB0dWRvIHF1ZSBjb25zZWd1aXIgYXJyZWNhZGFyLicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZ1tzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NjBlMzlkMzdjMDEzZDRhM2VlNjg3ZDJfaWNvbi1yZXdhcmQucG5nXFwnXVt3aWR0aD1cXCcxODBcXCddJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAudS10ZXh0LWNlbnRlci5mb250d2VpZ2h0LXNlbWlib2xkJywgJ07Do28gcHJlY2lzYSBkZSByZWNvbXBlbnNhcycpLCBtKCdwLnUtdGV4dC1jZW50ZXIuZm9udHNpemUtYmFzZScsICdObyBmbGV4IG9mZXJlY2VyIHJlY29tcGVuc2FzIMOpIG9wY2lvbmFsLiBWb2PDqiBlc2NvbGhlIHNlIG9mZXJlY8OqLWxhcyBmYXogc2VudGlkbyBwYXJhIG8gc2V1IHByb2pldG8gZSBjYW1wYW5oYS4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2MGUzOWZiMDFiNjZlMjUwYWNhNjdlM19pY29uLWN1cmFkLnBuZ1xcJ11bd2lkdGg9XFwnMTgwXFwnXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwLnUtdGV4dC1jZW50ZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsICdWb2PDqiBtZXNtbyBwdWJsaWNhIHNldSBwcm9qZXRvJyksIG0oJ3AudS10ZXh0LWNlbnRlci5mb250c2l6ZS1iYXNlJywgJ1RvZG9zIG9zIHByb2pldG9zIGluc2NyaXRvcyBubyBmbGV4IGVudHJhbSBubyBhci4gQWdpbGlkYWRlIGUgZmFjaWxpZGFkZSBwYXJhIHZvY8OqIGNhcHRhciByZWN1cnNvcyBhdHJhdsOpcyBkYSBpbnRlcm5ldC4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5ZTc3YzAxM2Q0YTNlZTY4N2Q0X2ljb24tdGltZS5wbmdcXCddW3dpZHRoPVxcJzE4MFxcJ10nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC51LXRleHQtY2VudGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnRW5jZXJyZSBhIGNhbXBhbmhhIHF1YW5kbyBxdWlzZXInKSwgbSgncC51LXRleHQtY2VudGVyLmZvbnRzaXplLWJhc2UnLCAnTsOjbyBow6EgbGltaXRlIGRlIHRlbXBvIGRlIGNhcHRhw6fDo28uIFZvY8OqIGVzY29saGUgIHF1YW5kbyBlbmNlcnJhciBzdWEgY2FtcGFuaGEgZSByZWNlYmVyIG9zIHZhbG9yZXMgYXJyZWNhZGFkb3MuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1lZGl0YWJsZS5mb250c2l6ZS1sYXJnZXIudS1tYXJnaW50b3AtNDAudS1tYXJnaW4tYm90dG9tLTQwLnUtdGV4dC1jZW50ZXInLCAnQ29uaGXDp2EgYWxndW5zIGRvcyBwcmltZWlyb3MgcHJvamV0b3MgZmxleCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwucHJvamVjdHNMb2FkZXIoKSA/IGgubG9hZGVyKCkgOiBtLmNvbXBvbmVudChjLlByb2plY3RSb3csIHtjb2xsZWN0aW9uOiBjdHJsLnByb2plY3RzLCByZWY6ICdjdHJzZV9mbGV4Jywgd3JhcHBlcjogJy53LXJvdy51LW1hcmdpbnRvcC00MCd9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uZGl2aWRlcicpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTYwLnUtbWFyZ2ludG9wLTQwJywgJ0TDunZpZGFzJyksIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiAnUXVhaXMgc8OjbyBhcyB0YXhhcyBkYSBtb2RhbGlkYWRlIGZsZXjDrXZlbD8gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdDb21vIG5vIENhdGFyc2UsIGVudmlhciB1bSBwcm9qZXRvIG7Do28gY3VzdGEgbmFkYSEgRXN0YW1vcyBlc3R1ZGFuZG8gb3DDp8O1ZXMgcGFyYSBlbnRlbmRlciBxdWFsIHNlcsOhIGEgdGF4YSBjb2JyYWRhIG5vIHNlcnZpw6dvIENhdGFyc2UgZmxleC4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdEZSBvbmRlIHZlbSBvIGRpbmhlaXJvIGRvIG1ldSBwcm9qZXRvPycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiAnRmFtw61saWEsIGFtaWdvcywgZsOjcyBlIG1lbWJyb3MgZGUgY29tdW5pZGFkZXMgcXVlIHZvY8OqIGZheiBwYXJ0ZSBzw6NvIHNldXMgbWFpb3JlcyBjb2xhYm9yYWRvcmVzLiBTw6NvIGVsZXMgcXVlIGlyw6NvIGRpdnVsZ2FyIHN1YSBjYW1wYW5oYSBwYXJhIGFzIHBlc3NvYXMgcXVlIGVsZXMgY29uaGVjZW0sIGUgYXNzaW0gbyBjw61yY3VsbyBkZSBhcG9pYWRvcmVzIHZhaSBhdW1lbnRhbmRvIGUgYSBzdWEgY2FtcGFuaGEgZ2FuaGEgZm9yw6dhLidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogJ1F1YWwgYSBkaWZlcmVuw6dhIGVudHJlIG8gZmxleMOtdmVsIGUgbyBcInR1ZG8gb3UgbmFkYVwiPycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiAnQXR1YWxtZW50ZSBvIENhdGFyc2UgdXRpbGl6YSBhcGVuYXMgbyBtb2RlbG8gXCJ0dWRvIG91IG5hZGFcIiwgb25kZSB2b2PDqiBzw7MgZmljYSBjb20gbyBkaW5oZWlybyBzZSBiYXRlciBhIG1ldGEgZGUgYXJyZWNhZGHDp8OjbyBkZW50cm8gZG8gcHJhem8gZGEgY2FtcGFuaGEuIE8gbW9kZWxvIGZsZXjDrXZlbCDDqSBkaWZlcmVudGUgcG9pcyBwZXJtaXRlIHF1ZSBvIHJlYWxpemFkb3IgZmlxdWUgY29tIG8gcXVlIGFycmVjYWRhciwgaW5kZXBlbmRlbnRlIGRlIGF0aW5naXIgb3UgbsOjbyBhIG1ldGEgZG8gcHJvamV0byBubyBwcmF6byBkYSBjYW1wYW5oYS4gTsOjbyBoYXZlcsOhIGxpbWl0ZSBkZSB0ZW1wbyBwYXJhIGFzIGNhbXBhbmhhcy4gTm9zc28gc2lzdGVtYSBmbGV4w612ZWwgc2Vyw6EgYWxnbyBub3ZvIGVtIHJlbGHDp8OjbyBhb3MgbW9kZWxvcyBxdWUgZXhpc3RlbSBhdHVhbG1lbnRlIG5vIG1lcmNhZG8uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdQb3NzbyBpbnNjcmV2ZXIgcHJvamV0b3MgcGFyYSBhIG1vZGFsaWRhZGUgZmxleMOtdmVsIGrDoT8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogJ1NpbS4gQWluZGEgZXN0YW1vcyBlbSB0ZXN0ZSwgbWFzIHZvY8OqIGrDoSDDqSBzdXBlciBiZW0gdmluZG8hIEluc2NyZXZhIHNldSBlbWFpbCBlIHNhaWJhIGNvbW8gaW5zY3JldmVyIG8gc2V1IHByb2pldG8gbm8gZmxleCEnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdQb3IgcXXDqiB2b2PDqnMgcXVlcmVtIGZhemVyIG8gQ2F0YXJzZSBmbGV4PycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiAnQWNyZWRpdGFtb3MgcXVlIG8gYW1iaWVudGUgZG8gY3Jvd2RmdW5kaW5nIGJyYXNpbGVpcm8gYWluZGEgdGVtIGVzcGHDp28gcGFyYSBtdWl0YXMgYcOnw7VlcywgdGVzdGVzIGUgZXhwZXJpbWVudGHDp8O1ZXMgcGFyYSBlbnRlbmRlciBkZSBmYXRvIG8gcXVlIGFzIHBlc3NvYXMgcHJlY2lzYW0uIFNvbmhhbW9zIGNvbSB0b3JuYXIgbyBmaW5hbmNpYW1lbnRvIGNvbGV0aXZvIHVtIGjDoWJpdG8gbm8gQnJhc2lsLiBPIENhdGFyc2UgZmxleCDDqSBtYWlzIHVtIHBhc3NvIG5lc3NhIGRpcmXDp8Ojby4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdRdWFuZG8gdm9jw6pzIGlyw6NvIGxhbsOnYXIgbyBDYXRhcnNlIGZsZXg/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdBaW5kYSBuw6NvIHNhYmVtb3MgcXVhbmRvIGFicmlyZW1vcyBvIGZsZXggcGFyYSBvIHDDumJsaWNvLiBJcmVtb3MgcHJpbWVpcmFtZW50ZSBwYXNzYXIgcG9yIHVtIHBlcsOtb2RvIGRlIHRlc3RlcyBlIGRlcG9pcyBlc3RhYmVsZWNlciB1bWEgZGF0YSBkZSBsYW7Dp2FtZW50by4gU2Ugdm9jw6ogZGVzZWphIGFjb21wYW5oYXIgZSByZWNlYmVyIG5vdMOtY2lhcyBzb2JyZSBlc3NhIGNhbWluaGFkYSwgaW5zY3JldmEgc2V1IGVtYWlsIG5lc3NhIHDDoWdpbmEuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1sYXJnZS51LXRleHQtY2VudGVyLmJnLXB1cnBsZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci5mb250Y29sb3ItbmVnYXRpdmUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QnLCAnSW5zY3JldmEgc2V1IHByb2pldG8hJyksIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTYwJywgJ0luc2NyZXZhIHNldSBlbWFpbCBlIHNhaWJhIGNvbW8gaW5zY3JldmVyIG8gc2V1IHByb2pldG8gbm8gZmxleCEnKSwgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdTaWdudXAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkZXI6IGN0cmwuYnVpbGRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctc2VjdGlvbi5zZWN0aW9uLW9uZS1jb2x1bW4uYmctY2F0YXJzZS16ZWxvLnNlY3Rpb24tbGFyZ2Vbc3R5bGU9XCJtaW4taGVpZ2h0OiA1MHZoO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWVkaXRhYmxlLnUtbWFyZ2luYm90dG9tLTQwLmZvbnRzaXplLWxhcmdlci5saW5laGVpZ2h0LXRpZ2h0LmZvbnRjb2xvci1uZWdhdGl2ZScsICdPIGZsZXggw6kgdW0gZXhwZXJpbWVudG8gZSBpbmljaWF0aXZhIGRvIENhdGFyc2UsIG1haW9yIHBsYXRhZm9ybWEgZGUgY3Jvd2RmdW5kaW5nIGRvIEJyYXNpbC4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS10ZXh0LWNlbnRlcicsIChjdHJsLnN0YXRzTG9hZGVyKCkpID8gaC5sb2FkZXIoKSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtanVtYm8udGV4dC1zdWNjZXNzLmxpbmVoZWlnaHQtbG9vc2UnLCBoLmZvcm1hdE51bWJlcihzdGF0cy50b3RhbF9jb250cmlidXRvcnMsIDAsIDMpKSwgbSgncC5zdGFydC1zdGF0cy5mb250c2l6ZS1iYXNlLmZvbnRjb2xvci1uZWdhdGl2ZScsICdQZXNzb2FzIGphIGFwb2lhcmFtIHBlbG8gbWVub3MgMDEgcHJvamV0byBubyBDYXRhcnNlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWp1bWJvLnRleHQtc3VjY2Vzcy5saW5laGVpZ2h0LWxvb3NlJywgaC5mb3JtYXROdW1iZXIoc3RhdHMudG90YWxfcHJvamVjdHNfc3VjY2VzcywgMCwgMykpLCBtKCdwLnN0YXJ0LXN0YXRzLmZvbnRzaXplLWJhc2UuZm9udGNvbG9yLW5lZ2F0aXZlJywgJ1Byb2pldG9zIGphIGZvcmFtIGZpbmFuY2lhZG9zIG5vwqBDYXRhcnNlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWp1bWJvLnRleHQtc3VjY2Vzcy5saW5laGVpZ2h0LWxvb3NlJywgc3RhdHMudG90YWxfY29udHJpYnV0ZWQudG9TdHJpbmcoKS5zbGljZSgwLCAyKSArICcgbWlsaMO1ZXMnKSwgbSgncC5zdGFydC1zdGF0cy5mb250c2l6ZS1iYXNlLmZvbnRjb2xvci1uZWdhdGl2ZScsICdGb3JhbSBpbnZlc3RpZG9zIGVtIGlkZWlhcyBwdWJsaWNhZGFzIG5vIENhdGFyc2UnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLmJnLWJsdWUtb25lLmZvbnRjb2xvci1uZWdhdGl2ZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdSZWNvbWVuZGUgbyBDYXRhcnNlIGZsZXggcGFyYSBhbWlnb3MhICcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYudy1zdWItY29sLW1pZGRsZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLmljb24tc2hhcmUtbW9iaWxlW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzUzYTNmNjZlMDVlYjYxNDQxNzFkOGVkYl9mYWNlYm9vay14eGwucG5nXFwnXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS53LWJ1dHRvbi5idG4uYnRuLWxhcmdlLmJ0bi1mYltocmVmPVwiaHR0cDovL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyL3NoYXJlci5waHA/dT1odHRwczovL3d3dy5jYXRhcnNlLm1lL2ZsZXg/cmVmPWZhY2Vib29rJnRpdGxlPScgKyBlbmNvZGVVUklDb21wb25lbnQoJ0Nvbmhlw6dhIG8gbm92byBDYXRhcnNlIEZsZXghJykgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdDb21wYXJ0aWxoYXInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02LnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcuaWNvbi1zaGFyZS1tb2JpbGVbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTNhM2Y2NTEwNWViNjE0NDE3MWQ4ZWRhX3R3aXR0ZXItMjU2LnBuZ1xcJ10nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Eudy1idXR0b24uYnRuLmJ0bi1sYXJnZS5idG4tdHdlZXRbaHJlZj1cImh0dHA6Ly90d2l0dGVyLmNvbS8/c3RhdHVzPScgKyBlbmNvZGVVUklDb21wb25lbnQoJ1ZhbW9zIGNvbnN0cnVpciB1bWEgbm92YSBtb2RhbGlkYWRlIGRlIGNyb3dkZnVuZGluZyBwYXJhIG8gQ2F0YXJzZSEgSnVudGUtc2UgYSBuw7NzLCBpbnNjcmV2YSBzZXUgZW1haWwhJykgKyAnaHR0cHM6Ly93d3cuY2F0YXJzZS5tZS9mbGV4P3JlZj10d2l0dGVyXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdUdWl0YXInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctc2VjdGlvbi5zZWN0aW9uLWxhcmdlLmJnLWdyZWVubGltZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjcGFydGljaXBlLWRvLWRlYmF0ZS51LXRleHQtY2VudGVyJywge2NvbmZpZzogaC50b0FuY2hvcigpfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdoMS5mb250c2l6ZS1sYXJnZXN0LmZvbnRjb2xvci1uZWdhdGl2ZScsJ0NvbnN0cnVhIG8gZmxleCBjb25vc2NvJyksIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTYwLmZvbnRjb2xvci1uZWdhdGl2ZScsICdJbmljaWUgdW1hIGNvbnZlcnNhLCBwZXJndW50ZSwgY29tZW50ZSwgY3JpdGlxdWUgZSBmYcOnYSBzdWdlc3TDtWVzIScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2Rpc3F1c190aHJlYWQuY2FyZC51LXJhZGl1c1tzdHlsZT1cIm1pbi1oZWlnaHQ6IDUwdmg7XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwuYWRkRGlzcXVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5yb290Lkluc2lnaHRzID0gKChtLCBjLCBoLCBtb2RlbHMsIF8sIEkxOG4pID0+IHtcbiAgICBjb25zdCBJMThuU2NvcGUgPSBfLnBhcnRpYWwoaC5pMThuU2NvcGUsICdwcm9qZWN0cy5pbnNpZ2h0cycpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBmaWx0ZXJzVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgaW5zaWdodHNWTSA9IGMuSW5zaWdodHNWTSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0RGV0YWlscyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckRheSA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBsb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW47XG5cbiAgICAgICAgICAgIGZpbHRlcnNWTS5wcm9qZWN0X2lkKGFyZ3Mucm9vdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGwgPSBsb2FkZXIobW9kZWxzLnByb2plY3REZXRhaWwuZ2V0Um93T3B0aW9ucyhmaWx0ZXJzVk0ucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICBsLmxvYWQoKS50aGVuKHByb2plY3REZXRhaWxzKTtcblxuICAgICAgICAgICAgY29uc3QgbENvbnRyaWJ1dGlvbnNQZXJEYXkgPSBsb2FkZXIobW9kZWxzLnByb2plY3RDb250cmlidXRpb25zUGVyRGF5LmdldFJvd09wdGlvbnMoZmlsdGVyc1ZNLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgbENvbnRyaWJ1dGlvbnNQZXJEYXkubG9hZCgpLnRoZW4oY29udHJpYnV0aW9uc1BlckRheSk7XG5cbiAgICAgICAgICAgIGxldCBjb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZSA9IFtbJ0VzdGFkbycsICdBcG9pb3MnLCAnUiQgYXBvaWFkb3MgKCUgZG8gdG90YWwpJ11dO1xuICAgICAgICAgICAgY29uc3QgYnVpbGRQZXJMb2NhdGlvblRhYmxlID0gKGNvbnRyaWJ1dGlvbnMpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCFfLmlzRW1wdHkoY29udHJpYnV0aW9ucykpID8gXy5tYXAoXy5maXJzdChjb250cmlidXRpb25zKS5zb3VyY2UsIChjb250cmlidXRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbHVtbiA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKGNvbnRyaWJ1dGlvbi5zdGF0ZV9hY3JvbnltIHx8ICdPdXRyby9vdGhlcicpO1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW4ucHVzaChjb250cmlidXRpb24udG90YWxfY29udHJpYnV0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKFtjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWQsWy8vQWRkaW5nIHJvdyB3aXRoIGN1c3RvbSBjb21wYXJhdG9yID0+IHJlYWQgcHJvamVjdC1kYXRhLXRhYmxlIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBtKGBpbnB1dFt0eXBlPVwiaGlkZGVuXCJdW3ZhbHVlPVwiJHtjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWR9XCJgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdSJCAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGVkLCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsICcgKCcgKyBjb250cmlidXRpb24udG90YWxfb25fcGVyY2VudGFnZS50b0ZpeGVkKDIpICsgJyUpJylcbiAgICAgICAgICAgICAgICAgICAgXV0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29udHJpYnV0aW9uc1BlckxvY2F0aW9uVGFibGUucHVzaChjb2x1bW4pO1xuICAgICAgICAgICAgICAgIH0pIDogW107XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBsQ29udHJpYnV0aW9uc1BlckxvY2F0aW9uID0gbG9hZGVyKG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uLmdldFJvd09wdGlvbnMoZmlsdGVyc1ZNLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgbENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbi5sb2FkKCkudGhlbihidWlsZFBlckxvY2F0aW9uVGFibGUpO1xuXG4gICAgICAgICAgICBsZXQgY29udHJpYnV0aW9uc1BlclJlZlRhYmxlID0gW1tcbiAgICAgICAgICAgICAgICBJMThuLnQoJ3JlZl90YWJsZS5oZWFkZXIub3JpZ2luJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgIEkxOG4udCgncmVmX3RhYmxlLmhlYWRlci5jb250cmlidXRpb25zJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgIEkxOG4udCgncmVmX3RhYmxlLmhlYWRlci5hbW91bnQnLCBJMThuU2NvcGUoKSlcbiAgICAgICAgICAgIF1dO1xuICAgICAgICAgICAgY29uc3QgYnVpbGRQZXJSZWZUYWJsZSA9IChjb250cmlidXRpb25zKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICghXy5pc0VtcHR5KGNvbnRyaWJ1dGlvbnMpKSA/IF8ubWFwKF8uZmlyc3QoY29udHJpYnV0aW9ucykuc291cmNlLCAoY29udHJpYnV0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlID0gLyhjdHJzZV9bXFx3XSopLyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlc3QgPSByZS5leGVjKGNvbnRyaWJ1dGlvbi5yZWZlcnJhbF9saW5rKTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgY29sdW1uID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRlc3Qpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uLnJlZmVycmFsX2xpbmsgPSB0ZXN0WzBdO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29sdW1uLnB1c2goY29udHJpYnV0aW9uLnJlZmVycmFsX2xpbmsgPyBJMThuLnQoJ3JlZmVycmFsLicgKyBjb250cmlidXRpb24ucmVmZXJyYWxfbGluaywgSTE4blNjb3BlKHtkZWZhdWx0VmFsdWU6IGNvbnRyaWJ1dGlvbi5yZWZlcnJhbF9saW5rfSkpIDogSTE4bi50KCdyZWZlcnJhbC5vdGhlcnMnLCBJMThuU2NvcGUoKSkpO1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW4ucHVzaChjb250cmlidXRpb24udG90YWwpO1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW4ucHVzaChbY29udHJpYnV0aW9uLnRvdGFsX2Ftb3VudCxbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKGBpbnB1dFt0eXBlPVwiaGlkZGVuXCJdW3ZhbHVlPVwiJHtjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWR9XCJgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdSJCAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLnRvdGFsX2Ftb3VudCwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCAnICgnICsgY29udHJpYnV0aW9uLnRvdGFsX29uX3BlcmNlbnRhZ2UudG9GaXhlZCgyKSArICclKScpXG4gICAgICAgICAgICAgICAgICAgIF1dKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRyaWJ1dGlvbnNQZXJSZWZUYWJsZS5wdXNoKGNvbHVtbik7XG4gICAgICAgICAgICAgICAgfSkgOiBbXTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGxDb250cmlidXRpb25zUGVyUmVmID0gbG9hZGVyKG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uc1BlclJlZi5nZXRSb3dPcHRpb25zKGZpbHRlcnNWTS5wYXJhbWV0ZXJzKCkpKTtcbiAgICAgICAgICAgIGxDb250cmlidXRpb25zUGVyUmVmLmxvYWQoKS50aGVuKGJ1aWxkUGVyUmVmVGFibGUpO1xuXG4gICAgICAgICAgICBjb25zdCBleHBsYW5hdGlvbk1vZGVDb21wb25lbnQgPSAocHJvamVjdE1vZGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtb2RlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgJ2Fvbic6IGMuQW9uQWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAnZmxleCc6IGMuRmxleEFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvblxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZXNbcHJvamVjdE1vZGVdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBsOiBsLFxuICAgICAgICAgICAgICAgIGxDb250cmlidXRpb25zUGVyUmVmOiBsQ29udHJpYnV0aW9uc1BlclJlZixcbiAgICAgICAgICAgICAgICBsQ29udHJpYnV0aW9uc1BlckxvY2F0aW9uOiBsQ29udHJpYnV0aW9uc1BlckxvY2F0aW9uLFxuICAgICAgICAgICAgICAgIGxDb250cmlidXRpb25zUGVyRGF5OiBsQ29udHJpYnV0aW9uc1BlckRheSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJzVk06IGZpbHRlcnNWTSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0RGV0YWlsczogcHJvamVjdERldGFpbHMsXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckRheTogY29udHJpYnV0aW9uc1BlckRheSxcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZTogY29udHJpYnV0aW9uc1BlckxvY2F0aW9uVGFibGUsXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlclJlZlRhYmxlOiBjb250cmlidXRpb25zUGVyUmVmVGFibGUsXG4gICAgICAgICAgICAgICAgZXhwbGFuYXRpb25Nb2RlQ29tcG9uZW50OiBleHBsYW5hdGlvbk1vZGVDb21wb25lbnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gXy5maXJzdChjdHJsLnByb2plY3REZXRhaWxzKCkpLFxuICAgICAgICAgICAgICAgIHRvb2x0aXAgPSAoZWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuVG9vbHRpcCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWw6IGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJbmZvcm1hIGRlIG9uZGUgdmllcmFtIG9zIGFwb2lvcyBkZSBzZXUgcHJvamV0by4gU2FpYmEgY29tbyB1c2FyIGVzc2EgdGFiZWxhIGUgcGxhbmVqYXIgbWVsaG9yIHN1YXMgYcOnw7VlcyBkZSBjb211bmljYcOnw6NvICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYVtocmVmPVwiJHtJMThuLnQoJ3JlZl90YWJsZS5oZWxwX3VybCcsIEkxOG5TY29wZSgpKX1cIl1bdGFyZ2V0PSdfYmxhbmsnXWAsICdhcXVpLicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDM4MFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3QtaW5zaWdodHMnLCAhY3RybC5sKCkgPyBbXG4gICAgICAgICAgICAgICAgKHByb2plY3QuaXNfb3duZXJfb3JfYWRtaW4gPyBtLmNvbXBvbmVudChjLlByb2plY3REYXNoYm9hcmRNZW51LCB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IG0ucHJvcChwcm9qZWN0KVxuICAgICAgICAgICAgICAgIH0pIDogJycpLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LmRhc2hib2FyZC1oZWFkZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC1sb29zZXIudS1tYXJnaW5ib3R0b20tMTAnLCBJMThuLnQoJ2NhbXBhaWduX3RpdGxlJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUHJvamVjdERldGFpbHNDYXJkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncC4nICsgcHJvamVjdC5zdGF0ZSArICctcHJvamVjdC10ZXh0LmZvbnRzaXplLXNtYWxsLmxpbmVoZWlnaHQtbG9vc2UnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QubW9kZSA9PT0gJ2ZsZXgnICYmIF8uaXNOdWxsKHByb2plY3QuZXhwaXJlc19hdCkgJiYgcHJvamVjdC5zdGF0ZSAhPT0gJ2RyYWZ0JyA/IG0oJ3NwYW4nLCBbSTE4bi50KCdmaW5pc2hfZXhwbGFuYXRpb24nLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjA2NTA3ODYzLUNhdGFyc2UtZmxleC1QcmluY2lwYWlzLXBlcmd1bnRhcy1lLXJlc3Bvc3Rhcy1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgSTE4bi50KCdrbm93X21vcmUnLCBJMThuU2NvcGUoKSkpXSkgOiBtLnRydXN0KEkxOG4udChgY2FtcGFpZ24uJHtwcm9qZWN0Lm1vZGV9LiR7cHJvamVjdC5zdGF0ZX1gLCBJMThuU2NvcGUoe3VzZXJuYW1lOiBwcm9qZWN0LnVzZXIubmFtZSwgZXhwaXJlc19hdDogaC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpLCBzZW50X3RvX2FuYWx5c2lzX2F0OiBoLm1vbWVudGlmeShwcm9qZWN0LnNlbnRfdG9fYW5hbHlzaXNfYXQpfSkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSwgKHByb2plY3QuaXNfcHVibGlzaGVkKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmRpdmlkZXInKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLW9uZS1jb2x1bW4uc2VjdGlvbi5iZy1ncmF5LmJlZm9yZS1mb290ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21pbi1oZWlnaHQnOiAnMzAwcHgnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFjdHJsLmxDb250cmlidXRpb25zUGVyRGF5KCkgPyBtLmNvbXBvbmVudChjLlByb2plY3REYXRhQ2hhcnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJEYXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IEkxOG4udCgnYW1vdW50X3Blcl9kYXlfbGFiZWwnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YUtleTogJ3RvdGFsX2Ftb3VudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeEF4aXM6IChpdGVtKSA9PiBoLm1vbWVudGlmeShpdGVtLnBhaWRfYXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSA6IGgubG9hZGVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21pbi1oZWlnaHQnOiAnMzAwcHgnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFjdHJsLmxDb250cmlidXRpb25zUGVyRGF5KCkgPyBtLmNvbXBvbmVudChjLlByb2plY3REYXRhQ2hhcnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJEYXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IEkxOG4udCgnY29udHJpYnV0aW9uc19wZXJfZGF5X2xhYmVsJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFLZXk6ICd0b3RhbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeEF4aXM6IChpdGVtKSA9PiBoLm1vbWVudGlmeShpdGVtLnBhaWRfYXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSA6IGgubG9hZGVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LWNvbnRyaWJ1dGlvbnMtcGVyLXJlZicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJMThuLnQoJ3JlZl9vcmlnaW5fdGl0bGUnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgubmV3RmVhdHVyZUJhZGdlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXAoJ3NwYW4uZm9udHNpemUtc21hbGxlc3QudG9vbHRpcC13cmFwcGVyLmZhLmZhLXF1ZXN0aW9uLWNpcmNsZS5mb250Y29sb3Itc2Vjb25kYXJ5JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhY3RybC5sQ29udHJpYnV0aW9uc1BlclJlZigpID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0RGF0YVRhYmxlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhYmxlOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJSZWZUYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFNvcnRJbmRleDogLTJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSA6IGgubG9hZGVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1jb250cmlidXRpb25zLXBlci1yZWYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlcicsIEkxOG4udCgnbG9jYXRpb25fb3JpZ2luX3RpdGxlJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhY3RybC5sQ29udHJpYnV0aW9uc1BlckxvY2F0aW9uKCkgPyBtLmNvbXBvbmVudChjLlByb2plY3REYXRhVGFibGUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFibGU6IGN0cmwuY29udHJpYnV0aW9uc1BlckxvY2F0aW9uVGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRTb3J0SW5kZXg6IC0yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmVtaW5kZXJDb3VudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdIDogJydcbiAgICAgICAgICAgIF0gOiBoLmxvYWRlcigpKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuXywgd2luZG93LkkxOG4pKTtcbiIsIndpbmRvdy5jLnJvb3QuSm9icyA9ICgobSwgSTE4biwgaCkgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3BhZ2VzLmpvYnMnKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG5cbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5oZXJvLWpvYnMuaGVyby1tZWRpdW0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lLnUtdGV4dC1jZW50ZXInLFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy5pY29uLWhlcm9bc3JjPVwiL2Fzc2V0cy9sb2dvLXdoaXRlLnBuZ1wiXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAuZm9udHNpemUtbGFyZ2VzdCcsIEkxOG4udCgndGl0bGUnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS1tYXJnaW50b3AtNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtcHVzaC0yLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsIEkxOG4udCgnaW5mbycsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaHJlZj1cIi9wcm9qZWN0cy9uZXdcIl0udy1idXR0b24uYnRuLmJ0bi1sYXJnZS5idG4taW5saW5lJywgSTE4bi50KCdjdGEnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LkkxOG4sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLnJvb3QuTGl2ZVN0YXRpc3RpY3MgPSAoKG0sIG1vZGVscywgaCwgXywgSlNPTikgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzID0ge30pID0+IHtcbiAgICAgICAgICAgIGxldCBwYWdlU3RhdGlzdGljcyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uRGF0YSA9IG0ucHJvcCh7fSk7XG5cbiAgICAgICAgICAgIG1vZGVscy5zdGF0aXN0aWMuZ2V0Um93KCkudGhlbihwYWdlU3RhdGlzdGljcyk7XG4gICAgICAgICAgICAvLyBhcmdzLnNvY2tldCBpcyBhIHNvY2tldCBwcm92aWRlZCBieSBzb2NrZXQuaW9cbiAgICAgICAgICAgIC8vIGNhbiBzZWUgdGhlcmUgaHR0cHM6Ly9naXRodWIuY29tL2NhdGFyc2UvY2F0YXJzZS1saXZlL2Jsb2IvbWFzdGVyL3B1YmxpYy9pbmRleC5qcyNMOFxuICAgICAgICAgICAgaWYgKGFyZ3Muc29ja2V0ICYmIF8uaXNGdW5jdGlvbihhcmdzLnNvY2tldC5vbikpIHtcbiAgICAgICAgICAgICAgICBhcmdzLnNvY2tldC5vbignbmV3X3BhaWRfY29udHJpYnV0aW9ucycsIChtc2cpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uRGF0YShKU09OLnBhcnNlKG1zZy5wYXlsb2FkKSk7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVscy5zdGF0aXN0aWMuZ2V0Um93KCkudGhlbihwYWdlU3RhdGlzdGljcyk7XG4gICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcGFnZVN0YXRpc3RpY3M6IHBhZ2VTdGF0aXN0aWNzLFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkRhdGE6IG5vdGlmaWNhdGlvbkRhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICBsZXQgZGF0YSA9IGN0cmwubm90aWZpY2F0aW9uRGF0YSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctc2VjdGlvbi5iZy1zdGF0cy5zZWN0aW9uLm1pbi1oZWlnaHQtMTAwJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgXy5tYXAoY3RybC5wYWdlU3RhdGlzdGljcygpLCAoc3RhdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW20oJ2ltZy51LW1hcmdpbmJvdHRvbS02MFtzcmM9XCJodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU1YWRhNWRkMTFiMzZhNTI2MTZkOTdkZl9zeW1ib2wtY2F0YXJzZS5wbmdcIl0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3ItbmVnYXRpdmUudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLW1lZ2FqdW1iby5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1IkICcgKyBoLmZvcm1hdE51bWJlcihzdGF0LnRvdGFsX2NvbnRyaWJ1dGVkLCAyLCAzKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlJywgJ0RvYWRvcyBwYXJhIHByb2pldG9zIHB1YmxpY2Fkb3MgcG9yIGFxdWknKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udHdlaWdodC1zZW1pYm9sZCcsIHN0YXQudG90YWxfY29udHJpYnV0b3JzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UnLCAnUGVzc29hcyBqw6EgYXBvaWFyYW0gcGVsbyBtZW5vcyAxIHByb2pldG8gbm8gQ2F0YXJzZScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIH0pKSwgKCFfLmlzRW1wdHkoZGF0YSkgPyBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLnUtcmFkaXVzLnUtbWFyZ2luYm90dG9tLTYwLm1lZGl1bScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi51LXJvdW5kW3NyYz1cIicgKyBoLnVzZUF2YXRhck9yRGVmYXVsdChkYXRhLnVzZXJfaW1hZ2UpICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtc21hbGwtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBkYXRhLnVzZXJfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnUtdGV4dC1jZW50ZXIuZm9udHNpemUtYmFzZS51LW1hcmdpbnRvcC0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsICdhY2Fib3UgZGUgYXBvaWFyIG8nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QudS1yYWRpdXNbc3JjPVwiJyArIGRhdGEucHJvamVjdF9pbWFnZSArICdcIl1bd2lkdGg9XCI3NVwiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtc21hbGwtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBkYXRhLnByb2plY3RfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlci5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC5mb250Y29sb3ItbmVnYXRpdmUnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW4uZm9udGNvbG9yLW5lZ2F0aXZlW2hyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vY2F0YXJzZVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWdpdGh1YicsICcuJyksICcgT3BlbiBTb3VyY2UgY29tIG9yZ3VsaG8hICdcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93Ll8sIHdpbmRvdy5KU09OKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLnJvb3QuUHJvamVjdHNEYXNoYm9hcmQgY29tcG9uZW50XG4gKiBBIHJvb3QgY29tcG9uZW50IHRvIG1hbmFnZSBwcm9qZWN0c1xuICpcbiAqIEV4YW1wbGU6XG4gKiBUbyBtb3VudCB0aGlzIGNvbXBvbmVudCBqdXN0IGNyZWF0ZSBhIERPTSBlbGVtZW50IGxpa2U6XG4gKiA8ZGl2IGRhdGEtbWl0aHJpbD1cIlByb2plY3RzRGFzaGJvYXJkXCI+XG4gKi9cbndpbmRvdy5jLnJvb3QuUHJvamVjdHNEYXNoYm9hcmQgPSAoKG0sIGMsIGgsIF8sIHZtcykgPT4ge1xuICAgIHJldHVybiB7XG5cbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB2bXMucHJvamVjdChhcmdzLnByb2plY3RfaWQsIGFyZ3MucHJvamVjdF91c2VyX2lkKTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGN0cmwucHJvamVjdERldGFpbHM7XG4gICAgICAgICAgICByZXR1cm4gcHJvamVjdCgpLmlzX293bmVyX29yX2FkbWluID9cbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3REYXNoYm9hcmRNZW51LCB7cHJvamVjdDogcHJvamVjdH0pIDogJyc7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cuYy52bXMpKTtcbiIsIi8qKlxuICogd2luZG93LmMucm9vdC5Qcm9qZWN0c0V4cGxvcmUgY29tcG9uZW50XG4gKiBBIHJvb3QgY29tcG9uZW50IHRvIHNob3cgcHJvamVjdHMgYWNjb3JkaW5nIHRvIHVzZXIgZGVmaW5lZCBmaWx0ZXJzXG4gKlxuICogRXhhbXBsZTpcbiAqIFRvIG1vdW50IHRoaXMgY29tcG9uZW50IGp1c3QgY3JlYXRlIGEgRE9NIGVsZW1lbnQgbGlrZTpcbiAqIDxkaXYgZGF0YS1taXRocmlsPVwiUHJvamVjdHNFeHBsb3JlXCI+XG4gKi9cbndpbmRvdy5jLnJvb3QuUHJvamVjdHNFeHBsb3JlID0gKChtLCBjLCBoLCBfLCBtb21lbnQpID0+IHtcbiAgICByZXR1cm4ge1xuXG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcnMgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0sXG4gICAgICAgICAgICAgICAgICBmb2xsb3cgPSBjLm1vZGVscy5jYXRlZ29yeUZvbGxvd2VyLFxuICAgICAgICAgICAgICAgICAgZmlsdGVyc01hcCA9IGMudm1zLnByb2plY3RGaWx0ZXJzKCksXG4gICAgICAgICAgICAgICAgICBjYXRlZ29yeUNvbGxlY3Rpb24gPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgICAgLy8gRmFrZSBwcm9qZWN0cyBvYmplY3QgdG8gYmUgYWJsZSB0byByZW5kZXIgcGFnZSB3aGlsZSBsb2FkZGluZyAoaW4gY2FzZSBvZiBzZWFyY2gpXG4gICAgICAgICAgICAgICAgICBwcm9qZWN0cyA9IG0ucHJvcCh7Y29sbGVjdGlvbjogbS5wcm9wKFtdKSwgaXNMb2FkaW5nOiAoKSA9PiB7IHJldHVybiB0cnVlOyB9LCBpc0xhc3RQYWdlOiAoKSA9PiB7IHJldHVybiB0cnVlOyB9fSksXG4gICAgICAgICAgICAgICAgICB0aXRsZSA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlJZCA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgICAgZmluZENhdGVnb3J5ID0gKGlkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uZmluZChjYXRlZ29yeUNvbGxlY3Rpb24oKSwgZnVuY3Rpb24oYyl7IHJldHVybiBjLmlkID09PSBwYXJzZUludChpZCk7IH0pO1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gXy5jb21wb3NlKGZpbmRDYXRlZ29yeSwgY2F0ZWdvcnlJZCksXG5cbiAgICAgICAgICAgICAgICAgIGxvYWRDYXRlZ29yaWVzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjLm1vZGVscy5jYXRlZ29yeS5nZXRQYWdlV2l0aFRva2VuKGZpbHRlcnMoe30pLm9yZGVyKHtuYW1lOiAnYXNjJ30pLnBhcmFtZXRlcnMoKSkudGhlbihjYXRlZ29yeUNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgZm9sbG93Q2F0ZWdvcnkgPSAoaWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xsb3cucG9zdFdpdGhUb2tlbih7Y2F0ZWdvcnlfaWQ6IGlkfSkudGhlbihsb2FkQ2F0ZWdvcmllcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHVuRm9sbG93Q2F0ZWdvcnkgPSAoaWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xsb3cuZGVsZXRlV2l0aFRva2VuKGZpbHRlcnMoe2NhdGVnb3J5X2lkOiAnZXEnfSkuY2F0ZWdvcnlfaWQoaWQpLnBhcmFtZXRlcnMoKSkudGhlbihsb2FkQ2F0ZWdvcmllcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgbG9hZFJvdXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvdXRlID0gd2luZG93LmxvY2F0aW9uLmhhc2gubWF0Y2goL1xcIyhbXlxcL10qKVxcLz8oXFxkKyk/LyksXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXQgPSByb3V0ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZVsyXSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5kQ2F0ZWdvcnkocm91dGVbMl0pLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRnJvbVJvdXRlID0gICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBieUNhdGVnb3J5ID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZV9vcmRlcjogJ2d0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeV9pZDogJ2VxJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5zdGF0ZV9vcmRlcigncHVibGlzaGVkJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZVsxXSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyc01hcFtyb3V0ZVsxXV0gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3RpdGxlOiBjYXQubmFtZSwgZmlsdGVyOiBieUNhdGVnb3J5LmNhdGVnb3J5X2lkKGNhdC5pZCl9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXIgPSBmaWx0ZXJGcm9tUm91dGUoKSB8fCBmaWx0ZXJzTWFwLnJlY29tbWVuZGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaCA9IGgucGFyYW1CeU5hbWUoJ3BnX3NlYXJjaCcpLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoUHJvamVjdHMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGwgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYy5tb2RlbHMucHJvamVjdFNlYXJjaC5wb3N0T3B0aW9ucyh7cXVlcnk6IHNlYXJjaH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZSA9IHsgLy8gV2UgYnVpbGQgYW4gb2JqZWN0IHdpdGggdGhlIHNhbWUgaW50ZXJmYWNlIGFzIHBhZ2luYXRpb25WTVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzTG9hZGluZzogbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzTGFzdFBhZ2U6ICgpID0+IHsgcmV0dXJuIHRydWU7IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0UGFnZTogKCkgPT4geyByZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbC5sb2FkKCkudGhlbihwYWdlLmNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFnZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZFByb2plY3RzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwYWdlcyA9IG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShjLm1vZGVscy5wcm9qZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZXMuZmlyc3RQYWdlKGZpbHRlci5maWx0ZXIub3JkZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3Blbl9mb3JfY29udHJpYnV0aW9uczogJ2Rlc2MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVfb3JkZXI6ICdhc2MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdkZXNjJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY29tbWVuZGVkOiAnZGVzYycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZGVzYydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhZ2VzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc1N0cmluZyhzZWFyY2gpICYmIHNlYXJjaC5sZW5ndGggPiAwICYmIHJvdXRlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlKCdCdXNjYSAnICsgc2VhcmNoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdHMoc2VhcmNoUHJvamVjdHMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUoZmlsdGVyLnRpdGxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdHMobG9hZFByb2plY3RzKCkpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeUlkKGNhdCAmJiBjYXQuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgIHJvdXRlID8gdG9nZ2xlQ2F0ZWdvcmllcyhmYWxzZSkgOiB0b2dnbGVDYXRlZ29yaWVzKHRydWUpO1xuXG4gICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICB0b2dnbGVDYXRlZ29yaWVzID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKTtcblxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9hZFJvdXRlKCk7XG4gICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcblxuICAgICAgICAgICAgLy8gSW5pdGlhbCBsb2Fkc1xuICAgICAgICAgICAgYy5tb2RlbHMucHJvamVjdC5wYWdlU2l6ZSg5KTtcbiAgICAgICAgICAgIGxvYWRDYXRlZ29yaWVzKCkudGhlbihsb2FkUm91dGUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNhdGVnb3JpZXM6IGNhdGVnb3J5Q29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICBmb2xsb3dDYXRlZ29yeTogZm9sbG93Q2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgdW5Gb2xsb3dDYXRlZ29yeTogdW5Gb2xsb3dDYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0czogcHJvamVjdHMsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJzTWFwOiBmaWx0ZXJzTWFwLFxuICAgICAgICAgICAgICAgIHRvZ2dsZUNhdGVnb3JpZXM6IHRvZ2dsZUNhdGVnb3JpZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5oZXJvLXNlYXJjaCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5TZWFyY2gpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2V4cGxvcmUtb3Blbi5saW5rLWhpZGRlbi13aGl0ZS5mb250d2VpZ2h0LWxpZ2h0LmZvbnRzaXplLWxhcmdlcltocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiXScse29uY2xpY2s6ICgpID0+IGN0cmwudG9nZ2xlQ2F0ZWdvcmllcy50b2dnbGUoKX0sIFsnRXhwbG9yZSBwcm9qZXRvcyBpbmNyw612ZWlzICcsbShgc3BhbiNleHBsb3JlLWJ0bi5mYS5mYS1hbmdsZS1kb3duJHtjdHJsLnRvZ2dsZUNhdGVnb3JpZXMoKSA/ICcub3BlbmVkJyA6ICcnfWAsICcnKV0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oYCNjYXRlZ29yaWVzLmNhdGVnb3J5LXNsaWRlciR7Y3RybC50b2dnbGVDYXRlZ29yaWVzKCkgPyAnLm9wZW5lZCcgOiAnJ31gLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLmNhdGVnb3JpZXMoKSwgKGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5DYXRlZ29yeUJ1dHRvbiwge2NhdGVnb3J5OiBjYXRlZ29yeX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLmZpbHRlcnNNYXAsIChmaWx0ZXIsIGhyZWYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLkZpbHRlckJ1dHRvbiwge3RpdGxlOiBmaWx0ZXIudGl0bGUsIGhyZWY6IGhyZWZ9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNi53LWNvbC1zbWFsbC03LnctY29sLXRpbnktNycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlcicsIGN0cmwudGl0bGUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIF8uaXNPYmplY3QoY3RybC5jYXRlZ29yeSgpKSA/IG0oJy53LWNvbC53LWNvbC02LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBtKCcudy1jb2wudy1jb2wtOC53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgbSgnLmZvbGxvd2luZy5mb250c2l6ZS1zbWFsbC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtcmlnaHQnLCBgJHtjdHJsLmNhdGVnb3J5KCkuZm9sbG93ZXJzfSBzZWd1aWRvcmVzYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtMTIudy1jb2wtdGlueS0xMicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICBjdHJsLmNhdGVnb3J5KCkuZm9sbG93aW5nID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgbSgnYS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnkudW5mb2xsb3ctYnRuW2hyZWY9XFwnI1xcJ10nLCB7b25jbGljazogY3RybC51bkZvbGxvd0NhdGVnb3J5KGN0cmwuY2F0ZWdvcnkoKS5pZCl9LCAnRGVpeGFyIGRlIHNlZ3VpcicpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgbSgnYS5idG4uYnRuLW1lZGl1bS5mb2xsb3ctYnRuW2hyZWY9XFwnI1xcJ10nLCB7b25jbGljazogY3RybC5mb2xsb3dDYXRlZ29yeShjdHJsLmNhdGVnb3J5KCkuaWQpfSwgJ1NlZ3VpcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIF0pIDogJydcblxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIF8ubWFwKGN0cmwucHJvamVjdHMoKS5jb2xsZWN0aW9uKCksIChwcm9qZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RDYXJkLCB7cHJvamVjdDogcHJvamVjdCwgcmVmOiAnY3Ryc2VfZXhwbG9yZSd9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5wcm9qZWN0cygpLmlzTG9hZGluZygpID8gaC5sb2FkZXIoKSA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoY3RybC5wcm9qZWN0cygpLmlzTGFzdFBhZ2UoKSB8fCBjdHJsLnByb2plY3RzKCkuaXNMb2FkaW5nKCkgfHwgXy5pc0VtcHR5KGN0cmwucHJvamVjdHMoKS5jb2xsZWN0aW9uKCkpKSA/ICcnIDogbSgnYS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnlbaHJlZj1cXCcjbG9hZE1vcmVcXCddJywge29uY2xpY2s6ICgpID0+IHsgY3RybC5wcm9qZWN0cygpLm5leHRQYWdlKCk7IHJldHVybiBmYWxzZTsgfX0sICdDYXJyZWdhciBtYWlzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCwgd2luZG93Ll8sIHdpbmRvdy5tb21lbnQpKTtcbiIsIndpbmRvdy5jLnJvb3QuUHJvamVjdHNIb21lID0gKCgobSwgYywgbW9tZW50LCBoLCBfLCBJMThuKSA9PiB7XG4gICAgY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAncHJvamVjdHMuaG9tZScpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHNhbXBsZTYgPSBfLnBhcnRpYWwoXy5zYW1wbGUsIF8sIDYpLFxuICAgICAgICAgICAgICAgIGxvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcixcbiAgICAgICAgICAgICAgICBwcm9qZWN0ID0gYy5tb2RlbHMucHJvamVjdCxcbiAgICAgICAgICAgICAgICBmaWx0ZXJzID0gYy52bXMucHJvamVjdEZpbHRlcnMoKSxcbiAgICAgICAgICAgICAgICB2bSA9IGMudm1zLmhvbWUoKTtcblxuICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbnMgPSBfLm1hcChbJ3JlY29tbWVuZGVkJ10sIChuYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZiA9IGZpbHRlcnNbbmFtZV0sXG4gICAgICAgICAgICAgICAgICAgICAgY0xvYWRlciA9IGxvYWRlcihwcm9qZWN0LmdldFBhZ2VPcHRpb25zKGYuZmlsdGVyLnBhcmFtZXRlcnMoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24gPSBtLnByb3AoW10pO1xuXG4gICAgICAgICAgICAgICAgY0xvYWRlci5sb2FkKCkudGhlbihfLmNvbXBvc2UoY29sbGVjdGlvbiwgc2FtcGxlNikpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGYudGl0bGUsXG4gICAgICAgICAgICAgICAgICAgIGhhc2g6IG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgIGxvYWRlcjogY0xvYWRlclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uczogY29sbGVjdGlvbnMsXG4gICAgICAgICAgICAgICAgc2xpZGVzQ29udGVudDogdm0uYmFubmVyc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2xpZGVzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLm1hcChjdHJsLnNsaWRlc0NvbnRlbnQsIChzbGlkZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjdXN0b21TdHlsZSA9IGBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJHtzbGlkZS5pbWFnZX0pO2A7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBtKCcudy1jb250YWluZXIudS10ZXh0LWNlbnRlcicsW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2gxLmZvbnRjb2xvci1uZWdhdGl2ZS5mb250c2l6ZS1tZWdhanVtYm8udS1tYXJnaW5ib3R0b20tMjAnLCBzbGlkZS50aXRsZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaDIuZm9udGNvbG9yLW5lZ2F0aXZlLmZvbnRzaXplLWxhcmdlJywgbS50cnVzdChzbGlkZS5zdWJ0aXRsZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC5idG4taW5saW5lJyx7aHJlZjogc2xpZGUubGlua30sIHNsaWRlLmN0YSlcbiAgICAgICAgICAgICAgICAgICAgXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXN0b21TdHlsZTogY3VzdG9tU3R5bGVcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5TbGlkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzOiBzbGlkZXMoKSxcbiAgICAgICAgICAgICAgICAgICAgZWZmZWN0OiAnZmFkZScsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlQ2xhc3M6ICdoZXJvLXNsaWRlIHN0YXJ0JyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnaGVyby1mdWxsIGhlcm8tZnVsbC1zbGlkZScsXG4gICAgICAgICAgICAgICAgICAgIHNsaWRlclRpbWU6IDEwMDAwXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgXy5tYXAoY3RybC5jb2xsZWN0aW9ucywgKGNvbGxlY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuUHJvamVjdFJvdywge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogYGhvbWVfJHtjb2xsZWN0aW9uLmhhc2h9YFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkNvbnRyaWJ1dGlvbkFjdGl2aXRpZXMpXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgfTtcbn0pKHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93Lm1vbWVudCwgd2luZG93LmMuaCwgd2luZG93Ll8sIHdpbmRvdy5JMThuKSk7XG4iLCJ3aW5kb3cuYy5yb290LlByb2plY3RzU2hvdyA9ICgobSwgYywgXywgaCwgdm1zKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB2bXMucHJvamVjdChhcmdzLnByb2plY3RfaWQsIGFyZ3MucHJvamVjdF91c2VyX2lkKTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgbGV0IHByb2plY3QgPSBjdHJsLnByb2plY3REZXRhaWxzO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3Qtc2hvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0SGVhZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlckRldGFpbHM6IGN0cmwudXNlckRldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFRhYnMsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBjdHJsLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdE1haW4sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBjdHJsLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChwcm9qZWN0KCkgJiYgcHJvamVjdCgpLmlzX293bmVyX29yX2FkbWluID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0RGFzaGJvYXJkTWVudSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICB9KSA6ICcnKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuXywgd2luZG93LmMuaCwgd2luZG93LmMudm1zKSk7XG4iLCJ3aW5kb3cuYy5yb290LlN0YXJ0ID0gKChtLCBjLCBoLCBtb2RlbHMsIEkxOG4pID0+IHtcbiAgICBjb25zdCBJMThuU2NvcGUgPSBfLnBhcnRpYWwoaC5pMThuU2NvcGUsICdwYWdlcy5zdGFydCcpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIGNhdGVnb3JpZXMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkUGFuZSA9IG0ucHJvcCgwKSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZENhdGVnb3J5ID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBmZWF0dXJlZFByb2plY3RzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZENhdGVnb3J5SWR4ID0gbS5wcm9wKC0xKSxcbiAgICAgICAgICAgICAgICBzdGFydHZtID0gYy52bXMuc3RhcnQoSTE4biksXG4gICAgICAgICAgICAgICAgZmlsdGVycyA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSxcbiAgICAgICAgICAgICAgICBwYW5lSW1hZ2VzID0gc3RhcnR2bS5wYW5lcyxcbiAgICAgICAgICAgICAgICBjYXRlZ29yeXZtID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5X2lkOiAnZXEnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgcHJvamVjdHZtID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB1c2Vydm0gPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBsb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXIsXG4gICAgICAgICAgICAgICAgc3RhdHNMb2FkZXIgPSBsb2FkZXIobW9kZWxzLnN0YXRpc3RpYy5nZXRSb3dPcHRpb25zKCkpLFxuICAgICAgICAgICAgICAgIGxvYWRDYXRlZ29yaWVzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYy5tb2RlbHMuY2F0ZWdvcnkuZ2V0UGFnZShmaWx0ZXJzKHt9KS5vcmRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnYXNjJ1xuICAgICAgICAgICAgICAgICAgICB9KS5wYXJhbWV0ZXJzKCkpLnRoZW4oY2F0ZWdvcmllcyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZWxlY3RQYW5lID0gKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRQYW5lKGlkeCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsQ2F0ZWdvcnkgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2FkZXIobW9kZWxzLmNhdGVnb3J5VG90YWxzLmdldFJvd09wdGlvbnMoY2F0ZWdvcnl2bS5wYXJhbWV0ZXJzKCkpKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxQcm9qZWN0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9hZGVyKG1vZGVscy5wcm9qZWN0RGV0YWlsLmdldFJvd09wdGlvbnMocHJvamVjdHZtLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbFVzZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2FkZXIobW9kZWxzLnVzZXJEZXRhaWwuZ2V0Um93T3B0aW9ucyh1c2Vydm0ucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZWxlY3RDYXRlZ29yeSA9IChjYXRlZ29yeSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeUlkeChjYXRlZ29yeS5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeXZtLmNhdGVnb3J5X2lkKGNhdGVnb3J5LmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnkoW2NhdGVnb3J5XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbENhdGVnb3J5KCkubG9hZCgpLnRoZW4obG9hZENhdGVnb3J5UHJvamVjdHMpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2V0VXNlciA9ICh1c2VyLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZmVhdHVyZWRQcm9qZWN0cygpW2lkeF0gPSBfLmV4dGVuZCh7fSwgZmVhdHVyZWRQcm9qZWN0cygpW2lkeF0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJUaHVtYjogIF8uZmlyc3QodXNlcikucHJvZmlsZV9pbWdfdGh1bWJuYWlsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2V0UHJvamVjdCA9IChwcm9qZWN0LCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZmVhdHVyZWRQcm9qZWN0cygpW2lkeF0gPSBfLmZpcnN0KHByb2plY3QpO1xuICAgICAgICAgICAgICAgICAgICB1c2Vydm0uaWQoXy5maXJzdChwcm9qZWN0KS51c2VyLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgbFVzZXIoKS5sb2FkKCkudGhlbigodXNlcikgPT4gc2V0VXNlcih1c2VyLCBpZHgpKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxvYWRDYXRlZ29yeVByb2plY3RzID0gKGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnkoY2F0ZWdvcnkpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgY2F0ZWdvcnlQcm9qZWN0cyA9IF8uZmluZFdoZXJlKHN0YXJ0dm0uY2F0ZWdvcnlQcm9qZWN0cywge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlJZDogXy5maXJzdChjYXRlZ29yeSkuY2F0ZWdvcnlfaWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGZlYXR1cmVkUHJvamVjdHMoW10pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQoY2F0ZWdvcnlQcm9qZWN0cykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGNhdGVnb3J5UHJvamVjdHMuc2FtcGxlUHJvamVjdHMsIChwcm9qZWN0X2lkLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQocHJvamVjdF9pZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdHZtLnByb2plY3RfaWQocHJvamVjdF9pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxQcm9qZWN0KCkubG9hZCgpLnRoZW4oKHByb2plY3QpID0+IHNldFByb2plY3QocHJvamVjdCwgaWR4KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzdGF0c0xvYWRlci5sb2FkKCkudGhlbihzdGF0cyk7XG4gICAgICAgICAgICBsb2FkQ2F0ZWdvcmllcygpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXRzOiBzdGF0cyxcbiAgICAgICAgICAgICAgICBjYXRlZ29yaWVzOiBjYXRlZ29yaWVzLFxuICAgICAgICAgICAgICAgIHBhbmVJbWFnZXM6IHBhbmVJbWFnZXMsXG4gICAgICAgICAgICAgICAgc2VsZWN0Q2F0ZWdvcnk6IHNlbGVjdENhdGVnb3J5LFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnk6IHNlbGVjdGVkQ2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeUlkeDogc2VsZWN0ZWRDYXRlZ29yeUlkeCxcbiAgICAgICAgICAgICAgICBzZWxlY3RQYW5lOiBzZWxlY3RQYW5lLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkUGFuZTogc2VsZWN0ZWRQYW5lLFxuICAgICAgICAgICAgICAgIGZlYXR1cmVkUHJvamVjdHM6IGZlYXR1cmVkUHJvamVjdHMsXG4gICAgICAgICAgICAgICAgdGVzdGltb25pYWxzOiBzdGFydHZtLnRlc3RpbW9uaWFscyxcbiAgICAgICAgICAgICAgICBxdWVzdGlvbnM6IHN0YXJ0dm0ucXVlc3Rpb25zXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHN0YXRzID0gXy5maXJzdChjdHJsLnN0YXRzKCkpO1xuICAgICAgICAgICAgY29uc3QgdGVzdGltb25pYWxzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLm1hcChjdHJsLnRlc3RpbW9uaWFscywgKHRlc3RpbW9uaWFsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBtKCcuY2FyZC51LXJhZGl1cy5jYXJkLWJpZy5jYXJkLXRlcmNpYXJ5JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgaW1nLnRodW1iLXRlc3RpbW9uaWFsLnUtcm91bmQudS1tYXJnaW5ib3R0b20tMjBbc3JjPVwiJHt0ZXN0aW1vbmlhbC50aHVtYlVybH1cIl1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdwLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTMwJywgYFwiJHt0ZXN0aW1vbmlhbC5jb250ZW50fVwiYCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UuZm9udHdlaWdodC1zZW1pYm9sZCcsIHRlc3RpbW9uaWFsLm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlJywgdGVzdGltb25pYWwudG90YWxzKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGNvbnRlbnRcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLmhlcm8tZnVsbC5oZXJvLXN0YXJ0JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS00MCcsIEkxOG4udCgnc2xvZ2FuJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1wdXNoLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMFtocmVmPVwiI3N0YXJ0LWZvcm1cIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IGguc2Nyb2xsVG8oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBJMThuLnQoJ3N1Ym1pdCcsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBfLmlzRW1wdHkoc3RhdHMpID8gJycgOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0LmxpbmVoZWlnaHQtbG9vc2UnLCBoLmZvcm1hdE51bWJlcihzdGF0cy50b3RhbF9jb250cmlidXRvcnMsIDAsIDMpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1zbWFsbC5zdGFydC1zdGF0cycsIEkxOG4udCgnaGVhZGVyLnBlb3BsZScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QubGluZWhlaWdodC1sb29zZScsIHN0YXRzLnRvdGFsX2NvbnRyaWJ1dGVkLnRvU3RyaW5nKCkuc2xpY2UoMCwgMikgKyAnIG1pbGjDtWVzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtc21hbGwuc3RhcnQtc3RhdHMnLCBJMThuLnQoJ2hlYWRlci5tb25leScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QubGluZWhlaWdodC1sb29zZScsIGguZm9ybWF0TnVtYmVyKHN0YXRzLnRvdGFsX3Byb2plY3RzX3N1Y2Nlc3MsIDAsIDMpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1zbWFsbC5zdGFydC1zdGF0cycsIEkxOG4udCgnaGVhZGVyLnN1Y2Nlc3MnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwLnctY29sLXB1c2gtMS51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLnUtbWFyZ2luYm90dG9tLTEwLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBJMThuLnQoJ3BhZ2UtdGl0bGUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwnLCBJMThuLnQoJ3BhZ2Utc3VidGl0bGUnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNsZWFyZml4Lmhvdy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuaG93LWNvbC0wMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmluZm8taG93d29ya3MtYmFja2VycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlJywgSTE4bi50KCdiYW5uZXIuMScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnYmFubmVyLjInLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuaW5mby1ob3d3b3Jrcy1iYWNrZXJzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UnLCBJMThuLnQoJ2Jhbm5lci4zJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlJywgSTE4bi50KCdiYW5uZXIuNCcsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuaG93LWNvbC0wMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5ob3ctY29sLTAzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZScsIEkxOG4udCgnYmFubmVyLjUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnYmFubmVyLjYnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS51LW1hcmdpbnRvcC0zMCcsIEkxOG4udCgnYmFubmVyLjcnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnYmFubmVyLjgnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLmhvdy1jb2wtMDEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5pbmZvLWhvd3dvcmtzLWJhY2tlcnMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZScsIEkxOG4udCgnYmFubmVyLjEnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLCBJMThuLnQoJ2Jhbm5lci4yJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmluZm8taG93d29ya3MtYmFja2VycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlJywgSTE4bi50KCdiYW5uZXIuMycsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsICBJMThuLnQoJ2Jhbm5lci40JywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uZGl2aWRlcicpLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1sYXJnZScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1sYXJnZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBJMThuLnQoJ2ZlYXR1cmVzLnRpdGxlJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0yMCcsIEkxOG4udCgnZmVhdHVyZXMuc3VidGl0bGUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLnUtbWFyZ2ludG9wLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsIEkxOG4udCgnZmVhdHVyZXMuZmVhdHVyZV8xJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMzAnLCBJMThuLnQoJ2ZlYXR1cmVzLmZlYXR1cmVfMicsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTMwJywgSTE4bi50KCdmZWF0dXJlcy5mZWF0dXJlXzMnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsIEkxOG4udCgnZmVhdHVyZXMuZmVhdHVyZV80JywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMzAnLCBJMThuLnQoJ2ZlYXR1cmVzLmZlYXR1cmVfNScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy10YWJzLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctdGFiLW1lbnUudy1jb2wudy1jb2wtNCcsIF8ubWFwKGN0cmwucGFuZUltYWdlcywgKHBhbmUsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbShgYnRuLnctdGFiLWxpbmsudy1pbmxpbmUtYmxvY2sudGFiLWxpc3QtaXRlbSR7KGlkeCA9PT0gY3RybC5zZWxlY3RlZFBhbmUoKSkgPyAnLnNlbGVjdGVkJyA6ICcnfWAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuc2VsZWN0UGFuZShpZHgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHBhbmUubGFiZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy10YWItY29udGVudC53LWNvbC53LWNvbC04JywgXy5tYXAoY3RybC5wYW5lSW1hZ2VzLCAocGFuZSwgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy10YWItcGFuZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGltZ1tzcmM9XCIke3BhbmUuc3JjfVwiXS5wYW5lLWltYWdlJHsoaWR4ID09PSBjdHJsLnNlbGVjdGVkUGFuZSgpKSA/ICcuc2VsZWN0ZWQnIDogJyd9YClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1sYXJnZS5iZy1ibHVlLW9uZScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLmxpbmVoZWlnaHQtdGlnaHQuZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEkxOG4udCgndmlkZW8udGl0bGUnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBJMThuLnQoJ3ZpZGVvLnN1YnRpdGxlJywgSTE4blNjb3BlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuWW91dHViZUxpZ2h0Ym94LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBJMThuLnQoJ3ZpZGVvLnNyYycsIEkxOG5TY29wZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5zZWN0aW9uLWNhdGVnb3JpZXMnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwLnctY29sLXB1c2gtMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS00MC5mb250Y29sb3ItbmVnYXRpdmUnLCBJMThuLnQoJ2NhdGVnb3JpZXMudGl0bGUnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctdGFicycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy10YWItbWVudS51LXRleHQtY2VudGVyJywgXy5tYXAoY3RybC5jYXRlZ29yaWVzKCksIChjYXRlZ29yeSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbShgYS53LXRhYi1saW5rLnctaW5saW5lLWJsb2NrLmJ0bi1jYXRlZ29yeS5zbWFsbC5idG4taW5saW5lJHsoY3RybC5zZWxlY3RlZENhdGVnb3J5SWR4KCkgPT09IGNhdGVnb3J5LmlkKSA/ICcudy0tY3VycmVudCcgOiAnJ31gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnNlbGVjdENhdGVnb3J5KGNhdGVnb3J5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBjYXRlZ29yeS5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctdGFiLWNvbnRlbnQudS1tYXJnaW50b3AtNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXRhYi1wYW5lLnctLXRhYi1hY3RpdmUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCAoY3RybC5zZWxlY3RlZENhdGVnb3J5SWR4KCkgIT09IC0xKSA/IF8ubWFwKGN0cmwuc2VsZWN0ZWRDYXRlZ29yeSgpLCAoY2F0ZWdvcnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1iby51LW1hcmdpbmJvdHRvbS0yMCcsIGNhdGVnb3J5Lm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS53LWJ1dHRvbi5idG4uYnRuLW1lZGl1bS5idG4taW5saW5lLmJ0bi1kYXJrW2hyZWY9XCIjc3RhcnQtZm9ybVwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IGguc2Nyb2xsVG8oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgSTE4bi50KCdzdWJtaXQnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udGNvbG9yLW5lZ2F0aXZlJywgYFIkICR7Y2F0ZWdvcnkudG90YWxfc3VjY2Vzc2Z1bF92YWx1ZSA/IGguZm9ybWF0TnVtYmVyKGNhdGVnb3J5LnRvdGFsX3N1Y2Nlc3NmdWxfdmFsdWUsIDIsIDMpIDogJy4uLid9YCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMjAnLCAnRG9hZG9zIHBhcmEgcHJvamV0b3MnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udGNvbG9yLW5lZ2F0aXZlJywgKGNhdGVnb3J5LnN1Y2Nlc3NmdWxfcHJvamVjdHMpID8gY2F0ZWdvcnkuc3VjY2Vzc2Z1bF9wcm9qZWN0cyA6ICcuLi4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsICdQcm9qZXRvcyBmaW5hbmNpYWRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIV8uaXNFbXB0eShjdHJsLmZlYXR1cmVkUHJvamVjdHMoKSkgPyBfLm1hcChjdHJsLmZlYXR1cmVkUHJvamVjdHMoKSwgKHByb2plY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIV8uaXNVbmRlZmluZWQocHJvamVjdCkgPyBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgaW1nLnVzZXItYXZhdGFyW3NyYz1cIiR7aC51c2VBdmF0YXJPckRlZmF1bHQocHJvamVjdC51c2VyVGh1bWIpfVwiXWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkJywgcHJvamVjdC51c2VyLm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEkxOG4udCgnY2F0ZWdvcmllcy5wbGVkZ2VkJywgSTE4blNjb3BlKHtwbGVkZ2VkOiBoLmZvcm1hdE51bWJlcihwcm9qZWN0LnBsZWRnZWQpLCBjb250cmlidXRvcnM6IHByb2plY3QudG90YWxfY29udHJpYnV0b3JzfSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGEubGluay1oaWRkZW5baHJlZj1cIi8ke3Byb2plY3QucGVybWFsaW5rfVwiXWAsIHByb2plY3QubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnY2F0ZWdvcmllcy5sb2FkaW5nX2ZlYXR1cmVkJywgSTE4blNjb3BlKCkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5TbGlkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzOiB0ZXN0aW1vbmlhbHMoKSxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IEkxOG4udCgndGVzdGltb25pYWxzX3RpdGxlJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICBzbGlkZUNsYXNzOiAnc2xpZGUtdGVzdGltb25pYWxzLWNvbnRlbnQnLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICdzbGlkZS10ZXN0aW1vbmlhbHMnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5kaXZpZGVyLnUtbWFyZ2ludG9wLTMwJyksXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tNjAudS1tYXJnaW50b3AtNDAnLCBJMThuLnQoJ3FhX3RpdGxlJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBfLm1hcChjdHJsLnF1ZXN0aW9ucy5jb2xfMSwgKHF1ZXN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiBxdWVzdGlvbi5xdWVzdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiBxdWVzdGlvbi5hbnN3ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgXy5tYXAoY3RybC5xdWVzdGlvbnMuY29sXzIsIChxdWVzdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogcXVlc3Rpb24ucXVlc3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogcXVlc3Rpb24uYW5zd2VyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcjc3RhcnQtZm9ybS53LXNlY3Rpb24uc2VjdGlvbi1sYXJnZS51LXRleHQtY2VudGVyLmJnLXB1cnBsZS5iZWZvcmUtZm9vdGVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtanVtYm8uZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTYwJywgJ0NyaWUgbyBzZXUgcmFzY3VuaG8gZ3JhdHVpdGFtZW50ZSEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm1bYWN0aW9uPVwiL3B0L3Byb2plY3RzXCJdW21ldGhvZD1cIlBPU1RcIl0udy1yb3cudy1mb3JtJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIuZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTEwJywgSTE4bi50KCdmb3JtLnRpdGxlJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXRbbmFtZT1cInV0ZjhcIl1bdHlwZT1cImhpZGRlblwiXVt2YWx1ZT1cIuKck1wiXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBpbnB1dFtuYW1lPVwiYXV0aGVudGljaXR5X3Rva2VuXCJdW3R5cGU9XCJoaWRkZW5cIl1bdmFsdWU9XCIke2guYXV0aGVudGljaXR5VG9rZW4oKX1cIl1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLm1lZGl1bS51LW1hcmdpbmJvdHRvbS0zMFt0eXBlPVwidGV4dFwiXScsIHtuYW1lOiAncHJvamVjdFtuYW1lXSd9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci5mb250Y29sb3ItbmVnYXRpdmUudS1tYXJnaW5ib3R0b20tMTAnLCAnbmEgY2F0ZWdvcmlhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NlbGVjdC53LXNlbGVjdC50ZXh0LWZpZWxkLm1lZGl1bS51LW1hcmdpbmJvdHRvbS00MCcsIHtuYW1lOiAncHJvamVjdFtjYXRlZ29yeV9pZF0nfSxbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdvcHRpb25bdmFsdWU9XCJcIl0nLCBJMThuLnQoJ2Zvcm0uc2VsZWN0X2RlZmF1bHQnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAoY3RybC5jYXRlZ29yaWVzKCksIChjYXRlZ29yeSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKGBvcHRpb25bdmFsdWU9XCIke2NhdGVnb3J5LmlkfVwiXWAsIGNhdGVnb3J5Lm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS04MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtcHVzaC00LnUtbWFyZ2ludG9wLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgaW5wdXRbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIiR7STE4bi50KCdmb3JtLnN1Ym1pdCcsIEkxOG5TY29wZSgpKX1cIl0udy1idXR0b24uYnRuLmJ0bi1sYXJnZWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5jLm1vZGVscywgd2luZG93LkkxOG4pKTtcbiIsIndpbmRvdy5jLnJvb3QuVGVhbSA9IChmdW5jdGlvbihtLCBjKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3N0YXRpYy10ZWFtLWFwcCcsIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlRlYW1Ub3RhbCksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5UZWFtTWVtYmVycylcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLnJvb3QuQmFsYW5jZSBjb21wb25lbnRcbiAqIEEgcm9vdCBjb21wb25lbnQgdG8gc2hvdyB1c2VyIGJhbGFuY2UgYW5kIHRyYW5zYWN0aW9uc1xuICpcbiAqIEV4YW1wbGU6XG4gKiBUbyBtb3VudCB0aGlzIGNvbXBvbmVudCBqdXN0IGNyZWF0ZSBhIERPTSBlbGVtZW50IGxpa2U6XG4gKiA8ZGl2IGRhdGEtbWl0aHJpbD1cIlVzZXJzQmFsYW5jZVwiIGRhdGEtcGFyYW1ldGVycz1cInsndXNlcl9pZCc6IDEwfVwiPlxuICovXG53aW5kb3cuYy5yb290LlVzZXJzQmFsYW5jZSA9ICgobSwgXywgYywgbW9kZWxzKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJJZFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHt1c2VyX2lkOiAnZXEnfSk7XG5cbiAgICAgICAgICAgIHVzZXJJZFZNLnVzZXJfaWQoYXJncy51c2VyX2lkKTtcblxuICAgICAgICAgICAgLy8gSGFuZGxlcyB3aXRoIHVzZXIgYmFsYW5jZSByZXF1ZXN0IGRhdGFcbiAgICAgICAgICAgIGNvbnN0IGJhbGFuY2VNYW5hZ2VyID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xsZWN0aW9uID0gbS5wcm9wKFt7YW1vdW50OiAwLCB1c2VyX2lkOiBhcmdzLnVzZXJfaWR9XSksXG4gICAgICAgICAgICAgICAgICAgICAgbG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWxzLmJhbGFuY2UuZ2V0Um93V2l0aFRva2VuKHVzZXJJZFZNLnBhcmFtZXRlcnMoKSkudGhlbihjb2xsZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgbG9hZDogbG9hZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuXG4gICAgICAgICAgICAgICAgICAvLyBIYW5kbGVzIHdpdGggdXNlciBiYWxhbmNlIHRyYW5zYWN0aW9ucyBsaXN0IGRhdGFcbiAgICAgICAgICAgICAgICAgIGJhbGFuY2VUcmFuc2FjdGlvbk1hbmFnZXIgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpc3RWTSA9IG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWxzLmJhbGFuY2VUcmFuc2FjdGlvbiwgJ2NyZWF0ZWRfYXQuZGVzYycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UodXNlcklkVk0ucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZDogbG9hZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdDogbGlzdFZNXG4gICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIH0pKCksXG5cbiAgICAgICAgICAgICAgICAgIC8vIEhhbmRsZXMgd2l0aCBiYW5rIGFjY291bnQgdG8gY2hlY2tcbiAgICAgICAgICAgICAgICAgIGJhbmtBY2NvdW50TWFuYWdlciA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVyID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVscy5iYW5rQWNjb3VudC5nZXRSb3dPcHRpb25zKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJZFZNLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVyLmxvYWQoKS50aGVuKGNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkOiBsb2FkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGxvYWRlclxuICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGJhbmtBY2NvdW50TWFuYWdlcjogYmFua0FjY291bnRNYW5hZ2VyLFxuICAgICAgICAgICAgICAgIGJhbGFuY2VNYW5hZ2VyOiBiYWxhbmNlTWFuYWdlcixcbiAgICAgICAgICAgICAgICBiYWxhbmNlVHJhbnNhY3Rpb25NYW5hZ2VyOiBiYWxhbmNlVHJhbnNhY3Rpb25NYW5hZ2VyXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IG9wdHMgPSBfLmV4dGVuZCh7fSwgYXJncywgY3RybCk7XG4gICAgICAgICAgICByZXR1cm4gbSgnI2JhbGFuY2UtYXJlYScsIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlVzZXJCYWxhbmNlLCBvcHRzKSxcbiAgICAgICAgICAgICAgICBtKCcuZGl2aWRlcicpLFxuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuVXNlckJhbGFuY2VUcmFuc2FjdGlvbnMsIG9wdHMpLFxuICAgICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS00MCcpLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi5jYXJkLXRlcmNpYXJ5LmJlZm9yZS1mb290ZXInKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLkFkbWluQ29udHJpYnV0aW9uRGV0YWlsID0gKGZ1bmN0aW9uKG0sIF8sIGMsIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICBsZXQgbDtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRSZXdhcmQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbW9kZWwgPSBjLm1vZGVscy5yZXdhcmREZXRhaWwsXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZF9pZCA9IGFyZ3MuaXRlbS5yZXdhcmRfaWQsXG4gICAgICAgICAgICAgICAgICAgIG9wdHMgPSBtb2RlbC5nZXRSb3dPcHRpb25zKGguaWRWTS5pZChyZXdhcmRfaWQpLnBhcmFtZXRlcnMoKSksXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZCA9IG0ucHJvcCh7fSk7XG4gICAgICAgICAgICAgICAgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihvcHRzKTtcbiAgICAgICAgICAgICAgICBpZiAocmV3YXJkX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIGwubG9hZCgpLnRoZW4oXy5jb21wb3NlKHJld2FyZCwgXy5maXJzdCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmV3YXJkO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHJld2FyZCA9IGxvYWRSZXdhcmQoKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmV3YXJkOiByZXdhcmQsXG4gICAgICAgICAgICAgICAgYWN0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICd1c2VyX2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ1RyYW5zZmVyaXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJMYWJlbDogJ0lkIGRvIG5vdm8gYXBvaWFkb3I6JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdUcmFuc2ZlcmlyIEFwb2lvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnZXg6IDEyOTkwOCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzTWVzc2FnZTogJ0Fwb2lvIHRyYW5zZmVyaWRvIGNvbSBzdWNlc3NvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdPIGFwb2lvIG7Do28gZm9pIHRyYW5zZmVyaWRvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0S2V5OiAncHJvamVjdF9pZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdjb250cmlidXRpb25faWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0S2V5OiAncmV3YXJkX2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhZGlvczogJ3Jld2FyZHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnQWx0ZXJhciBSZWNvbXBlbnNhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdSZWNvbXBlbnNhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldE1vZGVsOiBjLm1vZGVscy5yZXdhcmREZXRhaWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVNb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtOiByZXdhcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZTogKHJld2FyZHMsIG5ld1Jld2FyZElEKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJld2FyZCA9IF8uZmluZFdoZXJlKHJld2FyZHMsIHtpZDogbmV3UmV3YXJkSUR9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGFyZ3MuaXRlbS52YWx1ZSA+PSByZXdhcmQubWluaW11bV92YWx1ZSkgPyB1bmRlZmluZWQgOiAnVmFsb3IgbcOtbmltbyBkYSByZWNvbXBlbnNhIMOpIG1haW9yIGRvIHF1ZSBvIHZhbG9yIGRhIGNvbnRyaWJ1acOnw6NvLic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlZnVuZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnUmVlbWJvbHNvIGRpcmV0bycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnVGVtIGNlcnRlemEgcXVlIGRlc2VqYSByZWVtYm9sc2FyIGVzc2UgYXBvaW8/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdSZWVtYm9sc2FyIEFwb2lvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiBjLm1vZGVscy5jb250cmlidXRpb25EZXRhaWxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ3N0YXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ0FwYWdhcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnVGVtIGNlcnRlemEgcXVlIGRlc2VqYSBhcGFnYXIgZXNzZSBhcG9pbz8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ0FwYWdhciBBcG9pbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JjZVZhbHVlOiAnZGVsZXRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzTWVzc2FnZTogJ0Fwb2lvIHJlbW92aWRvIGNvbSBzdWNlc3NvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdPIGFwb2lvIG7Do28gZm9pIHJlbW92aWRvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGw6IGxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGFjdGlvbnMgPSBjdHJsLmFjdGlvbnMsXG4gICAgICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgICByZXdhcmQgPSBjdHJsLnJld2FyZDtcblxuICAgICAgICAgICAgY29uc3QgYWRkT3B0aW9ucyA9IChidWlsZGVyLCBpZCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgYnVpbGRlciwge1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0T3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiAoYC9hZG1pbi9jb250cmlidXRpb25zLyR7aWR9L2dhdGV3YXlfcmVmdW5kYCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjYWRtaW4tY29udHJpYnV0aW9uLWRldGFpbC1ib3gnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW50b3AtMjAudS1tYXJnaW5ib3R0b20tMjAnKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5JbnB1dEFjdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYWN0aW9ucy50cmFuc2ZlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChjdHJsLmwoKSkgPyBoLmxvYWRlciA6XG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5SYWRpb0FjdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYWN0aW9ucy5yZXdhcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiByZXdhcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRLZXlWYWx1ZTogaXRlbS5wcm9qZWN0X2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5VmFsdWU6IGl0ZW0uY29udHJpYnV0aW9uX2lkXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluRXh0ZXJuYWxBY3Rpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGFkZE9wdGlvbnMoYWN0aW9ucy5yZWZ1bmQsIGl0ZW0uaWQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbklucHV0QWN0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBhY3Rpb25zLnJlbW92ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cuY2FyZC5jYXJkLXRlcmNpYXJ5LnUtcmFkaXVzJywgW1xuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluVHJhbnNhY3Rpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbjogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblRyYW5zYWN0aW9uSGlzdG9yeSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAoY3RybC5sKCkpID8gaC5sb2FkZXIgOlxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUmV3YXJkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXdhcmQ6IHJld2FyZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogaXRlbS5rZXlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvbkl0ZW0gPSAoZnVuY3Rpb24obSwgYywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpdGVtQnVpbGRlcjogW3tcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Db250cmlidXRpb25Vc2VyJyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTQnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pblByb2plY3QnLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluQ29udHJpYnV0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTInXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdQYXltZW50U3RhdHVzJyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTInXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oXG4gICAgICAgICAgICAgICAgJy53LXJvdycsXG4gICAgICAgICAgICAgICAgXy5tYXAoY3RybC5pdGVtQnVpbGRlciwgZnVuY3Rpb24ocGFuZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0ocGFuZWwud3JhcHBlckNsYXNzLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjW3BhbmVsLmNvbXBvbmVudF0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBhcmdzLmtleVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuQWRtaW5Db250cmlidXRpb25Vc2VyIGNvbXBvbmVudFxuICogQW4gaXRlbWJ1aWxkZXIgY29tcG9uZW50IHRoYXQgcmV0dXJucyBhZGRpdGlvbmFsIGRhdGFcbiAqIHRvIGJlIGluY2x1ZGVkIGluIEFkbWluVXNlci5cbiAqXG4gKiBFeGFtcGxlOlxuICogY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gKiAgICAgcmV0dXJuIHtcbiAqICAgICAgICAgaXRlbUJ1aWxkZXI6IFt7XG4gKiAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pbkNvbnRyaWJ1dGlvblVzZXInLFxuICogICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTQnXG4gKiAgICAgICAgIH1dXG4gKiAgICAgfVxuICogfVxuICovXG53aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvblVzZXIgPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgICAgdXNlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgICBwcm9maWxlX2ltZ190aHVtYm5haWw6IGl0ZW0udXNlcl9wcm9maWxlX2ltZyxcbiAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS51c2VyX2lkLFxuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udXNlcl9uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiBpdGVtLmVtYWlsLFxuICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgYWRkaXRpb25hbERhdGEgPSBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdHYXRld2F5OiAnICsgaXRlbS5wYXllcl9lbWFpbCk7XG4gICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5BZG1pblVzZXIsIHtpdGVtOiB1c2VyLCBhZGRpdGlvbmFsX2RhdGE6IGFkZGl0aW9uYWxEYXRhfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuQWRtaW5Db250cmlidXRpb24gPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjb250cmlidXRpb24gPSBhcmdzLml0ZW07XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LmFkbWluLWNvbnRyaWJ1dGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtc21hbGwnLCAnUiQnICsgY29udHJpYnV0aW9uLnZhbHVlKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgubW9tZW50aWZ5KGNvbnRyaWJ1dGlvbi5jcmVhdGVkX2F0LCAnREQvTU0vWVlZWSBISDptbVtoXScpKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCBbXG4gICAgICAgICAgICAgICAgICAgICdJRCBkbyBHYXRld2F5OiAnLFxuICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiaHR0cHM6Ly9kYXNoYm9hcmQucGFnYXIubWUvIy90cmFuc2FjdGlvbnMvJyArIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkICsgJ1wiXScsIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFkbWluRXh0ZXJuYWxBY3Rpb24gY29tcG9uZW50XG4gKiBNYWtlcyBhcmJpdHJhcnkgYWpheCByZXF1ZXN0cyBhbmQgdXBkYXRlIHVuZGVybHlpbmdcbiAqIGRhdGEgZnJvbSBzb3VyY2UgZW5kcG9pbnQuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQWRtaW5FeHRlcm5hbEFjdGlvbiwge1xuICogICAgIGRhdGE6IHt9LFxuICogICAgIGl0ZW06IHJvd0Zyb21EYXRhYmFzZVxuICogfSlcbiAqL1xud2luZG93LmMuQWRtaW5FeHRlcm5hbEFjdGlvbiA9ICgoZnVuY3Rpb24obSwgaCwgYywgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBidWlsZGVyID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBlcnJvciA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZmFpbCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZGF0YSA9IHt9LFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW07XG5cbiAgICAgICAgICAgIGJ1aWxkZXIucmVxdWVzdE9wdGlvbnMuY29uZmlnID0gKHhocikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChoLmF1dGhlbnRpY2l0eVRva2VuKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ1gtQ1NSRi1Ub2tlbicsIGguYXV0aGVudGljaXR5VG9rZW4oKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgcmVsb2FkID0gXy5jb21wb3NlKGJ1aWxkZXIubW9kZWwuZ2V0Um93V2l0aFRva2VuLCBoLmlkVk0uaWQoaXRlbVtidWlsZGVyLnVwZGF0ZUtleV0pLnBhcmFtZXRlcnMpLFxuICAgICAgICAgICAgICAgIGwgPSBtLnByb3AoZmFsc2UpO1xuXG4gICAgICAgICAgICBjb25zdCByZWxvYWRJdGVtID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICByZWxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgcmVxdWVzdEVycm9yID0gKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGwoZmFsc2UpO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgIGVycm9yKHRydWUpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgdXBkYXRlSXRlbSA9IChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICBfLmV4dGVuZChpdGVtLCByZXNbMF0pO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHN1Ym1pdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBsKHRydWUpO1xuICAgICAgICAgICAgICAgIG0ucmVxdWVzdChidWlsZGVyLnJlcXVlc3RPcHRpb25zKS50aGVuKHJlbG9hZEl0ZW0sIHJlcXVlc3RFcnJvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgdW5sb2FkID0gKGVsLCBpc2luaXQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgbDogbCxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgICAgIHVubG9hZDogdW5sb2FkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBidG5WYWx1ZSA9IChjdHJsLmwoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSwgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC51bmxvYWRcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm0udy1mb3JtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgICAgIH0sICghY3RybC5jb21wbGV0ZSgpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsJywgZGF0YS5pbm5lckxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tc21hbGxbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIicgKyBidG5WYWx1ZSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICBdIDogKCFjdHJsLmVycm9yKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdSZXF1aXNpw6fDo28gZmVpdGEgY29tIHN1Y2Vzc28uJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdIb3V2ZSB1bSBwcm9ibGVtYSBuYSByZXF1aXNpw6fDo28uJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSkod2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5GaWx0ZXIgPSAoZnVuY3Rpb24oYywgbSwgXywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgdmFyIGZpbHRlckJ1aWxkZXIgPSBhcmdzLmZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBsYWJlbCA9IGFyZ3MubGFiZWwgfHwgJycsXG4gICAgICAgICAgICAgICAgbWFpbiA9IF8uZmluZFdoZXJlKGZpbHRlckJ1aWxkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyTWFpbidcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNhZG1pbi1jb250cmlidXRpb25zLWZpbHRlci53LXNlY3Rpb24ucGFnZS1oZWFkZXInLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMzAnLCBsYWJlbCksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdmb3JtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uc3VibWl0OiBhcmdzLnN1Ym1pdFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfLmZpbmRXaGVyZShmaWx0ZXJCdWlsZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpID8gbS5jb21wb25lbnQoY1ttYWluLmNvbXBvbmVudF0sIG1haW4uZGF0YSkgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS1tYXJnaW5ib3R0b20tMjAudy1yb3cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24udy1jb2wudy1jb2wtMTIuZm9udHNpemUtc21hbGxlc3QubGluay1oaWRkZW4tbGlnaHRbc3R5bGU9XCJiYWNrZ3JvdW5kOiBub25lOyBib3JkZXI6IG5vbmU7IG91dGxpbmU6IG5vbmU7IHRleHQtYWxpZ246IGxlZnQ7XCJdW3R5cGU9XCJidXR0b25cIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdGaWx0cm9zIGF2YW7Dp2Fkb3MgwqA+JykpLCAoY3RybC50b2dnbGVyKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjYWR2YW5jZWQtc2VhcmNoLnctcm93LmFkbWluLWZpbHRlcnMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChmaWx0ZXJCdWlsZGVyLCBmdW5jdGlvbihmKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChmLmNvbXBvbmVudCAhPT0gJ0ZpbHRlck1haW4nKSA/IG0uY29tcG9uZW50KGNbZi5jb21wb25lbnRdLCBmLmRhdGEpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cuYywgd2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbklucHV0QWN0aW9uID0gKGZ1bmN0aW9uKG0sIGgsIGMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7fSxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgIGtleSA9IGJ1aWxkZXIucHJvcGVydHksXG4gICAgICAgICAgICAgICAgZm9yY2VWYWx1ZSA9IGJ1aWxkZXIuZm9yY2VWYWx1ZSB8fCBudWxsLFxuICAgICAgICAgICAgICAgIG5ld1ZhbHVlID0gbS5wcm9wKGZvcmNlVmFsdWUpO1xuXG4gICAgICAgICAgICBoLmlkVk0uaWQoaXRlbVtidWlsZGVyLnVwZGF0ZUtleV0pO1xuXG4gICAgICAgICAgICB2YXIgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLm1vZGVsLnBhdGNoT3B0aW9ucyhoLmlkVk0ucGFyYW1ldGVycygpLCBkYXRhKSk7XG5cbiAgICAgICAgICAgIHZhciB1cGRhdGVJdGVtID0gZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgXy5leHRlbmQoaXRlbSwgcmVzWzBdKTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZGF0YVtrZXldID0gbmV3VmFsdWUoKTtcbiAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHVubG9hZCA9IGZ1bmN0aW9uKGVsLCBpc2luaXQsIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZShmb3JjZVZhbHVlKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogY29tcGxldGUsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIGw6IGwsXG4gICAgICAgICAgICAgICAgbmV3VmFsdWU6IG5ld1ZhbHVlLFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgdW5sb2FkOiB1bmxvYWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGJ0blZhbHVlID0gKGN0cmwubCgpKSA/ICdwb3IgZmF2b3IsIGFndWFyZGUuLi4nIDogZGF0YS5jYWxsVG9BY3Rpb247XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLCAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICAgICAgICBtKCcuZHJvcGRvd24tbGlzdC5jYXJkLnUtcmFkaXVzLmRyb3Bkb3duLWxpc3QtbWVkaXVtLnppbmRleC0xMCcsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnVubG9hZFxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWwnLCBkYXRhLmlubmVyTGFiZWwpLCAoZGF0YS5mb3JjZVZhbHVlID09PSB1bmRlZmluZWQpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZFt0eXBlPVwidGV4dFwiXVtwbGFjZWhvbGRlcj1cIicgKyBkYXRhLnBsYWNlaG9sZGVyICsgJ1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBjdHJsLm5ld1ZhbHVlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3RybC5uZXdWYWx1ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgZGF0YS5zdWNjZXNzTWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdIb3V2ZSB1bSBwcm9ibGVtYSBuYSByZXF1aXNpw6fDo28uICcgKyBkYXRhLmVycm9yTWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluSXRlbSA9IChmdW5jdGlvbihtLCBfLCBoLCBjKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIGRpc3BsYXlEZXRhaWxCb3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlEZXRhaWxCb3g6IGRpc3BsYXlEZXRhaWxCb3hcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSBhcmdzLml0ZW07XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jbGVhcmZpeC5jYXJkLnUtcmFkaXVzLnUtbWFyZ2luYm90dG9tLTIwLnJlc3VsdHMtYWRtaW4taXRlbXMnLCBbXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYXJncy5saXN0SXRlbSwge1xuICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICBrZXk6IGFyZ3Mua2V5XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLnctaW5saW5lLWJsb2NrLmFycm93LWFkbWluLmZhLmZhLWNoZXZyb24tZG93bi5mb250Y29sb3Itc2Vjb25kYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmRpc3BsYXlEZXRhaWxCb3gudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgY3RybC5kaXNwbGF5RGV0YWlsQm94KCkgPyBtLmNvbXBvbmVudChhcmdzLmxpc3REZXRhaWwsIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAga2V5OiBhcmdzLmtleVxuICAgICAgICAgICAgICAgIH0pIDogJydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5MaXN0ID0gKGZ1bmN0aW9uKG0sIGgsIGMpIHtcbiAgICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBsaXN0ID0gYXJncy52bS5saXN0O1xuICAgICAgICAgICAgaWYgKCFsaXN0LmNvbGxlY3Rpb24oKS5sZW5ndGggJiYgbGlzdC5maXJzdFBhZ2UpIHtcbiAgICAgICAgICAgICAgICBsaXN0LmZpcnN0UGFnZSgpLnRoZW4obnVsbCwgZnVuY3Rpb24oc2VydmVyRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncy52bS5lcnJvcihzZXJ2ZXJFcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgbGlzdCA9IGFyZ3Mudm0ubGlzdCxcbiAgICAgICAgICAgICAgICBlcnJvciA9IGFyZ3Mudm0uZXJyb3IsXG4gICAgICAgICAgICAgICAgbGFiZWwgPSBhcmdzLmxhYmVsIHx8ICcnO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcigpID9cbiAgICAgICAgICAgICAgICAgICAgbSgnLmNhcmQuY2FyZC1lcnJvci51LXJhZGl1cy5mb250d2VpZ2h0LWJvbGQnLCBlcnJvcigpKSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5pc0xvYWRpbmcoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgQ2FycmVnYW5kbyAke2xhYmVsLnRvTG93ZXJDYXNlKCl9Li4uYCA6IFttKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBsaXN0LnRvdGFsKCkpLCBgICR7bGFiZWwudG9Mb3dlckNhc2UoKX0gZW5jb250cmFkb3NgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2FkbWluLWNvbnRyaWJ1dGlvbnMtbGlzdC53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LmNvbGxlY3Rpb24oKS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5BZG1pbkl0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtOiBhcmdzLmxpc3RJdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdERldGFpbDogYXJncy5saXN0RGV0YWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogaXRlbS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBsaXN0Lm5leHRQYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdDYXJyZWdhciBtYWlzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5BZG1pbk5vdGlmaWNhdGlvbkhpc3RvcnkgY29tcG9uZW50XG4gKiBSZXR1cm4gbm90aWZpY2F0aW9ucyBsaXN0IGZyb20gYW4gVXNlciBvYmplY3QuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQWRtaW5Ob3RpZmljYXRpb25IaXN0b3J5LCB7XG4gKiAgICAgdXNlcjogdXNlclxuICogfSlcbiAqL1xuXG53aW5kb3cuYy5BZG1pbk5vdGlmaWNhdGlvbkhpc3RvcnkgPSAoKG0sIGgsIF8sIG1vZGVscykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25zID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBnZXROb3RpZmljYXRpb25zID0gKHVzZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5vdGlmaWNhdGlvbiA9IG1vZGVscy5ub3RpZmljYXRpb247XG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5nZXRQYWdlV2l0aFRva2VuKG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiAnZXEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VudF9hdDogJ2lzLm51bGwnXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC51c2VyX2lkKHVzZXIuaWQpXG4gICAgICAgICAgICAgICAgICAgIC5zZW50X2F0KCFudWxsKVxuICAgICAgICAgICAgICAgICAgICAub3JkZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VudF9hdDogJ2Rlc2MnXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5wYXJhbWV0ZXJzKCkpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKG5vdGlmaWNhdGlvbnMpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGdldE5vdGlmaWNhdGlvbnMoYXJncy51c2VyKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25zOiBub3RpZmljYXRpb25zXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnSGlzdMOzcmljbyBkZSBub3RpZmljYcOnw7VlcycpLFxuICAgICAgICAgICAgICAgIGN0cmwubm90aWZpY2F0aW9ucygpLm1hcCgoY0V2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXIuZGF0ZS1ldmVudCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeScsIGgubW9tZW50aWZ5KGNFdmVudC5zZW50X2F0LCAnREQvTU0vWVlZWSwgSEg6bW0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgLSAnLCBjRXZlbnQudGVtcGxhdGVfbmFtZSwgY0V2ZW50Lm9yaWdpbiA/ICcgLSAnICsgY0V2ZW50Lm9yaWdpbiA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXywgd2luZG93LmMubW9kZWxzKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFkbWluUHJvamVjdERldGFpbHNDYXJkIGNvbXBvbmVudFxuICogcmVuZGVyIGFuIGJveCB3aXRoIHNvbWUgcHJvamVjdCBzdGF0aXN0aWNzIGluZm9cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5BZG1pblByb2plY3REZXRhaWxzQ2FyZCwge1xuICogICAgIHJlc291cmNlOiBwcm9qZWN0RGV0YWlsIE9iamVjdCxcbiAqIH0pXG4gKi9cbndpbmRvdy5jLkFkbWluUHJvamVjdERldGFpbHNDYXJkID0gKChtLCBoLCBtb21lbnQpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHByb2plY3QgPSBhcmdzLnJlc291cmNlLFxuICAgICAgICAgICAgICAgIGdlbmVyYXRlU3RhdHVzVGV4dCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXR1c1RleHRPYmogPSBtLnByb3Aoe30pLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzVGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmxpbmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnTk8gQVInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzZnVsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC1zdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ0ZJTkFOQ0lBRE8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LWVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ07Dg08gRklOQU5DSUFETydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhaXRpbmdfZnVuZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LXdhaXRpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnQUdVQVJEQU5ETydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdGVkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC1lcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdSRUNVU0FETydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYWZ0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ1JBU0NVTkhPJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5fYW5hbHlzaXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnRU0gQU7DgUxJU0UnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ZlZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJ3RleHQtc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdBUFJPVkFETydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c1RleHRPYmooc3RhdHVzVGV4dFtwcm9qZWN0LnN0YXRlXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1c1RleHRPYmo7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpc0ZpbmFsTGFwID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBAVE9ETzogdXNlIDggZGF5cyBiZWNhdXNlIHRpbWV6b25lIG9uIGpzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAhXy5pc051bGwocHJvamVjdC5leHBpcmVzX2F0KSAmJiBtb21lbnQoKS5hZGQoOCwgJ2RheXMnKSA+PSBtb21lbnQocHJvamVjdC56b25lX2V4cGlyZXNfYXQpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgc3RhdHVzVGV4dE9iajogZ2VuZXJhdGVTdGF0dXNUZXh0KCksXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nVGV4dE9iajogaC50cmFuc2xhdGVkVGltZShwcm9qZWN0LnJlbWFpbmluZ190aW1lKSxcbiAgICAgICAgICAgICAgICBlbGFwc2VkVGV4dE9iajogaC50cmFuc2xhdGVkVGltZShwcm9qZWN0LmVsYXBzZWRfdGltZSksXG4gICAgICAgICAgICAgICAgaXNGaW5hbExhcDogaXNGaW5hbExhcFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgbGV0IHByb2plY3QgPSBjdHJsLnByb2plY3QsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MgPSBwcm9qZWN0LnByb2dyZXNzLnRvRml4ZWQoMiksXG4gICAgICAgICAgICAgICAgc3RhdHVzVGV4dE9iaiA9IGN0cmwuc3RhdHVzVGV4dE9iaigpLFxuICAgICAgICAgICAgICAgIHJlbWFpbmluZ1RleHRPYmogPSBjdHJsLnJlbWFpbmluZ1RleHRPYmosXG4gICAgICAgICAgICAgICAgZWxhcHNlZFRleHRPYmogPSBjdHJsLmVsYXBzZWRUZXh0T2JqO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3QtZGV0YWlscy1jYXJkLmNhcmQudS1yYWRpdXMuY2FyZC10ZXJjaWFyeS51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ1N0YXR1czonKSwgJ8KgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IHN0YXR1c1RleHRPYmouY3NzQ2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIChjdHJsLmlzRmluYWxMYXAoKSAmJiBwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgPyAnUkVUQSBGSU5BTCcgOiBzdGF0dXNUZXh0T2JqLnRleHQpKSwgJ8KgJ1xuICAgICAgICAgICAgICAgICAgICBdKSwgKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5tZXRlci51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5tZXRlci1maWxsJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAocHJvZ3Jlc3MgPiAxMDAgPyAxMDAgOiBwcm9ncmVzcykgKyAnJSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ2ZpbmFuY2lhZG8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcHJvZ3Jlc3MgKyAnJScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsICdsZXZhbnRhZG9zJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1IkICcgKyBoLmZvcm1hdE51bWJlcihwcm9qZWN0LnBsZWRnZWQsIDIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCAnYXBvaW9zJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIHByb2plY3QudG90YWxfY29udHJpYnV0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKF8uaXNOdWxsKHByb2plY3QuZXhwaXJlc19hdCkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsICdpbmljaWFkbyBow6EnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIGVsYXBzZWRUZXh0T2JqLnRvdGFsICsgJyAnICsgZWxhcHNlZFRleHRPYmoudW5pdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ3Jlc3RhbScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIHJlbWFpbmluZ1RleHRPYmoudG90YWwgKyAnICcgKyByZW1haW5pbmdUZXh0T2JqLnVuaXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgICAgICAgICAgIH0oKSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Lm1vbWVudCkpO1xuIiwid2luZG93LmMuQWRtaW5Qcm9qZWN0ID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MuaXRlbTtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tcHJvamVjdCcsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWItcHJvamVjdC51LXJhZGl1c1tzcmM9JyArIHByb2plY3QucHJvamVjdF9pbWcgKyAnXVt3aWR0aD01MF0nKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC05LnctY29sLXNtYWxsLTknLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cIi8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdJywgcHJvamVjdC5wcm9qZWN0X25hbWUpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udHdlaWdodC1zZW1pYm9sZCcsIHByb2plY3QucHJvamVjdF9zdGF0ZSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgaC5tb21lbnRpZnkocHJvamVjdC5wcm9qZWN0X29ubGluZV9kYXRlKSArICcgYSAnICsgaC5tb21lbnRpZnkocHJvamVjdC5wcm9qZWN0X2V4cGlyZXNfYXQpKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblJhZGlvQWN0aW9uID0gKGZ1bmN0aW9uKG0sIGgsIGMsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZGF0YSA9IHt9LFxuICAgICAgICAgICAgICAgIC8vVE9ETzogSW1wbGVtZW50IGEgZGVzY3JpcHRvciB0byBhYnN0cmFjdCB0aGUgaW5pdGlhbCBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBmYWlsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtKCksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBtLnByb3AoaXRlbS5kZXNjcmlwdGlvbiB8fCAnJyksXG4gICAgICAgICAgICAgICAga2V5ID0gYnVpbGRlci5nZXRLZXksXG4gICAgICAgICAgICAgICAgbmV3SUQgPSBtLnByb3AoJycpLFxuICAgICAgICAgICAgICAgIGdldEZpbHRlciA9IHt9LFxuICAgICAgICAgICAgICAgIHNldEZpbHRlciA9IHt9LFxuICAgICAgICAgICAgICAgIHJhZGlvcyA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgIGdldEF0dHIgPSBidWlsZGVyLnJhZGlvcyxcbiAgICAgICAgICAgICAgICBnZXRLZXkgPSBidWlsZGVyLmdldEtleSxcbiAgICAgICAgICAgICAgICBnZXRLZXlWYWx1ZSA9IGFyZ3MuZ2V0S2V5VmFsdWUsXG4gICAgICAgICAgICAgICAgdXBkYXRlS2V5ID0gYnVpbGRlci51cGRhdGVLZXksXG4gICAgICAgICAgICAgICAgdXBkYXRlS2V5VmFsdWUgPSBhcmdzLnVwZGF0ZUtleVZhbHVlLFxuICAgICAgICAgICAgICAgIHZhbGlkYXRlID0gYnVpbGRlci52YWxpZGF0ZSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZEl0ZW0gPSBidWlsZGVyLnNlbGVjdGVkSXRlbSB8fCBtLnByb3AoKTtcblxuICAgICAgICAgICAgc2V0RmlsdGVyW3VwZGF0ZUtleV0gPSAnZXEnO1xuICAgICAgICAgICAgdmFyIHNldFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHNldEZpbHRlcik7XG4gICAgICAgICAgICBzZXRWTVt1cGRhdGVLZXldKHVwZGF0ZUtleVZhbHVlKTtcblxuICAgICAgICAgICAgZ2V0RmlsdGVyW2dldEtleV0gPSAnZXEnO1xuICAgICAgICAgICAgdmFyIGdldFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKGdldEZpbHRlcik7XG4gICAgICAgICAgICBnZXRWTVtnZXRLZXldKGdldEtleVZhbHVlKTtcblxuICAgICAgICAgICAgdmFyIGdldExvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLmdldE1vZGVsLmdldFBhZ2VPcHRpb25zKGdldFZNLnBhcmFtZXRlcnMoKSkpO1xuXG4gICAgICAgICAgICB2YXIgc2V0TG9hZGVyID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGJ1aWxkZXIudXBkYXRlTW9kZWwucGF0Y2hPcHRpb25zKHNldFZNLnBhcmFtZXRlcnMoKSwgZGF0YSkpO1xuXG4gICAgICAgICAgICB2YXIgdXBkYXRlSXRlbSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0l0ZW0gPSBfLmZpbmRXaGVyZShyYWRpb3MoKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGFbMF1bYnVpbGRlci5zZWxlY3RLZXldXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEl0ZW0obmV3SXRlbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3Ioe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ05lbmh1bSBpdGVtIGF0dWFsaXphZG8nXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGZldGNoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZ2V0TG9hZGVyLmxvYWQoKS50aGVuKHJhZGlvcywgZXJyb3IpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChuZXdJRCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2YWxpZGF0aW9uID0gdmFsaWRhdGUocmFkaW9zKCksIG5ld0lEKCkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZCh2YWxpZGF0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtidWlsZGVyLnNlbGVjdEtleV0gPSBuZXdJRCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0TG9hZGVyLmxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0sIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3Ioe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHZhbGlkYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciB1bmxvYWQgPSBmdW5jdGlvbihlbCwgaXNpbml0LCBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5vbnVubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3SUQoJycpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc2V0RGVzY3JpcHRpb24gPSBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb24odGV4dCk7XG4gICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZldGNoKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29tcGxldGU6IGNvbXBsZXRlLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBzZXREZXNjcmlwdGlvbjogc2V0RGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIHNldExvYWRlcjogc2V0TG9hZGVyLFxuICAgICAgICAgICAgICAgIGdldExvYWRlcjogZ2V0TG9hZGVyLFxuICAgICAgICAgICAgICAgIG5ld0lEOiBuZXdJRCxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgICAgIHVubG9hZDogdW5sb2FkLFxuICAgICAgICAgICAgICAgIHJhZGlvczogcmFkaW9zXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICBsZXQgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtKCksXG4gICAgICAgICAgICAgICAgYnRuVmFsdWUgPSAoY3RybC5zZXRMb2FkZXIoKSB8fCBjdHJsLmdldExvYWRlcigpKSA/ICdwb3IgZmF2b3IsIGFndWFyZGUuLi4nIDogZGF0YS5jYWxsVG9BY3Rpb247XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLCAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICAgICAgICBtKCcuZHJvcGRvd24tbGlzdC5jYXJkLnUtcmFkaXVzLmRyb3Bkb3duLWxpc3QtbWVkaXVtLnppbmRleC0xMCcsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnVubG9hZFxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgKGN0cmwucmFkaW9zKCkpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGN0cmwucmFkaW9zKCksIGZ1bmN0aW9uKHJhZGlvLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5uZXdJRChyYWRpby5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuc2V0RGVzY3JpcHRpb24ocmFkaW8uZGVzY3JpcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gKHJhZGlvLmlkID09PSAoaXRlbVtkYXRhLnNlbGVjdEtleV0gfHwgaXRlbS5pZCkpID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJhZGlvJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dCNyLScgKyBpbmRleCArICcudy1yYWRpby1pbnB1dFt0eXBlPXJhZGlvXVtuYW1lPVwiYWRtaW4tcmFkaW9cIl1bdmFsdWU9XCInICsgcmFkaW8uaWQgKyAnXCJdJyArICgoc2VsZWN0ZWQpID8gJ1tjaGVja2VkXScgOiAnJyksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IHNldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWwudy1mb3JtLWxhYmVsW2Zvcj1cInItJyArIGluZGV4ICsgJ1wiXScsICdSJCcgKyByYWRpby5taW5pbXVtX3ZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Ryb25nJywgJ0Rlc2NyacOnw6NvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgY3RybC5kZXNjcmlwdGlvbigpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tc21hbGxbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIicgKyBidG5WYWx1ZSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICBdIDogKCFjdHJsLmVycm9yKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdSZWNvbXBlbnNhIGFsdGVyYWRhIGNvbSBzdWNlc3NvIScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1lcnJvcltzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCBjdHJsLmVycm9yKCkubWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMsIHdpbmRvdy5fKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFkbWluUmVzZXRQYXNzd29yZCBjb21wb25lbnRcbiAqIE1ha2VzIGFqYXggcmVxdWVzdCB0byB1cGRhdGUgVXNlciBwYXNzd29yZC5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5BZG1pblJlc2V0UGFzc3dvcmQsIHtcbiAqICAgICBkYXRhOiB7fSxcbiAqICAgICBpdGVtOiByb3dGcm9tRGF0YWJhc2VcbiAqIH0pXG4gKi9cbndpbmRvdy5jLkFkbWluUmVzZXRQYXNzd29yZCA9ICgoZnVuY3Rpb24obSwgaCwgYywgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBidWlsZGVyID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBlcnJvciA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZmFpbCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAga2V5ID0gYnVpbGRlci5wcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge30sXG4gICAgICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbTtcblxuICAgICAgICAgICAgYnVpbGRlci5yZXF1ZXN0T3B0aW9ucy5jb25maWcgPSAoeGhyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGguYXV0aGVudGljaXR5VG9rZW4oKSkge1xuICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1DU1JGLVRva2VuJywgaC5hdXRoZW50aWNpdHlUb2tlbigpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBsID0gbS5wb3N0Z3Jlc3QubG9hZGVyKF8uZXh0ZW5kKHt9LCB7ZGF0YTogZGF0YX0sIGJ1aWxkZXIucmVxdWVzdE9wdGlvbnMpKSxcbiAgICAgICAgICAgICAgICBuZXdQYXNzd29yZCA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgICAgICAgZXJyb3JfbWVzc2FnZSA9IG0ucHJvcCgnJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3RFcnJvciA9IChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBlcnJvcl9tZXNzYWdlKGVyci5lcnJvcnNbMF0pO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgIGVycm9yKHRydWUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZUl0ZW0gPSAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgXy5leHRlbmQoaXRlbSwgcmVzWzBdKTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBzdWJtaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZGF0YVtrZXldID0gbmV3UGFzc3dvcmQoKTtcbiAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0sIHJlcXVlc3RFcnJvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgdW5sb2FkID0gKGVsLCBpc2luaXQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgZXJyb3JfbWVzc2FnZTogZXJyb3JfbWVzc2FnZSxcbiAgICAgICAgICAgICAgICBsOiBsLFxuICAgICAgICAgICAgICAgIG5ld1Bhc3N3b3JkOiBuZXdQYXNzd29yZCxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgICAgIHVubG9hZDogdW5sb2FkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBidG5WYWx1ZSA9IChjdHJsLmwoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSwgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC51bmxvYWRcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm0udy1mb3JtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgICAgIH0sICghY3RybC5jb21wbGV0ZSgpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsJywgZGF0YS5pbm5lckxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZFt0eXBlPVwidGV4dFwiXVtuYW1lPVwiJyArIGRhdGEucHJvcGVydHkgKyAnXCJdW3BsYWNlaG9sZGVyPVwiJyArIGRhdGEucGxhY2Vob2xkZXIgKyAnXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGN0cmwubmV3UGFzc3dvcmQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdHJsLm5ld1Bhc3N3b3JkKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ1NlbmhhIGFsdGVyYWRhIGNvbSBzdWNlc3NvLicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1lcnJvcltzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCBjdHJsLmVycm9yX21lc3NhZ2UoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSkod2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5SZXdhcmQgPSAoZnVuY3Rpb24obSwgYywgaCwgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXdhcmQgPSBhcmdzLnJld2FyZCgpLFxuICAgICAgICAgICAgICAgIGF2YWlsYWJsZSA9IHBhcnNlSW50KHJld2FyZC5wYWlkX2NvdW50KSArIHBhcnNlSW50KHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQpO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnUmVjb21wZW5zYScpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3NlcicsIHJld2FyZC5pZCA/IFtcbiAgICAgICAgICAgICAgICAgICAgJ0lEOiAnICsgcmV3YXJkLmlkLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnVmFsb3IgbcOtbmltbzogUiQnICsgaC5mb3JtYXROdW1iZXIocmV3YXJkLm1pbmltdW1fdmFsdWUsIDIsIDMpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCdEaXNwb27DrXZlaXM6ICcgKyBhdmFpbGFibGUgKyAnIC8gJyArIChyZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zIHx8ICcmaW5maW47JykpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnQWd1YXJkYW5kbyBjb25maXJtYcOnw6NvOiAnICsgcmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0Rlc2NyacOnw6NvOiAnICsgcmV3YXJkLmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgXSA6ICdBcG9pbyBzZW0gcmVjb21wZW5zYScpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkFkbWluVHJhbnNhY3Rpb25IaXN0b3J5ID0gKGZ1bmN0aW9uKG0sIGgsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY29udHJpYnV0aW9uID0gYXJncy5jb250cmlidXRpb24sXG4gICAgICAgICAgICAgICAgbWFwRXZlbnRzID0gXy5yZWR1Y2UoW3tcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLnBhaWRfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBcG9pbyBjb25maXJtYWRvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLnBlbmRpbmdfcmVmdW5kX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnUmVlbWJvbHNvIHNvbGljaXRhZG8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24ucmVmdW5kZWRfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdFc3Rvcm5vIHJlYWxpemFkbydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5jcmVhdGVkX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXBvaW8gY3JpYWRvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLnJlZnVzZWRfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBcG9pbyBjYW5jZWxhZG8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24uZGVsZXRlZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0Fwb2lvIGV4Y2x1w61kbydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5jaGFyZ2ViYWNrX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQ2hhcmdlYmFjaydcbiAgICAgICAgICAgICAgICB9XSwgZnVuY3Rpb24obWVtbywgaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5kYXRlICE9PSBudWxsICYmIGl0ZW0uZGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLm9yaWdpbmFsRGF0ZSA9IGl0ZW0uZGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uZGF0ZSA9IGgubW9tZW50aWZ5KGl0ZW0uZGF0ZSwgJ0REL01NL1lZWVksIEhIOm1tJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVtby5jb25jYXQoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVtbztcbiAgICAgICAgICAgICAgICB9LCBbXSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3JkZXJlZEV2ZW50czogXy5zb3J0QnkobWFwRXZlbnRzLCAnb3JpZ2luYWxEYXRlJylcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ0hpc3TDs3JpY28gZGEgdHJhbnNhw6fDo28nKSxcbiAgICAgICAgICAgICAgICBjdHJsLm9yZGVyZWRFdmVudHMubWFwKGZ1bmN0aW9uKGNFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyLmRhdGUtZXZlbnQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeScsIGNFdmVudC5kYXRlKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBjRXZlbnQubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5UcmFuc2FjdGlvbiA9IChmdW5jdGlvbihtLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IGFyZ3MuY29udHJpYnV0aW9uO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ0RldGFsaGVzIGRvIGFwb2lvJyksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyJywgW1xuICAgICAgICAgICAgICAgICAgICAnVmFsb3I6IFIkJyArIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi52YWx1ZSwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdUYXhhOiBSJCcgKyBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24uZ2F0ZXdheV9mZWUsIDIsIDMpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnQWd1YXJkYW5kbyBDb25maXJtYcOnw6NvOiAnICsgKGNvbnRyaWJ1dGlvbi53YWl0aW5nX3BheW1lbnQgPyAnU2ltJyA6ICdOw6NvJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdBbsO0bmltbzogJyArIChjb250cmlidXRpb24uYW5vbnltb3VzID8gJ1NpbScgOiAnTsOjbycpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnSWQgcGFnYW1lbnRvOiAnICsgY29udHJpYnV0aW9uLmdhdGV3YXlfaWQsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdBcG9pbzogJyArIGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25faWQsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdDaGF2ZTrCoFxcbicsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbi5rZXksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdNZWlvOiAnICsgY29udHJpYnV0aW9uLmdhdGV3YXksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdPcGVyYWRvcmE6ICcgKyAoY29udHJpYnV0aW9uLmdhdGV3YXlfZGF0YSAmJiBjb250cmlidXRpb24uZ2F0ZXdheV9kYXRhLmFjcXVpcmVyX25hbWUpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLCAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udHJpYnV0aW9uLmlzX3NlY29uZF9zbGlwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFttKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIjXCJdJywgJ0JvbGV0byBiYW5jw6FyaW8nKSwgJyAnLCBtKCdzcGFuLmJhZGdlJywgJzJhIHZpYScpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSgpKSxcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5BZG1pblVzZXJEZXRhaWwgY29tcG9uZW50XG4gKiBSZXR1cm4gYWN0aW9uIGlucHV0cyB0byBiZSB1c2VkIGluc2lkZSBBZG1pbkxpc3QgY29tcG9uZW50LlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkFkbWluTGlzdCwge1xuICogICAgIGRhdGE6IHt9LFxuICogICAgIGxpc3REZXRhaWw6IGMuQWRtaW5Vc2VyRGV0YWlsXG4gKiB9KVxuICovXG53aW5kb3cuYy5BZG1pblVzZXJEZXRhaWwgPSAoZnVuY3Rpb24obSwgXywgYyl7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYWN0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICByZXNldDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICdwYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdSZWRlZmluaXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJMYWJlbDogJ05vdmEgc2VuaGEgZGUgVXN1w6FyaW86JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdSZWRlZmluaXIgc2VuaGEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdleDogMTIzbXVkQHInLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLnVzZXJcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVhY3RpdmF0ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICdkZWFjdGl2YXRlZF9hdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdpZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdSZWF0aXZhcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnVGVtIGNlcnRlemEgcXVlIGRlc2VqYSByZWF0aXZhciBlc3NlIHVzdcOhcmlvPycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzTWVzc2FnZTogJ1VzdcOhcmlvIHJlYXRpdmFkbyBjb20gc3VjZXNzbyEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTyB1c3XDoXJpbyBuw6NvIHDDtGRlIHNlciByZWF0aXZhZG8hJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdSZWF0aXZhciB1c3XDoXJpbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JjZVZhbHVlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLnVzZXJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICAgICAgICB2YXIgYWN0aW9ucyA9IGN0cmwuYWN0aW9ucyxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgIGRldGFpbHMgPSBhcmdzLmRldGFpbHM7XG5cbiAgICAgICAgICAgIGNvbnN0IGFkZE9wdGlvbnMgPSAoYnVpbGRlciwgaWQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIGJ1aWxkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogKGAvdXNlcnMvJHtpZH0vbmV3X3Bhc3N3b3JkYCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnI2FkbWluLWNvbnRyaWJ1dGlvbi1kZXRhaWwtYm94JywgW1xuICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTIwJyksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUmVzZXRQYXNzd29yZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYWRkT3B0aW9ucyhhY3Rpb25zLnJlc2V0LCBpdGVtLmlkKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChpdGVtLmRlYWN0aXZhdGVkX2F0KSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluSW5wdXRBY3Rpb24sIHtkYXRhOiBhY3Rpb25zLnJlYWN0aXZhdGUsIGl0ZW06IGl0ZW19KSA6ICcnXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93LmNhcmQuY2FyZC10ZXJjaWFyeS51LXJhZGl1cycsIFtcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbk5vdGlmaWNhdGlvbkhpc3RvcnksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluVXNlckl0ZW0gPSAoZnVuY3Rpb24obSwgYywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKFxuICAgICAgICAgICAgICAgICcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblVzZXIsIGFyZ3MpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5Vc2VyID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgdXNlciA9IGFyZ3MuaXRlbTtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tdXNlcicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpbWcudXNlci1hdmF0YXJbc3JjPVwiJyArIGgudXNlQXZhdGFyT3JEZWZhdWx0KHVzZXIucHJvZmlsZV9pbWdfdGh1bWJuYWlsKSArICdcIl0nKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC05LnctY29sLXNtYWxsLTknLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cIi91c2Vycy8nICsgdXNlci5pZCArICcvZWRpdFwiXScsIHVzZXIubmFtZSB8fCB1c2VyLmVtYWlsKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgJ1VzdcOhcmlvOiAnICsgdXNlci5pZCksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0VtYWlsOiAnICsgdXNlci5lbWFpbCksXG4gICAgICAgICAgICAgICAgICAgIGFyZ3MuYWRkaXRpb25hbF9kYXRhXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuQ2F0ZWdvcnlCdXR0b24gY29tcG9uZW50XG4gKiBSZXR1cm4gYSBsaW5rIHdpdGggYSBidG4tY2F0ZWdvcnkgY2xhc3MuXG4gKiBJdCB1c2VzIGEgY2F0ZWdvcnkgcGFyYW1ldGVyLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkNhdGVnb3J5QnV0dG9uLCB7XG4gKiAgICAgY2F0ZWdvcnk6IHtcbiAqICAgICAgICAgaWQ6IDEsXG4gKiAgICAgICAgIG5hbWU6ICdWaWRlbycsXG4gKiAgICAgICAgIG9ubGluZV9wcm9qZWN0czogMVxuICogICAgIH1cbiAqIH0pXG4gKi9cbndpbmRvdy5jLkNhdGVnb3J5QnV0dG9uID0gKChtLCBjKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gYXJncy5jYXRlZ29yeTtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICBtKGBhLnctaW5saW5lLWJsb2NrLmJ0bi1jYXRlZ29yeSR7Y2F0ZWdvcnkubmFtZS5sZW5ndGggPiAxMyA/ICcuZG91YmxlLWxpbmUnIDogJyd9W2hyZWY9JyNieV9jYXRlZ29yeV9pZC8ke2NhdGVnb3J5LmlkfSddYCxcbiAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2UuZXhwbG9yZScsIGNhdGVnb3J5Lm9ubGluZV9wcm9qZWN0cylcbiAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkNvbnRyaWJ1dGlvbkFjdGl2aXRpZXMgY29tcG9uZW50XG4gKiBSZW5kZXIgYSBjb21wb25lbnQgdGhhdCBwYXNzIG9uIGNvbmZpcm1lZCBjb250cmlidXRpb25zIGluIDI0aG91cnMgaW50ZXJ2YWxcbiAqXG4gKlxuICogRXhhbXBsZSBvZiB1c2U6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgLi4uXG4gKiAgICAgbS5jb21wb25lbnQoYy5Db250cmlidXRpb25BY3Rpdml0aWVzKVxuICogICAgIC4uLlxuICogfVxuICovXG53aW5kb3cuYy5Db250cmlidXRpb25BY3Rpdml0aWVzID0gKChtLCBoLCBtb2RlbHMsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IGludGVydmFsO1xuICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgICByZXNvdXJjZSA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbkluZGV4ID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgICAgICAgY29sbGVjdGlvblNpemUgPSBtLnByb3AoKSxcbiAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25MID0gbS5wb3N0Z3Jlc3QubG9hZGVyKFxuICAgICAgICAgICAgICAgICAgICAgIG1vZGVscy5jb250cmlidXRpb25BY3Rpdml0eS5nZXRQYWdlT3B0aW9ucygpKSxcbiAgICAgICAgICAgICAgICAgIG5leHRSZXNvdXJjZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoKGNvbGxlY3Rpb25JbmRleCgpICsgMSkgPiBjb2xsZWN0aW9uU2l6ZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25JbmRleCgwKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uSW5kZXgoY29sbGVjdGlvbkluZGV4KCkgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZShjb2xsZWN0aW9uKClbY29sbGVjdGlvbkluZGV4KCldKTtcbiAgICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHN0YXJ0Q29uZmlnID0gKGVsLCBpc2luaXRpYWxpemVkLCBjb250ZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29udGV4dC5vbnVubG9hZCA9ICgpID0+IGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChuZXh0UmVzb3VyY2UsIDE1MDAwKTtcbiAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbGxlY3Rpb25MLmxvYWQoKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbihkYXRhKTtcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uU2l6ZShkYXRhLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgcmVzb3VyY2UoXy5maXJzdChkYXRhKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc3RhcnRUaW1lcigpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IGNvbGxlY3Rpb24sXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbkw6IGNvbGxlY3Rpb25MLFxuICAgICAgICAgICAgICAgIHJlc291cmNlOiByZXNvdXJjZSxcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uU2l6ZTogY29sbGVjdGlvblNpemVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGlmICghY3RybC5jb2xsZWN0aW9uTCgpICYmICFfLmlzVW5kZWZpbmVkKGN0cmwucmVzb3VyY2UoKSkgJiYgKGN0cmwuY29sbGVjdGlvblNpemUoKSB8fCAwKSA+IDApIHtcbiAgICAgICAgICAgICAgICBsZXQgcmVzb3VyY2UgPSBjdHJsLnJlc291cmNlKCksXG4gICAgICAgICAgICAgICAgICAgIGVsYXBzZWQgPSBoLnRyYW5zbGF0ZWRUaW1lKHJlc291cmNlLmVsYXBzZWRfdGltZSksXG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RfbGluayA9IGBodHRwczovL2NhdGFyc2UubWUvJHtyZXNvdXJjZS5wZXJtYWxpbmt9P3JlZj1jdHJzZV9ob21lX2FjdGl2aXRpZXNgO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uc2VjdGlvbi5iZy1iYWNrcy1jYXJyb3NlbCcsIHtjb25maWc6IGN0cmwuc3RhcnRDb25maWd9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyLmZvbnRjb2xvci1uZWdhdGl2ZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsIGBow6EgJHtlbGFwc2VkLnRvdGFsfSAke2VsYXBzZWQudW5pdH0uLi5gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNsZWFyZml4LnctaW5saW5lLWJsb2NrLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EnLCB7aHJlZjogcHJvamVjdF9saW5rfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWItYXV0aG9yLnUtcm91bmQnLCB7c3JjOiByZXNvdXJjZS50aHVtYm5haWwsIHdpZHRoOiA4MH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi1hdXRob3IudS1yb3VuZCcsIHtzcmM6ICdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2ZDY0NmY3NzEwYTcxMjYzMzhiNDZmZl9sb2dvLWNhdGFyc2UtYmFjay1jYXJyb3NlbC5wbmcnfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYScsIHtocmVmOiBwcm9qZWN0X2xpbmt9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi1hdXRob3IudS1yb3VuZCcsIHtzcmM6IHJlc291cmNlLnByb2plY3RfdGh1bWJuYWlsLCB3aWR0aDogODAsIHN0eWxlOiAnbWFyZ2luLXJpZ2h0OiAwOyd9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UnLCBgJHtyZXNvdXJjZS5uYW1lfSBhcG9pb3VgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbi13aGl0ZScsIHtocmVmOiBwcm9qZWN0X2xpbmt9LCByZXNvdXJjZS5wcm9qZWN0X25hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnZGl2Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuRHJvcGRvd24gPSAoZnVuY3Rpb24obSwgaCwgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKFxuICAgICAgICAgICAgICAgIGBzZWxlY3Qke2FyZ3MuY2xhc3Nlc31baWQ9XCIke2FyZ3MuaWR9XCJdYCxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MudmFsdWVQcm9wKSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MudmFsdWVQcm9wKClcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF8ubWFwKGFyZ3Mub3B0aW9ucywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnb3B0aW9uW3ZhbHVlPVwiJyArIGRhdGEudmFsdWUgKyAnXCJdJywgZGF0YS5vcHRpb24pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkZpbHRlckJ1dHRvbiBjb21wb25lbnRcbiAqIFJldHVybiBhIGxpbmsgd2l0aCBhIGZpbHRlcnMgY2xhc3MuXG4gKiBJdCB1c2VzIGEgaHJlZiBhbmQgYSB0aXRsZSBwYXJhbWV0ZXIuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuRmlsdGVyQnV0dG9uLCB7XG4gKiAgICAgdGl0bGU6ICdGaWx0ZXIgYnkgY2F0ZWdvcnknLFxuICogICAgIGhyZWY6ICdmaWx0ZXJfYnlfY2F0ZWdvcnknXG4gKiB9KVxuICovXG53aW5kb3cuYy5GaWx0ZXJCdXR0b24gPSAoKG0sIGMpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBhcmdzLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgaHJlZiA9IGFyZ3MuaHJlZjtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICBtKGBhLnctaW5saW5lLWJsb2NrLmJ0bi1jYXRlZ29yeS5maWx0ZXJzJHt0aXRsZS5sZW5ndGggPiAxMyA/ICcuZG91YmxlLWxpbmUnIDogJyd9W2hyZWY9JyMke2hyZWZ9J11gLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJEYXRlUmFuZ2UgPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICAgICAgICAgIG0oJ2xhYmVsLmZvbnRzaXplLXNtYWxsZXJbZm9yPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywgYXJncy5sYWJlbCksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVtpZD1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmZpcnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy5maXJzdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LXRleHQtY2VudGVyLmxpbmVoZWlnaHQtbG9vc2VyJywgJ2UnKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5sYXN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy5sYXN0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLkZpbHRlckRyb3Bkb3duID0gKGZ1bmN0aW9uKG0sIGMsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuRHJvcGRvd24sIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGFyZ3MuaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzZXM6ICcudy1zZWxlY3QudGV4dC1maWVsZC5wb3NpdGl2ZScsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlUHJvcDogYXJncy52bSxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogYXJncy5vcHRpb25zXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuRmlsdGVyTWFpbiA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZS5tZWRpdW1bcGxhY2Vob2xkZXI9XCInICsgYXJncy5wbGFjZWhvbGRlciArICdcIl1bdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLnZtKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLnZtKClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQjZmlsdGVyLWJ0bi5idG4uYnRuLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwW3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCJCdXNjYXJcIl0nKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJOdW1iZXJSYW5nZSA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTYnLCBbXG4gICAgICAgICAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW2lkPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MuZmlyc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmZpcnN0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC0yLnctY29sLXRpbnktMicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtdGV4dC1jZW50ZXIubGluZWhlaWdodC1sb29zZXInLCAnZScpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmxhc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmxhc3QoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5sYW5kaW5nUUEgY29tcG9uZW50XG4gKiBBIHZpc3VhbCBjb21wb25lbnQgdGhhdCBkaXNwbGF5cyBhIHF1ZXN0aW9uL2Fuc3dlciBib3ggd2l0aCB0b2dnbGVcbiAqXG4gKiBFeGFtcGxlOlxuICogdmlldzogKCkgPT4ge1xuICogICAgICAuLi5cbiAqICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAqICAgICAgICAgIHF1ZXN0aW9uOiAnV2hhdHMgeW91ciBuYW1lPycsXG4gKiAgICAgICAgICBhbnN3ZXI6ICdEYXJ0aCBWYWRlci4nXG4gKiAgICAgIH0pXG4gKiAgICAgIC4uLlxuICogIH1cbiAqL1xud2luZG93LmMubGFuZGluZ1FBID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzaG93QW5zd2VyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy5jYXJkLnFhLWNhcmQudS1tYXJnaW5ib3R0b20tMjAudS1yYWRpdXMuYnRuLXRlcmNpYXJ5JyxbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuc2hvd0Fuc3dlci50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCBhcmdzLnF1ZXN0aW9uKSxcbiAgICAgICAgICAgICAgICBjdHJsLnNob3dBbnN3ZXIoKSA/IG0oJ3AudS1tYXJnaW50b3AtMjAuZm9udHNpemUtc21hbGwnLCBtLnRydXN0KGFyZ3MuYW5zd2VyKSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5sYW5kaW5nU2lnbnVwIGNvbXBvbmVudFxuICogQSB2aXN1YWwgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgc2lnbnVwIGVtYWlsIHR5cGljYWxseSB1c2VkIG9uIGxhbmRpbmcgcGFnZXMuXG4gKiBJdCBhY2NlcHRzIGEgY3VzdG9tIGZvcm0gYWN0aW9uIHRvIGF0dGFjaCB0byB0aGlyZC1wYXJ0eSBzZXJ2aWNlcyBsaWtlIE1haWxjaGltcFxuICpcbiAqIEV4YW1wbGU6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgIC4uLlxuICogICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdTaWdudXAsIHtcbiAqICAgICAgICAgIGJ1aWxkZXI6IHtcbiAqICAgICAgICAgICAgICBjdXN0b21BY3Rpb246ICdodHRwOi8vZm9ybWVuZHBvaW50LmNvbSdcbiAqICAgICAgICAgIH1cbiAqICAgICAgfSlcbiAqICAgICAgLi4uXG4gKiAgfVxuICovXG53aW5kb3cuYy5sYW5kaW5nU2lnbnVwID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgYnVpbGRlciA9IGFyZ3MuYnVpbGRlcixcbiAgICAgICAgICAgICAgICBlbWFpbCA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIHN1Ym1pdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGgudmFsaWRhdGVFbWFpbChlbWFpbCgpKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBlcnJvckNsYXNzZXMgPSAoIWN0cmwuZXJyb3IpID8gJy5wb3NpdGl2ZS5lcnJvcicgOiAnJztcbiAgICAgICAgICAgIHJldHVybiBtKCdmb3JtLnctZm9ybVtpZD1cImVtYWlsLWZvcm1cIl1bbWV0aG9kPVwicG9zdFwiXVthY3Rpb249XCInICsgYXJncy5idWlsZGVyLmN1c3RvbUFjdGlvbiArICdcIl0nLHtcbiAgICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgIH0sW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JywgW1xuICAgICAgICAgICAgICAgICAgICBtKGBpbnB1dCR7ZXJyb3JDbGFzc2VzfS53LWlucHV0LnRleHQtZmllbGQubWVkaXVtW25hbWU9XCJFTUFJTFwiXVtwbGFjZWhvbGRlcj1cIkRpZ2l0ZSBzZXUgZW1haWxcIl1bdHlwZT1cInRleHRcIl1gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBjdHJsLmVtYWlsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdHJsLmVtYWlsKClcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChjdHJsLmVycm9yKCkgPyBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXIudGV4dC1lcnJvcicsICdFLW1haWwgaW52w6FsaWRvJykgOiAnJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1sYXJnZVt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiQ2FkYXN0cmFyXCJdJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Nb2RhbEJveCBjb21wb25lbnRcbiAqIEJ1aWxzIHRoZSB0ZW1wbGF0ZSBmb3IgdXNpbmcgbW9kYWxcbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5Nb2RhbEJveCwge1xuICogICAgIGRpc3BsYXlNb2RhbDogdG9vZ2xlUHJvcE9iamVjdCxcbiAqICAgICBjb250ZW50OiBbJ0NvbXBvbmVudE5hbWUnLCB7YXJneDogJ3gnLCBhcmd5OiAneSd9XVxuICogfSlcbiAqIENvbXBvbmVudE5hbWUgc3RydWN0dXJlID0+ICBtKCdkaXYnLCBbXG4gKiAgICAgICAgICAgICAgICAgIG0oJy5tb2RhbC1kaWFsb2ctaGVhZGVyJywgW10pLFxuICogICAgICAgICAgICAgICAgICBtKCcubW9kYWwtZGlhbG9nLWNvbnRlbnQnLCBbXSksXG4gKiAgICAgICAgICAgICAgICAgIG0oJy5tb2RhbC1kaWFsb2ctbmF2LWJvdHRvbScsIFtdKSxcbiAqICAgICAgICAgICAgICBdKVxuICovXG5cbndpbmRvdy5jLk1vZGFsQm94ID0gKChtLCBjLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcubW9kYWwtYmFja2Ryb3AnLCBbXG4gICAgICAgICAgICAgICAgbSgnLm1vZGFsLWRpYWxvZy1vdXRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLm1vZGFsLWRpYWxvZy1pbm5lci5tb2RhbC1kaWFsb2ctc21hbGwnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLnctaW5saW5lLWJsb2NrLm1vZGFsLWNsb3NlLmZhLmZhLWNsb3NlLmZhLWxnW2hyZWY9XCJqczp2b2lkKDApO1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBhcmdzLmRpc3BsYXlNb2RhbC50b2dnbGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoY1thcmdzLmNvbnRlbnRbMF1dLCBhcmdzLmNvbnRlbnRbMV0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlBheW1lbnRTdGF0dXMgPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwYXltZW50ID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgIGNhcmQgPSBudWxsLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kLCBwYXltZW50TWV0aG9kQ2xhc3MsIHN0YXRlQ2xhc3M7XG5cbiAgICAgICAgICAgIGNhcmQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAocGF5bWVudC5nYXRld2F5X2RhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChwYXltZW50LmdhdGV3YXkudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbW9pcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fYmluLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FydGFvX2ZpbmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmFuZDogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FydGFvX2JhbmRlaXJhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3BhZ2FybWUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FyZF9maXJzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJkX2xhc3RfZGlnaXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmFuZDogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FyZF9icmFuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBkaXNwbGF5UGF5bWVudE1ldGhvZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAocGF5bWVudC5wYXltZW50X21ldGhvZC50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvbGV0b2JhbmNhcmlvJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCdzcGFuI2JvbGV0by1kZXRhaWwnLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NhcnRhb2RlY3JlZGl0byc6XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2FyZERhdGEgPSBjYXJkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FyZERhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnI2NyZWRpdGNhcmQtZGV0YWlsLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZERhdGEuZmlyc3RfZGlnaXRzICsgJyoqKioqKicgKyBjYXJkRGF0YS5sYXN0X2RpZ2l0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZERhdGEuYnJhbmQgKyAnICcgKyBwYXltZW50Lmluc3RhbGxtZW50cyArICd4J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHBheW1lbnRNZXRob2RDbGFzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAocGF5bWVudC5wYXltZW50X21ldGhvZC50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvbGV0b2JhbmNhcmlvJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLmZhLWJhcmNvZGUnO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdjYXJ0YW9kZWNyZWRpdG8nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcuZmEtY3JlZGl0LWNhcmQnO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcuZmEtcXVlc3Rpb24nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHN0YXRlQ2xhc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHBheW1lbnQuc3RhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncGFpZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy50ZXh0LXN1Y2Nlc3MnO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdyZWZ1bmRlZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy50ZXh0LXJlZnVuZGVkJztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncGVuZGluZyc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3BlbmRpbmdfcmVmdW5kJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLnRleHQtd2FpdGluZyc7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy50ZXh0LWVycm9yJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kOiBkaXNwbGF5UGF5bWVudE1ldGhvZCxcbiAgICAgICAgICAgICAgICBwYXltZW50TWV0aG9kQ2xhc3M6IHBheW1lbnRNZXRob2RDbGFzcyxcbiAgICAgICAgICAgICAgICBzdGF0ZUNsYXNzOiBzdGF0ZUNsYXNzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwYXltZW50ID0gYXJncy5pdGVtO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5wYXltZW50LXN0YXR1cycsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1jaXJjbGUnICsgY3RybC5zdGF0ZUNsYXNzKCkpLCAnwqAnICsgcGF5bWVudC5zdGF0ZVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhJyArIGN0cmwucGF5bWVudE1ldGhvZENsYXNzKCkpLCAnICcsIG0oJ2EubGluay1oaWRkZW5baHJlZj1cIiNcIl0nLCBwYXltZW50LnBheW1lbnRfbWV0aG9kKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHQnLCBbXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuZGlzcGxheVBheW1lbnRNZXRob2QoKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5Qb3BOb3RpZmljYXRpb24gPSAoKG0sIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgZGlzcGxheU5vdGlmaWNhdGlvbiA9IGgudG9nZ2xlUHJvcCh0cnVlLCBmYWxzZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheU5vdGlmaWNhdGlvbjogZGlzcGxheU5vdGlmaWNhdGlvblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoY3RybC5kaXNwbGF5Tm90aWZpY2F0aW9uKCkgPyBtKCcuZmxhc2gudy1jbGVhcmZpeC5jYXJkLmNhcmQtbm90aWZpY2F0aW9uLnUtcmFkaXVzLnppbmRleC0yMCcsIFtcbiAgICAgICAgICAgICAgICBtKCdpbWcuaWNvbi1jbG9zZVtzcmM9XCIvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL3gucG5nXCJdW3dpZHRoPVwiMTJcIl1bYWx0PVwiZmVjaGFyXCJdJywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmRpc3BsYXlOb3RpZmljYXRpb24udG9nZ2xlXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsJywgYXJncy5tZXNzYWdlKVxuICAgICAgICAgICAgXSkgOiBtKCdzcGFuJykpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RBYm91dCA9ICgobSwgYywgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0KCkgfHwge30sXG4gICAgICAgICAgICAgICAgb25saW5lRGF5cyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRpZmYgPSBtb21lbnQocHJvamVjdC56b25lX29ubGluZV9kYXRlKS5kaWZmKG1vbWVudChwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb24gPSBtb21lbnQuZHVyYXRpb24oZGlmZik7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC1NYXRoLmNlaWwoZHVyYXRpb24uYXNEYXlzKCkpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsZXQgZnVuZGluZ1BlcmlvZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKHByb2plY3QuaXNfcHVibGlzaGVkICYmIGguZXhpc3R5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSkgPyBtKCcuZnVuZGluZy1wZXJpb2QnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsICdQZXLDrW9kbyBkZSBjYW1wYW5oYScpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgYCR7aC5tb21lbnRpZnkocHJvamVjdC56b25lX29ubGluZV9kYXRlKX0gLSAke2gubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KX0gKCR7b25saW5lRGF5cygpfSBkaWFzKWApXG4gICAgICAgICAgICAgICAgXSkgOiAnJztcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1hYm91dCcsIFtcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1hYm91dC53LWNvbC53LWNvbC04Jywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGguVUlIZWxwZXIoKVxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1iYXNlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Ryb25nJywgJ08gcHJvamV0bycpLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2VbaXRlbXByb3A9XCJhYm91dFwiXScsIG0udHJ1c3QoaC5zZWxmT3JFbXB0eShwcm9qZWN0LmFib3V0X2h0bWwsICcuLi4nKSkpLFxuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmJ1ZGdldCA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkJywgJ09yw6dhbWVudG8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtYmFzZScsIG0udHJ1c3QocHJvamVjdC5idWRnZXQpKVxuICAgICAgICAgICAgICAgICAgICBdIDogJycsXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsICFfLmlzRW1wdHkoYXJncy5yZXdhcmREZXRhaWxzKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTMwJywgJ1JlY29tcGVuc2FzJyksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFJld2FyZExpc3QsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZERldGFpbHM6IGFyZ3MucmV3YXJkRGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICB9KSwgZnVuZGluZ1BlcmlvZCgpXG4gICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0zMCcsICdTdWdlc3TDtWVzwqBkZcKgYXBvaW8nKSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucywge3Byb2plY3Q6IHByb2plY3R9KSxcbiAgICAgICAgICAgICAgICAgICAgZnVuZGluZ1BlcmlvZCgpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q2FyZCA9ICgobSwgaCwgbW9kZWxzLCBJMThuKSA9PiB7XG4gICAgY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAncHJvamVjdHMuY2FyZCcpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MgPSBwcm9qZWN0LnByb2dyZXNzLnRvRml4ZWQoMiksXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nVGV4dE9iaiA9IGgudHJhbnNsYXRlZFRpbWUocHJvamVjdC5yZW1haW5pbmdfdGltZSksXG4gICAgICAgICAgICAgICAgbGluayA9ICcvJyArIHByb2plY3QucGVybWFsaW5rICsgKGFyZ3MucmVmID8gJz9yZWY9JyArIGFyZ3MucmVmIDogJycpO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmNhcmQtcHJvamVjdC5jYXJkLnUtcmFkaXVzJywgW1xuICAgICAgICAgICAgICAgICAgICBtKGBhLmNhcmQtcHJvamVjdC10aHVtYltocmVmPVwiJHtsaW5rfVwiXWAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2JhY2tncm91bmQtaW1hZ2UnOiBgdXJsKCR7cHJvamVjdC5wcm9qZWN0X2ltZ30pYCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGlzcGxheSc6ICdibG9jaydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLXByb2plY3QtZGVzY3JpcHRpb24uYWx0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5LmxpbmVoZWlnaHQtdGlnaHQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtYmFzZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhLmxpbmstaGlkZGVuW2hyZWY9XCIke2xpbmt9XCJdYCwgcHJvamVjdC5wcm9qZWN0X25hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnkudS1tYXJnaW5ib3R0b20tMjAnLCBgJHtJMThuLnQoJ2J5JywgSTE4blNjb3BlKCkpfSAke3Byb2plY3Qub3duZXJfbmFtZX1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRjb2xvci1zZWNvbmRhcnkuZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhLmxpbmstaGlkZGVuW2hyZWY9XCIke2xpbmt9XCJdYCwgcHJvamVjdC5oZWFkbGluZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5jYXJkLXByb2plY3QtYXV0aG9yLmFsdHQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIFttKCdzcGFuLmZhLmZhLW1hcC1tYXJrZXIuZmEtMScsICcgJyksIGAgJHtwcm9qZWN0LmNpdHlfbmFtZSA/IHByb2plY3QuY2l0eV9uYW1lIDogJyd9LCAke3Byb2plY3Quc3RhdGVfYWNyb255bSA/IHByb2plY3Quc3RhdGVfYWNyb255bSA6ICcnfWBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbShgLmNhcmQtcHJvamVjdC1tZXRlci4ke3Byb2plY3Quc3RhdGV9YCwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgKF8uY29udGFpbnMoWydzdWNjZXNzZnVsJywgJ2ZhaWxlZCcsICd3YWl0aW5nX2Z1bmRzJ10sIHByb2plY3Quc3RhdGUpKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgSTE4bi50KCdkaXNwbGF5X3N0YXR1cy4nICsgcHJvamVjdC5zdGF0ZSwgSTE4blNjb3BlKCkpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcubWV0ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyLWZpbGwnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYCR7KHByb2dyZXNzID4gMTAwID8gMTAwIDogcHJvZ3Jlc3MpfSVgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLXByb2plY3Qtc3RhdHMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBgJHtNYXRoLmNlaWwocHJvamVjdC5wcm9ncmVzcyl9JWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgYFIkICR7aC5mb3JtYXROdW1iZXIocHJvamVjdC5wbGVkZ2VkKX1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtdGlnaHRlc3QnLCAnTGV2YW50YWRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudS10ZXh0LXJpZ2h0JywgcHJvamVjdC5leHBpcmVzX2F0ID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgYCR7cmVtYWluaW5nVGV4dE9iai50b3RhbH0gJHtyZW1haW5pbmdUZXh0T2JqLnVuaXR9YCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LXRpZ2h0ZXN0JywgKHJlbWFpbmluZ1RleHRPYmoudG90YWwgPiAxKSA/ICdSZXN0YW50ZXMnIDogJ1Jlc3RhbnRlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC10aWdodCcsIFsnUHJhem8gZW0nLG0oJ2JyJyksJ2FiZXJ0byddKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXywgd2luZG93LkkxOG4pKTtcbiIsIndpbmRvdy5jLlByb2plY3RDb21tZW50cyA9IChmdW5jdGlvbihtLCBjLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbG9hZENvbW1lbnRzID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNJbml0aWFsaXplZCkge3JldHVybjt9XG4gICAgICAgICAgICAgICAgICAgIGguZmJQYXJzZSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge2xvYWRDb21tZW50czogbG9hZENvbW1lbnRzfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdCgpO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy5mYi1jb21tZW50c1tkYXRhLWhyZWY9XCJodHRwOi8vd3d3LmNhdGFyc2UubWUvJyArIHByb2plY3QucGVybWFsaW5rICsgJ1wiXVtkYXRhLW51bS1wb3N0cz01MF1bZGF0YS13aWR0aD1cIjYxMFwiXScsIHtjb25maWc6IGN0cmwubG9hZENvbW1lbnRzKCl9KTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdENvbnRyaWJ1dGlvbnMgPSAoKG0sIG1vZGVscywgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0Vk0gPSBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0obW9kZWxzLnByb2plY3RDb250cmlidXRpb24pLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJyxcbiAgICAgICAgICAgICAgICAgICAgd2FpdGluZ19wYXltZW50OiAnZXEnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgdG9nZ2xlV2FpdGluZyA9ICh3YWl0aW5nID0gZmFsc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlclZNLndhaXRpbmdfcGF5bWVudCh3YWl0aW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmaWx0ZXJWTS5wcm9qZWN0X2lkKGFyZ3MucHJvamVjdCgpLmlkKS53YWl0aW5nX3BheW1lbnQoZmFsc2UpO1xuXG4gICAgICAgICAgICBpZiAoIWxpc3RWTS5jb2xsZWN0aW9uKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGxpc3RWTTogbGlzdFZNLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTSxcbiAgICAgICAgICAgICAgICB0b2dnbGVXYWl0aW5nOiB0b2dnbGVXYWl0aW5nXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGN0cmwubGlzdFZNO1xuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0X2NvbnRyaWJ1dGlvbnMuY29udGVudC53LWNvbC53LWNvbC0xMicsIFtcbiAgICAgICAgICAgICAgICAoYXJncy5wcm9qZWN0KCkuaXNfb3duZXJfb3JfYWRtaW4gP1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dFtjaGVja2VkPVwiY2hlY2tlZFwiXVtpZD1cImNvbnRyaWJ1dGlvbl9zdGF0ZV9hdmFpbGFibGVfdG9fY291bnRcIl1bbmFtZT1cIndhaXRpbmdfcGF5bWVudFwiXVt0eXBlPVwicmFkaW9cIl1bdmFsdWU9XCJhdmFpbGFibGVfdG9fY291bnRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlV2FpdGluZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWxbZm9yPVwiY29udHJpYnV0aW9uX3N0YXRlX2F2YWlsYWJsZV90b19jb3VudFwiXScsICdDb25maXJtYWRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0W2lkPVwiY29udHJpYnV0aW9uX3N0YXRlX3dhaXRpbmdfY29uZmlybWF0aW9uXCJdW3R5cGU9XCJyYWRpb1wiXVtuYW1lPVwid2FpdGluZ19wYXltZW50XCJdW3ZhbHVlPVwid2FpdGluZ19jb25maXJtYXRpb25cIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlV2FpdGluZyh0cnVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsW2Zvcj1cImNvbnRyaWJ1dGlvbl9zdGF0ZV93YWl0aW5nX2NvbmZpcm1hdGlvblwiXScsICdQZW5kZW50ZXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgbSgnLnByb2plY3QtY29udHJpYnV0aW9ucycsIF8ubWFwKGxpc3QuY29sbGVjdGlvbigpLCAoY29udHJpYnV0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtocmVmPVwiL3VzZXJzLycgKyBjb250cmlidXRpb24udXNlcl9pZCArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudGh1bWIudS1sZWZ0LnUtcm91bmRbc3R5bGU9XCJiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJyArICghXy5pc0VtcHR5KGNvbnRyaWJ1dGlvbi5wcm9maWxlX2ltZ190aHVtYm5haWwpID8gY29udHJpYnV0aW9uLnByb2ZpbGVfaW1nX3RodW1ibmFpbCA6ICcvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL3VzZXIuanBnJykgKyAnKTsgYmFja2dyb3VuZC1zaXplOiBjb250YWluO1wiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTExJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbi1kYXJrW2hyZWY9XCIvdXNlcnMvJyArIGNvbnRyaWJ1dGlvbi51c2VyX2lkICsgJ1wiXScsIGNvbnRyaWJ1dGlvbi51c2VyX25hbWUpLCAoY29udHJpYnV0aW9uLmlzX293bmVyX29yX2FkbWluID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1IkICcgKyBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24udmFsdWUsIDIsIDMpLCAoY29udHJpYnV0aW9uLmFub255bW91cyA/IFttLnRydXN0KCcmbmJzcDstJm5ic3A7JyksIG0oJ3N0cm9uZycsICdBcG9pYWRvciBhbsO0bmltbycpXSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCBoLm1vbWVudGlmeShjb250cmlidXRpb24uY3JlYXRlZF9hdCwgJ0REL01NL1lZWVksIEhIOm1tJykgKyAnaCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCAoY29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzID4gMSA/ICdBcG9pb3UgZXN0ZSBlIG1haXMgb3V0cm9zICcgKyBjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zJyA6ICdBcG9pb3Ugc29tZW50ZSBlc3RlIHByb2pldG8gYXTDqSBhZ29yYScpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2luYm90dG9tLTIwJylcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtcHVzaC01JywgWyFsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIChsaXN0LmlzTGFzdFBhZ2UoKSA/ICcnIDogbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogbGlzdC5uZXh0UGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ0NhcnJlZ2FyIG1haXMnKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgaC5sb2FkZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0RGFzaGJvYXJkTWVudSBjb21wb25lbnRcbiAqIGJ1aWxkIGRhc2hib2FyZCBwcm9qZWN0IG1lbnUgZm9yIHByb2plY3Qgb3duZXJzXG4gKiBhbmQgYWRtaW4uXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuUHJvamVjdERhc2hib2FyZE1lbnUsIHtcbiAqICAgICBwcm9qZWN0OiBwcm9qZWN0RGV0YWlsIE9iamVjdCxcbiAqIH0pXG4gKi9cbndpbmRvdy5jLlByb2plY3REYXNoYm9hcmRNZW51ID0gKChtLCBfLCBoLCBJMThuKSA9PiB7XG4gICAgY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAncHJvamVjdHMuZGFzaGJvYXJkX25hdicpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXSxcbiAgICAgICAgICAgICAgICBlZGl0TGlua3NUb2dnbGUgPSBoLnRvZ2dsZVByb3AodHJ1ZSwgZmFsc2UpLFxuICAgICAgICAgICAgICAgIGJvZHlUb2dnbGVGb3JOYXYgPSBoLnRvZ2dsZVByb3AoJ2JvZHktcHJvamVjdCBvcGVuJywgJ2JvZHktcHJvamVjdCBjbG9zZWQnKTtcblxuICAgICAgICAgICAgaWYgKGFyZ3MucHJvamVjdCgpLmlzX3B1Ymxpc2hlZCkge1xuICAgICAgICAgICAgICAgIGVkaXRMaW5rc1RvZ2dsZS50b2dnbGUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGJvZHk6IGJvZHksXG4gICAgICAgICAgICAgICAgZWRpdExpbmtzVG9nZ2xlOiBlZGl0TGlua3NUb2dnbGUsXG4gICAgICAgICAgICAgICAgYm9keVRvZ2dsZUZvck5hdjogYm9keVRvZ2dsZUZvck5hdlxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3QoKSxcbiAgICAgICAgICAgICAgICAgIHByb2plY3RSb3V0ZSA9ICcvcHJvamVjdHMvJyArIHByb2plY3QuaWQsXG4gICAgICAgICAgICAgICAgICBlZGl0Um91dGUgPSBwcm9qZWN0Um91dGUgKyAnL2VkaXQnLFxuICAgICAgICAgICAgICAgICAgZWRpdExpbmtDbGFzcyA9ICdkYXNoYm9hcmQtbmF2LWxpbmstbGVmdCAnICsgKHByb2plY3QuaXNfcHVibGlzaGVkID8gJ2luZGVudCcgOiAnJyk7XG4gICAgICAgICAgICBsZXQgb3B0aW9uYWxPcHQgPSAocHJvamVjdC5tb2RlID09PSAnZmxleCcgPyBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnIChvcGNpb25hbCknKSA6ICcnKTtcblxuICAgICAgICAgICAgY3RybC5ib2R5LmNsYXNzTmFtZSA9IGN0cmwuYm9keVRvZ2dsZUZvck5hdigpO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3QtbmF2JywgW1xuICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LW5hdi13cmFwcGVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCduYXYudy1zZWN0aW9uLmRhc2hib2FyZC1uYXYuc2lkZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3ByZXZpZXdfbGluay53LWlubGluZS1ibG9jay5kYXNoYm9hcmQtcHJvamVjdC1uYW1lW2hyZWY9XCInICsgKHByb2plY3QuaXNfcHVibGlzaGVkID8gJy8nICsgcHJvamVjdC5wZXJtYWxpbmsgOiBlZGl0Um91dGUgKyAnI3ByZXZpZXcnKSArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QtZGFzaGJvYXJkW3NyYz1cIicgKyAoXy5pc051bGwocHJvamVjdC5sYXJnZV9pbWFnZSkgPyAnL2Fzc2V0cy90aHVtYi1wcm9qZWN0LnBuZycgOiBwcm9qZWN0LmxhcmdlX2ltYWdlKSArICdcIl1bd2lkdGg9XCIxMTRcIl0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLW5lZ2F0aXZlLmxpbmVoZWlnaHQtdGlnaHQuZm9udHNpemUtc21hbGwnLCBwcm9qZWN0Lm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGltZy51LW1hcmdpbnRvcC0xMFtzcmM9XCIvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL2JhZGdlLSR7cHJvamVjdC5tb2RlfS1oLnBuZ1wiXVt3aWR0aD04MF1gKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNpbmZvLWxpbmtzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX2hvbWVfbGlua1tjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluay1sZWZ0ICcgKyAoaC5sb2NhdGlvbkFjdGlvbk1hdGNoKCdpbnNpZ2h0cycpID8gJ3NlbGVjdGVkJyA6ICcnKSArICdcIl1baHJlZj1cIicgKyBwcm9qZWN0Um91dGUgKyAnL2luc2lnaHRzXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWJhci1jaGFydC5mYS1sZy5mYS1mdycpLCBJMThuLnQoJ3N0YXJ0X3RhYicsIEkxOG5TY29wZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCAocHJvamVjdC5pc19wdWJsaXNoZWQgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3JlcG9ydHNfbGluay5kYXNoYm9hcmQtbmF2LWxpbmstbGVmdFtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjcmVwb3J0cycgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS5mYS10YWJsZS5mYS1sZy5mYS1mdycpLCBJMThuLnQoJ3JlcG9ydHNfdGFiJywgSTE4blNjb3BlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9yZXBvcnRzX2xpbmsuZGFzaGJvYXJkLW5hdi1saW5rLWxlZnQudS1tYXJnaW5ib3R0b20tMzBbaHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3Bvc3RzJyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWJ1bGxob3JuLmZhLWZ3LmZhLWxnJyksIEkxOG4udCgncG9zdHNfdGFiJywgSTE4blNjb3BlKCkpLCBtKCdzcGFuLmJhZGdlJywgcHJvamVjdC5wb3N0c19jb3VudClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5lZGl0LXByb2plY3QtZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICghcHJvamVjdC5pc19wdWJsaXNoZWQgPyAnJyA6IG0oJ2J1dHRvbiN0b2dnbGUtZWRpdC1tZW51LmRhc2hib2FyZC1uYXYtbGluay1sZWZ0Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmVkaXRMaW5rc1RvZ2dsZS50b2dnbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtcGVuY2lsLmZhLWZ3LmZhLWxnJyksIEkxOG4udCgnZWRpdF9wcm9qZWN0JywgSTE4blNjb3BlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkpLCAoY3RybC5lZGl0TGlua3NUb2dnbGUoKSA/IG0oJyNlZGl0LW1lbnUtaXRlbXMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNkYXNoYm9hcmQtbGlua3MnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKCFwcm9qZWN0LmlzX3B1Ymxpc2hlZCB8fCBwcm9qZWN0LmlzX2FkbWluX3JvbGUpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjYmFzaWNzX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI2Jhc2ljcycgKyAnXCJdJywgJ0LDoXNpY28nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2dvYWxfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjZ29hbCcgKyAnXCJdJywgJ0ZpbmFuY2lhbWVudG8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rlc2NyaXB0aW9uX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI2Rlc2NyaXB0aW9uJyArICdcIl0nLCAnRGVzY3Jpw6fDo28nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjdmlkZW9fbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjdmlkZW8nICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnVsOtZGVvJywgb3B0aW9uYWxPcHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNidWRnZXRfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjYnVkZ2V0JyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ09yw6dhbWVudG8nLCBvcHRpb25hbE9wdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2NhcmRfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjY2FyZCcgKyAnXCJdJywgJ0NhcmQgZG8gcHJvamV0bycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcmV3YXJkX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3Jld2FyZCcgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdSZWNvbXBlbnNhcycsIG9wdGlvbmFsT3B0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3VzZXJfYWJvdXRfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjdXNlcl9hYm91dCcgKyAnXCJdJywgJ1NvYnJlIHZvY8OqJyksIChwcm9qZWN0Lm1vZGUgPT09ICdmbGV4JyB8fCAocHJvamVjdC5pc19wdWJsaXNoZWQgfHwgcHJvamVjdC5zdGF0ZSA9PT0gJ2FwcHJvdmVkJykgfHwgcHJvamVjdC5pc19hZG1pbl9yb2xlID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3VzZXJfc2V0dGluZ3NfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjdXNlcl9zZXR0aW5ncycgKyAnXCJdJywgJ0NvbnRhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpLCAoIXByb2plY3QuaXNfcHVibGlzaGVkID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3ByZXZpZXdfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjcHJldmlldycgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWZ3LmZhLWV5ZS5mYS1sZycpLCAnIFByZXZpZXcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmJ0bi1zZW5kLWRyYWZ0LWZpeGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5tb2RlID09PSAnYW9uJyA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHByb2plY3Quc3RhdGUgPT09ICdkcmFmdCcgPyBtKCdhLmJ0bi5idG4tbWVkaXVtW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL3NlbmRfdG9fYW5hbHlzaXNcIl0nLCBJMThuLnQoJ3NlbmQnLCBJMThuU2NvcGUoKSkpIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5zdGF0ZSA9PT0gJ2FwcHJvdmVkJyA/IG0oJ2EuYnRuLmJ0bi1tZWRpdW1baHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvcHVibGlzaFwiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEkxOG4udCgncHVibGlzaCcsIEkxOG5TY29wZSgpKSwgbS50cnVzdCgnJm5ic3A7Jm5ic3A7JyksIG0oJ3NwYW4uZmEuZmEtY2hldnJvbi1yaWdodCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHByb2plY3Quc3RhdGUgPT09ICdkcmFmdCcgPyBtKCdhLmJ0bi5idG4tbWVkaXVtW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL2VkaXQjcHJldmlld1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEkxOG4udCgncHVibGlzaCcsIEkxOG5TY29wZSgpKSwgbS50cnVzdCgnJm5ic3A7Jm5ic3A7JyksIG0oJ3NwYW4uZmEuZmEtY2hldnJvbi1yaWdodCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5tb2RlID09PSAnZmxleCcgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuYnRuLXNlbmQtZHJhZnQtZml4ZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoXy5pc051bGwocHJvamVjdC5leHBpcmVzX2F0KSA/IG0oJ2Eudy1idXR0b24uYnRuLmJ0bi1tZWRpdW0uYnRuLXNlY29uZGFyeS1kYXJrW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL2VkaXQjYW5ub3VuY2VfZXhwaXJhdGlvblwiXScsIEkxOG4udCgnYW5ub3VuY2VfZXhwaXJhdGlvbicsIEkxOG5TY29wZSgpKSkgOiAnJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJ2EuYnRuLWRhc2hib2FyZCBocmVmPVwianM6dm9pZCgwKTtcIicsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5ib2R5VG9nZ2xlRm9yTmF2LnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1iYXJzLmZhLWxnJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgsIHdpbmRvdy5JMThuKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3REYXRhQ2hhcnQgY29tcG9uZW50XG4gKiBBIGdyYXBoIGJ1aWxkZXIgaW50ZXJmYWNlIHRvIGJlIHVzZWQgb24gcHJvamVjdCByZWxhdGVkIGRhc2hib2FyZHMuXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5Qcm9qZWN0RGF0YUNoYXJ0LCB7XG4gKiAgICAgY29sbGVjdGlvbjogY3RybC5jb250cmlidXRpb25zUGVyRGF5LFxuICogICAgIGxhYmVsOiAnUiQgYXJyZWNhZGFkb3MgcG9yIGRpYScsXG4gKiAgICAgZGF0YUtleTogJ3RvdGFsX2Ftb3VudCdcbiAqIH0pXG4gKi9cbndpbmRvdy5jLlByb2plY3REYXRhQ2hhcnQgPSAoKG0sIENoYXJ0LCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlID0gXy5maXJzdChhcmdzLmNvbGxlY3Rpb24oKSksXG4gICAgICAgICAgICAgICAgICBzb3VyY2UgPSAoIV8uaXNVbmRlZmluZWQocmVzb3VyY2UpID8gcmVzb3VyY2Uuc291cmNlIDogW10pLFxuXG4gICAgICAgICAgICAgICAgbW91bnREYXRhc2V0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3tcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwwLjIpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50Q29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMSknLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRTdHJva2VDb2xvcjogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRGaWxsOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludEhpZ2hsaWdodFN0cm9rZTogJ3JnYmEoMjIwLDIyMCwyMjAsMSknLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogXy5tYXAoc291cmNlLCAoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtW2FyZ3MuZGF0YUtleV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlbmRlckNoYXJ0ID0gKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjdHggPSBlbGVtZW50LmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBDaGFydChjdHgpLkxpbmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsczogXy5tYXAoc291cmNlLCAoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJncy54QXhpcyhpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhc2V0czogbW91bnREYXRhc2V0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlbmRlckNoYXJ0OiByZW5kZXJDaGFydFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcuY2FyZC51LXJhZGl1cy5tZWRpdW0udS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlcicsIGFyZ3MubGFiZWwpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLm92ZXJmbG93LWF1dG8nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdjYW52YXNbaWQ9XCJjaGFydFwiXVt3aWR0aD1cIjg2MFwiXVtoZWlnaHQ9XCIzMDBcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnJlbmRlckNoYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LkNoYXJ0LCB3aW5kb3cuXykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0RGF0YVRhYmxlIGNvbXBvbmVudFxuICogQSB0YWJsZSBpbnRlcmZhY2UgY29uc3RydWN0b3IgdGhhdCBzaG91bGQgYmUgdXNlZCBvbiBwcm9qZWN0IHJlbGF0ZWQgZGFzaGJvYXJkcy5cbiAqIEl0IHRha2VzIGFuIGFycmF5IGFuZCBhIGxhYmxlIGFzIGl0J3Mgc291cmNlcy5cbiAqIFRoZSBmaXJzdCBpdGVtIGluIHRoZSBhcnJheSBpcyB0aGUgaGVhZGVyIGRlc2NyaXB0b3IgYW5kIHRoZSByZXN0IG9mIHRoZW0gYXJlIHJvdyBkYXRhLlxuICogUm93cyBtYXkgcmV0dXJuIGEgc3RyaW5nIG9yIGFuIGFycmF5IGFuZCB0aGlzIHZhbHVlIHdpbGwgYmUgdXNlZCBhcyBhIHJvdyBvdXRwdXQuXG4gKiBBbGwgdGFibGUgcm93cyBhcmUgc29ydGFibGUgYnkgZGVmYXVsdC4gSWYgeW91IHdhbnQgdG8gdXNlIGEgY3VzdG9tIHZhbHVlIGFzIHNvcnQgcGFyYW1ldGVyXG4gKiB5b3UgbWF5IHNldCBhIDJEIGFycmF5IGFzIHJvdy4gSW4gdGhpcyBjYXNlLCB0aGUgZmlyc3QgYXJyYXkgdmFsdWUgd2lsbCBiZSB0aGUgY3VzdG9tIHZhbHVlXG4gKiB3aGlsZSB0aGUgb3RoZXIgd2lsbCBiZSB0aGUgYWN0dWFsIG91dHB1dC5cbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLlByb2plY3REYXRhVGFibGUsIHtcbiAqICAgICAgbGFiZWw6ICdUYWJsZSBsYWJlbCcsXG4gKiAgICAgIHRhYmxlOiBbXG4gKiAgICAgICAgICBbJ2NvbCBoZWFkZXIgMScsICdjb2wgaGVhZGVyIDInXSxcbiAqICAgICAgICAgIFsndmFsdWUgMXgxJywgWzMsICd2YWx1ZSAxeDInXV0sXG4gKiAgICAgICAgICBbJ3ZhbHVlIDJ4MScsIFsxLCAndmFsdWUgMngyJ11dIC8vV2UgYXJlIHVzaW5nIGEgY3VzdG9tIGNvbXBhcmF0b3IgdHdvIGNvbCAyIHZhbHVlc1xuICogICAgICBdLFxuICogICAgICAvL0FsbG93cyB5b3UgdG8gc2V0IGEgc3BlY2lmaWMgY29sdW1uIHRvIGJlIG9yZGVyZWQgYnkgZGVmYXVsdC5cbiAqICAgICAgLy9JZiBubyB2YWx1ZSBpcyBzZXQsIHRoZSBmaXJzdCByb3cgd2lsbCBiZSB0aGUgZGVmYXVsdCBvbmUgdG8gYmUgb3JkZXJlZC5cbiAqICAgICAgLy9OZWdhdGl2ZSB2YWx1ZXMgbWVhbiB0aGF0IHRoZSBvcmRlciBzaG91bGQgYmUgcmV2ZXJ0ZWRcbiAqICAgICAgZGVmYXVsdFNvcnRJbmRleDogLTNcbiAqICB9KVxuICovXG53aW5kb3cuYy5Qcm9qZWN0RGF0YVRhYmxlID0gKChtLCBtb2RlbHMsIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHRhYmxlID0gbS5wcm9wKGFyZ3MudGFibGUpLFxuICAgICAgICAgICAgICAgIHNvcnRJbmRleCA9IG0ucHJvcCgtMSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbXBhcmF0b3IgPSAoYSwgYikgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBpZHggPSBzb3J0SW5kZXgoKSxcbiAgICAgICAgICAgICAgICAgICAgLy9DaGVjayBpZiBhIGN1c3RvbSBjb21wYXJhdG9yIGlzIHVzZWQgPT4gUmVhZCBjb21wb25lbnQgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgeCA9IChfLmlzQXJyYXkoYVtpZHhdKSAmJiBhW2lkeF0ubGVuZ3RoID4gMSkgPyBhW2lkeF1bMF0gOiBhW2lkeF0sXG4gICAgICAgICAgICAgICAgICAgIHkgPSAoXy5pc0FycmF5KGJbaWR4XSkgJiYgYltpZHhdLmxlbmd0aCA+IDEpID8gYltpZHhdWzBdIDogYltpZHhdO1xuXG4gICAgICAgICAgICAgICAgaWYgKHggPCB5KXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoeSA8IHgpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBzb3J0VGFibGUgPSAoaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGhlYWRlciA9IF8uZmlyc3QodGFibGUoKSksXG4gICAgICAgICAgICAgICAgICAgIGJvZHk7XG4gICAgICAgICAgICAgICAgaWYgKHNvcnRJbmRleCgpID09PSBpZHgpe1xuICAgICAgICAgICAgICAgICAgICBib2R5ID0gXy5yZXN0KHRhYmxlKCkpLnJldmVyc2UoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzb3J0SW5kZXgoaWR4KTtcbiAgICAgICAgICAgICAgICAgICAgYm9keSA9IF8ucmVzdCh0YWJsZSgpKS5zb3J0KGNvbXBhcmF0b3IpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRhYmxlKF8udW5pb24oW2hlYWRlcl0sYm9keSkpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc29ydFRhYmxlKE1hdGguYWJzKGFyZ3MuZGVmYXVsdFNvcnRJbmRleCkgfHwgMCk7XG5cbiAgICAgICAgICAgIGlmIChhcmdzLmRlZmF1bHRTb3J0SW5kZXggPCAwKXtcbiAgICAgICAgICAgICAgICBzb3J0VGFibGUoTWF0aC5hYnMoYXJncy5kZWZhdWx0U29ydEluZGV4KSB8fCAwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0YWJsZTogdGFibGUsXG4gICAgICAgICAgICAgICAgc29ydFRhYmxlOiBzb3J0VGFibGVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgaGVhZGVyID0gXy5maXJzdChjdHJsLnRhYmxlKCkpLFxuICAgICAgICAgICAgICAgIGJvZHkgPSBfLnJlc3QoY3RybC50YWJsZSgpKTtcbiAgICAgICAgICAgIHJldHVybiBtKCcudGFibGUtb3V0ZXIudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctcm93LnRhYmxlLXJvdy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIuaGVhZGVyJyxcbiAgICAgICAgICAgICAgICAgICAgXy5tYXAoaGVhZGVyLCAoaGVhZGluZywgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc29ydCA9ICgpID0+IGN0cmwuc29ydFRhYmxlKGlkeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IHNvcnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke2hlYWRpbmd9IGAsIG0oJ3NwYW4uZmEuZmEtc29ydCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICksIG0oJy50YWJsZS1pbm5lci5mb250c2l6ZS1zbWFsbCcsXG4gICAgICAgICAgICAgICAgICAgIF8ubWFwKGJvZHksIChyb3dEYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnRhYmxlLXJvdycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAocm93RGF0YSwgKHJvdykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0NoZWNrIGlmIGEgY3VzdG9tIGNvbXBhcmF0b3IgaXMgdXNlZCA9PiBSZWFkIGNvbXBvbmVudCBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3cgPSAoXy5pc0FycmF5KHJvdykgJiYgcm93Lmxlbmd0aCA+IDEpID8gcm93WzFdIDogcm93O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2Jywgcm93KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0SGVhZGVyID0gKChtLCBjLCBoLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuXG4gICAgICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZChwcm9qZWN0KCkpKXtcbiAgICAgICAgICAgICAgICBwcm9qZWN0ID0gbS5wcm9wKHt9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LWhlYWRlcicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24tcHJvZHVjdC4nICsgcHJvamVjdCgpLm1vZGUpLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24ucGFnZS1oZWFkZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaDEuZm9udHNpemUtbGFyZ2VyLmZvbnR3ZWlnaHQtc2VtaWJvbGQucHJvamVjdC1uYW1lW2l0ZW1wcm9wPVwibmFtZVwiXScsIGguc2VsZk9yRW1wdHkocHJvamVjdCgpLm5hbWUpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2gyLmZvbnRzaXplLWJhc2UubGluZWhlaWdodC1sb29zZXJbaXRlbXByb3A9XCJhdXRob3JcIl0nLCAocHJvamVjdCgpLnVzZXIpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdwb3IgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0KCkudXNlci5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5wcm9qZWN0LW1haW4nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy5wcm9qZWN0LW1haW4nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgucHJvamVjdC1oaWdobGlnaHQnLCBtLmNvbXBvbmVudChjLlByb2plY3RIaWdobGlnaHQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIG0uY29tcG9uZW50KGMuUHJvamVjdFNpZGViYXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlckRldGFpbHM6IGFyZ3MudXNlckRldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdEhpZ2hsaWdodCA9ICgobSwgXywgaCwgYykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5U2hhcmVCb3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlTaGFyZUJveDogZGlzcGxheVNoYXJlQm94XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBhZGRyZXNzID0gcHJvamVjdCgpLmFkZHJlc3MgfHwge3N0YXRlX2Fjcm9ueW06ICcnLCBjaXR5OiAnJ307XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1oaWdobGlnaHQnLCBbXG4gICAgICAgICAgICAgICAgKHByb2plY3QoKS52aWRlb19lbWJlZF91cmwgPyBtKCcudy1lbWJlZC53LXZpZGVvLnByb2plY3QtdmlkZW8nLCB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnbWluLWhlaWdodDogMjQwcHg7J1xuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaWZyYW1lLmVtYmVkbHktZW1iZWRbaXRlbXByb3A9XCJ2aWRlb1wiXVtzcmM9XCInICsgcHJvamVjdCgpLnZpZGVvX2VtYmVkX3VybCArICdcIl1bZnJhbWVib3JkZXI9XCIwXCJdW2FsbG93RnVsbFNjcmVlbl0nKVxuICAgICAgICAgICAgICAgIF0pIDogbSgnLnByb2plY3QtaW1hZ2UnLCB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnYmFja2dyb3VuZC1pbWFnZTp1cmwoJyArIHByb2plY3QoKS5vcmlnaW5hbF9pbWFnZSArICcpOydcbiAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgbSgnLnByb2plY3QtYmx1cmInLCBwcm9qZWN0KCkuaGVhZGxpbmUpLFxuICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLXNtYWxsLW9ubHkudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgICAgICghXy5pc051bGwoYWRkcmVzcykgP1xuICAgICAgICAgICAgICAgICAgICAgbShgYS5idG4uYnRuLWlubGluZS5idG4tc21hbGwuYnRuLXRyYW5zcGFyZW50LmxpbmstaGlkZGVuLWxpZ2h0LnUtbWFyZ2luYm90dG9tLTEwW2hyZWY9XCIvcHQvZXhwbG9yZT9wZ19zZWFyY2g9JHthZGRyZXNzLnN0YXRlX2Fjcm9ueW19XCJdYCwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtbWFwLW1hcmtlcicpLCBgICR7YWRkcmVzcy5jaXR5fSwgJHthZGRyZXNzLnN0YXRlX2Fjcm9ueW19YFxuICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBtKGBhLmJ0bi5idG4taW5saW5lLmJ0bi1zbWFsbC5idG4tdHJhbnNwYXJlbnQubGluay1oaWRkZW4tbGlnaHRbaHJlZj1cIi9wdC9leHBsb3JlI2J5X2NhdGVnb3J5X2lkLyR7cHJvamVjdCgpLmNhdGVnb3J5X2lkfVwiXWAsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtdGFnJyksICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QoKS5jYXRlZ29yeV9uYW1lXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24jc2hhcmUtYm94LmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5LmJ0bi1pbmxpbmUnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmRpc3BsYXlTaGFyZUJveC50b2dnbGVcbiAgICAgICAgICAgICAgICAgICAgfSwgJ0NvbXBhcnRpbGhhcicpLCAoY3RybC5kaXNwbGF5U2hhcmVCb3goKSA/IG0uY29tcG9uZW50KGMuUHJvamVjdFNoYXJlQm94LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheVNoYXJlQm94OiBjdHJsLmRpc3BsYXlTaGFyZUJveFxuICAgICAgICAgICAgICAgICAgICB9KSA6ICcnKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLlByb2plY3RNYWluID0gKChtLCBjLCBfLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgICBkaXNwbGF5VGFiQ29udGVudCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2gsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY19vcHRzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI3Jld2FyZHMnOiBtKCcudy1jb2wudy1jb2wtMTInLCBtLmNvbXBvbmVudChjLlByb2plY3RSZXdhcmRMaXN0LCBfLmV4dGVuZCh7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogYXJncy5yZXdhcmREZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGNfb3B0cykpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNjb250cmlidXRpb25fc3VnZ2VzdGlvbnMnOiBtLmNvbXBvbmVudChjLlByb2plY3RTdWdnZXN0ZWRDb250cmlidXRpb25zLCBjX29wdHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI2NvbnRyaWJ1dGlvbnMnOiBtLmNvbXBvbmVudChjLlByb2plY3RDb250cmlidXRpb25zLCBjX29wdHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI2Fib3V0JzogbS5jb21wb25lbnQoYy5Qcm9qZWN0QWJvdXQsIF8uZXh0ZW5kKHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBhcmdzLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgY19vcHRzKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjY29tbWVudHMnOiBtLmNvbXBvbmVudChjLlByb2plY3RDb21tZW50cywgY19vcHRzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNwb3N0cyc6IG0uY29tcG9uZW50KGMuUHJvamVjdFBvc3RzLCBjX29wdHMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgIGlmIChfLmlzRW1wdHkoaGFzaCkgfHwgaGFzaCA9PT0gJyNfPV8nIHx8IGhhc2ggPT09ICcjcHJldmlldycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhYnNbJyNhYm91dCddO1xuICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YWJzW2hhc2hdO1xuICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaC5yZWRyYXdIYXNoQ2hhbmdlKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheVRhYkNvbnRlbnQ6IGRpc3BsYXlUYWJDb250ZW50XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnc2VjdGlvbi5zZWN0aW9uW2l0ZW10eXBlPVwiaHR0cDovL3NjaGVtYS5vcmcvQ3JlYXRpdmVXb3JrXCJdJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgYXJncy5wcm9qZWN0KCkgPyBjdHJsLmRpc3BsYXlUYWJDb250ZW50KCkgOiAnJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3RNb2RlIGNvbXBvbmVudFxuICogQSBzaW1wbGUgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgYSBiYWRnZSB3aXRoIHRoZSBjdXJyZW50IHByb2plY3QgbW9kZVxuICogdG9nZXRoZXIgd2l0aCBhIGRlc2NyaXB0aW9uIG9mIHRoZSBtb2RlLCBzaG93biBpbnNpZGUgYSB0b29sdGlwLlxuICogSXQgcmVjZWl2ZXMgYSBwcm9qZWN0IGFzIHJlc291cmNlXG4gKlxuICogRXhhbXBsZTpcbiAqICB2aWV3OiB7XG4gKiAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RNb2RlLCB7cHJvamVjdDogcHJvamVjdH0pXG4gKiAgfVxuICovXG53aW5kb3cuYy5Qcm9qZWN0TW9kZSA9ICgobSwgYywgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgcHJvamVjdCA9IGFyZ3MucHJvamVjdCgpLFxuICAgICAgICAgICAgICAgIG1vZGUgPSBwcm9qZWN0Lm1vZGUsXG4gICAgICAgICAgICAgICAgbW9kZUltZ1NyYyA9IChtb2RlID09PSAnYW9uJykgPyAnL2Fzc2V0cy9hb24tYmFkZ2UucG5nJyA6ICcvYXNzZXRzL2ZsZXgtYmFkZ2UucG5nJyxcbiAgICAgICAgICAgICAgICBtb2RlVGl0bGUgPSAobW9kZSA9PT0gJ2FvbicpID8gJ0NhbXBhbmhhIFR1ZG8tb3UtbmFkYSAnIDogJ0NhbXBhbmhhIEZsZXjDrXZlbCAnLFxuICAgICAgICAgICAgICAgIGdvYWwgPSAoXy5pc051bGwocHJvamVjdC5nb2FsKSA/ICduw6NvIGRlZmluaWRhJyA6IGguZm9ybWF0TnVtYmVyKHByb2plY3QuZ29hbCkpLFxuICAgICAgICAgICAgICAgIHRvb2x0aXAgPSAoZWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuVG9vbHRpcCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWw6IGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogKG1vZGUgPT09ICdhb24nKSA/IGBTb21lbnRlIHJlY2ViZXLDoSBvcyByZWN1cnNvcyBzZSBhdGluZ2lyIG91IHVsdHJhcGFzc2FyIGEgbWV0YSBhdMOpIG8gZGlhICR7aC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQsICdERC9NTS9ZWVlZJyl9LmAgOiAnTyByZWFsaXphZG9yIHJlY2ViZXLDoSB0b2RvcyBvcyByZWN1cnNvcyBxdWFuZG8gZW5jZXJyYXIgYSBjYW1wYW5oYSwgbWVzbW8gcXVlIG7Do28gdGVuaGEgYXRpbmdpZG8gZXN0YSBtZXRhLicsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogMjgwXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBtKGAjJHttb2RlfS53LXJvd2AsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC0yLnctY29sLXRpbnktMicsIFtcbiAgICAgICAgICAgICAgICAgICAgIV8uaXNFbXB0eShwcm9qZWN0KSA/IG0oYGltZ1tzcmM9XCIke21vZGVJbWdTcmN9XCJdW3dpZHRoPSczMCddYCkgOiAnJ1xuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMC53LWNvbC1zbWFsbC0xMC53LWNvbC10aW55LTEwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgJ01ldGEgUiQgJyArIGguc2VsZk9yRW1wdHkoZ29hbCwgJy0tJykpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1pbmxpbmUtYmxvY2suZm9udHNpemUtc21hbGxlc3QuX3ctaW5saW5lLWJsb2NrJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgIV8uaXNFbXB0eShwcm9qZWN0KSA/IG1vZGVUaXRsZSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcCgnc3Bhbi53LWlubGluZS1ibG9jay50b29sdGlwLXdyYXBwZXIuZmEuZmEtcXVlc3Rpb24tY2lyY2xlLmZvbnRjb2xvci1zZWNvbmRhcnknKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlByb2plY3RQb3N0cyA9ICgobSwgbW9kZWxzLCBoLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RWTSA9IG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShtb2RlbHMucHJvamVjdFBvc3REZXRhaWwpLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmaWx0ZXJWTS5wcm9qZWN0X2lkKGFyZ3MucHJvamVjdCgpLmlkKTtcblxuICAgICAgICAgICAgaWYgKCFsaXN0Vk0uY29sbGVjdGlvbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBsaXN0Vk06IGxpc3RWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTTogZmlsdGVyVk1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0ID0gY3RybC5saXN0Vk0sXG4gICAgICAgICAgICAgICAgcHJvamVjdCA9IGFyZ3MucHJvamVjdCgpIHx8IHt9O1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3QtcG9zdHMudy1zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LW1hcmdpbnRvcC0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgKHByb2plY3QuaXNfb3duZXJfb3JfYWRtaW4gPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAoIWxpc3QuaXNMb2FkaW5nKCkpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIChfLmlzRW1wdHkobGlzdC5jb2xsZWN0aW9uKCkpID8gbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UudS1tYXJnaW5ib3R0b20tMzAudS1tYXJnaW50b3AtMjAnLCAnVG9kYSBub3ZpZGFkZSBwdWJsaWNhZGEgbm8gQ2F0YXJzZSDDqSBlbnZpYWRhIGRpcmV0YW1lbnRlIHBhcmEgbyBlbWFpbCBkZSBxdWVtIGrDoSBhcG9pb3Ugc2V1IHByb2pldG8gZSB0YW1iw6ltIGZpY2EgZGlzcG9uw612ZWwgcGFyYSB2aXN1YWxpemHDp8OjbyBubyBzaXRlLiBWb2PDqiBwb2RlIG9wdGFyIHBvciBkZWl4w6EtbGEgcMO6YmxpY2EsIG91IHZpc8OtdmVsIHNvbWVudGUgcGFyYSBzZXVzIGFwb2lhZG9yZXMgYXF1aSBuZXN0YSBhYmEuJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYS5idG4uYnRuLWVkaXQuYnRuLXNtYWxsW2hyZWY9Jy9wdC9wcm9qZWN0cy8ke3Byb2plY3QuaWR9L2VkaXQjcG9zdHMnXWAsICdFc2NyZXZlciBub3ZpZGFkZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiAnJyksIChfLm1hcChsaXN0LmNvbGxlY3Rpb24oKSwgKHBvc3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wb3N0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTYwIC53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtdGV4dC1jZW50ZXInLCBoLm1vbWVudGlmeShwb3N0LmNyZWF0ZWRfYXQpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZXIudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0zMCcsIHBvc3QudGl0bGUpLCAoIV8uaXNFbXB0eShwb3N0LmNvbW1lbnRfaHRtbCkgPyBtKCcuZm9udHNpemUtYmFzZScsIG0udHJ1c3QocG9zdC5jb21tZW50X2h0bWwpKSA6IG0oJy5mb250c2l6ZS1iYXNlJywgJ1Bvc3QgZXhjbHVzaXZvIHBhcmEgYXBvaWFkb3Jlcy4nKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW5ib3R0b20tNjAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXB1c2gtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIWxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAobGlzdC5pc0xhc3RQYWdlKCkgPyAnTmVuaHVtYSBub3ZpZGFkZS4nIDogbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBsaXN0Lm5leHRQYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdDYXJyZWdhciBtYWlzJykpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaC5sb2FkZXIoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdFJlbWluZGVyQ291bnQgPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5yZXNvdXJjZTtcbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1yZW1pbmRlci1jb3VudC5jYXJkLnUtcmFkaXVzLnUtdGV4dC1jZW50ZXIubWVkaXVtLnUtbWFyZ2luYm90dG9tLTgwJywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1RvdGFsIGRlIHBlc3NvYXMgcXVlIGNsaWNhcmFtIG5vIGJvdMOjbyBMZW1icmFyLW1lJyksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS1tYXJnaW5ib3R0b20tMzAnLCAnVW0gbGVtYnJldGUgcG9yIGVtYWlsIMOpIGVudmlhZG8gNDggaG9yYXMgYW50ZXMgZG8gdMOpcm1pbm8gZGEgc3VhIGNhbXBhbmhhJyksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWp1bWJvJywgcHJvamVjdC5yZW1pbmRlcl9jb3VudClcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIi8qKlxuICogd2luZG93LmMuUHJvamVjdFJlbWluZGVyIGNvbXBvbmVudFxuICogQSBjb21wb25lbnQgdGhhdCBkaXNwbGF5cyBhIGNsaWNrYWJsZSBwcm9qZWN0IHJlbWluZGVyIGVsZW1lbnQuXG4gKiBUaGUgY29tcG9uZW50IGNhbiBiZSBvZiB0d28gdHlwZXM6IGEgJ2xpbmsnIG9yIGEgJ2J1dHRvbidcbiAqXG4gKiBFeGFtcGxlOlxuICogIHZpZXc6IHtcbiAqICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuUHJvamVjdFJlbWluZGVyLCB7cHJvamVjdDogcHJvamVjdCwgdHlwZTogJ2J1dHRvbid9KVxuICogIH1cbiAqL1xud2luZG93LmMuUHJvamVjdFJlbWluZGVyID0gKChtLCBtb2RlbHMsIGgsIGMpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgZmlsdGVyVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgc3RvcmVSZW1pbmRlck5hbWUgPSAncmVtaW5kXycgKyBwcm9qZWN0KCkuaWQsXG4gICAgICAgICAgICAgICAgbCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgcG9wTm90aWZpY2F0aW9uID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBzdWJtaXRSZW1pbmRlciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFoLmdldFVzZXIoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaC5zdG9yZUFjdGlvbihzdG9yZVJlbWluZGVyTmFtZSwgc3VibWl0UmVtaW5kZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgubmF2aWdhdGVUb0RldmlzZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxldCBsb2FkZXJPcHRzID0gcHJvamVjdCgpLmluX3JlbWluZGVyID8gbW9kZWxzLnByb2plY3RSZW1pbmRlci5kZWxldGVPcHRpb25zKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkgOiBtb2RlbHMucHJvamVjdFJlbWluZGVyLnBvc3RPcHRpb25zKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6IHByb2plY3QoKS5pZFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihsb2FkZXJPcHRzKTtcblxuICAgICAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QoKS5pbl9yZW1pbmRlciA9ICFwcm9qZWN0KCkuaW5fcmVtaW5kZXI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9qZWN0KCkuaW5fcmVtaW5kZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3BOb3RpZmljYXRpb24odHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcE5vdGlmaWNhdGlvbihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcE5vdGlmaWNhdGlvbihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGguY2FsbFN0b3JlZEFjdGlvbihzdG9yZVJlbWluZGVyTmFtZSwgc3VibWl0UmVtaW5kZXIpO1xuICAgICAgICAgICAgZmlsdGVyVk0ucHJvamVjdF9pZChwcm9qZWN0KCkuaWQpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGw6IGwsXG4gICAgICAgICAgICAgICAgc3VibWl0UmVtaW5kZXI6IHN1Ym1pdFJlbWluZGVyLFxuICAgICAgICAgICAgICAgIHBvcE5vdGlmaWNhdGlvbjogcG9wTm90aWZpY2F0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWFpbkNsYXNzID0gKGFyZ3MudHlwZSA9PT0gJ2J1dHRvbicpID8gJycgOiAnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMzAnLFxuICAgICAgICAgICAgICAgIGJ1dHRvbkNsYXNzID0gKGFyZ3MudHlwZSA9PT0gJ2J1dHRvbicpID8gJ3ctYnV0dG9uIGJ0biBidG4tdGVyY2lhcnkgYnRuLW5vLWJvcmRlcicgOiAnYnRuLWxpbmsgbGluay1oaWRkZW4gZm9udHNpemUtc21hbGwnLFxuICAgICAgICAgICAgICAgIGhpZGVUZXh0T25Nb2JpbGUgPSBhcmdzLmhpZGVUZXh0T25Nb2JpbGUgfHwgZmFsc2UsXG4gICAgICAgICAgICAgICAgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcblxuICAgICAgICAgICAgcmV0dXJuIG0oYCNwcm9qZWN0LXJlbWluZGVyJHttYWluQ2xhc3N9YCwgW1xuICAgICAgICAgICAgICAgIG0oYGJ1dHRvbltjbGFzcz1cIiR7YnV0dG9uQ2xhc3N9ICR7KHByb2plY3QoKS5pbl9yZW1pbmRlciA/ICdsaW5rLWhpZGRlbi1zdWNjZXNzJyA6ICdmb250Y29sb3Itc2Vjb25kYXJ5Jyl9IGZvbnR3ZWlnaHQtc2VtaWJvbGRcIl1gLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuc3VibWl0UmVtaW5kZXJcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIChjdHJsLmwoKSA/ICdhZ3VhcmRlIC4uLicgOiBtKCdzcGFuLmZhLmZhLWNsb2NrLW8nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKGBzcGFuJHtoaWRlVGV4dE9uTW9iaWxlID8gJy53LWhpZGRlbi1tZWRpdW0nIDogJyd9YCwgcHJvamVjdCgpLmluX3JlbWluZGVyID8gJyBMZW1icmV0ZSBhdGl2bycgOiAnIExlbWJyYXItbWUnKVxuICAgICAgICAgICAgICAgICAgICBdKSlcbiAgICAgICAgICAgICAgICBdKSwgKGN0cmwucG9wTm90aWZpY2F0aW9uKCkgPyBtLmNvbXBvbmVudChjLlBvcE5vdGlmaWNhdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnT2shIFZhbW9zIHRlIG1hbmRhciB1bSBsZW1icmV0ZSBwb3IgZS1tYWlsIDQ4IGhvcmFzIGFudGVzIGRvIGZpbSBkYSBjYW1wYW5oYSdcbiAgICAgICAgICAgICAgICB9KSA6ICcnKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuUHJvamVjdFJld2FyZExpc3QgPSAoKG0sIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgLy9GSVhNRTogTUlTU0lORyBBREpVU1RTXG4gICAgICAgICAgICAvLyAtIGFkZCBkcmFmdCBhZG1pbiBtb2RpZmljYXRpb25zXG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgICAgICAgIHJldHVybiBtKCcjcmV3YXJkcy51LW1hcmdpbmJvdHRvbS0zMCcsIF8ubWFwKGFyZ3MucmV3YXJkRGV0YWlscygpLCAocmV3YXJkKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRyaWJ1dGlvblVybFdpdGhSZXdhcmQgPSAnL3Byb2plY3RzLycgKyBwcm9qZWN0KCkuaWQgKyAnL2NvbnRyaWJ1dGlvbnMvbmV3P3Jld2FyZF9pZD0nICsgcmV3YXJkLmlkO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJ2FbY2xhc3M9XCInICsgKGgucmV3YXJkU291bGRPdXQocmV3YXJkKSA/ICdjYXJkLWdvbmUnIDogJ2NhcmQtcmV3YXJkICcgKyAocHJvamVjdCgpLm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgPyAnY2xpY2thYmxlJyA6ICcnKSkgKyAnIGNhcmQgY2FyZC1zZWNvbmRhcnkgdS1tYXJnaW5ib3R0b20tMTBcIl1baHJlZj1cIicgKyAocHJvamVjdCgpLm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgJiYgIWgucmV3YXJkU291bGRPdXQocmV3YXJkKSA/IGNvbnRyaWJ1dGlvblVybFdpdGhSZXdhcmQgOiAnanM6dm9pZCgwKTsnKSArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnUGFyYSBSJCAnICsgaC5mb3JtYXROdW1iZXIocmV3YXJkLm1pbmltdW1fdmFsdWUpICsgJyBvdSBtYWlzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgaC5wbHVyYWxpemUocmV3YXJkLnBhaWRfY291bnQsICcgYXBvaW8nLCAnIGFwb2lvcycpKSwgKHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgPiAwID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChyZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50ID4gMCA/IG0oJy5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMuaW5fdGltZV90b19jb25maXJtLmNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcucGVuZGluZy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgaC5wbHVyYWxpemUocmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCwgJyBhcG9pbyBlbSBwcmF6byBkZSBjb25maXJtYcOnw6NvJywgJyBhcG9pb3MgZW0gcHJhem8gZGUgY29uZmlybWHDp8Ojby4nKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSwgKGgucmV3YXJkU291bGRPdXQocmV3YXJkKSA/IG0oJy51LW1hcmdpbnRvcC0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZS5iYWRnZS1nb25lLmZvbnRzaXplLXNtYWxsZXInLCAnRXNnb3RhZGEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogbSgnLnUtbWFyZ2ludG9wLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmJhZGdlLmJhZGdlLWF0dGVudGlvbi5mb250c2l6ZS1zbWFsbGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LWJvbGQnLCAnTGltaXRhZGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgKCcgKyBoLnJld2FyZFJlbWFuaW5nKHJld2FyZCkgKyAnIGRlICcgKyByZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zICsgJyBkaXNwb27DrXZlaXMpJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtbWFyZ2ludG9wLTIwJywgbS50cnVzdChoLnNpbXBsZUZvcm1hdChyZXdhcmQuZGVzY3JpcHRpb24pKSksICghXy5pc0VtcHR5KHJld2FyZC5kZWxpdmVyX2F0KSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdiJywgJ0VzdGltYXRpdmEgZGUgRW50cmVnYTogJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaC5tb21lbnRpZnkocmV3YXJkLmRlbGl2ZXJfYXQsICdNTU0vWVlZWScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSwgKHByb2plY3QoKS5vcGVuX2Zvcl9jb250cmlidXRpb25zICYmICFoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnByb2plY3QtcmV3YXJkLWJveC1ob3ZlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1yZXdhcmQtYm94LXNlbGVjdC10ZXh0LnUtdGV4dC1jZW50ZXInLCAnU2VsZWNpb25lIGVzc2EgcmVjb21wZW5zYScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Um93ID0gKChtLCBfLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbGxlY3Rpb24gPSBhcmdzLmNvbGxlY3Rpb24sXG4gICAgICAgICAgICAgICAgcmVmID0gYXJncy5yZWYsXG4gICAgICAgICAgICAgICAgd3JhcHBlciA9IGFyZ3Mud3JhcHBlciB8fCAnLnctc2VjdGlvbi5zZWN0aW9uLnUtbWFyZ2luYm90dG9tLTQwJztcblxuICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb24ubG9hZGVyKCkgfHwgY29sbGVjdGlvbi5jb2xsZWN0aW9uKCkubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0od3JhcHBlciwgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAoIV8uaXNVbmRlZmluZWQoY29sbGVjdGlvbi50aXRsZSkgfHwgIV8uaXNVbmRlZmluZWQoY29sbGVjdGlvbi5oYXNoKSkgPyBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwLnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC1sb29zZXInLCBjb2xsZWN0aW9uLnRpdGxlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5W2hyZWY9XCIvcHQvZXhwbG9yZT9yZWY9JHtyZWZ9IyR7Y29sbGVjdGlvbi5oYXNofVwiXWAsICdWZXIgdG9kb3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbi5sb2FkZXIoKSA/IGgubG9hZGVyKCkgOiBtKCcudy1yb3cnLCBfLm1hcChjb2xsZWN0aW9uLmNvbGxlY3Rpb24oKSwgKHByb2plY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Qcm9qZWN0Q2FyZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY6IHJlZlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCdkaXYnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdFNoYXJlQm94ID0gKChtLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5RW1iZWQ6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnBvcC1zaGFyZScsIHtcbiAgICAgICAgICAgICAgICBzdHlsZTogJ2Rpc3BsYXk6IGJsb2NrOydcbiAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tbWFpbi53LWhpZGRlbi1tZWRpdW0udy1jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnYS5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeS5idG4taW5saW5lLnUtcmlnaHQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBhcmdzLmRpc3BsYXlTaGFyZUJveC50b2dnbGVcbiAgICAgICAgICAgICAgICAgICAgfSwgJ0ZlY2hhcicpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0zMCcsICdDb21wYXJ0aWxoZSBlc3RlIHByb2pldG8nKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXdpZGdldC53LXdpZGdldC1mYWNlYm9vay53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LnNoYXJlLWJsb2NrJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpZnJhbWVbYWxsb3d0cmFuc3BhcmVuY3k9XCJ0cnVlXCJdW3dpZHRoPVwiMTUwcHhcIl1baGVpZ2h0PVwiMjJweFwiXVtmcmFtZWJvcmRlcj1cIjBcIl1bc2Nyb2xsaW5nPVwibm9cIl1bc3JjPVwiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL3YyLjAvcGx1Z2lucy9zaGFyZV9idXR0b24ucGhwP2FwcF9pZD0xNzM3NDcwNDI2NjE0OTEmY2hhbm5lbD1odHRwcyUzQSUyRiUyRnMtc3RhdGljLmFrLmZhY2Vib29rLmNvbSUyRmNvbm5lY3QlMkZ4ZF9hcmJpdGVyJTJGNDRPd0s3NHUwSWUuanMlM0Z2ZXJzaW9uJTNENDElMjNjYiUzRGY3ZDliOTAwYyUyNmRvbWFpbiUzRHd3dy5jYXRhcnNlLm1lJTI2b3JpZ2luJTNEaHR0cHMlMjUzQSUyNTJGJTI1MkZ3d3cuY2F0YXJzZS5tZSUyNTJGZjRiM2FkMGM4JTI2cmVsYXRpb24lM0RwYXJlbnQucGFyZW50JmNvbnRhaW5lcl93aWR0aD0wJmhyZWY9aHR0cHMlM0ElMkYlMkZ3d3cuY2F0YXJzZS5tZSUyRnB0JTJGJyArIGFyZ3MucHJvamVjdCgpLnBlcm1hbGluayArICclM0ZyZWYlM0RmYWNlYm9vayZsYXlvdXQ9YnV0dG9uX2NvdW50JmxvY2FsZT1wdF9CUiZzZGs9am9leVwiXScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctd2lkZ2V0Lnctd2lkZ2V0LXR3aXR0ZXIudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5zaGFyZS1ibG9jaycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaWZyYW1lW2FsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiXVt3aWR0aD1cIjEyMHB4XCJdW2hlaWdodD1cIjIycHhcIl1bZnJhbWVib3JkZXI9XCIwXCJdW3Njcm9sbGluZz1cIm5vXCJdW3NyYz1cIi8vcGxhdGZvcm0udHdpdHRlci5jb20vd2lkZ2V0cy90d2VldF9idXR0b24uOGQwMDdkZGZjMTg0ZTY3NzZiZTc2ZmU5ZTVlNTJkNjkuZW4uaHRtbCNfPTE0NDI0MjU5ODQ5MzYmY291bnQ9aG9yaXpvbnRhbCZkbnQ9ZmFsc2UmaWQ9dHdpdHRlci13aWRnZXQtMSZsYW5nPWVuJm9yaWdpbmFsX3JlZmVyZXI9aHR0cHMlM0ElMkYlMkZ3d3cuY2F0YXJzZS5tZSUyRnB0JTJGJyArIGFyZ3MucHJvamVjdCgpLnBlcm1hbGluayArICcmc2l6ZT1tJnRleHQ9Q29uZmlyYSUyMG8lMjBwcm9qZXRvJTIwJyArIGFyZ3MucHJvamVjdCgpLm5hbWUgKyAnJTIwbm8lMjAlNDBjYXRhcnNlJnR5cGU9c2hhcmUmdXJsPWh0dHBzJTNBJTJGJTJGd3d3LmNhdGFyc2UubWUlMkZwdCUyRicgKyBhcmdzLnByb2plY3QoKS5wZXJtYWxpbmsgKyAnJTNGcmVmJTNEdHdpdHRlciZ2aWE9Y2F0YXJzZVwiXScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnYS53LWhpZGRlbi1zbWFsbC53aWRnZXQtZW1iZWQudy1oaWRkZW4tdGlueS5mb250c2l6ZS1zbWFsbC5saW5rLWhpZGRlbi5mb250Y29sb3Itc2Vjb25kYXJ5W2hyZWY9XCJqczp2b2lkKDApO1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5kaXNwbGF5RW1iZWQudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgJzwgZW1iZWQgPicpLCAoY3RybC5kaXNwbGF5RW1iZWQoKSA/IG0oJy5lbWJlZC1leHBhbmRlZC51LW1hcmdpbnRvcC0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMjAnLCAnSW5zaXJhIHVtIHdpZGdldCBlbSBzZXUgc2l0ZScpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dFt0eXBlPVwidGV4dFwiXVt2YWx1ZT1cIjxpZnJhbWUgZnJhbWVib3JkZXI9XCIwXCIgaGVpZ2h0PVwiMzE0cHhcIiBzcmM9XCJodHRwczovL3d3dy5jYXRhcnNlLm1lL3B0L3Byb2plY3RzLycgKyBhcmdzLnByb2plY3QoKS5pZCArICcvZW1iZWRcIiB3aWR0aD1cIjMwMHB4XCIgc2Nyb2xsaW5nPVwibm9cIj48L2lmcmFtZT5cIl0nKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmNhcmQtZW1iZWQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpZnJhbWVbZnJhbWVib3JkZXI9XCIwXCJdW2hlaWdodD1cIjM1MHB4XCJdW3NyYz1cIi9wcm9qZWN0cy8nICsgYXJncy5wcm9qZWN0KCkuaWQgKyAnL2VtYmVkXCJdW3dpZHRoPVwiMzAwcHhcIl1bc2Nyb2xsaW5nPVwibm9cIl0nKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgIG0oJ2Eudy1oaWRkZW4tbWFpbi53LWhpZGRlbi1tZWRpdW0uYnRuLmJ0bi1tZWRpdW0uYnRuLWZiLnUtbWFyZ2luYm90dG9tLTIwW2hyZWY9XCJodHRwOi8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIvc2hhcmVyLnBocD91PWh0dHBzOi8vd3d3LmNhdGFyc2UubWUvJyArIGFyZ3MucHJvamVjdCgpLnBlcm1hbGluayArICc/cmVmPWZhY2Vib29rJnRpdGxlPScgKyBhcmdzLnByb2plY3QoKS5uYW1lICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtZmFjZWJvb2snKSwgJyBDb21wYXJ0aWxoZSdcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCdhLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLmJ0bi5idG4tbWVkaXVtLmJ0bi10d2VldC51LW1hcmdpbmJvdHRvbS0yMFtocmVmPVwiaHR0cDovL3R3aXR0ZXIuY29tLz9zdGF0dXM9QWNhYmVpIGRlIGFwb2lhciBvIHByb2pldG8gJyArIGFyZ3MucHJvamVjdCgpLm5hbWUgKyAnIGh0dHM6Ly93d3cuY2F0YXJzZS5tZS8nICsgYXJncy5wcm9qZWN0KCkucGVybWFsaW5rICsgJz9yZWY9dHdpdHRlcnJcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLXR3aXR0ZXInKSwgJyBUd2VldCdcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RTaWRlYmFyID0gKChtLCBoLCBjLCBfLCBJMThuKSA9PiB7XG4gICAgY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAncHJvamVjdHMucHJvamVjdF9zaWRlYmFyJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBhbmltYXRlUHJvZ3Jlc3MgPSAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYW5pbWF0aW9uLCBwcm9ncmVzcyA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxlZGdlZCA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0b3JzID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGVkZ2VkSW5jcmVtZW50ID0gcHJvamVjdCgpLnBsZWRnZWQgLyBwcm9qZWN0KCkucHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0b3JzSW5jcmVtZW50ID0gcHJvamVjdCgpLnRvdGFsX2NvbnRyaWJ1dG9ycyAvIHByb2plY3QoKS5wcm9ncmVzcztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3NCYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJvZ3Jlc3NCYXInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGVkZ2VkRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGxlZGdlZCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dG9yc0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRyaWJ1dG9ycycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbiA9IHNldEludGVydmFsKGluY3JlbWVudFByb2dyZXNzLCAyOCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmNyZW1lbnRQcm9ncmVzcyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2dyZXNzIDw9IHBhcnNlSW50KHByb2plY3QoKS5wcm9ncmVzcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gYCR7cHJvZ3Jlc3N9JWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGVkZ2VkRWwuaW5uZXJUZXh0ID0gYFIkICR7aC5mb3JtYXROdW1iZXIocGxlZGdlZCl9YDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dG9yc0VsLmlubmVyVGV4dCA9IGAke3BhcnNlSW50KGNvbnRyaWJ1dG9ycyl9IHBlc3NvYXNgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwuaW5uZXJUZXh0ID0gYCR7cHJvZ3Jlc3N9JWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGVkZ2VkID0gcGxlZGdlZCArIHBsZWRnZWRJbmNyZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRvcnMgPSBjb250cmlidXRvcnMgKyBjb250cmlidXRvcnNJbmNyZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzcyA9IHByb2dyZXNzICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoYW5pbWF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDE4MDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBhbmltYXRlUHJvZ3Jlc3M6IGFuaW1hdGVQcm9ncmVzc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBlbGFwc2VkID0gcHJvamVjdCgpLmVsYXBzZWRfdGltZSxcbiAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBwcm9qZWN0KCkucmVtYWluaW5nX3RpbWUsXG4gICAgICAgICAgICAgICAgZGlzcGxheUNhcmRDbGFzcyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdGVzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3dhaXRpbmdfZnVuZHMnOiAnY2FyZC13YWl0aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdWNjZXNzZnVsJzogJ2NhcmQtc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZmFpbGVkJzogJ2NhcmQtZXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RyYWZ0JzogJ2NhcmQtZGFyaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaW5fYW5hbHlzaXMnOiAnY2FyZC1kYXJrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdhcHByb3ZlZCc6ICdjYXJkLWRhcmsnXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChzdGF0ZXNbcHJvamVjdCgpLnN0YXRlXSA/ICdjYXJkIHUtcmFkaXVzIHppbmRleC0xMCAnICsgc3RhdGVzW3Byb2plY3QoKS5zdGF0ZV0gOiAnJyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkaXNwbGF5U3RhdHVzVGV4dCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdGVzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2FwcHJvdmVkJzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5hcHByb3ZlZCcsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdvbmxpbmUnOiBoLmV4aXN0eShwcm9qZWN0KCkuem9uZV9leHBpcmVzX2F0KSA/IEkxOG4udCgnZGlzcGxheV9zdGF0dXMub25saW5lJywgSTE4blNjb3BlKHtkYXRlOiBoLm1vbWVudGlmeShwcm9qZWN0KCkuem9uZV9leHBpcmVzX2F0KX0pKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2ZhaWxlZCc6IEkxOG4udCgnZGlzcGxheV9zdGF0dXMuZmFpbGVkJywgSTE4blNjb3BlKHtkYXRlOiBoLm1vbWVudGlmeShwcm9qZWN0KCkuem9uZV9leHBpcmVzX2F0KSwgZ29hbDogcHJvamVjdCgpLmdvYWx9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAncmVqZWN0ZWQnOiBJMThuLnQoJ2Rpc3BsYXlfc3RhdHVzLnJlamVjdGVkJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2luX2FuYWx5c2lzJzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5pbl9hbmFseXNpcycsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdWNjZXNzZnVsJzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5zdWNjZXNzZnVsJywgSTE4blNjb3BlKHtkYXRlOiBoLm1vbWVudGlmeShwcm9qZWN0KCkuem9uZV9leHBpcmVzX2F0KX0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd3YWl0aW5nX2Z1bmRzJzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy53YWl0aW5nX2Z1bmRzJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RyYWZ0JzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5kcmFmdCcsIEkxOG5TY29wZSgpKVxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZXNbcHJvamVjdCgpLnN0YXRlXTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3Qtc2lkZWJhci5hc2lkZScsIFtcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1zdGF0cycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnByb2plY3Qtc3RhdHMtaW5uZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1zdGF0cy1pbmZvJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI3BsZWRnZWQuZm9udHNpemUtbGFyZ2VzdC5mb250d2VpZ2h0LXNlbWlib2xkLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsIGBSJCAke3Byb2plY3QoKS5wbGVkZ2VkID8gaC5mb3JtYXROdW1iZXIocHJvamVjdCgpLnBsZWRnZWQpIDogJzAnfWApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSTE4bi50KCdjb250cmlidXRvcnNfY2FsbCcsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4jY29udHJpYnV0b3JzLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBJMThuLnQoJ2NvbnRyaWJ1dG9yc19jb3VudCcsIEkxOG5TY29wZSh7Y291bnQ6IHByb2plY3QoKS50b3RhbF9jb250cmlidXRvcnN9KSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFwcm9qZWN0KCkuZXhwaXJlc19hdCAmJiBlbGFwc2VkKSA/ICcgZW0gJyArIEkxOG4udCgnZGF0ZXRpbWUuZGlzdGFuY2VfaW5fd29yZHMueF8nICsgZWxhcHNlZC51bml0LCB7Y291bnQ6IGVsYXBzZWQudG90YWx9LCBJMThuU2NvcGUoKSkgOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5tZXRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI3Byb2dyZXNzQmFyLm1ldGVyLWZpbGwnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBgJHtwcm9qZWN0KCkucHJvZ3Jlc3N9JWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW50b3AtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQubGluZWhlaWdodC10aWdodGVyJywgYCR7cHJvamVjdCgpLnByb2dyZXNzID8gcGFyc2VJbnQocHJvamVjdCgpLnByb2dyZXNzKSA6ICcwJ30lYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC03LnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02LnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS1yaWdodC5mb250c2l6ZS1zbWFsbC5saW5laGVpZ2h0LXRpZ2h0ZXInLCByZW1haW5pbmcgJiYgcmVtYWluaW5nLnRvdGFsID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlbWFpbmluZy50b3RhbCksIEkxOG4udCgncmVtYWluaW5nX3RpbWUuJyArIHJlbWFpbmluZy51bml0LCBJMThuU2NvcGUoe2NvdW50OiByZW1haW5pbmcudG90YWx9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0TW9kZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICwgKHByb2plY3QoKS5vcGVuX2Zvcl9jb250cmlidXRpb25zID8gbSgnYSNjb250cmlidXRlX3Byb2plY3RfZm9ybS5idG4uYnRuLWxhcmdlLnUtbWFyZ2luYm90dG9tLTIwW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QoKS5pZCArICcvY29udHJpYnV0aW9ucy9uZXdcIl0nLCBJMThuLnQoJ3N1Ym1pdCcsIEkxOG5TY29wZSgpKSkgOiAnJyksICgocHJvamVjdCgpLm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMpID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0UmVtaW5kZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbGluaydcbiAgICAgICAgICAgICAgICAgICAgfSkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdltjbGFzcz1cImZvbnRzaXplLXNtYWxsZXIgdS1tYXJnaW5ib3R0b20tMzAgJyArIGRpc3BsYXlDYXJkQ2xhc3MoKSArICdcIl0nLCBkaXNwbGF5U3RhdHVzVGV4dCgpKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy51c2VyLWMnLCBtLmNvbXBvbmVudChjLlByb2plY3RVc2VyQ2FyZCwge1xuICAgICAgICAgICAgICAgICAgICB1c2VyRGV0YWlsczogYXJncy51c2VyRGV0YWlsc1xuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMsIHdpbmRvdy5fLCB3aW5kb3cuSTE4bikpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucyBjb21wb25lbnRcbiAqIEEgUHJvamVjdC1zaG93IHBhZ2UgaGVscGVyIHRvIHNob3cgc3VnZ2VzdGVkIGFtb3VudHMgb2YgY29udHJpYnV0aW9uc1xuICpcbiAqIEV4YW1wbGUgb2YgdXNlOlxuICogdmlldzogKCkgPT4ge1xuICogICAuLi5cbiAqICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucywge3Byb2plY3Q6IHByb2plY3R9KVxuICogICAuLi5cbiAqIH1cbiAqL1xuXG53aW5kb3cuYy5Qcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucyA9IChmdW5jdGlvbihtLCBjLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICAgICAgICBsZXQgc3VnZ2VzdGlvblVybCA9IChhbW91bnQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYC9wcm9qZWN0cy8ke3Byb2plY3QucHJvamVjdF9pZH0vY29udHJpYnV0aW9ucy9uZXc/YW1vdW50PSR7YW1vdW50fWA7XG4gICAgICAgICAgICB9LCBzdWdnZXN0ZWRWYWx1ZXMgPSBbMTAsIDI1LCA1MCwgMTAwXTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNzdWdnZXN0aW9ucycsIF8ubWFwKHN1Z2dlc3RlZFZhbHVlcywgKGFtb3VudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKGBhW2hyZWY9XCIke3N1Z2dlc3Rpb25VcmwoYW1vdW50KX1cIl0uY2FyZC1yZXdhcmQuY2FyZC1iaWcuY2FyZC1zZWNvbmRhcnkudS1tYXJnaW5ib3R0b20tMjBgLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXInLCBgUiTCoCR7YW1vdW50fWApXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0VGFicyA9ICgobSwgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgaXNGaXhlZCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbiA9IG0ucHJvcCgtMSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGZpeE9uU2Nyb2xsID0gKGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZpZXdwb3J0T2Zmc2V0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5zY3JvbGxZIDw9IG9yaWdpbmFsUG9zaXRpb24oKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbigtMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc0ZpeGVkKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAodmlld3BvcnRPZmZzZXQudG9wIDwgMCB8fCAod2luZG93LnNjcm9sbFkgPiBvcmlnaW5hbFBvc2l0aW9uKCkgJiYgb3JpZ2luYWxQb3NpdGlvbigpID4gMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNGaXhlZCgpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFBvc2l0aW9uKHdpbmRvdy5zY3JvbGxZKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0ZpeGVkKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgbmF2RGlzcGxheSA9IChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaXhOYXZCYXIgPSBmaXhPblNjcm9sbChlbCk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBmaXhOYXZCYXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbmF2RGlzcGxheTogbmF2RGlzcGxheSxcbiAgICAgICAgICAgICAgICBpc0ZpeGVkOiBpc0ZpeGVkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICByZXdhcmRzID0gYXJncy5yZXdhcmREZXRhaWxzO1xuXG4gICAgICAgICAgICBsZXQgbWFpbkNsYXNzID0gKCFjdHJsLmlzRml4ZWQoKSB8fCBwcm9qZWN0KCkuaXNfb3duZXJfb3JfYWRtaW4pID8gJy53LXNlY3Rpb24ucHJvamVjdC1uYXYnIDogJy53LXNlY3Rpb24ucHJvamVjdC1uYXYucHJvamVjdC1uYXYtZml4ZWQnO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnbmF2LXdyYXBwZXInLCBwcm9qZWN0KCkgPyBbXG4gICAgICAgICAgICAgICAgbShtYWluQ2xhc3MsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLm5hdkRpc3BsYXlcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFshXy5pc0VtcHR5KHJld2FyZHMoKSkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwicmV3YXJkcy1saW5rXCJdW2NsYXNzPVwidy1oaWRkZW4tbWFpbiB3LWhpZGRlbi1tZWRpdW0gZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNyZXdhcmRzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI3Jld2FyZHNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ1JlY29tcGVuc2FzJykgOiBtKCdhW2lkPVwicmV3YXJkcy1saW5rXCJdW2NsYXNzPVwidy1oaWRkZW4tbWFpbiB3LWhpZGRlbi1tZWRpdW0gZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNjb250cmlidXRpb25fc3VnZ2VzdGlvbnMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjY29udHJpYnV0aW9uX3N1Z2dlc3Rpb25zXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdWYWxvcmVzIFN1Z2VyaWRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwiYWJvdXQtbGlua1wiXVtjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjYWJvdXQnKSB8fCBoLmhhc2hNYXRjaCgnJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJyBcIl1baHJlZj1cIiNhYm91dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnZmxvYXQ6IGxlZnQ7J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnU29icmUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtpZD1cInBvc3RzLWxpbmtcIl1bY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI3Bvc3RzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI3Bvc3RzXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdOb3ZpZGFkZXMgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2UnLCBwcm9qZWN0KCkgPyBwcm9qZWN0KCkucG9zdHNfY291bnQgOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaWQ9XCJjb250cmlidXRpb25zLWxpbmtcIl1bY2xhc3M9XCJ3LWhpZGRlbi1zbWFsbCB3LWhpZGRlbi10aW55IGRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjY29udHJpYnV0aW9ucycpID8gJ3NlbGVjdGVkJyA6ICcnKSArICdcIl1baHJlZj1cIiNjb250cmlidXRpb25zXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdBcG9pb3MgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2Uudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsIHByb2plY3QoKSA/IHByb2plY3QoKS50b3RhbF9jb250cmlidXRpb25zIDogJy0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtpZD1cImNvbW1lbnRzLWxpbmtcIl1bY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI2NvbW1lbnRzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI2NvbW1lbnRzXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdDb21lbnTDoXJpb3MgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QoKSA/IG0oJ2ZiOmNvbW1lbnRzLWNvdW50W2hyZWY9XCJodHRwOi8vd3d3LmNhdGFyc2UubWUvJyArIHByb2plY3QoKS5wZXJtYWxpbmsgKyAnXCJdW2NsYXNzPVwiYmFkZ2UgcHJvamVjdC1mYi1jb21tZW50IHctaGlkZGVuLXNtYWxsIHctaGlkZGVuLXRpbnlcIl1bc3R5bGU9XCJkaXNwbGF5OiBpbmxpbmVcIl0nLCBtLnRydXN0KCcmbmJzcDsnKSkgOiAnLSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdCgpID8gbSgnLnctY29sLnctY29sLTQudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsIHByb2plY3QoKS5vcGVuX2Zvcl9jb250cmlidXRpb25zID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cucHJvamVjdC1uYXYtYmFjay1idXR0b24nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNi53LWNvbC1tZWRpdW0tOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLnctYnV0dG9uLmJ0bltocmVmPVwiL3Byb2plY3RzLycgKyBwcm9qZWN0KCkuaWQgKyAnL2NvbnRyaWJ1dGlvbnMvbmV3XCJdJywgJ0Fwb2lhcsKg4oCNZXN0ZcKgcHJvamV0bycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02LnctY29sLW1lZGl1bS00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFJlbWluZGVyLCB7cHJvamVjdDogcHJvamVjdCwgdHlwZTogJ2J1dHRvbicsIGhpZGVUZXh0T25Nb2JpbGU6IHRydWV9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpIDogJydcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgKGN0cmwuaXNGaXhlZCgpICYmICFwcm9qZWN0KCkuaXNfb3duZXJfb3JfYWRtaW4pID8gbSgnLnctc2VjdGlvbi5wcm9qZWN0LW5hdicpIDogJydcbiAgICAgICAgICAgIF0gOiAnJyk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdFVzZXJDYXJkID0gKChtLCBfLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjdXNlci1jYXJkJywgXy5tYXAoYXJncy51c2VyRGV0YWlscygpLCAodXNlckRldGFpbCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcudS1tYXJnaW5ib3R0b20tMzAudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIudS1tYXJnaW5ib3R0b20tMzAudS1yb3VuZFt3aWR0aD1cIjEwMFwiXVtpdGVtcHJvcD1cImltYWdlXCJdW3NyYz1cIicgKyB1c2VyRGV0YWlsLnByb2ZpbGVfaW1nX3RodW1ibmFpbCArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwubGluay1oaWRkZW4uZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5saW5laGVpZ2h0LXRpZ2h0W2l0ZW1wcm9wPVwibmFtZVwiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiL3VzZXJzLycgKyB1c2VyRGV0YWlsLmlkICsgJ1wiXScsIHVzZXJEZXRhaWwubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgucGx1cmFsaXplKHVzZXJEZXRhaWwudG90YWxfcHVibGlzaGVkX3Byb2plY3RzLCAnIGNyaWFkbycsICcgY3JpYWRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCcmbmJzcDsmbmJzcDt8Jm5ic3A7Jm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgucGx1cmFsaXplKHVzZXJEZXRhaWwudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMsICcgYXBvaWFkbycsICcgYXBvaWFkb3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3VsLnctaGlkZGVuLXRpbnkudy1oaWRkZW4tc21hbGwudy1saXN0LXVuc3R5bGVkLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC5mYWNlYm9va19saW5rKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiJyArIHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBGYWNlYm9vaycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLCAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLnR3aXR0ZXJfdXNlcm5hbWUpID8gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCJodHRwczovL3R3aXR0ZXIuY29tLycgKyB1c2VyRGV0YWlsLnR3aXR0ZXJfdXNlcm5hbWUgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdQZXJmaWwgbm8gVHdpdHRlcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcCh1c2VyRGV0YWlsLmxpbmtzLCAobGluaykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnNlZExpbmsgPSBoLnBhcnNlVXJsKGxpbmspO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCFfLmlzRW1wdHkocGFyc2VkTGluay5ob3N0bmFtZSkgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCInICsgbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgcGFyc2VkTGluay5ob3N0bmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLmVtYWlsKSA/IG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRzaXplLXNtYWxsZXN0LmFsdC1saW5rLmZvbnR3ZWlnaHQtc2VtaWJvbGRbaXRlbXByb3A9XCJlbWFpbFwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCB1c2VyRGV0YWlsLmVtYWlsKSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlNlYXJjaCBjb21wb25lbnRcbiAqIFJldHVybnMgYSBzZWFyY2ggaW5wdXRcbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5TZWFyY2gsIHthY3Rpb246ICcvc2VhcmNoJywgbWV0aG9kOiAnR0VUJ30pXG4gKi9cblxud2luZG93LmMuU2VhcmNoID0gKChtKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MgPSB7fSkgPT4ge1xuICAgICAgICAgICAgbGV0IGFjdGlvbiA9IGFyZ3MuYWN0aW9uIHx8ICcvcHQvZXhwbG9yZScsXG4gICAgICAgICAgICBtZXRob2QgPSBhcmdzLm1ldGhvZCB8fCAnR0VUJztcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNzZWFyY2gudy1jb250YWluZXIudy1oaWRkZW4tbWFpbi53LWhpZGRlbi1tZWRpdW0nLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm0jZW1haWwtZm9ybScsIHthY3Rpb246IGFjdGlvbiwgbWV0aG9kOiBtZXRob2R9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMC53LWNvbC1zbWFsbC0xMC53LWNvbC10aW55LTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0W3R5cGU9XCJ0ZXh0XCJdW25hbWU9XCJwZ19zZWFyY2hcIl1bcGxhY2Vob2xkZXI9XCJCdXNxdWUgcHJvamV0b3NcIl0jcGdfc2VhcmNoX2luc2lkZS53LWlucHV0LnRleHQtZmllbGQubmVnYXRpdmUucHJlZml4JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uLnctaW5saW5lLWJsb2NrLmJ0bi5idG4tZGFyay5idG4tYXR0YWNoZWQucG9zdGZpeCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLmhlYWRlci1sdXBhW3NyYz1cImh0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTRlNDQxNzhiMjEzNWZjZTJiNmNkMjM1X2x1cGEucG5nXCJdJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5TbGlkZXIgY29tcG9uZW50XG4gKiBCdWlsZCBhIHNsaWRlciBmcm9tIGFueSBhcnJheSBvZiBtaXRocmlsIGVsZW1lbnRzXG4gKlxuICogRXhhbXBsZSBvZiB1c2U6XG4gKiB2aWV3OiAoKSA9PiB7XG4gKiAgICAgLi4uXG4gKiAgICAgbS5jb21wb25lbnQoYy5TbGlkZXIsIHtcbiAqICAgICAgICAgc2xpZGVzOiBbbSgnc2xpZGUxJyksIG0oJ3NsaWRlMicpLCBtKCdzbGlkZTMnKV0sXG4gKiAgICAgICAgIHRpdGxlOiAnTyBxdWUgZXN0w6NvIGRpemVuZG8gcG9yIGHDrS4uLidcbiAqICAgICB9KVxuICogICAgIC4uLlxuICogfVxuICovXG53aW5kb3cuYy5TbGlkZXIgPSAoKG0sIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IGludGVydmFsO1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRTbGlkZUlkeCA9IG0ucHJvcCgwKSxcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblNpemUgPSBtLnByb3AoMTYwMCksXG4gICAgICAgICAgICAgICAgc2xpZGVyVGltZSA9IGFyZ3Muc2xpZGVyVGltZSB8fCA2NTAwLFxuICAgICAgICAgICAgICAgIGRlY3JlbWVudFNsaWRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRTbGlkZUlkeCgpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRTbGlkZUlkeChzZWxlY3RlZFNsaWRlSWR4KCkgLSAxKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkU2xpZGVJZHgoYXJncy5zbGlkZXMubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGluY3JlbWVudFNsaWRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRTbGlkZUlkeCgpIDwgKGFyZ3Muc2xpZGVzLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFNsaWRlSWR4KHNlbGVjdGVkU2xpZGVJZHgoKSArIDEpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRTbGlkZUlkeCgwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3RhcnRTbGlkZXJUaW1lciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmNyZW1lbnRTbGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgc2xpZGVyVGltZSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZXNldFNsaWRlclRpbWVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRTbGlkZXJUaW1lcigpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29uZmlnID0gKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblNpemUoTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLCB3aW5kb3cuaW5uZXJXaWR0aCB8fCAwKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQub251bmxvYWQgPSAoKSA9PiBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzdGFydFNsaWRlclRpbWVyKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRTbGlkZUlkeDogc2VsZWN0ZWRTbGlkZUlkeCxcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblNpemU6IHRyYW5zbGF0aW9uU2l6ZSxcbiAgICAgICAgICAgICAgICBkZWNyZW1lbnRTbGlkZTogZGVjcmVtZW50U2xpZGUsXG4gICAgICAgICAgICAgICAgaW5jcmVtZW50U2xpZGU6IGluY3JlbWVudFNsaWRlLFxuICAgICAgICAgICAgICAgIHJlc2V0U2xpZGVyVGltZXI6IHJlc2V0U2xpZGVyVGltZXJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzbGlkZUNsYXNzID0gYXJncy5zbGlkZUNsYXNzIHx8ICcnLFxuICAgICAgICAgICAgICAgIHdyYXBwZXJDbGFzcyA9IGFyZ3Mud3JhcHBlckNsYXNzIHx8ICcnLFxuICAgICAgICAgICAgICAgIGVmZmVjdCA9IGFyZ3MuZWZmZWN0IHx8ICdzbGlkZScsXG4gICAgICAgICAgICAgICAgc2xpZGVyQ2xpY2sgPSAoZm4sIHBhcmFtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZuKHBhcmFtKTtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5yZXNldFNsaWRlclRpbWVyKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlZmZlY3RTdHlsZSA9IChpZHgsIHRyYW5zbGF0ZVN0cikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzbGlkZUZ4ID0gYHRyYW5zZm9ybTogJHt0cmFuc2xhdGVTdHJ9OyAtd2Via2l0LXRyYW5zZm9ybTogJHt0cmFuc2xhdGVTdHJ9OyAtbXMtdHJhbnNmb3JtOiR7dHJhbnNsYXRlU3RyfWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBmYWRlRnggPSBpZHggPT09IGN0cmwuc2VsZWN0ZWRTbGlkZUlkeCgpID8gJ29wYWNpdHk6IDE7IHZpc2liaWxpdHk6IHZpc2libGU7JyA6ICdvcGFjaXR5OiAwOyB2aXNpYmlsaXR5OiBoaWRkZW47JztcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWZmZWN0ID09PSAnZmFkZScgPyBmYWRlRnggOiBzbGlkZUZ4O1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBtKGAudy1zbGlkZXIuJHt3cmFwcGVyQ2xhc3N9YCwge1xuICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC5jb25maWdcbiAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyJywgYXJncy50aXRsZSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2xpZGVyLW1hc2snLCBbXG4gICAgICAgICAgICAgICAgICAgIF8ubWFwKGFyZ3Muc2xpZGVzLCAoc2xpZGUsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRyYW5zbGF0ZVZhbHVlID0gKGlkeCAtIGN0cmwuc2VsZWN0ZWRTbGlkZUlkeCgpKSAqIGN0cmwudHJhbnNsYXRpb25TaXplKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlU3RyID0gYHRyYW5zbGF0ZTNkKCR7dHJhbnNsYXRlVmFsdWV9cHgsIDAsIDApYDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oYC5zbGlkZS53LXNsaWRlLiR7c2xpZGVDbGFzc31gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IGAke2VmZmVjdFN0eWxlKGlkeCwgdHJhbnNsYXRlU3RyKX0gJHtzbGlkZS5jdXN0b21TdHlsZX1gXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC53LWNvbC1wdXNoLTInLCBzbGlkZS5jb250ZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0oJyNzbGlkZS1wcmV2Lnctc2xpZGVyLWFycm93LWxlZnQudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6ICgpID0+IHNsaWRlckNsaWNrKGN0cmwuZGVjcmVtZW50U2xpZGUpXG4gICAgICAgICAgICAgICAgICAgIH0sW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaWNvbi1zbGlkZXItbGVmdC5mYS5mYS1sZy5mYS1hbmdsZS1sZWZ0LmZvbnRjb2xvci10ZXJjaWFyeScpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcjc2xpZGUtbmV4dC53LXNsaWRlci1hcnJvdy1yaWdodC53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogKCkgPT4gc2xpZGVyQ2xpY2soY3RybC5pbmNyZW1lbnRTbGlkZSlcbiAgICAgICAgICAgICAgICAgICAgfSxbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1pY29uLXNsaWRlci1yaWdodC5mYS5mYS1sZy5mYS1hbmdsZS1yaWdodC5mb250Y29sb3ItdGVyY2lhcnknKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctc2xpZGVyLW5hdi53LXNsaWRlci1uYXYtaW52ZXJ0Lnctcm91bmQuc2xpZGUtbmF2JywgXyhhcmdzLnNsaWRlcy5sZW5ndGgpLnRpbWVzKChpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKGAuc2xpZGUtYnVsbGV0Lnctc2xpZGVyLWRvdCR7Y3RybC5zZWxlY3RlZFNsaWRlSWR4KCkgPT09IGlkeCA/ICcudy1hY3RpdmUnIDogJyd9YCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6ICgpID0+IHNsaWRlckNsaWNrKGN0cmwuc2VsZWN0ZWRTbGlkZUlkeCwgaWR4KVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuVGVhbU1lbWJlcnMgPSAoZnVuY3Rpb24oXywgbSwgbW9kZWxzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdm0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IG0ucHJvcChbXSlcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgZ3JvdXBDb2xsZWN0aW9uID0gZnVuY3Rpb24oY29sbGVjdGlvbiwgZ3JvdXBUb3RhbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXy5tYXAoXy5yYW5nZShNYXRoLmNlaWwoY29sbGVjdGlvbi5sZW5ndGggLyBncm91cFRvdGFsKSksIGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uLnNsaWNlKGkgKiBncm91cFRvdGFsLCAoaSArIDEpICogZ3JvdXBUb3RhbCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIG1vZGVscy50ZWFtTWVtYmVyLmdldFBhZ2UoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB2bS5jb2xsZWN0aW9uKGdyb3VwQ29sbGVjdGlvbihkYXRhLCA0KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB2bTogdm1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgcmV0dXJuIG0oJyN0ZWFtLW1lbWJlcnMtc3RhdGljLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgXy5tYXAoY3RybC52bS5jb2xsZWN0aW9uKCksIGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAoZ3JvdXAsIGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnRlYW0tbWVtYmVyLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIvdXNlcnMvJyArIG1lbWJlci5pZCArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLmJpZy51LXJvdW5kLnUtbWFyZ2luYm90dG9tLTEwW3NyYz1cIicgKyBtZW1iZXIuaW1nICsgJ1wiXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWJhc2UnLCBtZW1iZXIubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnQXBvaW91ICcgKyBtZW1iZXIudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5fLCB3aW5kb3cubSwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5UZWFtVG90YWwgPSAoZnVuY3Rpb24obSwgaCwgbW9kZWxzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdm0gPSB7XG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbjogbS5wcm9wKFtdKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbW9kZWxzLnRlYW1Ub3RhbC5nZXRSb3coKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB2bS5jb2xsZWN0aW9uKGRhdGEpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdm06IHZtXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjdGVhbS10b3RhbC1zdGF0aWMudy1zZWN0aW9uLnNlY3Rpb24tb25lLWNvbHVtbi5zZWN0aW9uLnUtbWFyZ2ludG9wLTQwLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgY3RybC52bS5jb2xsZWN0aW9uKCkubWFwKGZ1bmN0aW9uKHRlYW1Ub3RhbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTMwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdIb2plIHNvbW9zICcgKyB0ZWFtVG90YWwubWVtYmVyX2NvdW50ICsgJyBwZXNzb2FzIGVzcGFsaGFkYXMgcG9yICcgKyB0ZWFtVG90YWwudG90YWxfY2l0aWVzICsgJyBjaWRhZGVzIGVtICcgKyB0ZWFtVG90YWwuY291bnRyaWVzLmxlbmd0aCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIHBhw61zZXMgKCcgKyB0ZWFtVG90YWwuY291bnRyaWVzLnRvU3RyaW5nKCkgKyAnKSEgTyBDYXRhcnNlIMOpIGluZGVwZW5kZW50ZSwgc2VtIGludmVzdGlkb3JlcywgZGUgY8OzZGlnbyBhYmVydG8gZSBjb25zdHJ1w61kbyBjb20gYW1vci4gTm9zc2EgcGFpeMOjbyDDqSBjb25zdHJ1aXIgdW0gYW1iaWVudGUgb25kZSBjYWRhIHZleiBtYWlzIHByb2pldG9zIHBvc3NhbSBnYW5oYXIgdmlkYS4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci5saW5laGVpZ2h0LXRpZ2h0LnRleHQtc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnTm9zc2EgZXF1aXBlLCBqdW50YSwgasOhIGFwb2lvdSBSJCcgKyBoLmZvcm1hdE51bWJlcih0ZWFtVG90YWwudG90YWxfYW1vdW50KSArICcgcGFyYSAnICsgdGVhbVRvdGFsLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcyEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIi8qKlxuICogd2luZG93LmMuVG9vbHRpcCBjb21wb25lbnRcbiAqIEEgY29tcG9uZW50IHRoYXQgYWxsb3dzIHlvdSB0byBzaG93IGEgdG9vbHRpcCBvblxuICogYSBzcGVjaWZpZWQgZWxlbWVudCBob3Zlci4gSXQgcmVjZWl2ZXMgdGhlIGVsZW1lbnQgeW91IHdhbnRcbiAqIHRvIHRyaWdnZXIgdGhlIHRvb2x0aXAgYW5kIGFsc28gdGhlIHRleHQgdG8gZGlzcGxheSBhcyB0b29sdGlwLlxuICpcbiAqIEV4YW1wbGUgb2YgdXNlOlxuICogdmlldzogKCkgPT4ge1xuICogICAgIGxldCB0b29sdGlwID0gKGVsKSA9PiB7XG4gKiAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Ub29sdGlwLCB7XG4gKiAgICAgICAgICAgICAgZWw6IGVsLFxuICogICAgICAgICAgICAgIHRleHQ6ICd0ZXh0IHRvIHRvb2x0aXAnLFxuICogICAgICAgICAgICAgIHdpZHRoOiAzMDBcbiAqICAgICAgICAgIH0pXG4gKiAgICAgfVxuICpcbiAqICAgICByZXR1cm4gdG9vbHRpcCgnYSNsaW5rLXd0aC10b29sdGlwW2hyZWY9XCIjXCJdJyk7XG4gKlxuICogfVxuICovXG53aW5kb3cuYy5Ub29sdGlwID0gKChtLCBjLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBwYXJlbnRIZWlnaHQgPSBtLnByb3AoMCksXG4gICAgICAgICAgICAgICAgd2lkdGggPSBtLnByb3AoYXJncy53aWR0aCB8fCAyODApLFxuICAgICAgICAgICAgICAgIHRvcCA9IG0ucHJvcCgwKSxcbiAgICAgICAgICAgICAgICBsZWZ0ID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgICAgIG9wYWNpdHkgPSBtLnByb3AoMCksXG4gICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0ID0gbS5wcm9wKHt0b3A6IDAsIGxlZnQ6IDB9KSxcbiAgICAgICAgICAgICAgICB0b29sdGlwID0gaC50b2dnbGVQcm9wKDAsIDEpLFxuICAgICAgICAgICAgICAgIHRvZ2dsZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcC50b2dnbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBzZXRQYXJlbnRQb3NpdGlvbiA9IChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldChoLmN1bXVsYXRpdmVPZmZzZXQoZWwpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldFBvc2l0aW9uID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZWxUb3AgPSBlbC5vZmZzZXRIZWlnaHQgKyBlbC5vZmZzZXRQYXJlbnQub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCAoZWwub2Zmc2V0V2lkdGggKyAyICogcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nTGVmdCkgKyAzMCkpeyAvLzMwIGhlcmUgaXMgYSBzYWZlIG1hcmdpblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsLnN0eWxlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggLSAzMDsgLy9BZGRpbmcgdGhlIHNhZmUgbWFyZ2luXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCgtcGFyZW50T2Zmc2V0KCkubGVmdCArIDE1KTsgLy9wb3NpdGlvbmluZyBjZW50ZXIgb2Ygd2luZG93LCBjb25zaWRlcmluZyBtYXJnaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoKHBhcmVudE9mZnNldCgpLmxlZnQgKyAoZWwub2Zmc2V0V2lkdGggLyAyKSkgPD0gd2luZG93LmlubmVyV2lkdGggJiYgKHBhcmVudE9mZnNldCgpLmxlZnQgLSAoZWwub2Zmc2V0V2lkdGggLyAyKSkgPj0gMCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCgtZWwub2Zmc2V0V2lkdGggLyAyKTsgLy9Qb3NpdGlvbmluZyB0byB0aGUgY2VudGVyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKChwYXJlbnRPZmZzZXQoKS5sZWZ0ICsgKGVsLm9mZnNldFdpZHRoIC8gMikpID4gd2luZG93LmlubmVyV2lkdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0KC1lbC5vZmZzZXRXaWR0aCArIGVsLm9mZnNldFBhcmVudC5vZmZzZXRXaWR0aCk7IC8vUG9zaXRpb25pbmcgdG8gdGhlIGxlZnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoKHBhcmVudE9mZnNldCgpLmxlZnQgLSAoZWwub2Zmc2V0V2lkdGggLyAyKSkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCgtZWwub2Zmc2V0UGFyZW50Lm9mZnNldFdpZHRoKTsgLy9Qb3NpdGlvbmluZyB0byB0aGUgcmlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcCgtZWxUb3ApOyAvL1NldHRpbmcgdG9wIHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IG9wYWNpdHksXG4gICAgICAgICAgICAgICAgdG9vbHRpcDogdG9vbHRpcCxcbiAgICAgICAgICAgICAgICB0b2dnbGU6IHRvZ2dsZSxcbiAgICAgICAgICAgICAgICBzZXRQb3NpdGlvbjogc2V0UG9zaXRpb24sXG4gICAgICAgICAgICAgICAgc2V0UGFyZW50UG9zaXRpb246IHNldFBhcmVudFBvc2l0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHdpZHRoID0gY3RybC53aWR0aCgpO1xuICAgICAgICAgICAgcmV0dXJuIG0oYXJncy5lbCwge1xuICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlLFxuICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC5zZXRQYXJlbnRQb3NpdGlvbixcbiAgICAgICAgICAgICAgICBzdHlsZToge2N1cnNvcjogJ3BvaW50ZXInfVxuICAgICAgICAgICAgfSwgY3RybC50b29sdGlwKCkgPyBbXG4gICAgICAgICAgICAgICAgbShgLnRvb2x0aXAuZGFya1tzdHlsZT1cIndpZHRoOiAke3dpZHRofXB4OyB0b3A6ICR7Y3RybC50b3AoKX1weDsgbGVmdDogJHtjdHJsLmxlZnQoKX1weDtcIl1gLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC5zZXRQb3NpdGlvblxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgYXJncy50ZXh0KVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdIDogJycpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlVzZXJCYWxhbmNlUmVxdWVzdE1vZGFsQ29udGVudCBjb21wb25lbnRcbiAqIFJlbmRlciB0aGUgY3VycmVudCB1c2VyIGJhbmsgYWNjb3VudCB0byBjb25maXJtIGZ1bmQgcmVxdWVzdFxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLlVzZXJCYWxhbmNlUmVxdWVzdE1vZGVsQ29udGVudCwge1xuICogICAgIGJhbGFuY2U6IHt1c2VyX2lkOiAxMjMsIGFtb3VudDogMTIzfSAvLyB1c2VyQmFsYW5jZSBzdHJ1Y3RcbiAqIH0pXG4gKi9cbndpbmRvdy5jLlVzZXJCYWxhbmNlUmVxdWVzdE1vZGFsQ29udGVudCA9ICgobSwgaCwgXywgbW9kZWxzLCBJMThuKSA9PiB7XG4gICAgY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAndXNlcnMuYmFsYW5jZScpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHt1c2VyX2lkOiAnZXEnfSksXG4gICAgICAgICAgICAgICAgICBiYWxhbmNlID0gYXJncy5iYWxhbmNlLFxuICAgICAgICAgICAgICAgICAgbG9hZGVyT3B0cyA9IG1vZGVscy5iYWxhbmNlVHJhbnNmZXIucG9zdE9wdGlvbnMoe1xuICAgICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6IGJhbGFuY2UudXNlcl9pZH0pLFxuICAgICAgICAgICAgICAgICAgcmVxdWVzdExvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihsb2FkZXJPcHRzKSxcbiAgICAgICAgICAgICAgICAgIGRpc3BsYXlEb25lID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKSxcbiAgICAgICAgICAgICAgICAgIHJlcXVlc3RGdW5kID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RMb2FkZXIubG9hZCgpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXJncy5iYWxhbmNlTWFuYWdlci5sb2FkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MuYmFsYW5jZVRyYW5zYWN0aW9uTWFuYWdlci5sb2FkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlEb25lLnRvZ2dsZSgpO1xuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgYXJncy5iYW5rQWNjb3VudE1hbmFnZXIubG9hZCgpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlcXVlc3RMb2FkZXI6IHJlcXVlc3RMb2FkZXIsXG4gICAgICAgICAgICAgICAgcmVxdWVzdEZ1bmQ6IHJlcXVlc3RGdW5kLFxuICAgICAgICAgICAgICAgIGJhbmtBY2NvdW50czogYXJncy5iYW5rQWNjb3VudE1hbmFnZXIuY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICBkaXNwbGF5RG9uZTogZGlzcGxheURvbmUsXG4gICAgICAgICAgICAgICAgbG9hZEJhbmtBOiBhcmdzLmJhbmtBY2NvdW50TWFuYWdlci5sb2FkZXJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgYmFsYW5jZSA9IGFyZ3MuYmFsYW5jZTtcblxuICAgICAgICAgICAgcmV0dXJuIChjdHJsLmxvYWRCYW5rQSgpID8gaC5sb2FkZXIoKSA6IG0oJ2RpdicsIF8ubWFwKGN0cmwuYmFua0FjY291bnRzKCksIChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLm1vZGFsLWRpYWxvZy1oZWFkZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlcicsIEkxOG4udCgnd2l0aGRyYXcnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAoY3RybC5kaXNwbGF5RG9uZSgpID8gbSgnLm1vZGFsLWRpYWxvZy1jb250ZW50LnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZmEuZmEtY2hlY2stY2lyY2xlLmZhLTV4LnRleHQtc3VjY2Vzcy51LW1hcmdpbmJvdHRvbS00MCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1sYXJnZScsIEkxOG4udCgnc3VjZXNzX21lc3NhZ2UnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgIF0pIDogbSgnLm1vZGFsLWRpYWxvZy1jb250ZW50JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1ZhbG9yOicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJyZuYnNwOycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udGV4dC1zdWNjZXNzJywgYFIkICR7aC5mb3JtYXROdW1iZXIoYmFsYW5jZS5hbW91bnQsIDIsIDMpfWApXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCB7c3R5bGU6IHsnZm9udC13ZWlnaHQnOiAnIDYwMCd9fSwgSTE4bi50KCdiYW5rLmFjY291bnQnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgnYmFuay5uYW1lJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnJm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ub3duZXJfbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250Y29sb3Itc2Vjb25kYXJ5JywgSTE4bi50KCdiYW5rLmNwZl9jbnBqJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnJm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ub3duZXJfZG9jdW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgnYmFuay5iYW5rX25hbWUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCcmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5iYW5rX25hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgnYmFuay5hZ2VuY3knLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCcmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7aXRlbS5hZ2VuY3l9LSR7aXRlbS5hZ2VuY3lfZGlnaXR9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250Y29sb3Itc2Vjb25kYXJ5JywgSTE4bi50KCdiYW5rLmFjY291bnQnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCcmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7aXRlbS5hY2NvdW50fS0ke2l0ZW0uYWNjb3VudF9kaWdpdH1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICBdKSksXG4gICAgICAgICAgICAgICAgICAgICghY3RybC5kaXNwbGF5RG9uZSgpID9cbiAgICAgICAgICAgICAgICAgICAgIG0oJy5tb2RhbC1kaWFsb2ctbmF2LWJvdHRvbScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGN0cmwucmVxdWVzdExvYWRlcigpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBtKCdhLmJ0bi5idG4tbGFyZ2UuYnRuLXJlcXVlc3QtZnVuZFtocmVmPVwianM6dm9pZCgwKTtcIl0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7b25jbGljazogY3RybC5yZXF1ZXN0RnVuZH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdTb2xpY2l0YXIgc2FxdWUnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zJylcbiAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJylcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfSkpKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXywgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuSTE4bikpO1xuIiwid2luZG93LmMuVXNlckJhbGFuY2VUcmFuc2FjdGlvblJvdyA9ICgobSwgaCkgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3VzZXJzLmJhbGFuY2UnKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBleHBhbmRlZCA9IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmIChhcmdzLmluZGV4ID09IDApIHtcbiAgICAgICAgICAgICAgICBleHBhbmRlZC50b2dnbGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBleHBhbmRlZDogZXhwYW5kZWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0ID0gaC5tb21lbnRGcm9tU3RyaW5nKGl0ZW0uY3JlYXRlZF9hdCwgJ1lZWVktTU0tREQnKTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oYGRpdltjbGFzcz0nYmFsYW5jZS1jYXJkICR7KGN0cmwuZXhwYW5kZWQoKSA/ICdjYXJkLWRldGFpbGVkLW9wZW4nIDogJycpfSddYCxcbiAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNsZWFyZml4LmNhcmQuY2FyZC1jbGlja2FibGUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwubGluZWhlaWdodC10aWdodGVzdCcsIGNyZWF0ZWRBdC5mb3JtYXQoJ0QgTU1NJykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci10ZXJjaWFyeScsIGNyZWF0ZWRBdC5mb3JtYXQoJ1lZWVknKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMC53LWNvbC10aW55LTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXIuZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgnZGViaXQnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnJm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRzaXplLWJhc2UudGV4dC1lcnJvcicsIGBSJCAke2guZm9ybWF0TnVtYmVyKE1hdGguYWJzKGl0ZW0uZGViaXQpLCAyLCAzKX1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXIuZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgnY3JlZGl0JywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJyZuYnNwOycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1iYXNlLnRleHQtc3VjY2VzcycsIGBSJCAke2guZm9ybWF0TnVtYmVyKGl0ZW0uY3JlZGl0LCAyLCAzKX1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXIuZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgndG90YWxzJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJyZuYnNwOycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1iYXNlJywgYFIkICR7aC5mb3JtYXROdW1iZXIoaXRlbS50b3RhbF9hbW91bnQsIDIsIDMpfWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgbShgYS53LWlubGluZS1ibG9jay5hcnJvdy1hZG1pbi4keyhjdHJsLmV4cGFuZGVkKCkgPyAnYXJyb3ctYWRtaW4tb3BlbmVkJyA6ICcnKX0uZmEuZmEtY2hldnJvbi1kb3duLmZvbnRjb2xvci1zZWNvbmRhcnlbaHJlZj1cImpzOih2b2lkKDApKTtcIl1gLCB7b25jbGljazogY3RybC5leHBhbmRlZC50b2dnbGV9KVxuICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAoY3RybC5leHBhbmRlZCgpID8gbSgnLmNhcmQnLCBfLm1hcChpdGVtLnNvdXJjZSwgKHRyYW5zYWN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBvcyA9IHRyYW5zYWN0aW9uLmFtb3VudCA+PSAwO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJ2RpdicsW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cuZm9udHNpemUtc21hbGwudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGAudGV4dC0keyhwb3MgPyAnc3VjY2VzcycgOiAnZXJyb3InKX1gLCBgJHtwb3MgPyAnKycgOiAnLSd9IFIkICR7aC5mb3JtYXROdW1iZXIoTWF0aC5hYnModHJhbnNhY3Rpb24uYW1vdW50KSwgMiwgMyl9YClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIGAke3RyYW5zYWN0aW9uLmV2ZW50X25hbWV9ICR7dHJhbnNhY3Rpb24ub3JpZ2luX29iamVjdC5uYW1lfWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW5ib3R0b20tMTAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgfSkpIDogJycpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuVXNlckJhbGFuY2VUcmFuc2FjdGlvbnMgPSAoKG0sIGgsIG1vZGVscywgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBhcmdzLmJhbGFuY2VUcmFuc2FjdGlvbk1hbmFnZXIubG9hZCgpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGxpc3Q6IGFyZ3MuYmFsYW5jZVRyYW5zYWN0aW9uTWFuYWdlci5saXN0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGN0cmwubGlzdDtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uc2VjdGlvbi5jYXJkLXRlcmNpYXJ5LmJlZm9yZS1mb290ZXIuYmFsYW5jZS10cmFuc2FjdGlvbnMtYXJlYScsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBfLm1hcChsaXN0LmNvbGxlY3Rpb24oKSwgKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIGMuVXNlckJhbGFuY2VUcmFuc2FjdGlvblJvdywge2l0ZW06IGl0ZW0sIGluZGV4OiBpbmRleH0pO1xuICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICBtKCcuY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW50b3AtNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIWxpc3QuaXNMb2FkaW5nKCkgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QuaXNMYXN0UGFnZSgpID8gJycgOiBtKCdidXR0b24jbG9hZC1tb3JlLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGxpc3QubmV4dFBhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ0NhcnJlZ2FyIG1haXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgubG9hZGVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jLm1vZGVscywgd2luZG93Ll8pKTtcbiIsIi8qKlxuICogd2luZG93LmMuVXNlckJhbGFuY2UgY29tcG9uZW50XG4gKiBSZW5kZXIgdGhlIGN1cnJlbnQgdXNlciB0b3RhbCBiYWxhbmNlIGFuZCByZXF1ZXN0IGZ1bmQgYWN0aW9uXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuVXNlckJhbGFuY2UsIHtcbiAqICAgICB1c2VyX2lkOiAxMjMsXG4gKiB9KVxuICovXG53aW5kb3cuYy5Vc2VyQmFsYW5jZSA9ICgobSwgaCwgXywgbW9kZWxzLCBjKSA9PiB7XG4gICAgY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAndXNlcnMuYmFsYW5jZScpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBkaXNwbGF5TW9kYWwgPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICBhcmdzLmJhbGFuY2VNYW5hZ2VyLmxvYWQoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1c2VyQmFsYW5jZXM6IGFyZ3MuYmFsYW5jZU1hbmFnZXIuY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICBkaXNwbGF5TW9kYWw6IGRpc3BsYXlNb2RhbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBiYWxhbmNlID0gXy5maXJzdChjdHJsLnVzZXJCYWxhbmNlcygpKSxcbiAgICAgICAgICAgICAgICBiYWxhbmNlUmVxdWVzdE1vZGFsQyA9IFtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZXJCYWxhbmNlUmVxdWVzdE1vZGFsQ29udGVudCcsXG4gICAgICAgICAgICAgICAgICAgIF8uZXh0ZW5kKHt9LCB7YmFsYW5jZTogYmFsYW5jZX0sIGFyZ3MpXG4gICAgICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uc2VjdGlvbi51c2VyLWJhbGFuY2Utc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAoY3RybC5kaXNwbGF5TW9kYWwoKSA/IG0uY29tcG9uZW50KGMuTW9kYWxCb3gsIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU1vZGFsOiBjdHJsLmRpc3BsYXlNb2RhbCxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogYmFsYW5jZVJlcXVlc3RNb2RhbENcbiAgICAgICAgICAgICAgICB9KSA6ICcnKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnUtdGV4dC1jZW50ZXItc21hbGwtb25seS51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJMThuLnQoJ3RvdGFscycsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi50ZXh0LXN1Y2Nlc3MnLCBgUiQgJHtoLmZvcm1hdE51bWJlcihiYWxhbmNlLmFtb3VudCwgMiwgMyl9YClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhW2NsYXNzPVwici1mdW5kLWJ0biB3LWJ1dHRvbiBidG4gYnRuLW1lZGl1bSB1LW1hcmdpbmJvdHRvbS0xMCAkeyhiYWxhbmNlLmFtb3VudCA8PSAwID8gJ2J0bi1pbmFjdGl2ZScgOiAnJyl9XCJdW2hyZWY9XCJqczp2b2lkKDApO1wiXWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7b25jbGljazogKGJhbGFuY2UuYW1vdW50ID4gMCA/IGN0cmwuZGlzcGxheU1vZGFsLnRvZ2dsZSA6ICdqczp2b2lkKDApOycpfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEkxOG4udCgnd2l0aGRyYXdfY3RhJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Ll8sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLlVzZXJDYXJkID0gKGZ1bmN0aW9uKG0sIF8sIG1vZGVscywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciB2bSA9IGguaWRWTSxcbiAgICAgICAgICAgICAgICB1c2VyRGV0YWlscyA9IG0ucHJvcChbXSk7XG5cbiAgICAgICAgICAgIHZtLmlkKGFyZ3MudXNlcklkKTtcblxuICAgICAgICAgICAgLy9GSVhNRTogY2FuIGNhbGwgYW5vbiByZXF1ZXN0cyB3aGVuIHRva2VuIGZhaWxzIChyZXF1ZXN0TWF5YmVXaXRoVG9rZW4pXG4gICAgICAgICAgICBtb2RlbHMudXNlckRldGFpbC5nZXRSb3dXaXRoVG9rZW4odm0ucGFyYW1ldGVycygpKS50aGVuKHVzZXJEZXRhaWxzKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1c2VyRGV0YWlsczogdXNlckRldGFpbHNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjdXNlci1jYXJkJywgXy5tYXAoY3RybC51c2VyRGV0YWlscygpLCBmdW5jdGlvbih1c2VyRGV0YWlsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJy5jYXJkLmNhcmQtdXNlci51LXJhZGl1cy51LW1hcmdpbmJvdHRvbS0zMFtpdGVtcHJvcD1cImF1dGhvclwiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy5jb2wtc21hbGwtNC53LWNvbC10aW55LTQudy1jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIudS1yb3VuZFt3aWR0aD1cIjEwMFwiXVtpdGVtcHJvcD1cImltYWdlXCJdW3NyYz1cIicgKyB1c2VyRGV0YWlsLnByb2ZpbGVfaW1nX3RodW1ibmFpbCArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC53LWNvbC1zbWFsbC04LnctY29sLXRpbnktOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXJbaXRlbXByb3A9XCJuYW1lXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIvdXNlcnMvJyArIHVzZXJEZXRhaWwuaWQgKyAnXCJdJywgdXNlckRldGFpbC5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3NlcltpdGVtcHJvcD1cImFkZHJlc3NcIl0nLCB1c2VyRGV0YWlsLmFkZHJlc3NfY2l0eSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgdXNlckRldGFpbC50b3RhbF9wdWJsaXNoZWRfcHJvamVjdHMgKyAnIHByb2pldG9zIGNyaWFkb3MnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCAnYXBvaW91ICcgKyB1c2VyRGV0YWlsLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LWF1dGhvci1jb250YWN0cycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3VsLnctbGlzdC11bnN0eWxlZC5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC5mYWNlYm9va19saW5rKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCInICsgdXNlckRldGFpbC5mYWNlYm9va19saW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnUGVyZmlsIG5vIEZhY2Vib29rJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSwgKCFfLmlzRW1wdHkodXNlckRldGFpbC50d2l0dGVyX3VzZXJuYW1lKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCJodHRwczovL3R3aXR0ZXIuY29tLycgKyB1c2VyRGV0YWlsLnR3aXR0ZXJfdXNlcm5hbWUgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdQZXJmaWwgbm8gVHdpdHRlcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAodXNlckRldGFpbC5saW5rcywgZnVuY3Rpb24obGluaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCInICsgbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgbGluaylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKSwgKCFfLmlzRW1wdHkodXNlckRldGFpbC5lbWFpbCkgPyBtKCdhLmJ0bi5idG4tbWVkaXVtLmJ0bi1tZXNzYWdlW2hyZWY9XCJtYWlsdG86JyArIHVzZXJEZXRhaWwuZW1haWwgKyAnXCJdW2l0ZW1wcm9wPVwiZW1haWxcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudmlhciBtZW5zYWdlbScpIDogJycpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy55b3V0dWJlTGlnaHRib3ggY29tcG9uZW50XG4gKiBBIHZpc3VhbCBjb21wb25lbnQgdGhhdCBkaXNwbGF5cyBhIGxpZ2h0Ym94IHdpdGggYSB5b3V0dWJlIHZpZGVvXG4gKlxuICogRXhhbXBsZTpcbiAqIHZpZXc6ICgpID0+IHtcbiAqICAgICAgLi4uXG4gKiAgICAgIG0uY29tcG9uZW50KGMueW91dHViZUxpZ2h0Ym94LCB7c3JjOiAnaHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1GbEZUY0RTS25MTSd9KVxuICogICAgICAuLi5cbiAqICB9XG4gKi9cbndpbmRvdy5jLllvdXR1YmVMaWdodGJveCA9ICgobSwgYywgaCwgbW9kZWxzKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBwbGF5ZXI7XG4gICAgICAgICAgICBjb25zdCBzaG93TGlnaHRib3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgICAgIHNldFlvdXR1YmUgPSAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0YWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFNjcmlwdFRhZyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5zcmMgPSAnaHR0cHM6Ly93d3cueW91dHViZS5jb20vaWZyYW1lX2FwaSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFNjcmlwdFRhZy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0YWcsIGZpcnN0U2NyaXB0VGFnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vbllvdVR1YmVJZnJhbWVBUElSZWFkeSA9IGNyZWF0ZVBsYXllcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2xvc2VWaWRlbyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKHBsYXllcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci5wYXVzZVZpZGVvKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzaG93TGlnaHRib3gudG9nZ2xlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRlUGxheWVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIgPSBuZXcgWVQuUGxheWVyKCd5dHZpZGVvJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnNTI4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnOTQwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvSWQ6IGFyZ3Muc3JjLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyVmFyczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dJbmZvOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVzdEJyYW5kaW5nOiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ29uU3RhdGVDaGFuZ2UnOiAoc3RhdGUpID0+IChzdGF0ZS5kYXRhID09PSAwKSA/IGNsb3NlVmlkZW8oKSA6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc2hvd0xpZ2h0Ym94OiBzaG93TGlnaHRib3gsXG4gICAgICAgICAgICAgICAgc2V0WW91dHViZTogc2V0WW91dHViZSxcbiAgICAgICAgICAgICAgICBjbG9zZVZpZGVvOiBjbG9zZVZpZGVvXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJyN5b3V0dWJlLWxpZ2h0Ym94JywgW1xuICAgICAgICAgICAgICAgIG0oJ2EjeW91dHViZS1wbGF5LnctbGlnaHRib3gudy1pbmxpbmUtYmxvY2suZmEuZmEtcGxheS1jaXJjbGUuZm9udGNvbG9yLW5lZ2F0aXZlLmZhLTV4W2hyZWY9XFwnamF2YXNjcmlwdDp2b2lkKDApO1xcJ10nLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuc2hvd0xpZ2h0Ym94LnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG0oYCNsaWdodGJveC53LWxpZ2h0Ym94LWJhY2tkcm9wW3N0eWxlPVwiZGlzcGxheToke2N0cmwuc2hvd0xpZ2h0Ym94KCkgPyAnYmxvY2snIDogJ25vbmUnfVwiXWAsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctbGlnaHRib3gtY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctbGlnaHRib3gtY29udGVudCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC12aWV3JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1mcmFtZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ZpZ3VyZS53LWxpZ2h0Ym94LWZpZ3VyZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudy1saWdodGJveC1pbWcudy1saWdodGJveC1pbWFnZVtzcmM9XFwnZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmLTgsJTNDc3ZnJTIweG1sbnM9JTIyaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmclMjIlMjB3aWR0aD0lMjI5NDAlMjIlMjBoZWlnaHQ9JTIyNTI4JTIyLyUzRVxcJ10nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjeXR2aWRlby5lbWJlZGx5LWVtYmVkLnctbGlnaHRib3gtZW1iZWQnLCB7Y29uZmlnOiBjdHJsLnNldFlvdXR1YmV9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1zcGlubmVyLnctbGlnaHRib3gtaGlkZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWxpZ2h0Ym94LWNvbnRyb2wudy1saWdodGJveC1sZWZ0LnctbGlnaHRib3gtaW5hY3RpdmUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1jb250cm9sLnctbGlnaHRib3gtcmlnaHQudy1saWdodGJveC1pbmFjdGl2ZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJyN5b3V0dWJlLWNsb3NlLnctbGlnaHRib3gtY29udHJvbC53LWxpZ2h0Ym94LWNsb3NlJywge29uY2xpY2s6IGN0cmwuY2xvc2VWaWRlb30pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWxpZ2h0Ym94LXN0cmlwJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMuYWRtaW4uQ29udHJpYnV0aW9ucyA9IChmdW5jdGlvbihtLCBjLCBoKSB7XG4gICAgdmFyIGFkbWluID0gYy5hZG1pbjtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBsaXN0Vk0gPSBhZG1pbi5jb250cmlidXRpb25MaXN0Vk0sXG4gICAgICAgICAgICAgICAgZmlsdGVyVk0gPSBhZG1pbi5jb250cmlidXRpb25GaWx0ZXJWTSxcbiAgICAgICAgICAgICAgICBlcnJvciA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlciA9IFt7IC8vZnVsbF90ZXh0X2luZGV4XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uZnVsbF90ZXh0X2luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdCdXNxdWUgcG9yIHByb2pldG8sIGVtYWlsLCBJZHMgZG8gdXN1w6FyaW8gZSBkbyBhcG9pby4uLidcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHsgLy9zdGF0ZVxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEcm9wZG93bicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQ29tIG8gZXN0YWRvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdzdGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uc3RhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdRdWFscXVlciB1bSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3BhaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ3BhaWQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdyZWZ1c2VkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdyZWZ1c2VkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncGVuZGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAncGVuZGluZydcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3BlbmRpbmdfcmVmdW5kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdwZW5kaW5nX3JlZnVuZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3JlZnVuZGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdyZWZ1bmRlZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ2NoYXJnZWJhY2snLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ2NoYXJnZWJhY2snXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdkZWxldGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdkZWxldGVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHsgLy9nYXRld2F5XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlckRyb3Bkb3duJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdnYXRld2F5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdnYXRld2F5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5nYXRld2F5LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnUXVhbHF1ZXIgdW0nXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdQYWdhcm1lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdQYWdhcm1lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnTW9JUCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnTW9JUCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ1BheVBhbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnUGF5UGFsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnQ3JlZGl0cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnQ3LDqWRpdG9zJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHsgLy92YWx1ZVxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJOdW1iZXJSYW5nZScsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVmFsb3JlcyBlbnRyZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdDogZmlsdGVyVk0udmFsdWUuZ3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdDogZmlsdGVyVk0udmFsdWUubHRlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB7IC8vY3JlYXRlZF9hdFxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEYXRlUmFuZ2UnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1BlcsOtb2RvIGRvIGFwb2lvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0OiBmaWx0ZXJWTS5jcmVhdGVkX2F0Lmd0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Q6IGZpbHRlclZNLmNyZWF0ZWRfYXQubHRlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICBzdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkudGhlbihudWxsLCBmdW5jdGlvbihzZXJ2ZXJFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3Ioc2VydmVyRXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTTogZmlsdGVyVk0sXG4gICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlcjogZmlsdGVyQnVpbGRlcixcbiAgICAgICAgICAgICAgICBsaXN0Vk06IHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdDogbGlzdFZNLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdBcG9pb3MnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5GaWx0ZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybTogY3RybC5maWx0ZXJWTS5mb3JtRGVzY3JpYmVyLFxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyOiBjdHJsLmZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgICAgIHN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluTGlzdCwge1xuICAgICAgICAgICAgICAgICAgICB2bTogY3RybC5saXN0Vk0sXG4gICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtOiBjLkFkbWluQ29udHJpYnV0aW9uSXRlbSxcbiAgICAgICAgICAgICAgICAgICAgbGlzdERldGFpbDogYy5BZG1pbkNvbnRyaWJ1dGlvbkRldGFpbFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5Vc2VycyA9IChmdW5jdGlvbihtLCBjLCBoKSB7XG4gICAgdmFyIGFkbWluID0gYy5hZG1pbjtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBsaXN0Vk0gPSBhZG1pbi51c2VyTGlzdFZNLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNID0gYWRtaW4udXNlckZpbHRlclZNLFxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKCcnKSxcbiAgICAgICAgICAgICAgICBpdGVtQnVpbGRlciA9IFt7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluVXNlcicsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgIGZpbHRlckJ1aWxkZXIgPSBbeyAvL25hbWVcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyTWFpbicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5mdWxsX3RleHRfaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ0J1c3F1ZSBwb3Igbm9tZSwgZS1tYWlsLCBJZHMgZG8gdXN1w6FyaW8uLi4nLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sIHsgLy9zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyRHJvcGRvd24nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0NvbSBvIGVzdGFkbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogJ3N0YXR1cycsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZGVhY3RpdmF0ZWRfYXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmRlYWN0aXZhdGVkX2F0LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnUXVhbHF1ZXIgdW0nXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnYXRpdm8nXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICFudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ2Rlc2F0aXZhZG8nXG4gICAgICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKS50aGVuKG51bGwsIGZ1bmN0aW9uKHNlcnZlckVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcihzZXJ2ZXJFcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyOiBmaWx0ZXJCdWlsZGVyLFxuICAgICAgICAgICAgICAgIGxpc3RWTToge1xuICAgICAgICAgICAgICAgICAgICBsaXN0OiBsaXN0Vk0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VibWl0OiBzdWJtaXRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgY29uc3QgbGFiZWwgPSAnVXN1w6FyaW9zJztcblxuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluRmlsdGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm06IGN0cmwuZmlsdGVyVk0uZm9ybURlc2NyaWJlcixcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlcjogY3RybC5maWx0ZXJCdWlsZGVyLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgIHN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluTGlzdCwge1xuICAgICAgICAgICAgICAgICAgICB2bTogY3RybC5saXN0Vk0sXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW06IGMuQWRtaW5Vc2VySXRlbSxcbiAgICAgICAgICAgICAgICAgICAgbGlzdERldGFpbDogYy5BZG1pblVzZXJEZXRhaWxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMudm1zLmhvbWUgPSAoKEkxOG4pID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBjb25zdCBpMThuU3RhcnQgPSBJMThuLnRyYW5zbGF0aW9uc1tJMThuLmN1cnJlbnRMb2NhbGUoKV0ucHJvamVjdHMuaG9tZSxcbiAgICAgICAgICAgIGJhbm5lcnMgPSBpMThuU3RhcnQuYmFubmVycztcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYmFubmVyczogYmFubmVyc1xuICAgICAgICB9O1xuICAgIH07XG59KHdpbmRvdy5JMThuKSk7XG4iLCJ3aW5kb3cuYy52bXMucHJvamVjdEZpbHRlcnMgPSAoKG0sIGgsIG1vbWVudCkgPT4ge1xuICAgIHJldHVybiAoKSA9PntcbiAgICAgICAgY29uc3QgZmlsdGVycyA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSxcblxuICAgICAgICAgICAgICBuZWFyTWUgPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgIG5lYXJfbWU6ICdlcScsXG4gICAgICAgICAgICAgICAgICBvcGVuX2Zvcl9jb250cmlidXRpb25zOiAnZXEnXG4gICAgICAgICAgICAgIH0pLm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMoJ3RydWUnKS5uZWFyX21lKHRydWUpLFxuXG4gICAgICAgICAgICAgIGV4cGlyaW5nID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICBleHBpcmVzX2F0OiAnbHRlJyxcbiAgICAgICAgICAgICAgICAgIG9wZW5fZm9yX2NvbnRyaWJ1dGlvbnM6ICdlcSdcbiAgICAgICAgICAgICAgfSkub3Blbl9mb3JfY29udHJpYnV0aW9ucygndHJ1ZScpLmV4cGlyZXNfYXQobW9tZW50KCkuYWRkKDE0LCAnZGF5cycpLmZvcm1hdCgnWVlZWS1NTS1ERCcpKSxcblxuICAgICAgICAgICAgICByZWNlbnQgPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgIG9ubGluZV9kYXRlOiAnZ3RlJyxcbiAgICAgICAgICAgICAgICAgIG9wZW5fZm9yX2NvbnRyaWJ1dGlvbnM6ICdlcSdcbiAgICAgICAgICAgICAgfSkub3Blbl9mb3JfY29udHJpYnV0aW9ucygndHJ1ZScpLm9ubGluZV9kYXRlKG1vbWVudCgpLnN1YnRyYWN0KDUsICdkYXlzJykuZm9ybWF0KCdZWVlZLU1NLUREJykpLFxuXG4gICAgICAgICAgICAgIHJlY29tbWVuZGVkID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICByZWNvbW1lbmRlZDogJ2VxJyxcbiAgICAgICAgICAgICAgICAgIG9wZW5fZm9yX2NvbnRyaWJ1dGlvbnM6ICdlcSdcbiAgICAgICAgICAgICAgfSkucmVjb21tZW5kZWQoJ3RydWUnKS5vcGVuX2Zvcl9jb250cmlidXRpb25zKCd0cnVlJyksXG5cbiAgICAgICAgICAgICAgb25saW5lID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICBvcGVuX2Zvcl9jb250cmlidXRpb25zOiAnZXEnXG4gICAgICAgICAgICAgIH0pLm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMoJ3RydWUnKSxcblxuICAgICAgICAgICAgICBzdWNjZXNzZnVsID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICBzdGF0ZTogJ2VxJ1xuICAgICAgICAgICAgICB9KS5zdGF0ZSgnc3VjY2Vzc2Z1bCcpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZWNvbW1lbmRlZDoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnUmVjb21lbmRhZG9zJyxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IHJlY29tbWVuZGVkXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25saW5lOiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdObyBhcicsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBvbmxpbmVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBleHBpcmluZzoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnUmV0YSBmaW5hbCcsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBleHBpcmluZ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1Y2Nlc3NmdWw6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0JlbS1zdWNlZGlkb3MnLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogc3VjY2Vzc2Z1bFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlY2VudDoge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnUmVjZW50ZXMnLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogcmVjZW50XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbmVhcl9tZToge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnUHLDs3hpbW9zIGEgbWltJyxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IG5lYXJNZVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cubW9tZW50KSk7XG4iLCJ3aW5kb3cuYy52bXMucHJvamVjdCA9ICgobSwgaCwgXywgbW9kZWxzKSA9PiB7XG4gICAgcmV0dXJuIChwcm9qZWN0X2lkLCBwcm9qZWN0X3VzZXJfaWQpID0+IHtcbiAgICAgICAgY29uc3Qgdm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICB9KSxcbiAgICAgICAgICAgICAgaWRWTSA9IGguaWRWTSxcbiAgICAgICAgICAgICAgcHJvamVjdERldGFpbHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICB1c2VyRGV0YWlscyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgIHJld2FyZERldGFpbHMgPSBtLnByb3AoW10pO1xuXG4gICAgICAgIHZtLnByb2plY3RfaWQocHJvamVjdF9pZCk7XG4gICAgICAgIGlkVk0uaWQocHJvamVjdF91c2VyX2lkKTtcblxuICAgICAgICBjb25zdCBsUHJvamVjdCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihtb2RlbHMucHJvamVjdERldGFpbC5nZXRSb3dPcHRpb25zKHZtLnBhcmFtZXRlcnMoKSkpLFxuICAgICAgICAgICAgICBsVXNlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihtb2RlbHMudXNlckRldGFpbC5nZXRSb3dPcHRpb25zKGlkVk0ucGFyYW1ldGVycygpKSksXG4gICAgICAgICAgICAgIGxSZXdhcmQgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnJld2FyZERldGFpbC5nZXRQYWdlT3B0aW9ucyh2bS5wYXJhbWV0ZXJzKCkpKSxcbiAgICAgICAgICAgICAgaXNMb2FkaW5nID0gKCkgPT4geyByZXR1cm4gKGxQcm9qZWN0KCkgfHwgbFVzZXIoKSB8fCBsUmV3YXJkKCkpOyB9O1xuXG4gICAgICAgIGxQcm9qZWN0LmxvYWQoKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBsVXNlci5sb2FkKCkudGhlbih1c2VyRGV0YWlscyk7XG4gICAgICAgICAgICBsUmV3YXJkLmxvYWQoKS50aGVuKHJld2FyZERldGFpbHMpO1xuXG4gICAgICAgICAgICBwcm9qZWN0RGV0YWlscyhkYXRhKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHByb2plY3REZXRhaWxzOiBfLmNvbXBvc2UoXy5maXJzdCwgcHJvamVjdERldGFpbHMpLFxuICAgICAgICAgICAgdXNlckRldGFpbHM6IHVzZXJEZXRhaWxzLFxuICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogcmV3YXJkRGV0YWlscyxcbiAgICAgICAgICAgIGlzTG9hZGluZzogaXNMb2FkaW5nXG4gICAgICAgIH07XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLnZtcy5zdGFydCA9ICgoXykgPT4ge1xuICAgIHJldHVybiAoSTE4bikgPT4ge1xuICAgICAgICBjb25zdCBpMThuU3RhcnQgPSBJMThuLnRyYW5zbGF0aW9uc1tJMThuLmN1cnJlbnRMb2NhbGUoKV0ucGFnZXMuc3RhcnQsXG4gICAgICAgICAgICB0ZXN0aW1vbmlhbHMgPSBpMThuU3RhcnQudGVzdGltb25pYWxzLFxuICAgICAgICAgICAgY2F0ZWdvcnlQcm9qZWN0cyA9IGkxOG5TdGFydC5jYXRlZ29yeVByb2plY3RzLFxuICAgICAgICAgICAgcGFuZXMgPSBpMThuU3RhcnQucGFuZXMsXG4gICAgICAgICAgICBxYSA9IGkxOG5TdGFydC5xYTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGVzdGltb25pYWxzOiBfLm1hcCh0ZXN0aW1vbmlhbHMsICh0ZXN0aW1vbmlhbCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHRodW1iVXJsOiB0ZXN0aW1vbmlhbC50aHVtYixcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogdGVzdGltb25pYWwuY29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdGVzdGltb25pYWwubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxzOiB0ZXN0aW1vbmlhbC50b3RhbHNcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBwYW5lczogXy5tYXAocGFuZXMsIChwYW5lKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHBhbmUubGFiZWwsXG4gICAgICAgICAgICAgICAgICAgIHNyYzogcGFuZS5zcmNcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBxdWVzdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBjb2xfMTogXy5tYXAocWEuY29sXzEsIChxdWVzdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246IHF1ZXN0aW9uLnF1ZXN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiBxdWVzdGlvbi5hbnN3ZXJcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBjb2xfMjogXy5tYXAocWEuY29sXzIsIChxdWVzdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246IHF1ZXN0aW9uLnF1ZXN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiBxdWVzdGlvbi5hbnN3ZXJcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNhdGVnb3J5UHJvamVjdHM6IF8ubWFwKGNhdGVnb3J5UHJvamVjdHMsIChjYXRlZ29yeSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5SWQ6IGNhdGVnb3J5LmNhdGVnb3J5X2lkLFxuICAgICAgICAgICAgICAgICAgICBzYW1wbGVQcm9qZWN0czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnkuc2FtcGxlX3Byb2plY3RfaWRzLnByaW1hcnksXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeS5zYW1wbGVfcHJvamVjdF9pZHMuc2Vjb25kYXJ5XG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfTtcbiAgICB9O1xufSh3aW5kb3cuXykpO1xuIiwid2luZG93LmMuYWRtaW4uY29udHJpYnV0aW9uRmlsdGVyVk0gPSAoZnVuY3Rpb24obSwgaCwgcmVwbGFjZURpYWNyaXRpY3MpIHtcbiAgICB2YXIgdm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgZnVsbF90ZXh0X2luZGV4OiAnQEAnLFxuICAgICAgICAgICAgc3RhdGU6ICdlcScsXG4gICAgICAgICAgICBnYXRld2F5OiAnZXEnLFxuICAgICAgICAgICAgdmFsdWU6ICdiZXR3ZWVuJyxcbiAgICAgICAgICAgIGNyZWF0ZWRfYXQ6ICdiZXR3ZWVuJ1xuICAgICAgICB9KSxcblxuICAgICAgICBwYXJhbVRvU3RyaW5nID0gZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgcmV0dXJuIChwIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKTtcbiAgICAgICAgfTtcblxuICAgIC8vIFNldCBkZWZhdWx0IHZhbHVlc1xuICAgIHZtLnN0YXRlKCcnKTtcbiAgICB2bS5nYXRld2F5KCcnKTtcbiAgICB2bS5vcmRlcih7XG4gICAgICAgIGlkOiAnZGVzYydcbiAgICB9KTtcblxuICAgIHZtLmNyZWF0ZWRfYXQubHRlLnRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmNyZWF0ZWRfYXQubHRlKCkpO1xuICAgICAgICByZXR1cm4gZmlsdGVyICYmIGgubW9tZW50RnJvbVN0cmluZyhmaWx0ZXIpLmVuZE9mKCdkYXknKS5mb3JtYXQoJycpO1xuICAgIH07XG5cbiAgICB2bS5jcmVhdGVkX2F0Lmd0ZS50b0ZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5jcmVhdGVkX2F0Lmd0ZSgpKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlciAmJiBoLm1vbWVudEZyb21TdHJpbmcoZmlsdGVyKS5mb3JtYXQoKTtcbiAgICB9O1xuXG4gICAgdm0uZnVsbF90ZXh0X2luZGV4LnRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmZ1bGxfdGV4dF9pbmRleCgpKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlciAmJiByZXBsYWNlRGlhY3JpdGljcyhmaWx0ZXIpIHx8IHVuZGVmaW5lZDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHZtO1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LnJlcGxhY2VEaWFjcml0aWNzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5jb250cmlidXRpb25MaXN0Vk0gPSAoZnVuY3Rpb24obSwgbW9kZWxzKSB7XG4gICAgcmV0dXJuIG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShtb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsLCAnaWQuZGVzYycsIHsnUHJlZmVyJzogJ2NvdW50PWV4YWN0J30pO1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi51c2VyRmlsdGVyVk0gPSAoZnVuY3Rpb24obSwgcmVwbGFjZURpYWNyaXRpY3MpIHtcbiAgICB2YXIgdm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgZnVsbF90ZXh0X2luZGV4OiAnQEAnLFxuICAgICAgICAgICAgZGVhY3RpdmF0ZWRfYXQ6ICdpcy5udWxsJ1xuICAgICAgICB9KSxcblxuICAgICAgICBwYXJhbVRvU3RyaW5nID0gZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgcmV0dXJuIChwIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKTtcbiAgICAgICAgfTtcblxuICAgIC8vIFNldCBkZWZhdWx0IHZhbHVlc1xuICAgIHZtLmRlYWN0aXZhdGVkX2F0KG51bGwpLm9yZGVyKHtcbiAgICAgICAgaWQ6ICdkZXNjJ1xuICAgIH0pO1xuXG4gICAgdm0uZGVhY3RpdmF0ZWRfYXQudG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IEpTT04ucGFyc2Uodm0uZGVhY3RpdmF0ZWRfYXQoKSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXI7XG4gICAgfTtcblxuICAgIHZtLmZ1bGxfdGV4dF9pbmRleC50b0ZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5mdWxsX3RleHRfaW5kZXgoKSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXIgJiYgcmVwbGFjZURpYWNyaXRpY3MoZmlsdGVyKSB8fCB1bmRlZmluZWQ7XG4gICAgfTtcblxuICAgIHJldHVybiB2bTtcbn0od2luZG93Lm0sIHdpbmRvdy5yZXBsYWNlRGlhY3JpdGljcykpO1xuIiwid2luZG93LmMuYWRtaW4udXNlckxpc3RWTSA9IChmdW5jdGlvbihtLCBtb2RlbHMpIHtcbiAgICByZXR1cm4gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy51c2VyLCAnaWQuZGVzYycsIHsnUHJlZmVyJzogJ2NvdW50PWV4YWN0J30pO1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzKSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
