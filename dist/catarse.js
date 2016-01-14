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
        useAvatarOrDefault: useAvatarOrDefault,
        locationActionMatch: locationActionMatch,
        mixpanelTrack: mixpanelTrack,
        navigateToDevise: navigateToDevise,
        storeAction: storeAction,
        callStoredAction: callStoredAction,
        UIHelper: UIHelper,
        toAnchor: toAnchor,
        paramByName: paramByName,
        i18nScope: i18nScope,
        scrollTo: scrollTo
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
                state: 'eq'
            }),
                statsLoader = m.postgrest.loaderWithToken(models.statistic.getRowOptions());

            flexVM.mode('flex').state('online');

            var projectsLoader = m.postgrest.loader(models.project.getPageOptions(flexVM.parameters()), m.postgrest.request);

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
                project: project
            }) : '', m('.w-container', [m('.w-row.u-marginbottom-40', [m('.w-col.w-col-2'), m('.w-col.w-col-8.dashboard-header.u-text-center', [m('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10', I18n.t('campaign_title', I18nScope())), m.component(c.AdminProjectDetailsCard, {
                resource: project
            }), m.component(ctrl.explanationModeComponent(project.mode), {
                resource: project
            })]), m('.w-col.w-col-2')])]), project.is_published ? [m('.divider'), m('.w-section.section-one-column.section.bg-gray.before-footer', [m('.w-container', [m('.w-row', [m('.w-col.w-col-12.u-text-center', {
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
            var project = ctrl.projectDetails();
            return project.is_owner_or_admin ? m.component(c.ProjectDashboardMenu, { project: project }) : '';
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
                toggleCategories.toggle();
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
            return [m('.w-section.hero-search', [m('.w-container.u-marginbottom-10', [m('.u-text-center.u-marginbottom-40', [m('a#explore-open.link-hidden-white.fontweight-light.fontsize-larger[href="javascript:void();"]', { onclick: function onclick() {
                    return ctrl.toggleCategories.toggle();
                } }, ['Explore projetos incríveis ', m('span#explore-btn.fa.fa-angle-down' + (ctrl.toggleCategories() ? '.opened' : ''), '')])]), m('#categories.category-slider' + (ctrl.toggleCategories() ? '.opened' : ''), [m('.w-row', [_.map(ctrl.categories(), function (category) {
                return m.component(c.CategoryButton, { category: category });
            })]), m('.w-row.u-marginbottom-30', [_.map(ctrl.filtersMap, function (filter, href) {
                return m.component(c.FilterButton, { title: filter.title, href: href });
            })])])])]), m('.w-section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-6.w-col-small-7.w-col-tiny-7', [m('.fontsize-larger', ctrl.title())]), _.isObject(ctrl.category()) ? m('.w-col.w-col-6.w-col-small-5.w-col-tiny-5', [m('.w-row', [m('.w-col.w-col-8.w-hidden-small.w-hidden-tiny.w-clearfix', [m('.following.fontsize-small.fontcolor-secondary.u-right', ctrl.category().followers + ' seguidores')]), m('.w-col.w-col-4.w-col-small-12.w-col-tiny-12', [ctrl.category().following ? m('a.btn.btn-medium.btn-terciary.unfollow-btn[href=\'#\']', { onclick: ctrl.unFollowCategory(ctrl.category().id) }, 'Deixar de seguir') : m('a.btn.btn-medium.follow-btn[href=\'#\']', { onclick: ctrl.followCategory(ctrl.category().id) }, 'Seguir')])])]) : ''])])]), m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-row', _.map(ctrl.projects().collection(), function (project) {
                return m.component(c.ProjectCard, { project: project, ref: 'ctrse_explore' });
            })), ctrl.projects().isLoading() ? h.loader() : ''])])]), m('.w-section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-5'), m('.w-col.w-col-2', [m('a.btn.btn-medium.btn-terciary[href=\'#loadMore\']', { onclick: function onclick() {
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
            var sample3 = _.partial(_.sample, _, 3),
                loaderWithToken = m.postgrest.loaderWithToken,
                loader = _.partial(m.postgrest.loader, _, m.postgrest.request),
                project = c.models.project,
                filters = c.vms.projectFilters();

            var collections = _.map(['recommended'], function (name) {
                var f = filters[name],
                    cLoader = loaderWithToken(project.getPageOptions(f.filter.parameters())),
                    collection = m.prop([]);

                cLoader.load().then(_.compose(collection, sample3));

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
            var project = ctrl.projectDetails();
            return !ctrl.isLoading() ? m('.project-show', {
                config: h.mixpanelTrack()
            }, [m.component(c.ProjectHeader, {
                project: project,
                userDetails: ctrl.userDetails
            }), m.component(c.ProjectTabs, {
                project: project,
                rewardDetails: ctrl.rewardDetails
            }), m.component(c.ProjectMain, {
                project: project,
                rewardDetails: ctrl.rewardDetails
            }), project.is_owner_or_admin ? m.component(c.ProjectDashboardMenu, {
                project: project
            }) : '']) : h.loader();
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
                loader = m.postgrest.loaderWithToken,
                statsLoader = loader(models.statistic.getRowOptions()),
                loadCategories = function loadCategories() {
                return c.models.category.getPageWithToken(filters({}).order({
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
            }, I18n.t('submit', I18nScope()))])]), m('.w-row', _.isEmpty(stats) ? '' : [m('.w-col.w-col-4', [m('.fontsize-largest.lineheight-loose', h.formatNumber(stats.total_contributors, 0, 3)), m('p.fontsize-small.start-stats', I18n.t('header.people', I18nScope()))]), m('.w-col.w-col-4', [m('.fontsize-largest.lineheight-loose', stats.total_contributed.toString().slice(0, 2) + ' milhões'), m('p.fontsize-small.start-stats', I18n.t('header.money', I18nScope()))]), m('.w-col.w-col-4', [m('.fontsize-largest.lineheight-loose', h.formatNumber(stats.total_projects_success, 0, 3)), m('p.fontsize-small.start-stats', I18n.t('header.success', I18nScope()))])])])]), m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-10.w-col-push-1.u-text-center', [m('.fontsize-larger.u-marginbottom-10.fontweight-semibold', I18n.t('page-title', I18nScope())), m('.fontsize-small', I18n.t('page-subtitle', I18nScope()))])]), m('.w-clearfix.how-row', [m('.w-hidden-small.w-hidden-tiny.how-col-01', [m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.1', I18nScope())), m('.fontsize-base', I18n.t('banner.2', I18nScope()))]), m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.3', I18nScope())), m('.fontsize-base', I18n.t('banner.4', I18nScope()))])]), m('.how-col-02'), m('.how-col-03', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.5', I18nScope())), m('.fontsize-base', I18n.t('banner.6', I18nScope())), m('.fontweight-semibold.fontsize-large.u-margintop-30', I18n.t('banner.7', I18nScope())), m('.fontsize-base', I18n.t('banner.8', I18nScope()))]), m('.w-hidden-main.w-hidden-medium.how-col-01', [m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.1', I18nScope())), m('.fontsize-base', I18n.t('banner.2', I18nScope()))]), m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.3', I18nScope())), m('.fontsize-base', I18n.t('banner.4', I18nScope()))]), m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.5', I18nScope())), m('.fontsize-base', I18n.t('banner.6', I18nScope()))]), m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.7', I18nScope())), m('.fontsize-base', I18n.t('banner.8', I18nScope()))])])])])]), m('.w-section.divider'), m('.w-section.section-large', [m('.w-container.u-text-center.u-marginbottom-60', [m('div', [m('span.fontsize-largest.fontweight-semibold', I18n.t('features.title', I18nScope()))]), m('.w-hidden-small.w-hidden-tiny.fontsize-large.u-marginbottom-20', I18n.t('features.subtitle', I18nScope())), m('.w-hidden-main.w-hidden-medium.u-margintop-30', [m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_1', I18nScope())), m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_2', I18nScope())), m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_3', I18nScope())), m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_4', I18nScope())), m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_5', I18nScope()))])]), m('.w-container', [m('.w-tabs.w-hidden-small.w-hidden-tiny', [m('.w-tab-menu.w-col.w-col-4', _.map(ctrl.paneImages, function (pane, idx) {
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
                }, I18n.t('submit', I18nScope()))]), m('.w-col.w-col-7', [m('.fontsize-megajumbo.fontcolor-negative', 'R$ ' + (category.total_successful_value ? h.formatNumber(category.total_successful_value, 2, 3) : '...')), m('.fontsize-large.u-marginbottom-20', 'Doados para projetos'), m('.fontsize-megajumbo.fontcolor-negative', category.successful_projects ? category.successful_projects : '...'), m('.fontsize-large.u-marginbottom-30', 'Projetos financiados')])];
            }) :
            // !_.isEmpty(ctrl.featuredProjects()) ? _.map(ctrl.featuredProjects(), (project) => {
            //     return !_.isUndefined(project) ? m('.w-row.u-marginbottom-10', [
            //         m('.w-col.w-col-1', [
            //             m(`img.user-avatar[src="${project.userThumb}"]`)
            //         ]),
            //         m('.w-col.w-col-11', [
            //             m('.fontsize-base.fontweight-semibold', project.user.name),
            //             m('.fontsize-smallest', [
            //                 I18n.t('categories.pledged', I18nScope({pledged: h.formatNumber(project.pledged), contributors: project.total_contributors})),
            //                 m(`a.link-hidden[href="/${project.permalink}"]`, project.name)
            //             ])
            //         ])
            //     ]) : m('.fontsize-base', I18n.t('categories.loading_featured', I18nScope()));
            // }) : m('.fontsize-base', I18n.t('categories.no_featured', I18nScope())),
            '')])])])])]), m.component(c.Slider, {
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

            var l = m.postgrest.loader(_.extend({}, { data: data }, builder.requestOptions), m.request),
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
 * window.c.AonAdminProjectDetailsExplanation component
 * render an explanation about project all or nothing project mde.
 *
 * Example:
 * m.component(c.AonAdminProjectDetailsExplanation, {
 *     project: projectDetail Object,
 * })
 */
'use strict';

window.c.AonAdminProjectDetailsExplanation = (function (m, h) {
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
 * window.c.FlexAdminProjectDetailsExplanation component
 * render an explanation about project flex project mde.
 *
 * Example:
 * m.component(c.FlexAdminProjectDetailsExplanation, {
 *     project: projectDetail Object,
 * })
 */
'use strict';

window.c.FlexAdminProjectDetailsExplanation = (function (m, h, _) {
    return {
        controller: function controller(args) {
            var explanation = function explanation(resource) {
                var stateText = {
                    online: [_.isNull(resource.expires_at) ? m('span', [m('a.alt-link[href="/projects/' + resource.id + '/edit#announce_expiration"]', 'Quero iniciar'), ' a reta final de 7 dias']) : m('span', 'Você recebe tudo que arrecadar até as ' + h.momentify(resource.zone_expires_at, 'HH:mm:ss') + ' de ' + h.momentify(resource.zone_expires_at))],
                    successful: [m('span.fontweight-semibold', resource.user.name + ', comemore que você merece!'), ' Seu projeto foi bem sucedido e agora é a hora de iniciar o trabalho de relacionamento com seus apoiadores! ', 'Atenção especial à entrega de recompensas. Prometeu? Entregue! Não deixe de olhar a seção de pós-projeto do ', m('a.alt-link[href="/guides"]', 'Guia dos Realizadores'), ' e de informar-se sobre ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="_blank"]', 'como o repasse do dinheiro será feito.')],
                    waiting_funds: [m('span.fontweight-semibold', resource.user.name + ', estamos processando os últimos pagamentos!'), ' Seu projeto foi finalizado em ' + h.momentify(resource.zone_expires_at) + ' e está aguardando confirmação de boletos e pagamentos. ', 'Devido à data de vencimento de boletos, projetos que tiveram apoios de última hora ficam por até 4 dias úteis nesse status, contados a partir da data de finalização do projeto. ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="_blank"]', 'Entenda como o repasse de dinheiro é feito para projetos bem sucedidos.')],
                    rejected: [m('span.fontweight-semibold', resource.user.name + ', infelizmente não foi desta vez.'), ' Você enviou seu projeto para análise do Catarse e entendemos que ele não está de acordo com o perfil do site. ', 'Ter um projeto recusado não impede que você envie novos projetos para avaliação ou reformule seu projeto atual. ', 'Converse com nosso atendimento! Recomendamos que você dê uma boa olhada nos ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos"][target="_blank"]', 'critérios da plataforma'), ' e no ', m('a.alt-link[href="/guides"]', 'guia dos realizadores'), '.'],
                    draft: [m('span.fontweight-semibold', resource.user.name + ', construa o seu projeto!'), ' Quanto mais cuidadoso e bem formatado for um projeto, maiores as chances de ele ser bem sucedido na sua campanha de captação. ', 'Antes de enviar seu projeto para a nossa análise, preencha todas as abas ao lado com carinho. Você pode salvar as alterações e voltar ao rascunho de projeto quantas vezes quiser. ', 'Quando tudo estiver pronto, clique no botão PUBLICAR.']
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
})(window.m, window.c.h, window._);
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
            var project = args.project,
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
            }, [m('p.fontsize-base', [m('strong', 'O projeto')]), m('.fontsize-base[itemprop="about"]', m.trust(project.about_html)), project.budget ? [m('p.fontsize-base.fontweight-semibold', 'Orçamento'), m('p.fontsize-base', m.trust(project.budget))] : '']), m('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', !_.isEmpty(args.rewardDetails()) ? [m('.fontsize-base.fontweight-semibold.u-marginbottom-30', 'Recompensas'), m.component(c.ProjectRewardList, {
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
            var project = args.project;
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
            var optionalOpt = project.mode === 'flex' ? m('span.fontsize-smallest.fontcolor-secondary', ' (opcional)') : '';

            ctrl.body.className = ctrl.bodyToggleForNav();

            return m('#project-nav', [m('.project-nav-wrapper', [m('nav.w-section.dashboard-nav.side', [m('a#dashboard_preview_link.w-inline-block.dashboard-project-name[href="' + (project.is_published ? '/' + project.permalink : editRoute + '#preview') + '"]', [m('img.thumb-project-dashboard[src="' + (_.isNull(project.large_image) ? '/assets/thumb-project.png' : project.large_image) + '"][width="114"]'), m('.fontcolor-negative.lineheight-tight.fontsize-small', project.name), m('img.u-margintop-10[src="/assets/catarse_bootstrap/badge-' + project.mode + '-h.png"][width=80]')]), m('#info-links', [m('a#dashboard_home_link[class="dashboard-nav-link-left ' + (h.locationActionMatch('insights') ? 'selected' : '') + '"][href="' + projectRoute + '/insights"]', [m('span.fa.fa-bar-chart.fa-lg.fa-fw'), ' Minha Campanha']), project.is_published ? [m('a#dashboard_reports_link.dashboard-nav-link-left[href="' + editRoute + '#reports' + '"]', [m('span.fa.fa.fa-table.fa-lg.fa-fw'), ' Relatórios de apoios']), m('a#dashboard_reports_link.dashboard-nav-link-left.u-marginbottom-30[href="' + editRoute + '#posts' + '"]', [m('span.fa.fa-bullhorn.fa-fw.fa-lg'), ' Novidades ', m('span.badge', project.posts_count)])] : '']), m('.edit-project-div', [!project.is_published ? '' : m('button#toggle-edit-menu.dashboard-nav-link-left', {
                onclick: ctrl.editLinksToggle.toggle
            }, [m('span.fa.fa-pencil.fa-fw.fa-lg'), ' Editar projeto']), ctrl.editLinksToggle() ? m('#edit-menu-items', [m('#dashboard-links', [!project.is_published || project.is_admin_role ? [m('a#basics_link[class="' + editLinkClass + '"][href="' + editRoute + '#basics' + '"]', 'Básico'), m('a#goal_link[class="' + editLinkClass + '"][href="' + editRoute + '#goal' + '"]', 'Financiamento')] : '', m('a#description_link[class="' + editLinkClass + '"][href="' + editRoute + '#description' + '"]', 'Descrição'), m('a#video_link[class="' + editLinkClass + '"][href="' + editRoute + '#video' + '"]', ['Vídeo', optionalOpt]), m('a#budget_link[class="' + editLinkClass + '"][href="' + editRoute + '#budget' + '"]', ['Orçamento', optionalOpt]), m('a#card_link[class="' + editLinkClass + '"][href="' + editRoute + '#card' + '"]', 'Card do projeto'), m('a#dashboard_reward_link[class="' + editLinkClass + '"][href="' + editRoute + '#reward' + '"]', ['Recompensas', optionalOpt]), m('a#dashboard_user_about_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_about' + '"]', 'Sobre você'), project.mode === 'flex' || project.is_published || project.state === 'approved' || project.is_admin_role ? [m('a#dashboard_user_settings_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_settings' + '"]', 'Conta')] : '', !project.is_published ? [m('a#dashboard_preview_link[class="' + editLinkClass + '"][href="' + editRoute + '#preview' + '"]', [m('span.fa.fa-fw.fa-eye.fa-lg'), ' Preview'])] : ''])]) : '', !project.is_published ? [m('.btn-send-draft-fixed', project.mode === 'aon' ? [project.state === 'draft' ? m('a.btn.btn-medium[href="/projects/' + project.id + '/send_to_analysis"]', 'Enviar') : '', project.state === 'approved' ? m('a.btn.btn-medium[href="/projects/' + project.id + '/publish"]', ['Publicar', m.trust('&nbsp;&nbsp;'), m('span.fa.fa-chevron-right')]) : ''] : [project.state === 'draft' ? m('a.btn.btn-medium[href="/projects/' + project.id + '/edit#preview"]', ['Publicar', m.trust('&nbsp;&nbsp;'), m('span.fa.fa-chevron-right')]) : ''])] : [project.mode === 'flex' ? [m('.btn-send-draft-fixed', _.isNull(project.expires_at) ? m('a.w-button.btn.btn-small.btn-secondary-dark[href="/projects/' + project.id + '/edit#announce_expiration"]', 'Iniciar reta final') : '')] : '']])])]), m('a.btn-dashboard href="js:void(0);"', {
                onclick: ctrl.bodyToggleForNav.toggle
            }, [m('span.fa.fa-bars.fa-lg')])]);
        }
    };
})(window.m, window._, window.c.h);
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

window.c.ProjectHeader = (function (m, c) {
    return {
        view: function view(ctrl, args) {
            var project = args.project;
            return m('#project-header', [m('.w-section.section-product.' + project.mode), m('.w-section.page-header.u-text-center', [m('.w-container', [m('h1.fontsize-larger.fontweight-semibold.project-name[itemprop="name"]', project.name), m('h2.fontsize-base.lineheight-looser[itemprop="author"]', ['por ', project.user.name])])]), m('.w-section.project-main', [m('.w-container', [m('.w-row.project-main', [m('.w-col.w-col-8.project-highlight', m.component(c.ProjectHighlight, {
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
            }), m('.project-blurb', project.headline), m('.u-text-center-small-only.u-marginbottom-30', [!_.isNull(project.address) ? m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light.u-marginbottom-10[href="/pt/explore?pg_search=' + project.address.state_acronym + '"]', [m('span.fa.fa-map-marker'), ' ' + project.address.city + ', ' + project.address.state_acronym]) : '', m('a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light[href="/pt/explore#by_category_id/' + project.category_id + '"]', [m('span.fa.fa-tag'), ' ', project.category_name]), m('button#share-box.btn.btn-small.btn-terciary.btn-inline', {
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
        controller: function controller(args) {
            var project = args.project,
                mode = project.mode,
                tooltipText = mode === 'aon' ? 'Somente receberá os recursos se atingir ou ultrapassar a meta até o dia ' + h.momentify(project.zone_expires_at, 'DD/MM/YYYY') + '.' : 'O realizador receberá todos os recursos quando encerrar a campanha, mesmo que não tenha atingido esta meta.';

            return {
                mode: mode,
                tooltipText: tooltipText
            };
        },
        view: function view(ctrl, args) {
            var mode = ctrl.mode,
                modeImgSrc = mode === 'aon' ? '/assets/aon-badge.png' : '/assets/flex-badge.png',
                modeTitle = mode === 'aon' ? 'Campanha Tudo-ou-nada ' : 'Campanha Flexível ',
                goal = _.isNull(args.project.goal) ? 'não definida' : h.formatNumber(args.project.goal),
                tooltip = function tooltip(el) {
                return m.component(c.Tooltip, {
                    el: el,
                    text: ctrl.tooltipText,
                    width: 280
                });
            };

            return m('#' + mode + '.w-row', [m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [m('img[src="' + modeImgSrc + '"][width=\'30\']')]), m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [m('.fontsize-smaller.fontweight-semibold', 'Meta R$ ' + goal), m('.w-inline-block.fontsize-smallest._w-inline-block', [modeTitle, tooltip('span.w-inline-block.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary')])])]);
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
                storeReminderName = 'remind_' + project.id,
                l = m.prop(false),
                popNotification = m.prop(false),
                submitReminder = function submitReminder() {
                if (!h.getUser()) {
                    h.storeAction(storeReminderName, submitReminder);
                    return h.navigateToDevise();
                }
                var loaderOpts = project.in_reminder ? models.projectReminder.deleteOptions(filterVM.parameters()) : models.projectReminder.postOptions({
                    project_id: project.id
                });
                l = m.postgrest.loaderWithToken(loaderOpts);

                l.load().then(function () {
                    project.in_reminder = !project.in_reminder;

                    if (project.in_reminder) {
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

            return m('#project-reminder' + mainClass, [m('button[class="' + buttonClass + ' ' + (project.in_reminder ? 'link-hidden-success' : 'fontcolor-secondary') + ' fontweight-semibold"]', {
                onclick: ctrl.submitReminder
            }, [ctrl.l() ? 'aguarde ...' : m('span.fa.fa-clock-o', [m('span' + (hideTextOnMobile ? '.w-hidden-medium' : ''), project.in_reminder ? ' Lembrete ativo' : ' Lembrar-me')])]), ctrl.popNotification() ? m.component(c.PopNotification, {
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
            }, 'Fechar'), m('.fontsize-small.fontweight-semibold.u-marginbottom-30', 'Compartilhe este projeto')]), m('.w-widget.w-widget-facebook.w-hidden-small.w-hidden-tiny.share-block', [m('iframe[allowtransparency="true"][width="150px"][height="22px"][frameborder="0"][scrolling="no"][src="https://www.facebook.com/v2.0/plugins/share_button.php?app_id=173747042661491&channel=https%3A%2F%2Fs-static.ak.facebook.com%2Fconnect%2Fxd_arbiter%2F44OwK74u0Ie.js%3Fversion%3D41%23cb%3Df7d9b900c%26domain%3Dwww.catarse.me%26origin%3Dhttps%253A%252F%252Fwww.catarse.me%252Ff4b3ad0c8%26relation%3Dparent.parent&container_width=0&href=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project.permalink + '%3Fref%3Dfacebook&layout=button_count&locale=pt_BR&sdk=joey"]')]), m('.w-widget.w-widget-twitter.w-hidden-small.w-hidden-tiny.share-block', [m('iframe[allowtransparency="true"][width="120px"][height="22px"][frameborder="0"][scrolling="no"][src="//platform.twitter.com/widgets/tweet_button.8d007ddfc184e6776be76fe9e5e52d69.en.html#_=1442425984936&count=horizontal&dnt=false&id=twitter-widget-1&lang=en&original_referer=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project.permalink + '&size=m&text=Confira%20o%20projeto%20' + args.project.name + '%20no%20%40catarse&type=share&url=https%3A%2F%2Fwww.catarse.me%2Fpt%2F' + args.project.permalink + '%3Fref%3Dtwitter&via=catarse"]')]), m('a.w-hidden-small.widget-embed.w-hidden-tiny.fontsize-small.link-hidden.fontcolor-secondary[href="js:void(0);"]', {
                onclick: ctrl.displayEmbed.toggle
            }, '< embed >'), ctrl.displayEmbed() ? m('.embed-expanded.u-margintop-30', [m('.fontsize-small.fontweight-semibold.u-marginbottom-20', 'Insira um widget em seu site'), m('.w-form', [m('input.w-input[type="text"][value="<iframe frameborder="0" height="314px" src="https://www.catarse.me/pt/projects/' + args.project.id + '/embed" width="300px" scrolling="no"></iframe>"]')]), m('.card-embed', [m('iframe[frameborder="0"][height="350px"][src="/projects/' + args.project.id + '/embed"][width="300px"][scrolling="no"]')])]) : '', m('a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-fb.u-marginbottom-20[href="http://www.facebook.com/sharer/sharer.php?u=https://www.catarse.me/' + args.project.permalink + '?ref=facebook&title=' + args.project.name + '"][target="_blank"]', [m('span.fa.fa-facebook'), ' Compartilhe']), m('a.w-hidden-main.w-hidden-medium.btn.btn-medium.btn-tweet.u-marginbottom-20[href="http://twitter.com/?status=Acabei de apoiar o projeto ' + args.project.name + ' htts://www.catarse.me/' + args.project.permalink + '?ref=twitterr"][target="_blank"]', [m('span.fa.fa-twitter'), ' Tweet'])]);
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
                            pledgedIncrement = project.pledged / project.progress,
                            contributorsIncrement = project.total_contributors / project.progress;

                        var progressBar = document.getElementById('progressBar'),
                            pledgedEl = document.getElementById('pledged'),
                            contributorsEl = document.getElementById('contributors'),
                            animate = function animate() {
                            animation = setInterval(incrementProgress, 28);
                        },
                            incrementProgress = function incrementProgress() {
                            if (progress <= parseInt(project.progress)) {
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

                return states[project.state] ? 'card u-radius zindex-10 ' + states[project.state] : '';
            },
                displayStatusText = function displayStatusText() {
                var states = {
                    'approved': I18n.t('display_status.approved', I18nScope()),
                    'online': h.existy(project.zone_expires_at) ? I18n.t('display_status.online', I18nScope({ date: h.momentify(project.zone_expires_at) })) : '',
                    'failed': I18n.t('display_status.failed', I18nScope({ date: h.momentify(project.zone_expires_at), goal: project.goal })),
                    'rejected': I18n.t('display_status.rejected', I18nScope()),
                    'in_analysis': I18n.t('display_status.in_analysis', I18nScope()),
                    'successful': I18n.t('display_status.successful', I18nScope({ date: h.momentify(project.zone_expires_at) })),
                    'waiting_funds': I18n.t('display_status.waiting_funds', I18nScope()),
                    'draft': I18n.t('display_status.draft', I18nScope())
                };

                return states[project.state];
            };

            return {
                animateProgress: animateProgress,
                displayCardClass: displayCardClass,
                displayStatusText: displayStatusText
            };
        },

        view: function view(ctrl, args) {
            var project = args.project,
                elapsed = project.elapsed_time,
                remaining = project.remaining_time;

            return m('#project-sidebar.aside', [m('.project-stats', [m('.project-stats-inner', [m('.project-stats-info', [m('.u-marginbottom-20', [m('#pledged.fontsize-largest.fontweight-semibold.u-text-center-small-only', 'R$ ' + h.formatNumber(project.pledged)), m('.fontsize-small.u-text-center-small-only', [I18n.t('contributors_call', I18nScope()), m('span#contributors.fontweight-semibold', I18n.t('contributors_count', I18nScope({ count: project.total_contributors }))), !project.expires_at ? ' em ' + I18n.t('datetime.distance_in_words.x_' + elapsed.unit, { count: elapsed.total }, I18nScope()) : ''])]), m('.meter', [m('#progressBar.meter-fill', {
                style: {
                    width: project.progress + '%'
                }
            })]), m('.w-row.u-margintop-10', [m('.w-col.w-col-5.w-col-small-6.w-col-tiny-6', [m('.fontsize-small.fontweight-semibold.lineheight-tighter', parseInt(project.progress) + '%')]), m('.w-col.w-col-7.w-col-small-6.w-col-tiny-6.w-clearfix', [m('.u-right.fontsize-small.lineheight-tighter', remaining.total ? [m('span.fontweight-semibold', remaining.total), I18n.t('remaining_time.' + remaining.unit, I18nScope({ count: remaining.total }))] : '')])])]), m('.w-row', [m.component(c.ProjectMode, {
                project: project
            })])]), project.open_for_contributions ? m('a#contribute_project_form.btn.btn-large.u-marginbottom-20[href="/projects/' + project.id + '/contributions/new"]', I18n.t('submit', I18nScope())) : '', project.open_for_contributions ? m.component(c.ProjectReminder, {
                project: project,
                type: 'link'
            }) : '', m('div[class="fontsize-smaller u-marginbottom-30 ' + ctrl.displayCardClass() + '"]', ctrl.displayStatusText())]), m('.user-c', m.component(c.ProjectUserCard, {
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

            var mainClass = !ctrl.isFixed() || project.is_owner_or_admin ? '.w-section.project-nav' : '.w-section.project-nav.project-nav-fixed';

            return m('nav-wrapper', [m(mainClass, {
                config: ctrl.navDisplay
            }, [m('.w-container', [m('.w-row', [m('.w-col.w-col-8', [!_.isEmpty(rewards()) ? m('a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf ' + (h.hashMatch('#rewards') ? 'selected' : '') + '"][href="#rewards"]', {
                style: 'float: left;'
            }, 'Recompensas') : m('a[id="rewards-link"][class="w-hidden-main w-hidden-medium dashboard-nav-link mf ' + (h.hashMatch('#contribution_suggestions') ? 'selected' : '') + '"][href="#contribution_suggestions"]', {
                style: 'float: left;'
            }, 'Valores Sugeridos'), m('a[id="about-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#about') || h.hashMatch('') ? 'selected' : '') + ' "][href="#about"]', {
                style: 'float: left;'
            }, 'Sobre'), m('a[id="posts-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#posts') ? 'selected' : '') + '"][href="#posts"]', {
                style: 'float: left;'
            }, ['Novidades ', m('span.badge', project.posts_count)]), m('a[id="contributions-link"][class="w-hidden-small w-hidden-tiny dashboard-nav-link mf ' + (h.hashMatch('#contributions') ? 'selected' : '') + '"][href="#contributions"]', {
                style: 'float: left;'
            }, ['Apoios ', m('span.badge.w-hidden-small.w-hidden-tiny', project.total_contributions)]), m('a[id="comments-link"][class="dashboard-nav-link mf ' + (h.hashMatch('#comments') ? 'selected' : '') + '"][href="#comments"]', {
                style: 'float: left;'
            }, ['Comentários ', m('fb:comments-count[href="http://www.catarse.me/' + project.permalink + '"][class="badge project-fb-comment w-hidden-small w-hidden-tiny"][style="display: inline"]', m.trust('&nbsp;'))])]), m('.w-col.w-col-4.w-hidden-small.w-hidden-tiny', project.open_for_contributions ? [m('.w-row.project-nav-back-button', [m('.w-col.w-col-6.w-col-medium-8', [m('a.w-button.btn[href="/projects/' + project.id + '/contributions/new"]', 'Apoiar ‍este projeto')]), m('.w-col.w-col-6.w-col-medium-4', [m.component(c.ProjectReminder, { project: project, type: 'button', hideTextOnMobile: true })])])] : '')])])]), ctrl.isFixed() && !project.is_owner_or_admin ? m('.w-section.project-nav') : '']);
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
            }, [m('.w-icon-slider-left.fa.fa-chevron-left.fontcolor-terciary')]), m('#slide-next.w-slider-arrow-right.w-hidden-small.w-hidden-tiny', {
                onclick: function onclick() {
                    return sliderClick(ctrl.incrementSlide);
                }
            }, [m('.w-icon-slider-right.fa.fa-chevron-right.fontcolor-terciary')]), m('.w-slider-nav.w-slider-nav-invert.w-round.slide-nav', _(args.slides.length).times(function (idx) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImMuanMiLCJoLmpzIiwibW9kZWxzLmpzIiwiZmxleC5qcyIsImluc2lnaHRzLmpzIiwiam9icy5qcyIsImxpdmUtc3RhdGlzdGljcy5qcyIsInByb2plY3RzLWRhc2hib2FyZC5qcyIsInByb2plY3RzLWV4cGxvcmUuanMiLCJwcm9qZWN0cy1ob21lLmpzIiwicHJvamVjdHMtc2hvdy5qcyIsInN0YXJ0LmpzIiwidGVhbS5qcyIsInVzZXJzLWJhbGFuY2UuanMiLCJhZG1pbi1jb250cmlidXRpb24tZGV0YWlsLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLWl0ZW0uanMiLCJhZG1pbi1jb250cmlidXRpb24tdXNlci5qcyIsImFkbWluLWNvbnRyaWJ1dGlvbi5qcyIsImFkbWluLWV4dGVybmFsLWFjdGlvbi5qcyIsImFkbWluLWZpbHRlci5qcyIsImFkbWluLWlucHV0LWFjdGlvbi5qcyIsImFkbWluLWl0ZW0uanMiLCJhZG1pbi1saXN0LmpzIiwiYWRtaW4tbm90aWZpY2F0aW9uLWhpc3RvcnkuanMiLCJhZG1pbi1wcm9qZWN0LWRldGFpbHMtY2FyZC5qcyIsImFkbWluLXByb2plY3QuanMiLCJhZG1pbi1yYWRpby1hY3Rpb24uanMiLCJhZG1pbi1yZXNldC1wYXNzd29yZC5qcyIsImFkbWluLXJld2FyZC5qcyIsImFkbWluLXRyYW5zYWN0aW9uLWhpc3RvcnkuanMiLCJhZG1pbi10cmFuc2FjdGlvbi5qcyIsImFkbWluLXVzZXItZGV0YWlsLmpzIiwiYWRtaW4tdXNlci1pdGVtLmpzIiwiYWRtaW4tdXNlci5qcyIsImFvbi1hZG1pbi1wcm9qZWN0LWRldGFpbHMtZXhwbGFuYXRpb24uanMiLCJjYXRlZ29yeS1idXR0b24uanMiLCJmaWx0ZXItYnV0dG9uLmpzIiwiZmlsdGVyLWRhdGUtcmFuZ2UuanMiLCJmaWx0ZXItZHJvcGRvd24uanMiLCJmaWx0ZXItbWFpbi5qcyIsImZpbHRlci1udW1iZXItcmFuZ2UuanMiLCJmbGV4LXByb2plY3QtZGV0YWlscy1leHBsYW5hdGlvbi5qcyIsImxhbmRpbmctcWEuanMiLCJsYW5kaW5nLXNpZ251cC5qcyIsIm1vZGFsLWJveC5qcyIsInBheW1lbnQtc3RhdHVzLmpzIiwicG9wLW5vdGlmaWNhdGlvbi5qcyIsInByb2plY3QtYWJvdXQuanMiLCJwcm9qZWN0LWNhcmQuanMiLCJwcm9qZWN0LWNvbW1lbnRzLmpzIiwicHJvamVjdC1jb250cmlidXRpb25zLmpzIiwicHJvamVjdC1kYXNoYm9hcmQtbWVudS5qcyIsInByb2plY3QtZGF0YS1jaGFydC5qcyIsInByb2plY3QtZGF0YS10YWJsZS5qcyIsInByb2plY3QtaGVhZGVyLmpzIiwicHJvamVjdC1oaWdobGlnaHQuanMiLCJwcm9qZWN0LW1haW4uanMiLCJwcm9qZWN0LW1vZGUuanMiLCJwcm9qZWN0LXBvc3RzLmpzIiwicHJvamVjdC1yZW1pbmRlci1jb3VudC5qcyIsInByb2plY3QtcmVtaW5kZXIuanMiLCJwcm9qZWN0LXJld2FyZC1saXN0LmpzIiwicHJvamVjdC1yb3cuanMiLCJwcm9qZWN0LXNoYXJlLWJveC5qcyIsInByb2plY3Qtc2lkZWJhci5qcyIsInByb2plY3Qtc3VnZ2VzdGVkLWNvbnRyaWJ1dGlvbnMuanMiLCJwcm9qZWN0LXRhYnMuanMiLCJwcm9qZWN0LXVzZXItY2FyZC5qcyIsInNsaWRlci5qcyIsInRlYW0tbWVtYmVycy5qcyIsInRlYW0tdG90YWwuanMiLCJ0b29sdGlwLmpzIiwidXNlci1iYWxhbmNlLXJlcXVlc3QtbW9kYWwtY29udGVudC5qcyIsInVzZXItYmFsYW5jZS10cmFuc2FjdGlvbi1yb3cuanMiLCJ1c2VyLWJhbGFuY2UtdHJhbnNhY3Rpb25zLmpzIiwidXNlci1iYWxhbmNlLmpzIiwidXNlci1jYXJkLmpzIiwieW91dHViZS1saWdodGJveC5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMuanMiLCJhZG1pbi91c2Vycy5qcyIsInZtcy9wcm9qZWN0LWZpbHRlcnMuanMiLCJ2bXMvcHJvamVjdC5qcyIsInZtcy9zdGFydC5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMvY29udHJpYnV0aW9uLWZpbHRlci12bS5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMvY29udHJpYnV0aW9uLWxpc3Qtdm0uanMiLCJhZG1pbi91c2Vycy91c2VyLWZpbHRlci12bS5qcyIsImFkbWluL3VzZXJzL3VzZXItbGlzdC12bS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sQ0FBQyxDQUFDLEdBQUksQ0FBQSxZQUFNO0FBQ2QsV0FBTztBQUNILGNBQU0sRUFBRSxFQUFFO0FBQ1YsWUFBSSxFQUFFLEVBQUU7QUFDUixXQUFHLEVBQUUsRUFBRTtBQUNQLGFBQUssRUFBRSxFQUFFO0FBQ1QsU0FBQyxFQUFFLEVBQUU7S0FDUixDQUFDO0NBQ0wsQ0FBQSxFQUFFLEFBQUMsQ0FBQzs7O0FDUkwsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFLOzs7QUFHL0IsUUFBTSxTQUFTLEdBQUcsU0FBWixTQUFTLENBQUksR0FBRyxFQUFLO0FBQUUsZUFBTyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxHQUFHLENBQUM7S0FBRTtRQUMvRCxXQUFXLEdBQUcsU0FBZCxXQUFXLENBQUksSUFBSSxFQUFLO0FBQ3BCLFlBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDO1lBQ2pFLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEdBQUcsVUFBVSxHQUFHLFdBQVcsQ0FBQztZQUN2RCxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUMsZUFBTyxPQUFPLEtBQUssSUFBSSxHQUFHLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxH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QUksRUFBRSxTQUFTLEVBQUUsRUFBQyxRQUFRLEVBQUUsYUFBYSxFQUFDLENBQUMsQ0FBQztDQUN0RixDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxBQUFDLENBQUMiLCJmaWxlIjoiY2F0YXJzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIndpbmRvdy5jID0gKCgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBtb2RlbHM6IHt9LFxuICAgICAgICByb290OiB7fSxcbiAgICAgICAgdm1zOiB7fSxcbiAgICAgICAgYWRtaW46IHt9LFxuICAgICAgICBoOiB7fVxuICAgIH07XG59KCkpO1xuIiwid2luZG93LmMuaCA9ICgobSwgbW9tZW50LCBJMThuKSA9PiB7XG4gICAgLy9EYXRlIEhlbHBlcnNcblxuICAgIGNvbnN0IGhhc2hNYXRjaCA9IChzdHIpID0+IHsgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5oYXNoID09PSBzdHI7IH0sXG4gICAgICAgIHBhcmFtQnlOYW1lID0gKG5hbWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5vcm1hbE5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgJ1xcXFxbJykucmVwbGFjZSgvW1xcXV0vLCAnXFxcXF0nKSxcbiAgICAgICAgICAgICAgICByZWdleCA9IG5ldyBSZWdFeHAoJ1tcXFxcPyZdJyArIG5vcm1hbE5hbWUgKyAnPShbXiYjXSopJyksXG4gICAgICAgICAgICAgICAgcmVzdWx0cyA9IHJlZ2V4LmV4ZWMobG9jYXRpb24uc2VhcmNoKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzID09PSBudWxsID8gJycgOiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgJyAnKSk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldE1vbWVudGlmeUxvY2FsZSA9ICgpID0+IHtcbiAgICAgICAgICAgIG1vbWVudC5sb2NhbGUoJ3B0Jywge1xuICAgICAgICAgICAgICAgICAgICBtb250aHNTaG9ydDogJ2phbl9mZXZfbWFyX2Ficl9tYWlfanVuX2p1bF9hZ29fc2V0X291dF9ub3ZfZGV6Jy5zcGxpdCgnXycpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGV4aXN0eSA9ICh4KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geCAhPSBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vbWVudGlmeSA9IChkYXRlLCBmb3JtYXQpID0+IHtcbiAgICAgICAgICAgIGZvcm1hdCA9IGZvcm1hdCB8fCAnREQvTU0vWVlZWSc7XG4gICAgICAgICAgICByZXR1cm4gZGF0ZSA/IG1vbWVudChkYXRlKS5sb2NhbGUoJ3B0JykuZm9ybWF0KGZvcm1hdCkgOiAnbm8gZGF0ZSc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RvcmVBY3Rpb24gPSAoYWN0aW9uKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXNlc3Npb25TdG9yYWdlLmdldEl0ZW0oYWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKGFjdGlvbiwgYWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjYWxsU3RvcmVkQWN0aW9uID0gKGFjdGlvbiwgZnVuYykgPT4ge1xuICAgICAgICAgICAgaWYgKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oYWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIGZ1bmMuY2FsbCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKGFjdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzY3VzcyA9IChwYWdlLCBpZGVudGlmaWVyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkID0gZG9jdW1lbnQsXG4gICAgICAgICAgICAgICAgcyA9IGQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICAgICAgICB3aW5kb3cuZGlzcXVzX2NvbmZpZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFnZS51cmwgPSBwYWdlO1xuICAgICAgICAgICAgICAgIHRoaXMucGFnZS5pZGVudGlmaWVyID0gaWRlbnRpZmllcjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzLnNyYyA9ICcvL2NhdGFyc2VmbGV4LmRpc3F1cy5jb20vZW1iZWQuanMnO1xuICAgICAgICAgICAgcy5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGltZXN0YW1wJywgK25ldyBEYXRlKCkpO1xuICAgICAgICAgICAgKGQuaGVhZCB8fCBkLmJvZHkpLmFwcGVuZENoaWxkKHMpO1xuICAgICAgICAgICAgcmV0dXJuIG0oJycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vbWVudEZyb21TdHJpbmcgPSAoZGF0ZSwgZm9ybWF0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBldXJvcGVhbiA9IG1vbWVudChkYXRlLCBmb3JtYXQgfHwgJ0REL01NL1lZWVknKTtcbiAgICAgICAgICAgIHJldHVybiBldXJvcGVhbi5pc1ZhbGlkKCkgPyBldXJvcGVhbiA6IG1vbWVudChkYXRlKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0cmFuc2xhdGVkVGltZVVuaXRzID0ge1xuICAgICAgICAgICAgZGF5czogJ2RpYXMnLFxuICAgICAgICAgICAgbWludXRlczogJ21pbnV0b3MnLFxuICAgICAgICAgICAgaG91cnM6ICdob3JhcycsXG4gICAgICAgICAgICBzZWNvbmRzOiAnc2VndW5kb3MnXG4gICAgICAgIH0sXG4gICAgICAgIC8vT2JqZWN0IG1hbmlwdWxhdGlvbiBoZWxwZXJzXG4gICAgICAgIHRyYW5zbGF0ZWRUaW1lID0gKHRpbWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zbGF0ZWRUaW1lID0gdHJhbnNsYXRlZFRpbWVVbml0cyxcbiAgICAgICAgICAgICAgICB1bml0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm9qVW5pdCA9IHRyYW5zbGF0ZWRUaW1lW3RpbWUudW5pdCB8fCAnc2Vjb25kcyddO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAodGltZS50b3RhbCA8PSAxKSA/IHByb2pVbml0LnNsaWNlKDAsIC0xKSA6IHByb2pVbml0O1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdW5pdDogdW5pdCgpLFxuICAgICAgICAgICAgICAgIHRvdGFsOiB0aW1lLnRvdGFsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vTnVtYmVyIGZvcm1hdHRpbmcgaGVscGVyc1xuICAgICAgICBnZW5lcmF0ZUZvcm1hdE51bWJlciA9IChzLCBjKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKG51bWJlciwgbiwgeCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghXy5pc051bWJlcihudW1iZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHJlID0gJ1xcXFxkKD89KFxcXFxkeycgKyAoeCB8fCAzKSArICd9KSsnICsgKG4gPiAwID8gJ1xcXFxEJyA6ICckJykgKyAnKScsXG4gICAgICAgICAgICAgICAgICAgIG51bSA9IG51bWJlci50b0ZpeGVkKE1hdGgubWF4KDAsIH5+bikpO1xuICAgICAgICAgICAgICAgIHJldHVybiAoYyA/IG51bS5yZXBsYWNlKCcuJywgYykgOiBudW0pLnJlcGxhY2UobmV3IFJlZ0V4cChyZSwgJ2cnKSwgJyQmJyArIChzIHx8ICcsJykpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgZm9ybWF0TnVtYmVyID0gZ2VuZXJhdGVGb3JtYXROdW1iZXIoJy4nLCAnLCcpLFxuXG4gICAgICAgIHRvZ2dsZVByb3AgPSAoZGVmYXVsdFN0YXRlLCBhbHRlcm5hdGVTdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcCA9IG0ucHJvcChkZWZhdWx0U3RhdGUpO1xuICAgICAgICAgICAgcC50b2dnbGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHAoKChwKCkgPT09IGFsdGVybmF0ZVN0YXRlKSA/IGRlZmF1bHRTdGF0ZSA6IGFsdGVybmF0ZVN0YXRlKSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgfSxcblxuICAgICAgICBpZFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgIGlkOiAnZXEnXG4gICAgICAgIH0pLFxuXG4gICAgICAgIGdldFVzZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKSxcbiAgICAgICAgICAgICAgICBkYXRhID0gXy5maXJzdChib2R5KS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXNlcicpO1xuICAgICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGxvY2F0aW9uQWN0aW9uTWF0Y2ggPSAoYWN0aW9uKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhY3QgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5zbGljZSgtMSlbMF07XG4gICAgICAgICAgICByZXR1cm4gYWN0aW9uID09PSBhY3Q7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXNlQXZhdGFyT3JEZWZhdWx0ID0gKGF2YXRhclBhdGgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhdmF0YXJQYXRoIHx8ICcvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL3VzZXIuanBnJztcbiAgICAgICAgfSxcblxuICAgICAgICAvL1RlbXBsYXRlc1xuICAgICAgICBsb2FkZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW50b3AtMzAgdS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgbSgnaW1nW2FsdD1cIkxvYWRlclwiXVtzcmM9XCJodHRwczovL3MzLmFtYXpvbmF3cy5jb20vY2F0YXJzZS5maWxlcy9sb2FkZXIuZ2lmXCJdJylcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5ld0ZlYXR1cmVCYWRnZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCdzcGFuLmJhZGdlLmJhZGdlLXN1Y2Nlc3MubWFyZ2luLXNpZGUtNScsIEkxOG4udCgncHJvamVjdHMubmV3X2ZlYXR1cmVfYmFkZ2UnKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmJQYXJzZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRyeVBhcnNlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5GQi5YRkJNTC5wYXJzZSgpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5zZXRUaW1lb3V0KHRyeVBhcnNlLCA1MDApOyAvL3VzZSB0aW1lb3V0IHRvIHdhaXQgYXN5bmMgb2YgZmFjZWJvb2tcbiAgICAgICAgfSxcblxuICAgICAgICBwbHVyYWxpemUgPSAoY291bnQsIHMsIHApID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoY291bnQgPiAxID8gY291bnQgKyBwIDogY291bnQgKyBzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaW1wbGVGb3JtYXQgPSAoc3RyID0gJycpID0+IHtcbiAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXHJcXG4/LywgJ1xcbicpO1xuICAgICAgICAgICAgaWYgKHN0ci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcblxcbisvZywgJzwvcD48cD4nKTtcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxuL2csICc8YnIgLz4nKTtcbiAgICAgICAgICAgICAgICBzdHIgPSAnPHA+JyArIHN0ciArICc8L3A+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmV3YXJkU291bGRPdXQgPSAocmV3YXJkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgPiAwID9cbiAgICAgICAgICAgICAgICAocmV3YXJkLnBhaWRfY291bnQgKyByZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50ID49IHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMpIDogZmFsc2UpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJld2FyZFJlbWFuaW5nID0gKHJld2FyZCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgLSAocmV3YXJkLnBhaWRfY291bnQgKyByZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBwYXJzZVVybCA9IChocmVmKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgbC5ocmVmID0gaHJlZjtcbiAgICAgICAgICAgIHJldHVybiBsO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1peHBhbmVsVHJhY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5DYXRhcnNlTWl4cGFuZWwuYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIFVJSGVscGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCAmJiAkKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5VSUhlbHBlci5zZXR1cFJlc3BvbnNpdmVJZnJhbWVzKCQoZWwpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvQW5jaG9yID0gKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChoYXNoID09PSBlbC5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGVsLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZhbGlkYXRlRW1haWwgPSAoZW1haWwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlID0gL14oKFtePD4oKVtcXF1cXC4sOzpcXHNAXFxcIl0rKFxcLltePD4oKVtcXF1cXC4sOzpcXHNAXFxcIl0rKSopfChcXFwiLitcXFwiKSlAKChbXjw+KClbXFxdXFwuLDs6XFxzQFxcXCJdK1xcLikrW148PigpW1xcXVxcLiw7Olxcc0BcXFwiXXsyLH0pJC9pO1xuICAgICAgICAgICAgcmV0dXJuIHJlLnRlc3QoZW1haWwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5hdmlnYXRlVG9EZXZpc2UgPSAoKSA9PiB7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvcHQvbG9naW4nO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGN1bXVsYXRpdmVPZmZzZXQgPSAoZWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IHRvcCA9IDAsIGxlZnQgPSAwO1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIHRvcCArPSBlbGVtZW50Lm9mZnNldFRvcCAgfHwgMDtcbiAgICAgICAgICAgICAgICBsZWZ0ICs9IGVsZW1lbnQub2Zmc2V0TGVmdCB8fCAwO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50Lm9mZnNldFBhcmVudDtcbiAgICAgICAgICAgIH0gd2hpbGUgKGVsZW1lbnQpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRvcDogdG9wLFxuICAgICAgICAgICAgICAgIGxlZnQ6IGxlZnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xvc2VGbGFzaCA9ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2ljb24tY2xvc2UnKVswXTtcbiAgICAgICAgICAgIGlmIChfLmlzRWxlbWVudChlbCkpe1xuICAgICAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgICAgICBlbC5wYXJlbnRFbGVtZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGkxOG5TY29wZSA9IChzY29wZSwgb2JqKSA9PiB7XG4gICAgICAgICAgICBvYmogPSBvYmogfHwge307XG4gICAgICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIG9iaiwge3Njb3BlOiBzY29wZX0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGF1dGhlbnRpY2l0eVRva2VuID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWV0YSA9IF8uZmlyc3QoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW25hbWU9Y3NyZi10b2tlbl0nKSk7XG4gICAgICAgICAgICByZXR1cm4gbWV0YSA/IG1ldGEuY29udGVudCA6IHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgYW5pbWF0ZVNjcm9sbFRvID0gKGVsKSA9PiB7XG4gICAgICAgICAgICBsZXQgc2Nyb2xsZWQgPSB3aW5kb3cuc2Nyb2xsWTtcblxuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gY3VtdWxhdGl2ZU9mZnNldChlbCkudG9wLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uID0gMzAwLFxuICAgICAgICAgICAgICAgIGRGcmFtZSA9IChvZmZzZXQgLSBzY3JvbGxlZCkgLyBkdXJhdGlvbixcbiAgICAgICAgICAgICAgICAvL0Vhc2VJbk91dEN1YmljIGVhc2luZyBmdW5jdGlvbi4gV2UnbGwgYWJzdHJhY3QgYWxsIGFuaW1hdGlvbiBmdW5zIGxhdGVyLlxuICAgICAgICAgICAgICAgIGVhc2VkID0gKHQpID0+IHQgPCAuNSA/IDQgKiB0ICogdCAqIHQgOiAodCAtIDEpICogKDIgKiB0IC0gMikgKiAoMiAqIHQgLSAyKSArIDEsXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgcG9zID0gZWFzZWQoc2Nyb2xsZWQgLyBvZmZzZXQpICogc2Nyb2xsZWQ7XG5cbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnNjcm9sbFRvKDAsIHBvcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNjcm9sbGVkID49IG9mZnNldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChhbmltYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsZWQgPSBzY3JvbGxlZCArIGRGcmFtZTtcbiAgICAgICAgICAgICAgICB9LCAxKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2Nyb2xsVG8gPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZXRUcmlnZ2VyID0gKGVsLCBhbmNob3JJZCkgPT4ge1xuICAgICAgICAgICAgICAgIGVsLm9uY2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFuY2hvckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYW5jaG9ySWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChfLmlzRWxlbWVudChhbmNob3JFbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGVTY3JvbGxUbyhhbmNob3JFbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VHJpZ2dlcihlbCwgZWwuaGFzaC5zbGljZSgxKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgIHNldE1vbWVudGlmeUxvY2FsZSgpO1xuICAgIGNsb3NlRmxhc2goKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGF1dGhlbnRpY2l0eVRva2VuOiBhdXRoZW50aWNpdHlUb2tlbixcbiAgICAgICAgY3VtdWxhdGl2ZU9mZnNldDogY3VtdWxhdGl2ZU9mZnNldCxcbiAgICAgICAgZGlzY3VzczogZGlzY3VzcyxcbiAgICAgICAgZXhpc3R5OiBleGlzdHksXG4gICAgICAgIHZhbGlkYXRlRW1haWw6IHZhbGlkYXRlRW1haWwsXG4gICAgICAgIG1vbWVudGlmeTogbW9tZW50aWZ5LFxuICAgICAgICBtb21lbnRGcm9tU3RyaW5nOiBtb21lbnRGcm9tU3RyaW5nLFxuICAgICAgICBmb3JtYXROdW1iZXI6IGZvcm1hdE51bWJlcixcbiAgICAgICAgaWRWTTogaWRWTSxcbiAgICAgICAgZ2V0VXNlcjogZ2V0VXNlcixcbiAgICAgICAgdG9nZ2xlUHJvcDogdG9nZ2xlUHJvcCxcbiAgICAgICAgbG9hZGVyOiBsb2FkZXIsXG4gICAgICAgIG5ld0ZlYXR1cmVCYWRnZTogbmV3RmVhdHVyZUJhZGdlLFxuICAgICAgICBmYlBhcnNlOiBmYlBhcnNlLFxuICAgICAgICBwbHVyYWxpemU6IHBsdXJhbGl6ZSxcbiAgICAgICAgc2ltcGxlRm9ybWF0OiBzaW1wbGVGb3JtYXQsXG4gICAgICAgIHRyYW5zbGF0ZWRUaW1lOiB0cmFuc2xhdGVkVGltZSxcbiAgICAgICAgcmV3YXJkU291bGRPdXQ6IHJld2FyZFNvdWxkT3V0LFxuICAgICAgICByZXdhcmRSZW1hbmluZzogcmV3YXJkUmVtYW5pbmcsXG4gICAgICAgIHBhcnNlVXJsOiBwYXJzZVVybCxcbiAgICAgICAgaGFzaE1hdGNoOiBoYXNoTWF0Y2gsXG4gICAgICAgIHVzZUF2YXRhck9yRGVmYXVsdDogdXNlQXZhdGFyT3JEZWZhdWx0LFxuICAgICAgICBsb2NhdGlvbkFjdGlvbk1hdGNoOiBsb2NhdGlvbkFjdGlvbk1hdGNoLFxuICAgICAgICBtaXhwYW5lbFRyYWNrOiBtaXhwYW5lbFRyYWNrLFxuICAgICAgICBuYXZpZ2F0ZVRvRGV2aXNlOiBuYXZpZ2F0ZVRvRGV2aXNlLFxuICAgICAgICBzdG9yZUFjdGlvbjogc3RvcmVBY3Rpb24sXG4gICAgICAgIGNhbGxTdG9yZWRBY3Rpb246IGNhbGxTdG9yZWRBY3Rpb24sXG4gICAgICAgIFVJSGVscGVyOiBVSUhlbHBlcixcbiAgICAgICAgdG9BbmNob3I6IHRvQW5jaG9yLFxuICAgICAgICBwYXJhbUJ5TmFtZTogcGFyYW1CeU5hbWUsXG4gICAgICAgIGkxOG5TY29wZTogaTE4blNjb3BlLFxuICAgICAgICBzY3JvbGxUbzogc2Nyb2xsVG9cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Lm1vbWVudCwgd2luZG93LkkxOG4pKTtcbiIsIndpbmRvdy5jLm1vZGVscyA9IChmdW5jdGlvbihtKSB7XG4gICAgdmFyIGNvbnRyaWJ1dGlvbkRldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjb250cmlidXRpb25fZGV0YWlscycpLFxuICAgICAgICBwcm9qZWN0RGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfZGV0YWlscycpLFxuICAgICAgICB1c2VyRGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3VzZXJfZGV0YWlscycpLFxuICAgICAgICBiYWxhbmNlID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2JhbGFuY2VzJyksXG4gICAgICAgIGJhbGFuY2VUcmFuc2FjdGlvbiA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdiYWxhbmNlX3RyYW5zYWN0aW9ucycpLFxuICAgICAgICBiYWxhbmNlVHJhbnNmZXIgPSBtLnBvc3RncmVzdC5tb2RlbCgnYmFsYW5jZV90cmFuc2ZlcnMnKSxcbiAgICAgICAgdXNlciA9IG0ucG9zdGdyZXN0Lm1vZGVsKCd1c2VycycpLFxuICAgICAgICBiYW5rQWNjb3VudCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdiYW5rX2FjY291bnRzJyksXG4gICAgICAgIHJld2FyZERldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdyZXdhcmRfZGV0YWlscycpLFxuICAgICAgICBwcm9qZWN0UmVtaW5kZXIgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9yZW1pbmRlcnMnKSxcbiAgICAgICAgY29udHJpYnV0aW9ucyA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjb250cmlidXRpb25zJyksXG4gICAgICAgIHRlYW1Ub3RhbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCd0ZWFtX3RvdGFscycpLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9ucycpLFxuICAgICAgICBwcm9qZWN0UG9zdERldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X3Bvc3RzX2RldGFpbHMnKSxcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXkgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zX3Blcl9kYXknKSxcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbiA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2NvbnRyaWJ1dGlvbnNfcGVyX2xvY2F0aW9uJyksXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb25zUGVyUmVmID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9uc19wZXJfcmVmJyksXG4gICAgICAgIHByb2plY3QgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdHMnKSxcbiAgICAgICAgcHJvamVjdFNlYXJjaCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdycGMvcHJvamVjdF9zZWFyY2gnKSxcbiAgICAgICAgY2F0ZWdvcnkgPSBtLnBvc3RncmVzdC5tb2RlbCgnY2F0ZWdvcmllcycpLFxuICAgICAgICBjYXRlZ29yeVRvdGFscyA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjYXRlZ29yeV90b3RhbHMnKSxcbiAgICAgICAgY2F0ZWdvcnlGb2xsb3dlciA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjYXRlZ29yeV9mb2xsb3dlcnMnKSxcbiAgICAgICAgdGVhbU1lbWJlciA9IG0ucG9zdGdyZXN0Lm1vZGVsKCd0ZWFtX21lbWJlcnMnKSxcbiAgICAgICAgbm90aWZpY2F0aW9uID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ25vdGlmaWNhdGlvbnMnKSxcbiAgICAgICAgc3RhdGlzdGljID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3N0YXRpc3RpY3MnKTtcblxuICAgIHRlYW1NZW1iZXIucGFnZVNpemUoNDApO1xuICAgIHJld2FyZERldGFpbC5wYWdlU2l6ZShmYWxzZSk7XG4gICAgcHJvamVjdC5wYWdlU2l6ZSgzMCk7XG4gICAgY2F0ZWdvcnkucGFnZVNpemUoNTApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJpYnV0aW9uRGV0YWlsOiBjb250cmlidXRpb25EZXRhaWwsXG4gICAgICAgIHByb2plY3REZXRhaWw6IHByb2plY3REZXRhaWwsXG4gICAgICAgIHVzZXJEZXRhaWw6IHVzZXJEZXRhaWwsXG4gICAgICAgIGJhbGFuY2U6IGJhbGFuY2UsXG4gICAgICAgIGJhbGFuY2VUcmFuc2FjdGlvbjogYmFsYW5jZVRyYW5zYWN0aW9uLFxuICAgICAgICBiYWxhbmNlVHJhbnNmZXI6IGJhbGFuY2VUcmFuc2ZlcixcbiAgICAgICAgYmFua0FjY291bnQ6IGJhbmtBY2NvdW50LFxuICAgICAgICB1c2VyOiB1c2VyLFxuICAgICAgICByZXdhcmREZXRhaWw6IHJld2FyZERldGFpbCxcbiAgICAgICAgY29udHJpYnV0aW9uczogY29udHJpYnV0aW9ucyxcbiAgICAgICAgdGVhbVRvdGFsOiB0ZWFtVG90YWwsXG4gICAgICAgIHRlYW1NZW1iZXI6IHRlYW1NZW1iZXIsXG4gICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgIHByb2plY3RTZWFyY2g6IHByb2plY3RTZWFyY2gsXG4gICAgICAgIGNhdGVnb3J5OiBjYXRlZ29yeSxcbiAgICAgICAgY2F0ZWdvcnlUb3RhbHM6IGNhdGVnb3J5VG90YWxzLFxuICAgICAgICBjYXRlZ29yeUZvbGxvd2VyOiBjYXRlZ29yeUZvbGxvd2VyLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheTogcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXksXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb246IHByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb24sXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb25zUGVyUmVmOiBwcm9qZWN0Q29udHJpYnV0aW9uc1BlclJlZixcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbjogcHJvamVjdENvbnRyaWJ1dGlvbixcbiAgICAgICAgcHJvamVjdFBvc3REZXRhaWw6IHByb2plY3RQb3N0RGV0YWlsLFxuICAgICAgICBwcm9qZWN0UmVtaW5kZXI6IHByb2plY3RSZW1pbmRlcixcbiAgICAgICAgbm90aWZpY2F0aW9uOiBub3RpZmljYXRpb24sXG4gICAgICAgIHN0YXRpc3RpYzogc3RhdGlzdGljXG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLnJvb3QuRmxleCA9IChmdW5jdGlvbihtLCBjLCBoLCBtb2RlbHMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0cyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgbCA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgIHNhbXBsZTMgPSBfLnBhcnRpYWwoXy5zYW1wbGUsIF8sIDMpLFxuICAgICAgICAgICAgICAgIGJ1aWxkZXIgPSB7XG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbUFjdGlvbjogJy8vY2F0YXJzZS51czUubGlzdC1tYW5hZ2UuY29tL3N1YnNjcmliZS9wb3N0P3U9ZWJmY2QwZDE2ZGJiMDAwMWEwYmVhMzYzOSZhbXA7aWQ9OGE0YzFhMzNjZSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGFkZERpc3F1cyA9IChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGguZGlzY3VzcygnaHR0cHM6Ly9jYXRhcnNlLm1lL2ZsZXgnLCAnZmxleF9wYWdlJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGZsZXhWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgIG1vZGU6ICdlcScsXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiAnZXEnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgc3RhdHNMb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnN0YXRpc3RpYy5nZXRSb3dPcHRpb25zKCkpO1xuXG4gICAgICAgICAgICBmbGV4Vk0ubW9kZSgnZmxleCcpLnN0YXRlKCdvbmxpbmUnKTtcblxuICAgICAgICAgICAgY29uc3QgcHJvamVjdHNMb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXIobW9kZWxzLnByb2plY3QuZ2V0UGFnZU9wdGlvbnMoZmxleFZNLnBhcmFtZXRlcnMoKSksIG0ucG9zdGdyZXN0LnJlcXVlc3QpO1xuXG4gICAgICAgICAgICBzdGF0c0xvYWRlci5sb2FkKCkudGhlbihzdGF0cyk7XG5cbiAgICAgICAgICAgIHByb2plY3RzTG9hZGVyLmxvYWQoKS50aGVuKF8uY29tcG9zZShwcm9qZWN0cywgc2FtcGxlMykpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGFkZERpc3F1czogYWRkRGlzcXVzLFxuICAgICAgICAgICAgICAgIGJ1aWxkZXI6IGJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgc3RhdHNMb2FkZXI6IHN0YXRzTG9hZGVyLFxuICAgICAgICAgICAgICAgIHN0YXRzOiBzdGF0cyxcbiAgICAgICAgICAgICAgICBwcm9qZWN0c0xvYWRlcjogcHJvamVjdHNMb2FkZXIsXG4gICAgICAgICAgICAgICAgcHJvamVjdHM6IHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyOiBwcm9qZWN0c0xvYWRlcixcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogcHJvamVjdHNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICBsZXQgc3RhdHMgPSBfLmZpcnN0KGN0cmwuc3RhdHMoKSk7XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uaGVyby1mdWxsLmhlcm8temVsbycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcubG9nby1mbGV4LWhvbWVbc3JjPVxcJy9hc3NldHMvbG9nby1mbGV4LnBuZ1xcJ11bd2lkdGg9XFwnMzU5XFwnXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS02MC53LWNvbC1wdXNoLTIudy1jb2wtOCcsICdWYW1vcyBjb25zdHJ1aXIgdW1hIG5vdmEgbW9kYWxpZGFkZSBkZSBjcm93ZGZ1bmRpbmcgcGFyYSBvIENhdGFyc2UhICBKdW50ZS1zZSBhIG7Ds3MsIGluc2NyZXZhIHNldSBlbWFpbCEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdTaWdudXAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRlcjogY3RybC5idWlsZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VzdC51LW1hcmdpbnRvcC00MC51LXRleHQtY2VudGVyJywgJ1ByYSBxdWVtIHNlcsOhPycpLCBtKCcuZm9udHNpemUtYmFzZS51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTYwJywgJ0luaWNpYXJlbW9zIGEgZmFzZSBkZSB0ZXN0ZXMgY29tIGNhdGVnb3JpYXMgZGUgcHJvamV0b3MgZXNwZWPDrWZpY2FzJyksIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZ1tzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NjBlMzkzYTAxYjY2ZTI1MGFjYTY3Y2JfaWNvbi16ZWxvLWNvbS5wbmdcXCddW3dpZHRoPVxcJzIxMFxcJ10nKSwgbSgnLmZvbnRzaXplLWxhcmdlc3QubGluZWhlaWdodC1sb29zZScsICdDYXVzYXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCdwLmZvbnRzaXplLWJhc2UnLCAnRmxleGliaWxpZGFkZSBwYXJhIGNhdXNhcyBkZSBpbXBhY3RvISBFc3RhcmVtb3MgYWJlcnRvcyBhIGNhbXBhbmhhcyBkZSBvcmdhbml6YcOnw7VlcyBvdSBwZXNzb2FzIGbDrXNpY2FzIHBhcmEgYXJyZWNhZGHDp8OjbyBkZSByZWN1cnNvcyBwYXJhIGNhdXNhcyBwZXNzb2FpcywgcHJvamV0b3MgYXNzaXN0ZW5jaWFsaXN0YXMsIHNhw7pkZSwgYWp1ZGFzIGh1bWFuaXTDoXJpYXMsIHByb3Rlw6fDo28gYW9zIGFuaW1haXMsIGVtcHJlZW5kZWRvcmlzbW8gc29jaW9hbWJpZW50YWwsIGF0aXZpc21vIG91IHF1YWxxdWVyIGNvaXNhIHF1ZSB1bmEgYXMgcGVzc29hcyBwYXJhIGZhemVyIG8gYmVtLicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZ1tzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NjBlMzkyOWEwZGFlYTIzMGE1ZjEyY2RfaWNvbi16ZWxvLXBlc3NvYWwucG5nXFwnXVt3aWR0aD1cXCcyMTBcXCddJyksIG0oJy5mb250c2l6ZS1sYXJnZXN0LmxpbmVoZWlnaHQtbG9vc2UnLCAnVmFxdWluaGFzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgncC5mb250c2l6ZS1iYXNlJywgJ0NhbXBhbmhhcyBzaW1wbGVzIHF1ZSBwcmVjaXNhbSBkZSBmbGV4aWJpbGlkYWRlIHBhcmEgYXJyZWNhZGFyIGRpbmhlaXJvIGNvbSBwZXNzb2FzIHByw7N4aW1hcy4gRXN0YXJlbW9zIGFiZXJ0b3MgYSB1bWEgdmFyaWVkYWRlIGRlIGNhbXBhbmhhcyBwZXNzb2FpcyBxdWUgcG9kZW0gaXIgZGVzZGUgY29icmlyIGN1c3RvcyBkZSBlc3R1ZG9zIGEgYWp1ZGFyIHF1ZW0gcHJlY2lzYSBkZSB0cmF0YW1lbnRvIG3DqWRpY28uIERlIGp1bnRhciBhIGdyYW5hIHBhcmEgZmF6ZXIgYXF1ZWxhIGZlc3RhIGEgY29tcHJhciBwcmVzZW50ZXMgcGFyYSBhbGd1w6ltIGNvbSBhIGFqdWRhIGRhIGdhbGVyYS4gJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1zZWN0aW9uLnNlY3Rpb24uYmctZ3JlZW5saW1lLmZvbnRjb2xvci1uZWdhdGl2ZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VzdC51LW1hcmdpbnRvcC00MC51LW1hcmdpbmJvdHRvbS02MC51LXRleHQtY2VudGVyJywgJ0NvbW8gZnVuY2lvbmFyw6E/JyksIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5YzU3OGIyODQ0OTNlMmE0MjhhX3plbG8tbW9uZXkucG5nXFwnXVt3aWR0aD1cXCcxODBcXCddJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAudS10ZXh0LWNlbnRlci5mb250d2VpZ2h0LXNlbWlib2xkJywgJ0ZpcXVlIGNvbSBxdWFudG8gYXJyZWNhZGFyJyksIG0oJ3AudS10ZXh0LWNlbnRlci5mb250c2l6ZS1iYXNlJywgJ08gZmxleCDDqSBwYXJhIGltcHVsc2lvbmFyIGNhbXBhbmhhcyBvbmRlIHRvZG8gZGluaGVpcm8gw6kgYmVtIHZpbmRvISBWb2PDqiBmaWNhIGNvbSB0dWRvIHF1ZSBjb25zZWd1aXIgYXJyZWNhZGFyLicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZ1tzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NjBlMzlkMzdjMDEzZDRhM2VlNjg3ZDJfaWNvbi1yZXdhcmQucG5nXFwnXVt3aWR0aD1cXCcxODBcXCddJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAudS10ZXh0LWNlbnRlci5mb250d2VpZ2h0LXNlbWlib2xkJywgJ07Do28gcHJlY2lzYSBkZSByZWNvbXBlbnNhcycpLCBtKCdwLnUtdGV4dC1jZW50ZXIuZm9udHNpemUtYmFzZScsICdObyBmbGV4IG9mZXJlY2VyIHJlY29tcGVuc2FzIMOpIG9wY2lvbmFsLiBWb2PDqiBlc2NvbGhlIHNlIG9mZXJlY8OqLWxhcyBmYXogc2VudGlkbyBwYXJhIG8gc2V1IHByb2pldG8gZSBjYW1wYW5oYS4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2MGUzOWZiMDFiNjZlMjUwYWNhNjdlM19pY29uLWN1cmFkLnBuZ1xcJ11bd2lkdGg9XFwnMTgwXFwnXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwLnUtdGV4dC1jZW50ZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsICdWb2PDqiBtZXNtbyBwdWJsaWNhIHNldSBwcm9qZXRvJyksIG0oJ3AudS10ZXh0LWNlbnRlci5mb250c2l6ZS1iYXNlJywgJ1RvZG9zIG9zIHByb2pldG9zIGluc2NyaXRvcyBubyBmbGV4IGVudHJhbSBubyBhci4gQWdpbGlkYWRlIGUgZmFjaWxpZGFkZSBwYXJhIHZvY8OqIGNhcHRhciByZWN1cnNvcyBhdHJhdsOpcyBkYSBpbnRlcm5ldC4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5ZTc3YzAxM2Q0YTNlZTY4N2Q0X2ljb24tdGltZS5wbmdcXCddW3dpZHRoPVxcJzE4MFxcJ10nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC51LXRleHQtY2VudGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnRW5jZXJyZSBhIGNhbXBhbmhhIHF1YW5kbyBxdWlzZXInKSwgbSgncC51LXRleHQtY2VudGVyLmZvbnRzaXplLWJhc2UnLCAnTsOjbyBow6EgbGltaXRlIGRlIHRlbXBvIGRlIGNhcHRhw6fDo28uIFZvY8OqIGVzY29saGUgIHF1YW5kbyBlbmNlcnJhciBzdWEgY2FtcGFuaGEgZSByZWNlYmVyIG9zIHZhbG9yZXMgYXJyZWNhZGFkb3MuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1lZGl0YWJsZS5mb250c2l6ZS1sYXJnZXIudS1tYXJnaW50b3AtNDAudS1tYXJnaW4tYm90dG9tLTQwLnUtdGV4dC1jZW50ZXInLCAnQ29uaGXDp2EgYWxndW5zIGRvcyBwcmltZWlyb3MgcHJvamV0b3MgZmxleCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwucHJvamVjdHNMb2FkZXIoKSA/IGgubG9hZGVyKCkgOiBtLmNvbXBvbmVudChjLlByb2plY3RSb3csIHtjb2xsZWN0aW9uOiBjdHJsLnByb2plY3RzLCByZWY6ICdjdHJzZV9mbGV4Jywgd3JhcHBlcjogJy53LXJvdy51LW1hcmdpbnRvcC00MCd9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uZGl2aWRlcicpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTYwLnUtbWFyZ2ludG9wLTQwJywgJ0TDunZpZGFzJyksIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiAnUXVhaXMgc8OjbyBhcyB0YXhhcyBkYSBtb2RhbGlkYWRlIGZsZXjDrXZlbD8gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdDb21vIG5vIENhdGFyc2UsIGVudmlhciB1bSBwcm9qZXRvIG7Do28gY3VzdGEgbmFkYSEgRXN0YW1vcyBlc3R1ZGFuZG8gb3DDp8O1ZXMgcGFyYSBlbnRlbmRlciBxdWFsIHNlcsOhIGEgdGF4YSBjb2JyYWRhIG5vIHNlcnZpw6dvIENhdGFyc2UgZmxleC4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdEZSBvbmRlIHZlbSBvIGRpbmhlaXJvIGRvIG1ldSBwcm9qZXRvPycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiAnRmFtw61saWEsIGFtaWdvcywgZsOjcyBlIG1lbWJyb3MgZGUgY29tdW5pZGFkZXMgcXVlIHZvY8OqIGZheiBwYXJ0ZSBzw6NvIHNldXMgbWFpb3JlcyBjb2xhYm9yYWRvcmVzLiBTw6NvIGVsZXMgcXVlIGlyw6NvIGRpdnVsZ2FyIHN1YSBjYW1wYW5oYSBwYXJhIGFzIHBlc3NvYXMgcXVlIGVsZXMgY29uaGVjZW0sIGUgYXNzaW0gbyBjw61yY3VsbyBkZSBhcG9pYWRvcmVzIHZhaSBhdW1lbnRhbmRvIGUgYSBzdWEgY2FtcGFuaGEgZ2FuaGEgZm9yw6dhLidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogJ1F1YWwgYSBkaWZlcmVuw6dhIGVudHJlIG8gZmxleMOtdmVsIGUgbyBcInR1ZG8gb3UgbmFkYVwiPycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiAnQXR1YWxtZW50ZSBvIENhdGFyc2UgdXRpbGl6YSBhcGVuYXMgbyBtb2RlbG8gXCJ0dWRvIG91IG5hZGFcIiwgb25kZSB2b2PDqiBzw7MgZmljYSBjb20gbyBkaW5oZWlybyBzZSBiYXRlciBhIG1ldGEgZGUgYXJyZWNhZGHDp8OjbyBkZW50cm8gZG8gcHJhem8gZGEgY2FtcGFuaGEuIE8gbW9kZWxvIGZsZXjDrXZlbCDDqSBkaWZlcmVudGUgcG9pcyBwZXJtaXRlIHF1ZSBvIHJlYWxpemFkb3IgZmlxdWUgY29tIG8gcXVlIGFycmVjYWRhciwgaW5kZXBlbmRlbnRlIGRlIGF0aW5naXIgb3UgbsOjbyBhIG1ldGEgZG8gcHJvamV0byBubyBwcmF6byBkYSBjYW1wYW5oYS4gTsOjbyBoYXZlcsOhIGxpbWl0ZSBkZSB0ZW1wbyBwYXJhIGFzIGNhbXBhbmhhcy4gTm9zc28gc2lzdGVtYSBmbGV4w612ZWwgc2Vyw6EgYWxnbyBub3ZvIGVtIHJlbGHDp8OjbyBhb3MgbW9kZWxvcyBxdWUgZXhpc3RlbSBhdHVhbG1lbnRlIG5vIG1lcmNhZG8uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdQb3NzbyBpbnNjcmV2ZXIgcHJvamV0b3MgcGFyYSBhIG1vZGFsaWRhZGUgZmxleMOtdmVsIGrDoT8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogJ1BvciBlbnF1YW50byBuw6NvLiBBIG1vZGFsaWRhZGUgZmxleCBzZXLDoSB0ZXN0YWRhIGNvbSBhbGd1bnMgcHJvamV0b3MgZXNwZWPDrWZpY29zLiBJbnNjcmV2YSBzZXUgZW1haWwgZSBwYXJ0aWNpcGUgZGEgY29udmVyc2EgbmVzc2EgcMOhZ2luYSBwYXJhIHJlY2ViZXIgaW5mb3JtYcOnw7VlcywgbWF0ZXJpYWlzLCBhY29tcGFuaGFyIHByb2pldG9zIGVtIHRlc3RlIGUgc2FiZXIgY29tIGFudGVjZWTDqm5jaWEgYSBkYXRhIGRlIGxhbsOnYW1lbnRvIGRvIGZsZXguJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiAnUG9yIHF1w6ogdm9jw6pzIHF1ZXJlbSBmYXplciBvIENhdGFyc2UgZmxleD8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogJ0FjcmVkaXRhbW9zIHF1ZSBvIGFtYmllbnRlIGRvIGNyb3dkZnVuZGluZyBicmFzaWxlaXJvIGFpbmRhIHRlbSBlc3Bhw6dvIHBhcmEgbXVpdGFzIGHDp8O1ZXMsIHRlc3RlcyBlIGV4cGVyaW1lbnRhw6fDtWVzIHBhcmEgZW50ZW5kZXIgZGUgZmF0byBvIHF1ZSBhcyBwZXNzb2FzIHByZWNpc2FtLiBTb25oYW1vcyBjb20gdG9ybmFyIG8gZmluYW5jaWFtZW50byBjb2xldGl2byB1bSBow6FiaXRvIG5vIEJyYXNpbC4gTyBDYXRhcnNlIGZsZXggw6kgbWFpcyB1bSBwYXNzbyBuZXNzYSBkaXJlw6fDo28uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiAnUXVhbmRvIHZvY8OqcyBpcsOjbyBsYW7Dp2FyIG8gQ2F0YXJzZSBmbGV4PycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiAnQWluZGEgbsOjbyBzYWJlbW9zIHF1YW5kbyBhYnJpcmVtb3MgbyBmbGV4IHBhcmEgbyBww7pibGljby4gSXJlbW9zIHByaW1laXJhbWVudGUgcGFzc2FyIHBvciB1bSBwZXLDrW9kbyBkZSB0ZXN0ZXMgZSBkZXBvaXMgZXN0YWJlbGVjZXIgdW1hIGRhdGEgZGUgbGFuw6dhbWVudG8uIFNlIHZvY8OqIGRlc2VqYSBhY29tcGFuaGFyIGUgcmVjZWJlciBub3TDrWNpYXMgc29icmUgZXNzYSBjYW1pbmhhZGEsIGluc2NyZXZhIHNldSBlbWFpbCBuZXNzYSBww6FnaW5hLidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24tbGFyZ2UudS10ZXh0LWNlbnRlci5iZy1wdXJwbGUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIuZm9udGNvbG9yLW5lZ2F0aXZlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0JywgJ0ZpcXVlIHBvciBkZW50cm8hJyksIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTYwJywgJ1JlY2ViYSBub3TDrWNpYXMgZSBhY29tcGFuaGUgYSBldm9sdcOnw6NvIGRvIENhdGFyc2UgZmxleCcpLCBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1NpZ251cCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGRlcjogY3RybC5idWlsZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1zZWN0aW9uLnNlY3Rpb24tb25lLWNvbHVtbi5iZy1jYXRhcnNlLXplbG8uc2VjdGlvbi1sYXJnZVtzdHlsZT1cIm1pbi1oZWlnaHQ6IDUwdmg7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZWRpdGFibGUudS1tYXJnaW5ib3R0b20tNDAuZm9udHNpemUtbGFyZ2VyLmxpbmVoZWlnaHQtdGlnaHQuZm9udGNvbG9yLW5lZ2F0aXZlJywgJ08gZmxleCDDqSB1bSBleHBlcmltZW50byBlIGluaWNpYXRpdmEgZG8gQ2F0YXJzZSwgbWFpb3IgcGxhdGFmb3JtYSBkZSBjcm93ZGZ1bmRpbmcgZG8gQnJhc2lsLicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LXRleHQtY2VudGVyJywgKGN0cmwuc3RhdHNMb2FkZXIoKSkgPyBoLmxvYWRlcigpIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1iby50ZXh0LXN1Y2Nlc3MubGluZWhlaWdodC1sb29zZScsIGguZm9ybWF0TnVtYmVyKHN0YXRzLnRvdGFsX2NvbnRyaWJ1dG9ycywgMCwgMykpLCBtKCdwLnN0YXJ0LXN0YXRzLmZvbnRzaXplLWJhc2UuZm9udGNvbG9yLW5lZ2F0aXZlJywgJ1Blc3NvYXMgamEgYXBvaWFyYW0gcGVsbyBtZW5vcyAwMSBwcm9qZXRvIG5vIENhdGFyc2UnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtanVtYm8udGV4dC1zdWNjZXNzLmxpbmVoZWlnaHQtbG9vc2UnLCBoLmZvcm1hdE51bWJlcihzdGF0cy50b3RhbF9wcm9qZWN0c19zdWNjZXNzLCAwLCAzKSksIG0oJ3Auc3RhcnQtc3RhdHMuZm9udHNpemUtYmFzZS5mb250Y29sb3ItbmVnYXRpdmUnLCAnUHJvamV0b3MgamEgZm9yYW0gZmluYW5jaWFkb3Mgbm/CoENhdGFyc2UnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtanVtYm8udGV4dC1zdWNjZXNzLmxpbmVoZWlnaHQtbG9vc2UnLCBzdGF0cy50b3RhbF9jb250cmlidXRlZC50b1N0cmluZygpLnNsaWNlKDAsIDIpICsgJyBtaWxow7VlcycpLCBtKCdwLnN0YXJ0LXN0YXRzLmZvbnRzaXplLWJhc2UuZm9udGNvbG9yLW5lZ2F0aXZlJywgJ0ZvcmFtIGludmVzdGlkb3MgZW0gaWRlaWFzIHB1YmxpY2FkYXMgbm8gQ2F0YXJzZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24uYmctYmx1ZS1vbmUuZm9udGNvbG9yLW5lZ2F0aXZlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ1JlY29tZW5kZSBvIENhdGFyc2UgZmxleCBwYXJhIGFtaWdvcyEgJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNi53LXN1Yi1jb2wtbWlkZGxlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcuaWNvbi1zaGFyZS1tb2JpbGVbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTNhM2Y2NmUwNWViNjE0NDE3MWQ4ZWRiX2ZhY2Vib29rLXh4bC5wbmdcXCddJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLnctYnV0dG9uLmJ0bi5idG4tbGFyZ2UuYnRuLWZiW2hyZWY9XCJodHRwOi8vd3d3LmZhY2Vib29rLmNvbS9zaGFyZXIvc2hhcmVyLnBocD91PWh0dHBzOi8vd3d3LmNhdGFyc2UubWUvZmxleD9yZWY9ZmFjZWJvb2smdGl0bGU9JyArIGVuY29kZVVSSUNvbXBvbmVudCgnQ29uaGXDp2EgbyBub3ZvIENhdGFyc2UgRmxleCEnKSArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0NvbXBhcnRpbGhhcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy5pY29uLXNoYXJlLW1vYmlsZVtzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81M2EzZjY1MTA1ZWI2MTQ0MTcxZDhlZGFfdHdpdHRlci0yNTYucG5nXFwnXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS53LWJ1dHRvbi5idG4uYnRuLWxhcmdlLmJ0bi10d2VldFtocmVmPVwiaHR0cDovL3R3aXR0ZXIuY29tLz9zdGF0dXM9JyArIGVuY29kZVVSSUNvbXBvbmVudCgnVmFtb3MgY29uc3RydWlyIHVtYSBub3ZhIG1vZGFsaWRhZGUgZGUgY3Jvd2RmdW5kaW5nIHBhcmEgbyBDYXRhcnNlISBKdW50ZS1zZSBhIG7Ds3MsIGluc2NyZXZhIHNldSBlbWFpbCEnKSArICdodHRwczovL3d3dy5jYXRhcnNlLm1lL2ZsZXg/cmVmPXR3aXR0ZXJcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1R1aXRhcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLCBtKCcudy1zZWN0aW9uLnNlY3Rpb24tbGFyZ2UuYmctZ3JlZW5saW1lJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNwYXJ0aWNpcGUtZG8tZGViYXRlLnUtdGV4dC1jZW50ZXInLCB7Y29uZmlnOiBoLnRvQW5jaG9yKCl9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2gxLmZvbnRzaXplLWxhcmdlc3QuZm9udGNvbG9yLW5lZ2F0aXZlJywnQ29uc3RydWEgbyBmbGV4IGNvbm9zY28nKSwgbSgnLmZvbnRzaXplLWJhc2UudS1tYXJnaW5ib3R0b20tNjAuZm9udGNvbG9yLW5lZ2F0aXZlJywgJ0luaWNpZSB1bWEgY29udmVyc2EsIHBlcmd1bnRlLCBjb21lbnRlLCBjcml0aXF1ZSBlIGZhw6dhIHN1Z2VzdMO1ZXMhJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjZGlzcXVzX3RocmVhZC5jYXJkLnUtcmFkaXVzW3N0eWxlPVwibWluLWhlaWdodDogNTB2aDtcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC5hZGREaXNxdXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLnJvb3QuSW5zaWdodHMgPSAoKG0sIGMsIGgsIG1vZGVscywgXywgSTE4bikgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3Byb2plY3RzLmluc2lnaHRzJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IGZpbHRlcnNWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBpbnNpZ2h0c1ZNID0gYy5JbnNpZ2h0c1ZNLFxuICAgICAgICAgICAgICAgIHByb2plY3REZXRhaWxzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb25zUGVyRGF5ID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb25zUGVyTG9jYXRpb24gPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIGxvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbjtcblxuICAgICAgICAgICAgZmlsdGVyc1ZNLnByb2plY3RfaWQoYXJncy5yb290LmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpKTtcblxuICAgICAgICAgICAgY29uc3QgbCA9IGxvYWRlcihtb2RlbHMucHJvamVjdERldGFpbC5nZXRSb3dPcHRpb25zKGZpbHRlcnNWTS5wYXJhbWV0ZXJzKCkpKTtcbiAgICAgICAgICAgIGwubG9hZCgpLnRoZW4ocHJvamVjdERldGFpbHMpO1xuXG4gICAgICAgICAgICBjb25zdCBsQ29udHJpYnV0aW9uc1BlckRheSA9IGxvYWRlcihtb2RlbHMucHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXkuZ2V0Um93T3B0aW9ucyhmaWx0ZXJzVk0ucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICBsQ29udHJpYnV0aW9uc1BlckRheS5sb2FkKCkudGhlbihjb250cmlidXRpb25zUGVyRGF5KTtcblxuICAgICAgICAgICAgbGV0IGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvblRhYmxlID0gW1snRXN0YWRvJywgJ0Fwb2lvcycsICdSJCBhcG9pYWRvcyAoJSBkbyB0b3RhbCknXV07XG4gICAgICAgICAgICBjb25zdCBidWlsZFBlckxvY2F0aW9uVGFibGUgPSAoY29udHJpYnV0aW9ucykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAoIV8uaXNFbXB0eShjb250cmlidXRpb25zKSkgPyBfLm1hcChfLmZpcnN0KGNvbnRyaWJ1dGlvbnMpLnNvdXJjZSwgKGNvbnRyaWJ1dGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29sdW1uID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgY29sdW1uLnB1c2goY29udHJpYnV0aW9uLnN0YXRlX2Fjcm9ueW0gfHwgJ091dHJvL290aGVyJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKGNvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uLnB1c2goW2NvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRlZCxbLy9BZGRpbmcgcm93IHdpdGggY3VzdG9tIGNvbXBhcmF0b3IgPT4gcmVhZCBwcm9qZWN0LWRhdGEtdGFibGUgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIG0oYGlucHV0W3R5cGU9XCJoaWRkZW5cIl1bdmFsdWU9XCIke2NvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRlZH1cImApLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1IkICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWQsIDIsIDMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgJyAoJyArIGNvbnRyaWJ1dGlvbi50b3RhbF9vbl9wZXJjZW50YWdlLnRvRml4ZWQoMikgKyAnJSknKVxuICAgICAgICAgICAgICAgICAgICBdXSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZS5wdXNoKGNvbHVtbik7XG4gICAgICAgICAgICAgICAgfSkgOiBbXTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGxDb250cmlidXRpb25zUGVyTG9jYXRpb24gPSBsb2FkZXIobW9kZWxzLnByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb24uZ2V0Um93T3B0aW9ucyhmaWx0ZXJzVk0ucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICBsQ29udHJpYnV0aW9uc1BlckxvY2F0aW9uLmxvYWQoKS50aGVuKGJ1aWxkUGVyTG9jYXRpb25UYWJsZSk7XG5cbiAgICAgICAgICAgIGxldCBjb250cmlidXRpb25zUGVyUmVmVGFibGUgPSBbW1xuICAgICAgICAgICAgICAgIEkxOG4udCgncmVmX3RhYmxlLmhlYWRlci5vcmlnaW4nLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgSTE4bi50KCdyZWZfdGFibGUuaGVhZGVyLmNvbnRyaWJ1dGlvbnMnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgSTE4bi50KCdyZWZfdGFibGUuaGVhZGVyLmFtb3VudCcsIEkxOG5TY29wZSgpKVxuICAgICAgICAgICAgXV07XG4gICAgICAgICAgICBjb25zdCBidWlsZFBlclJlZlRhYmxlID0gKGNvbnRyaWJ1dGlvbnMpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCFfLmlzRW1wdHkoY29udHJpYnV0aW9ucykpID8gXy5tYXAoXy5maXJzdChjb250cmlidXRpb25zKS5zb3VyY2UsIChjb250cmlidXRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmUgPSAvKGN0cnNlX1thLXpdKikvLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGVzdCA9IHJlLmV4ZWMoY29udHJpYnV0aW9uLnJlZmVycmFsX2xpbmspO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCBjb2x1bW4gPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodGVzdCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb24ucmVmZXJyYWxfbGluayA9IHRlc3RbMF07XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb2x1bW4ucHVzaChjb250cmlidXRpb24ucmVmZXJyYWxfbGluayA/IEkxOG4udCgncmVmZXJyYWwuJyArIGNvbnRyaWJ1dGlvbi5yZWZlcnJhbF9saW5rLCBJMThuU2NvcGUoe2RlZmF1bHRWYWx1ZTogY29udHJpYnV0aW9uLnJlZmVycmFsX2xpbmt9KSkgOiBJMThuLnQoJ3JlZmVycmFsLm90aGVycycsIEkxOG5TY29wZSgpKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKGNvbnRyaWJ1dGlvbi50b3RhbCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKFtjb250cmlidXRpb24udG90YWxfYW1vdW50LFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oYGlucHV0W3R5cGU9XCJoaWRkZW5cIl1bdmFsdWU9XCIke2NvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRlZH1cImApLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1IkICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24udG90YWxfYW1vdW50LCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsICcgKCcgKyBjb250cmlidXRpb24udG90YWxfb25fcGVyY2VudGFnZS50b0ZpeGVkKDIpICsgJyUpJylcbiAgICAgICAgICAgICAgICAgICAgXV0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29udHJpYnV0aW9uc1BlclJlZlRhYmxlLnB1c2goY29sdW1uKTtcbiAgICAgICAgICAgICAgICB9KSA6IFtdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgbENvbnRyaWJ1dGlvbnNQZXJSZWYgPSBsb2FkZXIobW9kZWxzLnByb2plY3RDb250cmlidXRpb25zUGVyUmVmLmdldFJvd09wdGlvbnMoZmlsdGVyc1ZNLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgbENvbnRyaWJ1dGlvbnNQZXJSZWYubG9hZCgpLnRoZW4oYnVpbGRQZXJSZWZUYWJsZSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGV4cGxhbmF0aW9uTW9kZUNvbXBvbmVudCA9IChwcm9qZWN0TW9kZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vZGVzID0ge1xuICAgICAgICAgICAgICAgICAgICAnYW9uJzogYy5Bb25BZG1pblByb2plY3REZXRhaWxzRXhwbGFuYXRpb24sXG4gICAgICAgICAgICAgICAgICAgICdmbGV4JzogYy5GbGV4QWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBtb2Rlc1twcm9qZWN0TW9kZV07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGw6IGwsXG4gICAgICAgICAgICAgICAgbENvbnRyaWJ1dGlvbnNQZXJSZWY6IGxDb250cmlidXRpb25zUGVyUmVmLFxuICAgICAgICAgICAgICAgIGxDb250cmlidXRpb25zUGVyTG9jYXRpb246IGxDb250cmlidXRpb25zUGVyTG9jYXRpb24sXG4gICAgICAgICAgICAgICAgbENvbnRyaWJ1dGlvbnNQZXJEYXk6IGxDb250cmlidXRpb25zUGVyRGF5LFxuICAgICAgICAgICAgICAgIGZpbHRlcnNWTTogZmlsdGVyc1ZNLFxuICAgICAgICAgICAgICAgIHByb2plY3REZXRhaWxzOiBwcm9qZWN0RGV0YWlscyxcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb25zUGVyRGF5OiBjb250cmlidXRpb25zUGVyRGF5LFxuICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvblRhYmxlOiBjb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZSxcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb25zUGVyUmVmVGFibGU6IGNvbnRyaWJ1dGlvbnNQZXJSZWZUYWJsZSxcbiAgICAgICAgICAgICAgICBleHBsYW5hdGlvbk1vZGVDb21wb25lbnQ6IGV4cGxhbmF0aW9uTW9kZUNvbXBvbmVudFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBfLmZpcnN0KGN0cmwucHJvamVjdERldGFpbHMoKSksXG4gICAgICAgICAgICAgICAgdG9vbHRpcCA9IChlbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Ub29sdGlwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbDogZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0luZm9ybWEgZGUgb25kZSB2aWVyYW0gb3MgYXBvaW9zIGRlIHNldSBwcm9qZXRvLiBTYWliYSBjb21vIHVzYXIgZXNzYSB0YWJlbGEgZSBwbGFuZWphciBtZWxob3Igc3VhcyBhw6fDtWVzIGRlIGNvbXVuaWNhw6fDo28gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhW2hyZWY9XCIke0kxOG4udCgncmVmX3RhYmxlLmhlbHBfdXJsJywgSTE4blNjb3BlKCkpfVwiXVt0YXJnZXQ9J19ibGFuayddYCwgJ2FxdWkuJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogMzgwXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcucHJvamVjdC1pbnNpZ2h0cycsICFjdHJsLmwoKSA/IFtcbiAgICAgICAgICAgICAgICAocHJvamVjdC5pc19vd25lcl9vcl9hZG1pbiA/IG0uY29tcG9uZW50KGMuUHJvamVjdERhc2hib2FyZE1lbnUsIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgIH0pIDogJycpLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LmRhc2hib2FyZC1oZWFkZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC1sb29zZXIudS1tYXJnaW5ib3R0b20tMTAnLCBJMThuLnQoJ2NhbXBhaWduX3RpdGxlJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUHJvamVjdERldGFpbHNDYXJkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoY3RybC5leHBsYW5hdGlvbk1vZGVDb21wb25lbnQocHJvamVjdC5tb2RlKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSwgKHByb2plY3QuaXNfcHVibGlzaGVkKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmRpdmlkZXInKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLW9uZS1jb2x1bW4uc2VjdGlvbi5iZy1ncmF5LmJlZm9yZS1mb290ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21pbi1oZWlnaHQnOiAnMzAwcHgnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFjdHJsLmxDb250cmlidXRpb25zUGVyRGF5KCkgPyBtLmNvbXBvbmVudChjLlByb2plY3REYXRhQ2hhcnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJEYXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IEkxOG4udCgnYW1vdW50X3Blcl9kYXlfbGFiZWwnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YUtleTogJ3RvdGFsX2Ftb3VudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeEF4aXM6IChpdGVtKSA9PiBoLm1vbWVudGlmeShpdGVtLnBhaWRfYXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSA6IGgubG9hZGVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21pbi1oZWlnaHQnOiAnMzAwcHgnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFjdHJsLmxDb250cmlidXRpb25zUGVyRGF5KCkgPyBtLmNvbXBvbmVudChjLlByb2plY3REYXRhQ2hhcnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJEYXksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IEkxOG4udCgnY29udHJpYnV0aW9uc19wZXJfZGF5X2xhYmVsJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFLZXk6ICd0b3RhbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeEF4aXM6IChpdGVtKSA9PiBoLm1vbWVudGlmeShpdGVtLnBhaWRfYXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSA6IGgubG9hZGVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LWNvbnRyaWJ1dGlvbnMtcGVyLXJlZicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJMThuLnQoJ3JlZl9vcmlnaW5fdGl0bGUnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgubmV3RmVhdHVyZUJhZGdlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXAoJ3NwYW4uZm9udHNpemUtc21hbGxlc3QudG9vbHRpcC13cmFwcGVyLmZhLmZhLXF1ZXN0aW9uLWNpcmNsZS5mb250Y29sb3Itc2Vjb25kYXJ5JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhY3RybC5sQ29udHJpYnV0aW9uc1BlclJlZigpID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0RGF0YVRhYmxlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhYmxlOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJSZWZUYWJsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFNvcnRJbmRleDogLTJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSA6IGgubG9hZGVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1jb250cmlidXRpb25zLXBlci1yZWYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlcicsIEkxOG4udCgnbG9jYXRpb25fb3JpZ2luX3RpdGxlJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhY3RybC5sQ29udHJpYnV0aW9uc1BlckxvY2F0aW9uKCkgPyBtLmNvbXBvbmVudChjLlByb2plY3REYXRhVGFibGUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFibGU6IGN0cmwuY29udHJpYnV0aW9uc1BlckxvY2F0aW9uVGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRTb3J0SW5kZXg6IC0yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmVtaW5kZXJDb3VudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc291cmNlOiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdIDogJydcbiAgICAgICAgICAgIF0gOiBoLmxvYWRlcigpKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuXywgd2luZG93LkkxOG4pKTtcbiIsIndpbmRvdy5jLnJvb3QuSm9icyA9ICgobSwgSTE4biwgaCkgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3BhZ2VzLmpvYnMnKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG5cbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5oZXJvLWpvYnMuaGVyby1tZWRpdW0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lLnUtdGV4dC1jZW50ZXInLFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy5pY29uLWhlcm9bc3JjPVwiL2Fzc2V0cy9sb2dvLXdoaXRlLnBuZ1wiXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAuZm9udHNpemUtbGFyZ2VzdCcsIEkxOG4udCgndGl0bGUnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS1tYXJnaW50b3AtNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtcHVzaC0yLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsIEkxOG4udCgnaW5mbycsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaHJlZj1cIi9wcm9qZWN0cy9uZXdcIl0udy1idXR0b24uYnRuLmJ0bi1sYXJnZS5idG4taW5saW5lJywgSTE4bi50KCdjdGEnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LkkxOG4sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLnJvb3QuTGl2ZVN0YXRpc3RpY3MgPSAoKG0sIG1vZGVscywgaCwgXywgSlNPTikgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzID0ge30pID0+IHtcbiAgICAgICAgICAgIGxldCBwYWdlU3RhdGlzdGljcyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uRGF0YSA9IG0ucHJvcCh7fSk7XG5cbiAgICAgICAgICAgIG1vZGVscy5zdGF0aXN0aWMuZ2V0Um93KCkudGhlbihwYWdlU3RhdGlzdGljcyk7XG4gICAgICAgICAgICAvLyBhcmdzLnNvY2tldCBpcyBhIHNvY2tldCBwcm92aWRlZCBieSBzb2NrZXQuaW9cbiAgICAgICAgICAgIC8vIGNhbiBzZWUgdGhlcmUgaHR0cHM6Ly9naXRodWIuY29tL2NhdGFyc2UvY2F0YXJzZS1saXZlL2Jsb2IvbWFzdGVyL3B1YmxpYy9pbmRleC5qcyNMOFxuICAgICAgICAgICAgaWYgKGFyZ3Muc29ja2V0ICYmIF8uaXNGdW5jdGlvbihhcmdzLnNvY2tldC5vbikpIHtcbiAgICAgICAgICAgICAgICBhcmdzLnNvY2tldC5vbignbmV3X3BhaWRfY29udHJpYnV0aW9ucycsIChtc2cpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uRGF0YShKU09OLnBhcnNlKG1zZy5wYXlsb2FkKSk7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVscy5zdGF0aXN0aWMuZ2V0Um93KCkudGhlbihwYWdlU3RhdGlzdGljcyk7XG4gICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcGFnZVN0YXRpc3RpY3M6IHBhZ2VTdGF0aXN0aWNzLFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkRhdGE6IG5vdGlmaWNhdGlvbkRhdGFcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICBsZXQgZGF0YSA9IGN0cmwubm90aWZpY2F0aW9uRGF0YSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctc2VjdGlvbi5iZy1zdGF0cy5zZWN0aW9uLm1pbi1oZWlnaHQtMTAwJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgXy5tYXAoY3RybC5wYWdlU3RhdGlzdGljcygpLCAoc3RhdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW20oJ2ltZy51LW1hcmdpbmJvdHRvbS02MFtzcmM9XCJodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU1YWRhNWRkMTFiMzZhNTI2MTZkOTdkZl9zeW1ib2wtY2F0YXJzZS5wbmdcIl0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3ItbmVnYXRpdmUudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLW1lZ2FqdW1iby5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1IkICcgKyBoLmZvcm1hdE51bWJlcihzdGF0LnRvdGFsX2NvbnRyaWJ1dGVkLCAyLCAzKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlJywgJ0RvYWRvcyBwYXJhIHByb2pldG9zIHB1YmxpY2Fkb3MgcG9yIGFxdWknKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udHdlaWdodC1zZW1pYm9sZCcsIHN0YXQudG90YWxfY29udHJpYnV0b3JzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UnLCAnUGVzc29hcyBqw6EgYXBvaWFyYW0gcGVsbyBtZW5vcyAxIHByb2pldG8gbm8gQ2F0YXJzZScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIH0pKSwgKCFfLmlzRW1wdHkoZGF0YSkgPyBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLnUtcmFkaXVzLnUtbWFyZ2luYm90dG9tLTYwLm1lZGl1bScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi51LXJvdW5kW3NyYz1cIicgKyBoLnVzZUF2YXRhck9yRGVmYXVsdChkYXRhLnVzZXJfaW1hZ2UpICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtc21hbGwtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBkYXRhLnVzZXJfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnUtdGV4dC1jZW50ZXIuZm9udHNpemUtYmFzZS51LW1hcmdpbnRvcC0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsICdhY2Fib3UgZGUgYXBvaWFyIG8nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QudS1yYWRpdXNbc3JjPVwiJyArIGRhdGEucHJvamVjdF9pbWFnZSArICdcIl1bd2lkdGg9XCI3NVwiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtc21hbGwtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBkYXRhLnByb2plY3RfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlci5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC5mb250Y29sb3ItbmVnYXRpdmUnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW4uZm9udGNvbG9yLW5lZ2F0aXZlW2hyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vY2F0YXJzZVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWdpdGh1YicsICcuJyksICcgT3BlbiBTb3VyY2UgY29tIG9yZ3VsaG8hICdcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93Ll8sIHdpbmRvdy5KU09OKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLnJvb3QuUHJvamVjdHNEYXNoYm9hcmQgY29tcG9uZW50XG4gKiBBIHJvb3QgY29tcG9uZW50IHRvIG1hbmFnZSBwcm9qZWN0c1xuICpcbiAqIEV4YW1wbGU6XG4gKiBUbyBtb3VudCB0aGlzIGNvbXBvbmVudCBqdXN0IGNyZWF0ZSBhIERPTSBlbGVtZW50IGxpa2U6XG4gKiA8ZGl2IGRhdGEtbWl0aHJpbD1cIlByb2plY3RzRGFzaGJvYXJkXCI+XG4gKi9cbndpbmRvdy5jLnJvb3QuUHJvamVjdHNEYXNoYm9hcmQgPSAoKG0sIGMsIGgsIF8sIHZtcykgPT4ge1xuICAgIHJldHVybiB7XG5cbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB2bXMucHJvamVjdChhcmdzLnByb2plY3RfaWQsIGFyZ3MucHJvamVjdF91c2VyX2lkKTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGN0cmwucHJvamVjdERldGFpbHMoKTtcbiAgICAgICAgICAgIHJldHVybiBwcm9qZWN0LmlzX293bmVyX29yX2FkbWluID9cbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3REYXNoYm9hcmRNZW51LCB7cHJvamVjdDogcHJvamVjdH0pIDogJyc7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cuYy52bXMpKTtcbiIsIi8qKlxuICogd2luZG93LmMucm9vdC5Qcm9qZWN0c0V4cGxvcmUgY29tcG9uZW50XG4gKiBBIHJvb3QgY29tcG9uZW50IHRvIHNob3cgcHJvamVjdHMgYWNjb3JkaW5nIHRvIHVzZXIgZGVmaW5lZCBmaWx0ZXJzXG4gKlxuICogRXhhbXBsZTpcbiAqIFRvIG1vdW50IHRoaXMgY29tcG9uZW50IGp1c3QgY3JlYXRlIGEgRE9NIGVsZW1lbnQgbGlrZTpcbiAqIDxkaXYgZGF0YS1taXRocmlsPVwiUHJvamVjdHNFeHBsb3JlXCI+XG4gKi9cbndpbmRvdy5jLnJvb3QuUHJvamVjdHNFeHBsb3JlID0gKChtLCBjLCBoLCBfLCBtb21lbnQpID0+IHtcbiAgICByZXR1cm4ge1xuXG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcnMgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0sXG4gICAgICAgICAgICAgICAgICBmb2xsb3cgPSBjLm1vZGVscy5jYXRlZ29yeUZvbGxvd2VyLFxuICAgICAgICAgICAgICAgICAgZmlsdGVyc01hcCA9IGMudm1zLnByb2plY3RGaWx0ZXJzKCksXG4gICAgICAgICAgICAgICAgICBjYXRlZ29yeUNvbGxlY3Rpb24gPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgICAgLy8gRmFrZSBwcm9qZWN0cyBvYmplY3QgdG8gYmUgYWJsZSB0byByZW5kZXIgcGFnZSB3aGlsZSBsb2FkZGluZyAoaW4gY2FzZSBvZiBzZWFyY2gpXG4gICAgICAgICAgICAgICAgICBwcm9qZWN0cyA9IG0ucHJvcCh7Y29sbGVjdGlvbjogbS5wcm9wKFtdKSwgaXNMb2FkaW5nOiAoKSA9PiB7IHJldHVybiB0cnVlOyB9fSksXG4gICAgICAgICAgICAgICAgICB0aXRsZSA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlJZCA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgICAgZmluZENhdGVnb3J5ID0gKGlkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uZmluZChjYXRlZ29yeUNvbGxlY3Rpb24oKSwgZnVuY3Rpb24oYyl7IHJldHVybiBjLmlkID09PSBwYXJzZUludChpZCk7IH0pO1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gXy5jb21wb3NlKGZpbmRDYXRlZ29yeSwgY2F0ZWdvcnlJZCksXG5cbiAgICAgICAgICAgICAgICAgIGxvYWRDYXRlZ29yaWVzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjLm1vZGVscy5jYXRlZ29yeS5nZXRQYWdlV2l0aFRva2VuKGZpbHRlcnMoe30pLm9yZGVyKHtuYW1lOiAnYXNjJ30pLnBhcmFtZXRlcnMoKSkudGhlbihjYXRlZ29yeUNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgZm9sbG93Q2F0ZWdvcnkgPSAoaWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xsb3cucG9zdFdpdGhUb2tlbih7Y2F0ZWdvcnlfaWQ6IGlkfSkudGhlbihsb2FkQ2F0ZWdvcmllcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHVuRm9sbG93Q2F0ZWdvcnkgPSAoaWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xsb3cuZGVsZXRlV2l0aFRva2VuKGZpbHRlcnMoe2NhdGVnb3J5X2lkOiAnZXEnfSkuY2F0ZWdvcnlfaWQoaWQpLnBhcmFtZXRlcnMoKSkudGhlbihsb2FkQ2F0ZWdvcmllcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgbG9hZFJvdXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvdXRlID0gd2luZG93LmxvY2F0aW9uLmhhc2gubWF0Y2goL1xcIyhbXlxcL10qKVxcLz8oXFxkKyk/LyksXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXQgPSByb3V0ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZVsyXSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5kQ2F0ZWdvcnkocm91dGVbMl0pLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRnJvbVJvdXRlID0gICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBieUNhdGVnb3J5ID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZV9vcmRlcjogJ2d0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeV9pZDogJ2VxJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5zdGF0ZV9vcmRlcigncHVibGlzaGVkJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZVsxXSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyc01hcFtyb3V0ZVsxXV0gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3RpdGxlOiBjYXQubmFtZSwgZmlsdGVyOiBieUNhdGVnb3J5LmNhdGVnb3J5X2lkKGNhdC5pZCl9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXIgPSBmaWx0ZXJGcm9tUm91dGUoKSB8fCBmaWx0ZXJzTWFwLnJlY29tbWVuZGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaCA9IGgucGFyYW1CeU5hbWUoJ3BnX3NlYXJjaCcpLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoUHJvamVjdHMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGwgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYy5tb2RlbHMucHJvamVjdFNlYXJjaC5wb3N0T3B0aW9ucyh7cXVlcnk6IHNlYXJjaH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZSA9IHsgLy8gV2UgYnVpbGQgYW4gb2JqZWN0IHdpdGggdGhlIHNhbWUgaW50ZXJmYWNlIGFzIHBhZ2luYXRpb25WTVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzTG9hZGluZzogbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRQYWdlOiAoKSA9PiB7IHJldHVybiBmYWxzZTsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKHBhZ2UuY29sbGVjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYWdlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkUHJvamVjdHMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhZ2VzID0gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKGMubW9kZWxzLnByb2plY3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlcy5maXJzdFBhZ2UoZmlsdGVyLmZpbHRlci5vcmRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuX2Zvcl9jb250cmlidXRpb25zOiAnZGVzYycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZV9vcmRlcjogJ2FzYycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZGVzYydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhZ2VzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc1N0cmluZyhzZWFyY2gpICYmIHNlYXJjaC5sZW5ndGggPiAwICYmIHJvdXRlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlKCdCdXNjYSAnICsgc2VhcmNoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdHMoc2VhcmNoUHJvamVjdHMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUoZmlsdGVyLnRpdGxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdHMobG9hZFByb2plY3RzKCkpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeUlkKGNhdCAmJiBjYXQuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgIHRvZ2dsZUNhdGVnb3JpZXMudG9nZ2xlKCk7XG4gICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICB0b2dnbGVDYXRlZ29yaWVzID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKTtcblxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9hZFJvdXRlKCk7XG4gICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcblxuICAgICAgICAgICAgLy8gSW5pdGlhbCBsb2Fkc1xuICAgICAgICAgICAgYy5tb2RlbHMucHJvamVjdC5wYWdlU2l6ZSg5KTtcbiAgICAgICAgICAgIGxvYWRDYXRlZ29yaWVzKCkudGhlbihsb2FkUm91dGUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNhdGVnb3JpZXM6IGNhdGVnb3J5Q29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICBmb2xsb3dDYXRlZ29yeTogZm9sbG93Q2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgdW5Gb2xsb3dDYXRlZ29yeTogdW5Gb2xsb3dDYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0czogcHJvamVjdHMsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJzTWFwOiBmaWx0ZXJzTWFwLFxuICAgICAgICAgICAgICAgIHRvZ2dsZUNhdGVnb3JpZXM6IHRvZ2dsZUNhdGVnb3JpZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5oZXJvLXNlYXJjaCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNleHBsb3JlLW9wZW4ubGluay1oaWRkZW4td2hpdGUuZm9udHdlaWdodC1saWdodC5mb250c2l6ZS1sYXJnZXJbaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgpO1wiXScse29uY2xpY2s6ICgpID0+IGN0cmwudG9nZ2xlQ2F0ZWdvcmllcy50b2dnbGUoKX0sIFsnRXhwbG9yZSBwcm9qZXRvcyBpbmNyw612ZWlzICcsbShgc3BhbiNleHBsb3JlLWJ0bi5mYS5mYS1hbmdsZS1kb3duJHtjdHJsLnRvZ2dsZUNhdGVnb3JpZXMoKSA/ICcub3BlbmVkJyA6ICcnfWAsICcnKV0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oYCNjYXRlZ29yaWVzLmNhdGVnb3J5LXNsaWRlciR7Y3RybC50b2dnbGVDYXRlZ29yaWVzKCkgPyAnLm9wZW5lZCcgOiAnJ31gLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLmNhdGVnb3JpZXMoKSwgKGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5DYXRlZ29yeUJ1dHRvbiwge2NhdGVnb3J5OiBjYXRlZ29yeX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLmZpbHRlcnNNYXAsIChmaWx0ZXIsIGhyZWYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLkZpbHRlckJ1dHRvbiwge3RpdGxlOiBmaWx0ZXIudGl0bGUsIGhyZWY6IGhyZWZ9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNi53LWNvbC1zbWFsbC03LnctY29sLXRpbnktNycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlcicsIGN0cmwudGl0bGUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uaXNPYmplY3QoY3RybC5jYXRlZ29yeSgpKSA/IG0oJy53LWNvbC53LWNvbC02LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbGxvd2luZy5mb250c2l6ZS1zbWFsbC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtcmlnaHQnLCBgJHtjdHJsLmNhdGVnb3J5KCkuZm9sbG93ZXJzfSBzZWd1aWRvcmVzYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtMTIudy1jb2wtdGlueS0xMicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLmNhdGVnb3J5KCkuZm9sbG93aW5nID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnkudW5mb2xsb3ctYnRuW2hyZWY9XFwnI1xcJ10nLCB7b25jbGljazogY3RybC51bkZvbGxvd0NhdGVnb3J5KGN0cmwuY2F0ZWdvcnkoKS5pZCl9LCAnRGVpeGFyIGRlIHNlZ3VpcicpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5idG4uYnRuLW1lZGl1bS5mb2xsb3ctYnRuW2hyZWY9XFwnI1xcJ10nLCB7b25jbGljazogY3RybC5mb2xsb3dDYXRlZ29yeShjdHJsLmNhdGVnb3J5KCkuaWQpfSwgJ1NlZ3VpcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJydcblxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIF8ubWFwKGN0cmwucHJvamVjdHMoKS5jb2xsZWN0aW9uKCksIChwcm9qZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RDYXJkLCB7cHJvamVjdDogcHJvamVjdCwgcmVmOiAnY3Ryc2VfZXhwbG9yZSd9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5wcm9qZWN0cygpLmlzTG9hZGluZygpID8gaC5sb2FkZXIoKSA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1tZWRpdW0uYnRuLXRlcmNpYXJ5W2hyZWY9XFwnI2xvYWRNb3JlXFwnXScsIHtvbmNsaWNrOiAoKSA9PiB7IGN0cmwucHJvamVjdHMoKS5uZXh0UGFnZSgpOyByZXR1cm4gZmFsc2U7IH19LCAnQ2FycmVnYXIgbWFpcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKV07XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cubW9tZW50KSk7XG4iLCJ3aW5kb3cuYy5yb290LlByb2plY3RzSG9tZSA9ICgoKG0sIGMsIG1vbWVudCwgaCwgXykgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3Byb2plY3RzLmhvbWUnKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBzYW1wbGUzID0gXy5wYXJ0aWFsKF8uc2FtcGxlLCBfLCAzKSxcbiAgICAgICAgICAgICAgICBsb2FkZXJXaXRoVG9rZW4gPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4sXG4gICAgICAgICAgICAgICAgbG9hZGVyID0gXy5wYXJ0aWFsKG0ucG9zdGdyZXN0LmxvYWRlciwgXywgbS5wb3N0Z3Jlc3QucmVxdWVzdCksXG4gICAgICAgICAgICAgICAgcHJvamVjdCA9IGMubW9kZWxzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgZmlsdGVycyA9IGMudm1zLnByb2plY3RGaWx0ZXJzKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbGxlY3Rpb25zID0gXy5tYXAoWydyZWNvbW1lbmRlZCddLCAobmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGYgPSBmaWx0ZXJzW25hbWVdLFxuICAgICAgICAgICAgICAgICAgICAgIGNMb2FkZXIgPSBsb2FkZXJXaXRoVG9rZW4ocHJvamVjdC5nZXRQYWdlT3B0aW9ucyhmLmZpbHRlci5wYXJhbWV0ZXJzKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uID0gbS5wcm9wKFtdKTtcblxuICAgICAgICAgICAgICAgIGNMb2FkZXIubG9hZCgpLnRoZW4oXy5jb21wb3NlKGNvbGxlY3Rpb24sIHNhbXBsZTMpKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBmLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICBoYXNoOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGNMb2FkZXJcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbnM6IGNvbGxlY3Rpb25zXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uaGVyby1mdWxsLmhlcm8tMjAxNicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbWVnYWp1bWJvLnUtbWFyZ2luYm90dG9tLTYwLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udGNvbG9yLW5lZ2F0aXZlJywgSTE4bi50KCd0aXRsZScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2hyZWY9XCJodHRwOi8vMjAxNS5jYXRhcnNlLm1lL1wiXS5idG4uYnRuLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwLmJ0bi1pbmxpbmUnLCBJMThuLnQoJ2N0YScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBfLm1hcChjdHJsLmNvbGxlY3Rpb25zLCAoY29sbGVjdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Qcm9qZWN0Um93LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiBgaG9tZV8ke2NvbGxlY3Rpb24uaGFzaH1gXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgfTtcbn0pKHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93Lm1vbWVudCwgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLnJvb3QuUHJvamVjdHNTaG93ID0gKChtLCBjLCBfLCBoLCB2bXMpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHZtcy5wcm9qZWN0KGFyZ3MucHJvamVjdF9pZCwgYXJncy5wcm9qZWN0X3VzZXJfaWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gY3RybC5wcm9qZWN0RGV0YWlscygpO1xuICAgICAgICAgICAgcmV0dXJuICghY3RybC5pc0xvYWRpbmcoKSkgP1xuICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LXNob3cnLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogaC5taXhwYW5lbFRyYWNrKClcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdEhlYWRlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiBjdHJsLnVzZXJEZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RUYWJzLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogY3RybC5yZXdhcmREZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RNYWluLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogY3RybC5yZXdhcmREZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5pc19vd25lcl9vcl9hZG1pbiA/IG0uY29tcG9uZW50KGMuUHJvamVjdERhc2hib2FyZE1lbnUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgfSkgOiAnJylcbiAgICAgICAgICAgICAgICBdKSA6IGgubG9hZGVyKCk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5fLCB3aW5kb3cuYy5oLCB3aW5kb3cuYy52bXMpKTtcbiIsIndpbmRvdy5jLnJvb3QuU3RhcnQgPSAoKG0sIGMsIGgsIG1vZGVscywgSTE4bikgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3BhZ2VzLnN0YXJ0Jyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRQYW5lID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnkgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIGZlYXR1cmVkUHJvamVjdHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnlJZHggPSBtLnByb3AoLTEpLFxuICAgICAgICAgICAgICAgIHN0YXJ0dm0gPSBjLnZtcy5zdGFydChJMThuKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJzID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNLFxuICAgICAgICAgICAgICAgIHBhbmVJbWFnZXMgPSBzdGFydHZtLnBhbmVzLFxuICAgICAgICAgICAgICAgIGNhdGVnb3J5dm0gPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlfaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0dm0gPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHVzZXJ2bSA9IGZpbHRlcnMoe1xuICAgICAgICAgICAgICAgICAgICBpZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGxvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbixcbiAgICAgICAgICAgICAgICBzdGF0c0xvYWRlciA9IGxvYWRlcihtb2RlbHMuc3RhdGlzdGljLmdldFJvd09wdGlvbnMoKSksXG4gICAgICAgICAgICAgICAgbG9hZENhdGVnb3JpZXMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjLm1vZGVscy5jYXRlZ29yeS5nZXRQYWdlV2l0aFRva2VuKGZpbHRlcnMoe30pLm9yZGVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdhc2MnXG4gICAgICAgICAgICAgICAgICAgIH0pLnBhcmFtZXRlcnMoKSkudGhlbihjYXRlZ29yaWVzKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNlbGVjdFBhbmUgPSAoaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFBhbmUoaWR4KTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxDYXRlZ29yeSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvYWRlcihtb2RlbHMuY2F0ZWdvcnlUb3RhbHMuZ2V0Um93T3B0aW9ucyhjYXRlZ29yeXZtLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbFByb2plY3QgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2FkZXIobW9kZWxzLnByb2plY3REZXRhaWwuZ2V0Um93T3B0aW9ucyhwcm9qZWN0dm0ucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsVXNlciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvYWRlcihtb2RlbHMudXNlckRldGFpbC5nZXRSb3dPcHRpb25zKHVzZXJ2bS5wYXJhbWV0ZXJzKCkpKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNlbGVjdENhdGVnb3J5ID0gKGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZENhdGVnb3J5SWR4KGNhdGVnb3J5LmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5dm0uY2F0ZWdvcnlfaWQoY2F0ZWdvcnkuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeShbY2F0ZWdvcnldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsQ2F0ZWdvcnkoKS5sb2FkKCkudGhlbihsb2FkQ2F0ZWdvcnlQcm9qZWN0cyk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXRVc2VyID0gKHVzZXIsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmZWF0dXJlZFByb2plY3RzKClbaWR4XSA9IF8uZXh0ZW5kKHt9LCBmZWF0dXJlZFByb2plY3RzKClbaWR4XSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlclRodW1iOiAgXy5maXJzdCh1c2VyKS5wcm9maWxlX2ltZ190aHVtYm5haWxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXRQcm9qZWN0ID0gKHByb2plY3QsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmZWF0dXJlZFByb2plY3RzKClbaWR4XSA9IF8uZmlyc3QocHJvamVjdCk7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJ2bS5pZChfLmZpcnN0KHByb2plY3QpLnVzZXIuaWQpO1xuICAgICAgICAgICAgICAgICAgICBsVXNlcigpLmxvYWQoKS50aGVuKCh1c2VyKSA9PiBzZXRVc2VyKHVzZXIsIGlkeCkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbG9hZENhdGVnb3J5UHJvamVjdHMgPSAoY2F0ZWdvcnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeShjYXRlZ29yeSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjYXRlZ29yeVByb2plY3RzID0gXy5maW5kV2hlcmUoc3RhcnR2bS5jYXRlZ29yeVByb2plY3RzLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeUlkOiBfLmZpcnN0KGNhdGVnb3J5KS5jYXRlZ29yeV9pZFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZmVhdHVyZWRQcm9qZWN0cyhbXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChjYXRlZ29yeVByb2plY3RzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAoY2F0ZWdvcnlQcm9qZWN0cy5zYW1wbGVQcm9qZWN0cywgKHByb2plY3RfaWQsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghXy5pc1VuZGVmaW5lZChwcm9qZWN0X2lkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0dm0ucHJvamVjdF9pZChwcm9qZWN0X2lkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbFByb2plY3QoKS5sb2FkKCkudGhlbigocHJvamVjdCkgPT4gc2V0UHJvamVjdChwcm9qZWN0LCBpZHgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHN0YXRzTG9hZGVyLmxvYWQoKS50aGVuKHN0YXRzKTtcbiAgICAgICAgICAgIGxvYWRDYXRlZ29yaWVzKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3RhdHM6IHN0YXRzLFxuICAgICAgICAgICAgICAgIGNhdGVnb3JpZXM6IGNhdGVnb3JpZXMsXG4gICAgICAgICAgICAgICAgcGFuZUltYWdlczogcGFuZUltYWdlcyxcbiAgICAgICAgICAgICAgICBzZWxlY3RDYXRlZ29yeTogc2VsZWN0Q2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeTogc2VsZWN0ZWRDYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZENhdGVnb3J5SWR4OiBzZWxlY3RlZENhdGVnb3J5SWR4LFxuICAgICAgICAgICAgICAgIHNlbGVjdFBhbmU6IHNlbGVjdFBhbmUsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRQYW5lOiBzZWxlY3RlZFBhbmUsXG4gICAgICAgICAgICAgICAgZmVhdHVyZWRQcm9qZWN0czogZmVhdHVyZWRQcm9qZWN0cyxcbiAgICAgICAgICAgICAgICB0ZXN0aW1vbmlhbHM6IHN0YXJ0dm0udGVzdGltb25pYWxzLFxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uczogc3RhcnR2bS5xdWVzdGlvbnNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgc3RhdHMgPSBfLmZpcnN0KGN0cmwuc3RhdHMoKSk7XG4gICAgICAgICAgICBjb25zdCB0ZXN0aW1vbmlhbHMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF8ubWFwKGN0cmwudGVzdGltb25pYWxzLCAodGVzdGltb25pYWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy5jYXJkLnUtcmFkaXVzLmNhcmQtYmlnLmNhcmQtdGVyY2lhcnknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBpbWcudGh1bWItdGVzdGltb25pYWwudS1yb3VuZC51LW1hcmdpbmJvdHRvbS0yMFtzcmM9XCIke3Rlc3RpbW9uaWFsLnRodW1iVXJsfVwiXWApXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMzAnLCBgXCIke3Rlc3RpbW9uaWFsLmNvbnRlbnR9XCJgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5mb250d2VpZ2h0LXNlbWlib2xkJywgdGVzdGltb25pYWwubmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLCB0ZXN0aW1vbmlhbC50b3RhbHMpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLmhlcm8tZnVsbC5oZXJvLXN0YXJ0JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS00MCcsIEkxOG4udCgnc2xvZ2FuJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1wdXNoLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMFtocmVmPVwiI3N0YXJ0LWZvcm1cIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IGguc2Nyb2xsVG8oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBJMThuLnQoJ3N1Ym1pdCcsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBfLmlzRW1wdHkoc3RhdHMpID8gJycgOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0LmxpbmVoZWlnaHQtbG9vc2UnLCBoLmZvcm1hdE51bWJlcihzdGF0cy50b3RhbF9jb250cmlidXRvcnMsIDAsIDMpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1zbWFsbC5zdGFydC1zdGF0cycsIEkxOG4udCgnaGVhZGVyLnBlb3BsZScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QubGluZWhlaWdodC1sb29zZScsIHN0YXRzLnRvdGFsX2NvbnRyaWJ1dGVkLnRvU3RyaW5nKCkuc2xpY2UoMCwgMikgKyAnIG1pbGjDtWVzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtc21hbGwuc3RhcnQtc3RhdHMnLCBJMThuLnQoJ2hlYWRlci5tb25leScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QubGluZWhlaWdodC1sb29zZScsIGguZm9ybWF0TnVtYmVyKHN0YXRzLnRvdGFsX3Byb2plY3RzX3N1Y2Nlc3MsIDAsIDMpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1zbWFsbC5zdGFydC1zdGF0cycsIEkxOG4udCgnaGVhZGVyLnN1Y2Nlc3MnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwLnctY29sLXB1c2gtMS51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLnUtbWFyZ2luYm90dG9tLTEwLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBJMThuLnQoJ3BhZ2UtdGl0bGUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwnLCBJMThuLnQoJ3BhZ2Utc3VidGl0bGUnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNsZWFyZml4Lmhvdy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuaG93LWNvbC0wMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmluZm8taG93d29ya3MtYmFja2VycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlJywgSTE4bi50KCdiYW5uZXIuMScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnYmFubmVyLjInLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuaW5mby1ob3d3b3Jrcy1iYWNrZXJzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UnLCBJMThuLnQoJ2Jhbm5lci4zJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlJywgSTE4bi50KCdiYW5uZXIuNCcsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuaG93LWNvbC0wMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5ob3ctY29sLTAzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZScsIEkxOG4udCgnYmFubmVyLjUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnYmFubmVyLjYnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS51LW1hcmdpbnRvcC0zMCcsIEkxOG4udCgnYmFubmVyLjcnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnYmFubmVyLjgnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLmhvdy1jb2wtMDEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5pbmZvLWhvd3dvcmtzLWJhY2tlcnMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZScsIEkxOG4udCgnYmFubmVyLjEnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLCBJMThuLnQoJ2Jhbm5lci4yJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmluZm8taG93d29ya3MtYmFja2VycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlJywgSTE4bi50KCdiYW5uZXIuMycsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsICBJMThuLnQoJ2Jhbm5lci40JywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmluZm8taG93d29ya3MtYmFja2VycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlJywgSTE4bi50KCdiYW5uZXIuNScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsICBJMThuLnQoJ2Jhbm5lci42JywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmluZm8taG93d29ya3MtYmFja2VycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlJywgSTE4bi50KCdiYW5uZXIuNycsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsICBJMThuLnQoJ2Jhbm5lci44JywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uZGl2aWRlcicpLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1sYXJnZScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1sYXJnZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBJMThuLnQoJ2ZlYXR1cmVzLnRpdGxlJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0yMCcsIEkxOG4udCgnZmVhdHVyZXMuc3VidGl0bGUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLW1haW4udy1oaWRkZW4tbWVkaXVtLnUtbWFyZ2ludG9wLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsIEkxOG4udCgnZmVhdHVyZXMuZmVhdHVyZV8xJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMzAnLCBJMThuLnQoJ2ZlYXR1cmVzLmZlYXR1cmVfMicsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTMwJywgSTE4bi50KCdmZWF0dXJlcy5mZWF0dXJlXzMnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsIEkxOG4udCgnZmVhdHVyZXMuZmVhdHVyZV80JywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMzAnLCBJMThuLnQoJ2ZlYXR1cmVzLmZlYXR1cmVfNScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy10YWJzLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctdGFiLW1lbnUudy1jb2wudy1jb2wtNCcsIF8ubWFwKGN0cmwucGFuZUltYWdlcywgKHBhbmUsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbShgYnRuLnctdGFiLWxpbmsudy1pbmxpbmUtYmxvY2sudGFiLWxpc3QtaXRlbSR7KGlkeCA9PT0gY3RybC5zZWxlY3RlZFBhbmUoKSkgPyAnLnNlbGVjdGVkJyA6ICcnfWAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuc2VsZWN0UGFuZShpZHgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHBhbmUubGFiZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy10YWItY29udGVudC53LWNvbC53LWNvbC04JywgXy5tYXAoY3RybC5wYW5lSW1hZ2VzLCAocGFuZSwgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy10YWItcGFuZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGltZ1tzcmM9XCIke3BhbmUuc3JjfVwiXS5wYW5lLWltYWdlJHsoaWR4ID09PSBjdHJsLnNlbGVjdGVkUGFuZSgpKSA/ICcuc2VsZWN0ZWQnIDogJyd9YClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1sYXJnZS5iZy1ibHVlLW9uZScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLmxpbmVoZWlnaHQtdGlnaHQuZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEkxOG4udCgndmlkZW8udGl0bGUnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBJMThuLnQoJ3ZpZGVvLnN1YnRpdGxlJywgSTE4blNjb3BlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuWW91dHViZUxpZ2h0Ym94LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBJMThuLnQoJ3ZpZGVvLnNyYycsIEkxOG5TY29wZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5zZWN0aW9uLWNhdGVnb3JpZXMnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwLnctY29sLXB1c2gtMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS00MC5mb250Y29sb3ItbmVnYXRpdmUnLCBJMThuLnQoJ2NhdGVnb3JpZXMudGl0bGUnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctdGFicycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy10YWItbWVudS51LXRleHQtY2VudGVyJywgXy5tYXAoY3RybC5jYXRlZ29yaWVzKCksIChjYXRlZ29yeSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbShgYS53LXRhYi1saW5rLnctaW5saW5lLWJsb2NrLmJ0bi1jYXRlZ29yeS5zbWFsbC5idG4taW5saW5lJHsoY3RybC5zZWxlY3RlZENhdGVnb3J5SWR4KCkgPT09IGNhdGVnb3J5LmlkKSA/ICcudy0tY3VycmVudCcgOiAnJ31gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnNlbGVjdENhdGVnb3J5KGNhdGVnb3J5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBjYXRlZ29yeS5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctdGFiLWNvbnRlbnQudS1tYXJnaW50b3AtNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXRhYi1wYW5lLnctLXRhYi1hY3RpdmUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCAoY3RybC5zZWxlY3RlZENhdGVnb3J5SWR4KCkgIT09IC0xKSA/IF8ubWFwKGN0cmwuc2VsZWN0ZWRDYXRlZ29yeSgpLCAoY2F0ZWdvcnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1iby51LW1hcmdpbmJvdHRvbS0yMCcsIGNhdGVnb3J5Lm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS53LWJ1dHRvbi5idG4uYnRuLW1lZGl1bS5idG4taW5saW5lLmJ0bi1kYXJrW2hyZWY9XCIjc3RhcnQtZm9ybVwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IGguc2Nyb2xsVG8oKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgSTE4bi50KCdzdWJtaXQnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udGNvbG9yLW5lZ2F0aXZlJywgYFIkICR7Y2F0ZWdvcnkudG90YWxfc3VjY2Vzc2Z1bF92YWx1ZSA/IGguZm9ybWF0TnVtYmVyKGNhdGVnb3J5LnRvdGFsX3N1Y2Nlc3NmdWxfdmFsdWUsIDIsIDMpIDogJy4uLid9YCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMjAnLCAnRG9hZG9zIHBhcmEgcHJvamV0b3MnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udGNvbG9yLW5lZ2F0aXZlJywgKGNhdGVnb3J5LnN1Y2Nlc3NmdWxfcHJvamVjdHMpID8gY2F0ZWdvcnkuc3VjY2Vzc2Z1bF9wcm9qZWN0cyA6ICcuLi4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsICdQcm9qZXRvcyBmaW5hbmNpYWRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gIV8uaXNFbXB0eShjdHJsLmZlYXR1cmVkUHJvamVjdHMoKSkgPyBfLm1hcChjdHJsLmZlYXR1cmVkUHJvamVjdHMoKSwgKHByb2plY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICByZXR1cm4gIV8uaXNVbmRlZmluZWQocHJvamVjdCkgPyBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgbShgaW1nLnVzZXItYXZhdGFyW3NyYz1cIiR7cHJvamVjdC51c2VyVGh1bWJ9XCJdYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBwcm9qZWN0LnVzZXIubmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgSTE4bi50KCdjYXRlZ29yaWVzLnBsZWRnZWQnLCBJMThuU2NvcGUoe3BsZWRnZWQ6IGguZm9ybWF0TnVtYmVyKHByb2plY3QucGxlZGdlZCksIGNvbnRyaWJ1dG9yczogcHJvamVjdC50b3RhbF9jb250cmlidXRvcnN9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgbShgYS5saW5rLWhpZGRlbltocmVmPVwiLyR7cHJvamVjdC5wZXJtYWxpbmt9XCJdYCwgcHJvamVjdC5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBdKSA6IG0oJy5mb250c2l6ZS1iYXNlJywgSTE4bi50KCdjYXRlZ29yaWVzLmxvYWRpbmdfZmVhdHVyZWQnLCBJMThuU2NvcGUoKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gfSkgOiBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnY2F0ZWdvcmllcy5ub19mZWF0dXJlZCcsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5TbGlkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVzOiB0ZXN0aW1vbmlhbHMoKSxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IEkxOG4udCgndGVzdGltb25pYWxzX3RpdGxlJywgSTE4blNjb3BlKCkpXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5kaXZpZGVyLnUtbWFyZ2ludG9wLTMwJyksXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tNjAudS1tYXJnaW50b3AtNDAnLCBJMThuLnQoJ3FhX3RpdGxlJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBfLm1hcChjdHJsLnF1ZXN0aW9ucy5jb2xfMSwgKHF1ZXN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiBxdWVzdGlvbi5xdWVzdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiBxdWVzdGlvbi5hbnN3ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgXy5tYXAoY3RybC5xdWVzdGlvbnMuY29sXzIsIChxdWVzdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogcXVlc3Rpb24ucXVlc3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogcXVlc3Rpb24uYW5zd2VyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcjc3RhcnQtZm9ybS53LXNlY3Rpb24uc2VjdGlvbi1sYXJnZS51LXRleHQtY2VudGVyLmJnLXB1cnBsZS5iZWZvcmUtZm9vdGVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtanVtYm8uZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTYwJywgJ0NyaWUgbyBzZXUgcmFzY3VuaG8gZ3JhdHVpdGFtZW50ZSEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm1bYWN0aW9uPVwiL3B0L3Byb2plY3RzXCJdW21ldGhvZD1cIlBPU1RcIl0udy1yb3cudy1mb3JtJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIuZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTEwJywgSTE4bi50KCdmb3JtLnRpdGxlJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXRbbmFtZT1cInV0ZjhcIl1bdHlwZT1cImhpZGRlblwiXVt2YWx1ZT1cIuKck1wiXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBpbnB1dFtuYW1lPVwiYXV0aGVudGljaXR5X3Rva2VuXCJdW3R5cGU9XCJoaWRkZW5cIl1bdmFsdWU9XCIke2guYXV0aGVudGljaXR5VG9rZW4oKX1cIl1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLm1lZGl1bS51LW1hcmdpbmJvdHRvbS0zMFt0eXBlPVwidGV4dFwiXScsIHtuYW1lOiAncHJvamVjdFtuYW1lXSd9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci5mb250Y29sb3ItbmVnYXRpdmUudS1tYXJnaW5ib3R0b20tMTAnLCAnbmEgY2F0ZWdvcmlhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NlbGVjdC53LXNlbGVjdC50ZXh0LWZpZWxkLm1lZGl1bS51LW1hcmdpbmJvdHRvbS00MCcsIHtuYW1lOiAncHJvamVjdFtjYXRlZ29yeV9pZF0nfSxbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdvcHRpb25bdmFsdWU9XCJcIl0nLCBJMThuLnQoJ2Zvcm0uc2VsZWN0X2RlZmF1bHQnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAoY3RybC5jYXRlZ29yaWVzKCksIChjYXRlZ29yeSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKGBvcHRpb25bdmFsdWU9XCIke2NhdGVnb3J5LmlkfVwiXWAsIGNhdGVnb3J5Lm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS04MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtcHVzaC00LnUtbWFyZ2ludG9wLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgaW5wdXRbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIiR7STE4bi50KCdmb3JtLnN1Ym1pdCcsIEkxOG5TY29wZSgpKX1cIl0udy1idXR0b24uYnRuLmJ0bi1sYXJnZWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5jLm1vZGVscywgd2luZG93LkkxOG4pKTtcbiIsIndpbmRvdy5jLnJvb3QuVGVhbSA9IChmdW5jdGlvbihtLCBjKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3N0YXRpYy10ZWFtLWFwcCcsIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlRlYW1Ub3RhbCksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5UZWFtTWVtYmVycylcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLnJvb3QuQmFsYW5jZSBjb21wb25lbnRcbiAqIEEgcm9vdCBjb21wb25lbnQgdG8gc2hvdyB1c2VyIGJhbGFuY2UgYW5kIHRyYW5zYWN0aW9uc1xuICpcbiAqIEV4YW1wbGU6XG4gKiBUbyBtb3VudCB0aGlzIGNvbXBvbmVudCBqdXN0IGNyZWF0ZSBhIERPTSBlbGVtZW50IGxpa2U6XG4gKiA8ZGl2IGRhdGEtbWl0aHJpbD1cIlVzZXJzQmFsYW5jZVwiIGRhdGEtcGFyYW1ldGVycz1cInsndXNlcl9pZCc6IDEwfVwiPlxuICovXG53aW5kb3cuYy5yb290LlVzZXJzQmFsYW5jZSA9ICgobSwgXywgYywgbW9kZWxzKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHVzZXJJZFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHt1c2VyX2lkOiAnZXEnfSk7XG5cbiAgICAgICAgICAgIHVzZXJJZFZNLnVzZXJfaWQoYXJncy51c2VyX2lkKTtcblxuICAgICAgICAgICAgLy8gSGFuZGxlcyB3aXRoIHVzZXIgYmFsYW5jZSByZXF1ZXN0IGRhdGFcbiAgICAgICAgICAgIGNvbnN0IGJhbGFuY2VNYW5hZ2VyID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xsZWN0aW9uID0gbS5wcm9wKFt7YW1vdW50OiAwLCB1c2VyX2lkOiBhcmdzLnVzZXJfaWR9XSksXG4gICAgICAgICAgICAgICAgICAgICAgbG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWxzLmJhbGFuY2UuZ2V0Um93V2l0aFRva2VuKHVzZXJJZFZNLnBhcmFtZXRlcnMoKSkudGhlbihjb2xsZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgbG9hZDogbG9hZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuXG4gICAgICAgICAgICAgICAgICAvLyBIYW5kbGVzIHdpdGggdXNlciBiYWxhbmNlIHRyYW5zYWN0aW9ucyBsaXN0IGRhdGFcbiAgICAgICAgICAgICAgICAgIGJhbGFuY2VUcmFuc2FjdGlvbk1hbmFnZXIgPSAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpc3RWTSA9IG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWxzLmJhbGFuY2VUcmFuc2FjdGlvbiwgJ2NyZWF0ZWRfYXQuZGVzYycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UodXNlcklkVk0ucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZDogbG9hZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdDogbGlzdFZNXG4gICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIH0pKCksXG5cbiAgICAgICAgICAgICAgICAgIC8vIEhhbmRsZXMgd2l0aCBiYW5rIGFjY291bnQgdG8gY2hlY2tcbiAgICAgICAgICAgICAgICAgIGJhbmtBY2NvdW50TWFuYWdlciA9ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVyID0gKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVscy5iYW5rQWNjb3VudC5nZXRSb3dPcHRpb25zKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJZFZNLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZGVyLmxvYWQoKS50aGVuKGNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkOiBsb2FkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkZXI6IGxvYWRlclxuICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGJhbmtBY2NvdW50TWFuYWdlcjogYmFua0FjY291bnRNYW5hZ2VyLFxuICAgICAgICAgICAgICAgIGJhbGFuY2VNYW5hZ2VyOiBiYWxhbmNlTWFuYWdlcixcbiAgICAgICAgICAgICAgICBiYWxhbmNlVHJhbnNhY3Rpb25NYW5hZ2VyOiBiYWxhbmNlVHJhbnNhY3Rpb25NYW5hZ2VyXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IG9wdHMgPSBfLmV4dGVuZCh7fSwgYXJncywgY3RybCk7XG4gICAgICAgICAgICByZXR1cm4gbSgnI2JhbGFuY2UtYXJlYScsIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlVzZXJCYWxhbmNlLCBvcHRzKSxcbiAgICAgICAgICAgICAgICBtKCcuZGl2aWRlcicpLFxuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuVXNlckJhbGFuY2VUcmFuc2FjdGlvbnMsIG9wdHMpLFxuICAgICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS00MCcpLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi5jYXJkLXRlcmNpYXJ5LmJlZm9yZS1mb290ZXInKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLkFkbWluQ29udHJpYnV0aW9uRGV0YWlsID0gKGZ1bmN0aW9uKG0sIF8sIGMsIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICBsZXQgbDtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRSZXdhcmQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbW9kZWwgPSBjLm1vZGVscy5yZXdhcmREZXRhaWwsXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZF9pZCA9IGFyZ3MuaXRlbS5yZXdhcmRfaWQsXG4gICAgICAgICAgICAgICAgICAgIG9wdHMgPSBtb2RlbC5nZXRSb3dPcHRpb25zKGguaWRWTS5pZChyZXdhcmRfaWQpLnBhcmFtZXRlcnMoKSksXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZCA9IG0ucHJvcCh7fSk7XG4gICAgICAgICAgICAgICAgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihvcHRzKTtcbiAgICAgICAgICAgICAgICBpZiAocmV3YXJkX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIGwubG9hZCgpLnRoZW4oXy5jb21wb3NlKHJld2FyZCwgXy5maXJzdCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmV3YXJkO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHJld2FyZCA9IGxvYWRSZXdhcmQoKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmV3YXJkOiByZXdhcmQsXG4gICAgICAgICAgICAgICAgYWN0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICd1c2VyX2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ1RyYW5zZmVyaXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJMYWJlbDogJ0lkIGRvIG5vdm8gYXBvaWFkb3I6JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdUcmFuc2ZlcmlyIEFwb2lvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnZXg6IDEyOTkwOCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzTWVzc2FnZTogJ0Fwb2lvIHRyYW5zZmVyaWRvIGNvbSBzdWNlc3NvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdPIGFwb2lvIG7Do28gZm9pIHRyYW5zZmVyaWRvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJld2FyZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0S2V5OiAncHJvamVjdF9pZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdjb250cmlidXRpb25faWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0S2V5OiAncmV3YXJkX2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhZGlvczogJ3Jld2FyZHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnQWx0ZXJhciBSZWNvbXBlbnNhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdSZWNvbXBlbnNhJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldE1vZGVsOiBjLm1vZGVscy5yZXdhcmREZXRhaWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVNb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtOiByZXdhcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZTogKHJld2FyZHMsIG5ld1Jld2FyZElEKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHJld2FyZCA9IF8uZmluZFdoZXJlKHJld2FyZHMsIHtpZDogbmV3UmV3YXJkSUR9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGFyZ3MuaXRlbS52YWx1ZSA+PSByZXdhcmQubWluaW11bV92YWx1ZSkgPyB1bmRlZmluZWQgOiAnVmFsb3IgbcOtbmltbyBkYSByZWNvbXBlbnNhIMOpIG1haW9yIGRvIHF1ZSBvIHZhbG9yIGRhIGNvbnRyaWJ1acOnw6NvLic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHJlZnVuZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnUmVlbWJvbHNvIGRpcmV0bycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnVGVtIGNlcnRlemEgcXVlIGRlc2VqYSByZWVtYm9sc2FyIGVzc2UgYXBvaW8/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdSZWVtYm9sc2FyIEFwb2lvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiBjLm1vZGVscy5jb250cmlidXRpb25EZXRhaWxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ3N0YXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ0FwYWdhcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnVGVtIGNlcnRlemEgcXVlIGRlc2VqYSBhcGFnYXIgZXNzZSBhcG9pbz8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ0FwYWdhciBBcG9pbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JjZVZhbHVlOiAnZGVsZXRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzTWVzc2FnZTogJ0Fwb2lvIHJlbW92aWRvIGNvbSBzdWNlc3NvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdPIGFwb2lvIG7Do28gZm9pIHJlbW92aWRvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGw6IGxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGFjdGlvbnMgPSBjdHJsLmFjdGlvbnMsXG4gICAgICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgICByZXdhcmQgPSBjdHJsLnJld2FyZDtcblxuICAgICAgICAgICAgY29uc3QgYWRkT3B0aW9ucyA9IChidWlsZGVyLCBpZCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgYnVpbGRlciwge1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0T3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiAoYC9hZG1pbi9jb250cmlidXRpb25zLyR7aWR9L2dhdGV3YXlfcmVmdW5kYCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjYWRtaW4tY29udHJpYnV0aW9uLWRldGFpbC1ib3gnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW50b3AtMjAudS1tYXJnaW5ib3R0b20tMjAnKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5JbnB1dEFjdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYWN0aW9ucy50cmFuc2ZlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChjdHJsLmwoKSkgPyBoLmxvYWRlciA6XG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5SYWRpb0FjdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYWN0aW9ucy5yZXdhcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiByZXdhcmQsXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRLZXlWYWx1ZTogaXRlbS5wcm9qZWN0X2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5VmFsdWU6IGl0ZW0uY29udHJpYnV0aW9uX2lkXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluRXh0ZXJuYWxBY3Rpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGFkZE9wdGlvbnMoYWN0aW9ucy5yZWZ1bmQsIGl0ZW0uaWQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbklucHV0QWN0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBhY3Rpb25zLnJlbW92ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cuY2FyZC5jYXJkLXRlcmNpYXJ5LnUtcmFkaXVzJywgW1xuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluVHJhbnNhY3Rpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbjogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblRyYW5zYWN0aW9uSGlzdG9yeSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAoY3RybC5sKCkpID8gaC5sb2FkZXIgOlxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUmV3YXJkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXdhcmQ6IHJld2FyZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogaXRlbS5rZXlcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvbkl0ZW0gPSAoZnVuY3Rpb24obSwgYywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpdGVtQnVpbGRlcjogW3tcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Db250cmlidXRpb25Vc2VyJyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTQnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pblByb2plY3QnLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluQ29udHJpYnV0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTInXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdQYXltZW50U3RhdHVzJyxcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTInXG4gICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oXG4gICAgICAgICAgICAgICAgJy53LXJvdycsXG4gICAgICAgICAgICAgICAgXy5tYXAoY3RybC5pdGVtQnVpbGRlciwgZnVuY3Rpb24ocGFuZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0ocGFuZWwud3JhcHBlckNsYXNzLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjW3BhbmVsLmNvbXBvbmVudF0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBhcmdzLmtleVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuQWRtaW5Db250cmlidXRpb25Vc2VyIGNvbXBvbmVudFxuICogQW4gaXRlbWJ1aWxkZXIgY29tcG9uZW50IHRoYXQgcmV0dXJucyBhZGRpdGlvbmFsIGRhdGFcbiAqIHRvIGJlIGluY2x1ZGVkIGluIEFkbWluVXNlci5cbiAqXG4gKiBFeGFtcGxlOlxuICogY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gKiAgICAgcmV0dXJuIHtcbiAqICAgICAgICAgaXRlbUJ1aWxkZXI6IFt7XG4gKiAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pbkNvbnRyaWJ1dGlvblVzZXInLFxuICogICAgICAgICAgICAgd3JhcHBlckNsYXNzOiAnLnctY29sLnctY29sLTQnXG4gKiAgICAgICAgIH1dXG4gKiAgICAgfVxuICogfVxuICovXG53aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvblVzZXIgPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgICAgdXNlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgICBwcm9maWxlX2ltZ190aHVtYm5haWw6IGl0ZW0udXNlcl9wcm9maWxlX2ltZyxcbiAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS51c2VyX2lkLFxuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGl0ZW0udXNlcl9uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiBpdGVtLmVtYWlsLFxuICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgYWRkaXRpb25hbERhdGEgPSBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdHYXRld2F5OiAnICsgaXRlbS5wYXllcl9lbWFpbCk7XG4gICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5BZG1pblVzZXIsIHtpdGVtOiB1c2VyLCBhZGRpdGlvbmFsX2RhdGE6IGFkZGl0aW9uYWxEYXRhfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuQWRtaW5Db250cmlidXRpb24gPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjb250cmlidXRpb24gPSBhcmdzLml0ZW07XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LmFkbWluLWNvbnRyaWJ1dGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtc21hbGwnLCAnUiQnICsgY29udHJpYnV0aW9uLnZhbHVlKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgubW9tZW50aWZ5KGNvbnRyaWJ1dGlvbi5jcmVhdGVkX2F0LCAnREQvTU0vWVlZWSBISDptbVtoXScpKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCBbXG4gICAgICAgICAgICAgICAgICAgICdJRCBkbyBHYXRld2F5OiAnLFxuICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiaHR0cHM6Ly9kYXNoYm9hcmQucGFnYXIubWUvIy90cmFuc2FjdGlvbnMvJyArIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkICsgJ1wiXScsIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFkbWluRXh0ZXJuYWxBY3Rpb24gY29tcG9uZW50XG4gKiBNYWtlcyBhcmJpdHJhcnkgYWpheCByZXF1ZXN0cyBhbmQgdXBkYXRlIHVuZGVybHlpbmdcbiAqIGRhdGEgZnJvbSBzb3VyY2UgZW5kcG9pbnQuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQWRtaW5FeHRlcm5hbEFjdGlvbiwge1xuICogICAgIGRhdGE6IHt9LFxuICogICAgIGl0ZW06IHJvd0Zyb21EYXRhYmFzZVxuICogfSlcbiAqL1xud2luZG93LmMuQWRtaW5FeHRlcm5hbEFjdGlvbiA9ICgoZnVuY3Rpb24obSwgaCwgYywgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBidWlsZGVyID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBlcnJvciA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZmFpbCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZGF0YSA9IHt9LFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW07XG5cbiAgICAgICAgICAgIGJ1aWxkZXIucmVxdWVzdE9wdGlvbnMuY29uZmlnID0gKHhocikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChoLmF1dGhlbnRpY2l0eVRva2VuKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ1gtQ1NSRi1Ub2tlbicsIGguYXV0aGVudGljaXR5VG9rZW4oKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgcmVsb2FkID0gXy5jb21wb3NlKGJ1aWxkZXIubW9kZWwuZ2V0Um93V2l0aFRva2VuLCBoLmlkVk0uaWQoaXRlbVtidWlsZGVyLnVwZGF0ZUtleV0pLnBhcmFtZXRlcnMpLFxuICAgICAgICAgICAgICAgIGwgPSBtLnBvc3RncmVzdC5sb2FkZXIoYnVpbGRlci5yZXF1ZXN0T3B0aW9ucywgbS5yZXF1ZXN0KTtcblxuICAgICAgICAgICAgY29uc3QgcmVsb2FkSXRlbSA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVsb2FkKCkudGhlbih1cGRhdGVJdGVtKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3RFcnJvciA9IChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBlcnJvcih0cnVlKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZUl0ZW0gPSAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgXy5leHRlbmQoaXRlbSwgcmVzWzBdKTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBzdWJtaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbC5sb2FkKCkudGhlbihyZWxvYWRJdGVtLCByZXF1ZXN0RXJyb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHVubG9hZCA9IChlbCwgaXNpbml0LCBjb250ZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5vbnVubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogY29tcGxldGUsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIGw6IGwsXG4gICAgICAgICAgICAgICAgc3VibWl0OiBzdWJtaXQsXG4gICAgICAgICAgICAgICAgdG9nZ2xlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKSxcbiAgICAgICAgICAgICAgICB1bmxvYWQ6IHVubG9hZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgYnRuVmFsdWUgPSAoY3RybC5sKCkpID8gJ3BvciBmYXZvciwgYWd1YXJkZS4uLicgOiBkYXRhLmNhbGxUb0FjdGlvbjtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0yJywgW1xuICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0sIGRhdGEub3V0ZXJMYWJlbCksIChjdHJsLnRvZ2dsZXIoKSkgP1xuICAgICAgICAgICAgICAgIG0oJy5kcm9wZG93bi1saXN0LmNhcmQudS1yYWRpdXMuZHJvcGRvd24tbGlzdC1tZWRpdW0uemluZGV4LTEwJywge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwudW5sb2FkXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdmb3JtLnctZm9ybScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgICAgICAgICB9LCAoIWN0cmwuY29tcGxldGUoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbCcsIGRhdGEuaW5uZXJMYWJlbCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWJ1dHRvbi5idG4uYnRuLXNtYWxsW3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCInICsgYnRuVmFsdWUgKyAnXCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSA6ICghY3RybC5lcnJvcigpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZG9uZVtzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnUmVxdWlzacOnw6NvIGZlaXRhIGNvbSBzdWNlc3NvLicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1lcnJvcltzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnSG91dmUgdW0gcHJvYmxlbWEgbmEgcmVxdWlzacOnw6NvLicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pKHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYywgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkFkbWluRmlsdGVyID0gKGZ1bmN0aW9uKGMsIG0sIF8sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdG9nZ2xlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHZhciBmaWx0ZXJCdWlsZGVyID0gYXJncy5maWx0ZXJCdWlsZGVyLFxuICAgICAgICAgICAgICAgIGRhdGEgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgbGFiZWwgPSBhcmdzLmxhYmVsIHx8ICcnLFxuICAgICAgICAgICAgICAgIG1haW4gPSBfLmZpbmRXaGVyZShmaWx0ZXJCdWlsZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjYWRtaW4tY29udHJpYnV0aW9ucy1maWx0ZXIudy1zZWN0aW9uLnBhZ2UtaGVhZGVyJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTMwJywgbGFiZWwpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnZm9ybScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbnN1Ym1pdDogYXJncy5zdWJtaXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoXy5maW5kV2hlcmUoZmlsdGVyQnVpbGRlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJNYWluJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSA/IG0uY29tcG9uZW50KGNbbWFpbi5jb21wb25lbnRdLCBtYWluLmRhdGEpIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTIwLnctcm93JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uLnctY29sLnctY29sLTEyLmZvbnRzaXplLXNtYWxsZXN0LmxpbmstaGlkZGVuLWxpZ2h0W3N0eWxlPVwiYmFja2dyb3VuZDogbm9uZTsgYm9yZGVyOiBub25lOyBvdXRsaW5lOiBub25lOyB0ZXh0LWFsaWduOiBsZWZ0O1wiXVt0eXBlPVwiYnV0dG9uXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnRmlsdHJvcyBhdmFuw6dhZG9zIMKgPicpKSwgKGN0cmwudG9nZ2xlcigpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2FkdmFuY2VkLXNlYXJjaC53LXJvdy5hZG1pbi1maWx0ZXJzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAoZmlsdGVyQnVpbGRlciwgZnVuY3Rpb24oZikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoZi5jb21wb25lbnQgIT09ICdGaWx0ZXJNYWluJykgPyBtLmNvbXBvbmVudChjW2YuY29tcG9uZW50XSwgZi5kYXRhKSA6ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93LmMsIHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5JbnB1dEFjdGlvbiA9IChmdW5jdGlvbihtLCBoLCBjKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIGJ1aWxkZXIgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgY29tcGxldGUgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBmYWlsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge30sXG4gICAgICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgICBrZXkgPSBidWlsZGVyLnByb3BlcnR5LFxuICAgICAgICAgICAgICAgIGZvcmNlVmFsdWUgPSBidWlsZGVyLmZvcmNlVmFsdWUgfHwgbnVsbCxcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZSA9IG0ucHJvcChmb3JjZVZhbHVlKTtcblxuICAgICAgICAgICAgaC5pZFZNLmlkKGl0ZW1bYnVpbGRlci51cGRhdGVLZXldKTtcblxuICAgICAgICAgICAgdmFyIGwgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYnVpbGRlci5tb2RlbC5wYXRjaE9wdGlvbnMoaC5pZFZNLnBhcmFtZXRlcnMoKSwgZGF0YSkpO1xuXG4gICAgICAgICAgICB2YXIgdXBkYXRlSXRlbSA9IGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgIF8uZXh0ZW5kKGl0ZW0sIHJlc1swXSk7XG4gICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGRhdGFba2V5XSA9IG5ld1ZhbHVlKCk7XG4gICAgICAgICAgICAgICAgbC5sb2FkKCkudGhlbih1cGRhdGVJdGVtLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKHRydWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciB1bmxvYWQgPSBmdW5jdGlvbihlbCwgaXNpbml0LCBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5vbnVubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3VmFsdWUoZm9yY2VWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29tcGxldGU6IGNvbXBsZXRlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcixcbiAgICAgICAgICAgICAgICBsOiBsLFxuICAgICAgICAgICAgICAgIG5ld1ZhbHVlOiBuZXdWYWx1ZSxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgICAgIHVubG9hZDogdW5sb2FkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBidG5WYWx1ZSA9IChjdHJsLmwoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSwgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC51bmxvYWRcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm0udy1mb3JtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgICAgIH0sICghY3RybC5jb21wbGV0ZSgpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsJywgZGF0YS5pbm5lckxhYmVsKSwgKGRhdGEuZm9yY2VWYWx1ZSA9PT0gdW5kZWZpbmVkKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGRbdHlwZT1cInRleHRcIl1bcGxhY2Vob2xkZXI9XCInICsgZGF0YS5wbGFjZWhvbGRlciArICdcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgY3RybC5uZXdWYWx1ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGN0cmwubmV3VmFsdWUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tc21hbGxbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIicgKyBidG5WYWx1ZSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICBdIDogKCFjdHJsLmVycm9yKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsIGRhdGEuc3VjY2Vzc01lc3NhZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1lcnJvcltzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnSG91dmUgdW0gcHJvYmxlbWEgbmEgcmVxdWlzacOnw6NvLiAnICsgZGF0YS5lcnJvck1lc3NhZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkl0ZW0gPSAoZnVuY3Rpb24obSwgXywgaCwgYykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5RGV0YWlsQm94ID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5RGV0YWlsQm94OiBkaXNwbGF5RGV0YWlsQm94XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gYXJncy5pdGVtO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY2xlYXJmaXguY2FyZC51LXJhZGl1cy51LW1hcmdpbmJvdHRvbS0yMC5yZXN1bHRzLWFkbWluLWl0ZW1zJywgW1xuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGFyZ3MubGlzdEl0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAga2V5OiBhcmdzLmtleVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG0oJ2J1dHRvbi53LWlubGluZS1ibG9jay5hcnJvdy1hZG1pbi5mYS5mYS1jaGV2cm9uLWRvd24uZm9udGNvbG9yLXNlY29uZGFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5kaXNwbGF5RGV0YWlsQm94LnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGN0cmwuZGlzcGxheURldGFpbEJveCgpID8gbS5jb21wb25lbnQoYXJncy5saXN0RGV0YWlsLCB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIGtleTogYXJncy5rZXlcbiAgICAgICAgICAgICAgICB9KSA6ICcnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluTGlzdCA9IChmdW5jdGlvbihtLCBoLCBjKSB7XG4gICAgdmFyIGFkbWluID0gYy5hZG1pbjtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgbGlzdCA9IGFyZ3Mudm0ubGlzdDtcbiAgICAgICAgICAgIGlmICghbGlzdC5jb2xsZWN0aW9uKCkubGVuZ3RoICYmIGxpc3QuZmlyc3RQYWdlKSB7XG4gICAgICAgICAgICAgICAgbGlzdC5maXJzdFBhZ2UoKS50aGVuKG51bGwsIGZ1bmN0aW9uKHNlcnZlckVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3Mudm0uZXJyb3Ioc2VydmVyRXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGxpc3QgPSBhcmdzLnZtLmxpc3QsXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBhcmdzLnZtLmVycm9yLFxuICAgICAgICAgICAgICAgIGxhYmVsID0gYXJncy5sYWJlbCB8fCAnJztcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJyxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoKSA/XG4gICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLmNhcmQtZXJyb3IudS1yYWRpdXMuZm9udHdlaWdodC1ib2xkJywgZXJyb3IoKSkgOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYENhcnJlZ2FuZG8gJHtsYWJlbC50b0xvd2VyQ2FzZSgpfS4uLmAgOiBbbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgbGlzdC50b3RhbCgpKSwgYCAke2xhYmVsLnRvTG93ZXJDYXNlKCl9IGVuY29udHJhZG9zYF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNhZG1pbi1jb250cmlidXRpb25zLWxpc3Qudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5jb2xsZWN0aW9uKCkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuQWRtaW5JdGVtLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbTogYXJncy5saXN0SXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3REZXRhaWw6IGFyZ3MubGlzdERldGFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGl0ZW0uaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtcHVzaC01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaC5sb2FkZXIoKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2J1dHRvbiNsb2FkLW1vcmUuYnRuLmJ0bi1tZWRpdW0uYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogbGlzdC5uZXh0UGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnQ2FycmVnYXIgbWFpcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIi8qKlxuICogd2luZG93LmMuQWRtaW5Ob3RpZmljYXRpb25IaXN0b3J5IGNvbXBvbmVudFxuICogUmV0dXJuIG5vdGlmaWNhdGlvbnMgbGlzdCBmcm9tIGFuIFVzZXIgb2JqZWN0LlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkFkbWluTm90aWZpY2F0aW9uSGlzdG9yeSwge1xuICogICAgIHVzZXI6IHVzZXJcbiAqIH0pXG4gKi9cblxud2luZG93LmMuQWRtaW5Ob3RpZmljYXRpb25IaXN0b3J5ID0gKChtLCBoLCBfLCBtb2RlbHMpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9ucyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgZ2V0Tm90aWZpY2F0aW9ucyA9ICh1c2VyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBub3RpZmljYXRpb24gPSBtb2RlbHMubm90aWZpY2F0aW9uO1xuICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb24uZ2V0UGFnZVdpdGhUb2tlbihtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcl9pZDogJ2VxJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbnRfYXQ6ICdpcy5udWxsJ1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAudXNlcl9pZCh1c2VyLmlkKVxuICAgICAgICAgICAgICAgICAgICAuc2VudF9hdCghbnVsbClcbiAgICAgICAgICAgICAgICAgICAgLm9yZGVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbnRfYXQ6ICdkZXNjJ1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAucGFyYW1ldGVycygpKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihub3RpZmljYXRpb25zKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBnZXROb3RpZmljYXRpb25zKGFyZ3MudXNlcik7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uczogbm90aWZpY2F0aW9uc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ0hpc3TDs3JpY28gZGUgbm90aWZpY2HDp8O1ZXMnKSxcbiAgICAgICAgICAgICAgICBjdHJsLm5vdGlmaWNhdGlvbnMoKS5tYXAoKGNFdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyLmRhdGUtZXZlbnQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMjQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnknLCBoLm1vbWVudGlmeShjRXZlbnQuc2VudF9hdCwgJ0REL01NL1lZWVksIEhIOm1tJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIC0gJywgY0V2ZW50LnRlbXBsYXRlX25hbWUsIGNFdmVudC5vcmlnaW4gPyAnIC0gJyArIGNFdmVudC5vcmlnaW4gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Ll8sIHdpbmRvdy5jLm1vZGVscykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5BZG1pblByb2plY3REZXRhaWxzQ2FyZCBjb21wb25lbnRcbiAqIHJlbmRlciBhbiBib3ggd2l0aCBzb21lIHByb2plY3Qgc3RhdGlzdGljcyBpbmZvXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQWRtaW5Qcm9qZWN0RGV0YWlsc0NhcmQsIHtcbiAqICAgICByZXNvdXJjZTogcHJvamVjdERldGFpbCBPYmplY3QsXG4gKiB9KVxuICovXG53aW5kb3cuYy5BZG1pblByb2plY3REZXRhaWxzQ2FyZCA9ICgobSwgaCwgbW9tZW50KSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBwcm9qZWN0ID0gYXJncy5yZXNvdXJjZSxcbiAgICAgICAgICAgICAgICBnZW5lcmF0ZVN0YXR1c1RleHQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdGF0dXNUZXh0T2JqID0gbS5wcm9wKHt9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c1RleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25saW5lOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC1zdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ05PIEFSJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJ3RleHQtc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdGSU5BTkNJQURPJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbGVkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC1lcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdOw4NPIEZJTkFOQ0lBRE8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YWl0aW5nX2Z1bmRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC13YWl0aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ0FHVUFSREFORE8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3RlZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJ3RleHQtZXJyb3InLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnUkVDVVNBRE8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcmFmdDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdSQVNDVU5ITydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluX2FuYWx5c2lzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ0VNIEFOw4FMSVNFJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm92ZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnQVBST1ZBRE8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBzdGF0dXNUZXh0T2JqKHN0YXR1c1RleHRbcHJvamVjdC5zdGF0ZV0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXNUZXh0T2JqO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaXNGaW5hbExhcCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQFRPRE86IHVzZSA4IGRheXMgYmVjYXVzZSB0aW1lem9uZSBvbiBqc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIV8uaXNOdWxsKHByb2plY3QuZXhwaXJlc19hdCkgJiYgbW9tZW50KCkuYWRkKDgsICdkYXlzJykgPj0gbW9tZW50KHByb2plY3Quem9uZV9leHBpcmVzX2F0KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgIHN0YXR1c1RleHRPYmo6IGdlbmVyYXRlU3RhdHVzVGV4dCgpLFxuICAgICAgICAgICAgICAgIHJlbWFpbmluZ1RleHRPYmo6IGgudHJhbnNsYXRlZFRpbWUocHJvamVjdC5yZW1haW5pbmdfdGltZSksXG4gICAgICAgICAgICAgICAgZWxhcHNlZFRleHRPYmo6IGgudHJhbnNsYXRlZFRpbWUocHJvamVjdC5lbGFwc2VkX3RpbWUpLFxuICAgICAgICAgICAgICAgIGlzRmluYWxMYXA6IGlzRmluYWxMYXBcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIGxldCBwcm9qZWN0ID0gY3RybC5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIHByb2dyZXNzID0gcHJvamVjdC5wcm9ncmVzcy50b0ZpeGVkKDIpLFxuICAgICAgICAgICAgICAgIHN0YXR1c1RleHRPYmogPSBjdHJsLnN0YXR1c1RleHRPYmooKSxcbiAgICAgICAgICAgICAgICByZW1haW5pbmdUZXh0T2JqID0gY3RybC5yZW1haW5pbmdUZXh0T2JqLFxuICAgICAgICAgICAgICAgIGVsYXBzZWRUZXh0T2JqID0gY3RybC5lbGFwc2VkVGV4dE9iajtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LWRldGFpbHMtY2FyZC5jYXJkLnUtcmFkaXVzLmNhcmQtdGVyY2lhcnkudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsICdTdGF0dXM6JyksICfCoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiBzdGF0dXNUZXh0T2JqLmNzc0NsYXNzXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAoY3RybC5pc0ZpbmFsTGFwKCkgJiYgcHJvamVjdC5vcGVuX2Zvcl9jb250cmlidXRpb25zID8gJ1JFVEEgRklOQUwnIDogc3RhdHVzVGV4dE9iai50ZXh0KSksICfCoCdcbiAgICAgICAgICAgICAgICAgICAgXSksICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvamVjdC5pc19wdWJsaXNoZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcubWV0ZXIudS1tYXJnaW50b3AtMjAudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcubWV0ZXItZmlsbCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogKHByb2dyZXNzID4gMTAwID8gMTAwIDogcHJvZ3Jlc3MpICsgJyUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsICdmaW5hbmNpYWRvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIHByb2dyZXNzICsgJyUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCAnbGV2YW50YWRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdSJCAnICsgaC5mb3JtYXROdW1iZXIocHJvamVjdC5wbGVkZ2VkLCAyKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ2Fwb2lvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dGlvbnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfLmlzTnVsbChwcm9qZWN0LmV4cGlyZXNfYXQpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCAnaW5pY2lhZG8gaMOhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBlbGFwc2VkVGV4dE9iai50b3RhbCArICcgJyArIGVsYXBzZWRUZXh0T2JqLnVuaXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsICdyZXN0YW0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCByZW1haW5pbmdUZXh0T2JqLnRvdGFsICsgJyAnICsgcmVtYWluaW5nVGV4dE9iai51bml0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgICAgICAgICB9KCkpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5tb21lbnQpKTtcbiIsIndpbmRvdy5jLkFkbWluUHJvamVjdCA9IChmdW5jdGlvbihtLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLml0ZW07XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LmFkbWluLXByb2plY3QnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QudS1yYWRpdXNbc3JjPScgKyBwcm9qZWN0LnByb2plY3RfaW1nICsgJ11bd2lkdGg9NTBdJylcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOS53LWNvbC1zbWFsbC05JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbdGFyZ2V0PVwiX2JsYW5rXCJdW2hyZWY9XCIvJyArIHByb2plY3QucGVybWFsaW5rICsgJ1wiXScsIHByb2plY3QucHJvamVjdF9uYW1lKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBwcm9qZWN0LnByb2plY3Rfc3RhdGUpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgubW9tZW50aWZ5KHByb2plY3QucHJvamVjdF9vbmxpbmVfZGF0ZSkgKyAnIGEgJyArIGgubW9tZW50aWZ5KHByb2plY3QucHJvamVjdF9leHBpcmVzX2F0KSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5SYWRpb0FjdGlvbiA9IChmdW5jdGlvbihtLCBoLCBjLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIGJ1aWxkZXIgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgY29tcGxldGUgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7fSxcbiAgICAgICAgICAgICAgICAvL1RPRE86IEltcGxlbWVudCBhIGRlc2NyaXB0b3IgdG8gYWJzdHJhY3QgdGhlIGluaXRpYWwgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICBlcnJvciA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZmFpbCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbSgpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gbS5wcm9wKGl0ZW0uZGVzY3JpcHRpb24gfHwgJycpLFxuICAgICAgICAgICAgICAgIGtleSA9IGJ1aWxkZXIuZ2V0S2V5LFxuICAgICAgICAgICAgICAgIG5ld0lEID0gbS5wcm9wKCcnKSxcbiAgICAgICAgICAgICAgICBnZXRGaWx0ZXIgPSB7fSxcbiAgICAgICAgICAgICAgICBzZXRGaWx0ZXIgPSB7fSxcbiAgICAgICAgICAgICAgICByYWRpb3MgPSBtLnByb3AoKSxcbiAgICAgICAgICAgICAgICBnZXRBdHRyID0gYnVpbGRlci5yYWRpb3MsXG4gICAgICAgICAgICAgICAgZ2V0S2V5ID0gYnVpbGRlci5nZXRLZXksXG4gICAgICAgICAgICAgICAgZ2V0S2V5VmFsdWUgPSBhcmdzLmdldEtleVZhbHVlLFxuICAgICAgICAgICAgICAgIHVwZGF0ZUtleSA9IGJ1aWxkZXIudXBkYXRlS2V5LFxuICAgICAgICAgICAgICAgIHVwZGF0ZUtleVZhbHVlID0gYXJncy51cGRhdGVLZXlWYWx1ZSxcbiAgICAgICAgICAgICAgICB2YWxpZGF0ZSA9IGJ1aWxkZXIudmFsaWRhdGUsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtID0gYnVpbGRlci5zZWxlY3RlZEl0ZW0gfHwgbS5wcm9wKCk7XG5cbiAgICAgICAgICAgIHNldEZpbHRlclt1cGRhdGVLZXldID0gJ2VxJztcbiAgICAgICAgICAgIHZhciBzZXRWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTShzZXRGaWx0ZXIpO1xuICAgICAgICAgICAgc2V0Vk1bdXBkYXRlS2V5XSh1cGRhdGVLZXlWYWx1ZSk7XG5cbiAgICAgICAgICAgIGdldEZpbHRlcltnZXRLZXldID0gJ2VxJztcbiAgICAgICAgICAgIHZhciBnZXRWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTShnZXRGaWx0ZXIpO1xuICAgICAgICAgICAgZ2V0Vk1bZ2V0S2V5XShnZXRLZXlWYWx1ZSk7XG5cbiAgICAgICAgICAgIHZhciBnZXRMb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYnVpbGRlci5nZXRNb2RlbC5nZXRQYWdlT3B0aW9ucyhnZXRWTS5wYXJhbWV0ZXJzKCkpKTtcblxuICAgICAgICAgICAgdmFyIHNldExvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLnVwZGF0ZU1vZGVsLnBhdGNoT3B0aW9ucyhzZXRWTS5wYXJhbWV0ZXJzKCksIGRhdGEpKTtcblxuICAgICAgICAgICAgdmFyIHVwZGF0ZUl0ZW0gPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdJdGVtID0gXy5maW5kV2hlcmUocmFkaW9zKCksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBkYXRhWzBdW2J1aWxkZXIuc2VsZWN0S2V5XVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtKG5ld0l0ZW0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdOZW5odW0gaXRlbSBhdHVhbGl6YWRvJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBmZXRjaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGdldExvYWRlci5sb2FkKCkudGhlbihyYWRpb3MsIGVycm9yKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAobmV3SUQoKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgdmFsaWRhdGlvbiA9IHZhbGlkYXRlKHJhZGlvcygpLCBuZXdJRCgpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF8uaXNVbmRlZmluZWQodmFsaWRhdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbYnVpbGRlci5zZWxlY3RLZXldID0gbmV3SUQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldExvYWRlci5sb2FkKCkudGhlbih1cGRhdGVJdGVtLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiB2YWxpZGF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgdW5sb2FkID0gZnVuY3Rpb24oZWwsIGlzaW5pdCwgY29udGV4dCkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQub251bmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld0lEKCcnKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHNldERlc2NyaXB0aW9uID0gZnVuY3Rpb24odGV4dCkge1xuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uKHRleHQpO1xuICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmZXRjaCgpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgc2V0RGVzY3JpcHRpb246IHNldERlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcixcbiAgICAgICAgICAgICAgICBzZXRMb2FkZXI6IHNldExvYWRlcixcbiAgICAgICAgICAgICAgICBnZXRMb2FkZXI6IGdldExvYWRlcixcbiAgICAgICAgICAgICAgICBuZXdJRDogbmV3SUQsXG4gICAgICAgICAgICAgICAgc3VibWl0OiBzdWJtaXQsXG4gICAgICAgICAgICAgICAgdG9nZ2xlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKSxcbiAgICAgICAgICAgICAgICB1bmxvYWQ6IHVubG9hZCxcbiAgICAgICAgICAgICAgICByYWRpb3M6IHJhZGlvc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbSgpLFxuICAgICAgICAgICAgICAgIGJ0blZhbHVlID0gKGN0cmwuc2V0TG9hZGVyKCkgfHwgY3RybC5nZXRMb2FkZXIoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSwgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC51bmxvYWRcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm0udy1mb3JtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgICAgIH0sICghY3RybC5jb21wbGV0ZSgpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIChjdHJsLnJhZGlvcygpKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLnJhZGlvcygpLCBmdW5jdGlvbihyYWRpbywgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwubmV3SUQocmFkaW8uaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNldERlc2NyaXB0aW9uKHJhZGlvLmRlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IChyYWRpby5pZCA9PT0gKGl0ZW1bZGF0YS5zZWxlY3RLZXldIHx8IGl0ZW0uaWQpKSA/IHRydWUgOiBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yYWRpbycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQjci0nICsgaW5kZXggKyAnLnctcmFkaW8taW5wdXRbdHlwZT1yYWRpb11bbmFtZT1cImFkbWluLXJhZGlvXCJdW3ZhbHVlPVwiJyArIHJhZGlvLmlkICsgJ1wiXScgKyAoKHNlbGVjdGVkKSA/ICdbY2hlY2tlZF0nIDogJycpLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsLnctZm9ybS1sYWJlbFtmb3I9XCJyLScgKyBpbmRleCArICdcIl0nLCAnUiQnICsgcmFkaW8ubWluaW11bV92YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pIDogaC5sb2FkZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3N0cm9uZycsICdEZXNjcmnDp8OjbycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsIGN0cmwuZGVzY3JpcHRpb24oKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWJ1dHRvbi5idG4uYnRuLXNtYWxsW3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCInICsgYnRuVmFsdWUgKyAnXCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSA6ICghY3RybC5lcnJvcigpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZG9uZVtzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnUmVjb21wZW5zYSBhbHRlcmFkYSBjb20gc3VjZXNzbyEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZXJyb3Jbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgY3RybC5lcnJvcigpLm1lc3NhZ2UpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pIDogJydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jLCB3aW5kb3cuXykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5BZG1pblJlc2V0UGFzc3dvcmQgY29tcG9uZW50XG4gKiBNYWtlcyBhamF4IHJlcXVlc3QgdG8gdXBkYXRlIFVzZXIgcGFzc3dvcmQuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQWRtaW5SZXNldFBhc3N3b3JkLCB7XG4gKiAgICAgZGF0YToge30sXG4gKiAgICAgaXRlbTogcm93RnJvbURhdGFiYXNlXG4gKiB9KVxuICovXG53aW5kb3cuYy5BZG1pblJlc2V0UGFzc3dvcmQgPSAoKGZ1bmN0aW9uKG0sIGgsIGMsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICBsZXQgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGtleSA9IGJ1aWxkZXIucHJvcGVydHksXG4gICAgICAgICAgICAgICAgZGF0YSA9IHt9LFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW07XG5cbiAgICAgICAgICAgIGJ1aWxkZXIucmVxdWVzdE9wdGlvbnMuY29uZmlnID0gKHhocikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChoLmF1dGhlbnRpY2l0eVRva2VuKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ1gtQ1NSRi1Ub2tlbicsIGguYXV0aGVudGljaXR5VG9rZW4oKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcihfLmV4dGVuZCh7fSwge2RhdGE6IGRhdGF9LCBidWlsZGVyLnJlcXVlc3RPcHRpb25zKSwgbS5yZXF1ZXN0KSxcbiAgICAgICAgICAgICAgICBuZXdQYXNzd29yZCA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgICAgICAgZXJyb3JfbWVzc2FnZSA9IG0ucHJvcCgnJyk7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3RFcnJvciA9IChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBlcnJvcl9tZXNzYWdlKGVyci5lcnJvcnNbMF0pO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgIGVycm9yKHRydWUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZUl0ZW0gPSAocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgXy5leHRlbmQoaXRlbSwgcmVzWzBdKTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBzdWJtaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZGF0YVtrZXldID0gbmV3UGFzc3dvcmQoKTtcbiAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0sIHJlcXVlc3RFcnJvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgdW5sb2FkID0gKGVsLCBpc2luaXQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgZXJyb3JfbWVzc2FnZTogZXJyb3JfbWVzc2FnZSxcbiAgICAgICAgICAgICAgICBsOiBsLFxuICAgICAgICAgICAgICAgIG5ld1Bhc3N3b3JkOiBuZXdQYXNzd29yZCxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgICAgIHVubG9hZDogdW5sb2FkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBidG5WYWx1ZSA9IChjdHJsLmwoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSwgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC51bmxvYWRcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm0udy1mb3JtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgICAgIH0sICghY3RybC5jb21wbGV0ZSgpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsJywgZGF0YS5pbm5lckxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZFt0eXBlPVwidGV4dFwiXVtuYW1lPVwiJyArIGRhdGEucHJvcGVydHkgKyAnXCJdW3BsYWNlaG9sZGVyPVwiJyArIGRhdGEucGxhY2Vob2xkZXIgKyAnXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGN0cmwubmV3UGFzc3dvcmQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdHJsLm5ld1Bhc3N3b3JkKClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ1NlbmhhIGFsdGVyYWRhIGNvbSBzdWNlc3NvLicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1lcnJvcltzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCBjdHJsLmVycm9yX21lc3NhZ2UoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSkod2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5SZXdhcmQgPSAoZnVuY3Rpb24obSwgYywgaCwgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXdhcmQgPSBhcmdzLnJld2FyZCgpLFxuICAgICAgICAgICAgICAgIGF2YWlsYWJsZSA9IHBhcnNlSW50KHJld2FyZC5wYWlkX2NvdW50KSArIHBhcnNlSW50KHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQpO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnUmVjb21wZW5zYScpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3NlcicsIHJld2FyZC5pZCA/IFtcbiAgICAgICAgICAgICAgICAgICAgJ0lEOiAnICsgcmV3YXJkLmlkLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnVmFsb3IgbcOtbmltbzogUiQnICsgaC5mb3JtYXROdW1iZXIocmV3YXJkLm1pbmltdW1fdmFsdWUsIDIsIDMpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCdEaXNwb27DrXZlaXM6ICcgKyBhdmFpbGFibGUgKyAnIC8gJyArIChyZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zIHx8ICcmaW5maW47JykpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnQWd1YXJkYW5kbyBjb25maXJtYcOnw6NvOiAnICsgcmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0Rlc2NyacOnw6NvOiAnICsgcmV3YXJkLmRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgXSA6ICdBcG9pbyBzZW0gcmVjb21wZW5zYScpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLkFkbWluVHJhbnNhY3Rpb25IaXN0b3J5ID0gKGZ1bmN0aW9uKG0sIGgsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY29udHJpYnV0aW9uID0gYXJncy5jb250cmlidXRpb24sXG4gICAgICAgICAgICAgICAgbWFwRXZlbnRzID0gXy5yZWR1Y2UoW3tcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLnBhaWRfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBcG9pbyBjb25maXJtYWRvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLnBlbmRpbmdfcmVmdW5kX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnUmVlbWJvbHNvIHNvbGljaXRhZG8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24ucmVmdW5kZWRfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdFc3Rvcm5vIHJlYWxpemFkbydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5jcmVhdGVkX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXBvaW8gY3JpYWRvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLnJlZnVzZWRfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBcG9pbyBjYW5jZWxhZG8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24uZGVsZXRlZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0Fwb2lvIGV4Y2x1w61kbydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5jaGFyZ2ViYWNrX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQ2hhcmdlYmFjaydcbiAgICAgICAgICAgICAgICB9XSwgZnVuY3Rpb24obWVtbywgaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5kYXRlICE9PSBudWxsICYmIGl0ZW0uZGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLm9yaWdpbmFsRGF0ZSA9IGl0ZW0uZGF0ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uZGF0ZSA9IGgubW9tZW50aWZ5KGl0ZW0uZGF0ZSwgJ0REL01NL1lZWVksIEhIOm1tJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVtby5jb25jYXQoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVtbztcbiAgICAgICAgICAgICAgICB9LCBbXSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgb3JkZXJlZEV2ZW50czogXy5zb3J0QnkobWFwRXZlbnRzLCAnb3JpZ2luYWxEYXRlJylcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ0hpc3TDs3JpY28gZGEgdHJhbnNhw6fDo28nKSxcbiAgICAgICAgICAgICAgICBjdHJsLm9yZGVyZWRFdmVudHMubWFwKGZ1bmN0aW9uKGNFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyLmRhdGUtZXZlbnQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeScsIGNFdmVudC5kYXRlKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBjRXZlbnQubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5UcmFuc2FjdGlvbiA9IChmdW5jdGlvbihtLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IGFyZ3MuY29udHJpYnV0aW9uO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ0RldGFsaGVzIGRvIGFwb2lvJyksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyJywgW1xuICAgICAgICAgICAgICAgICAgICAnVmFsb3I6IFIkJyArIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi52YWx1ZSwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdUYXhhOiBSJCcgKyBoLmZvcm1hdE51bWJlcihjb250cmlidXRpb24uZ2F0ZXdheV9mZWUsIDIsIDMpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnQWd1YXJkYW5kbyBDb25maXJtYcOnw6NvOiAnICsgKGNvbnRyaWJ1dGlvbi53YWl0aW5nX3BheW1lbnQgPyAnU2ltJyA6ICdOw6NvJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdBbsO0bmltbzogJyArIChjb250cmlidXRpb24uYW5vbnltb3VzID8gJ1NpbScgOiAnTsOjbycpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnSWQgcGFnYW1lbnRvOiAnICsgY29udHJpYnV0aW9uLmdhdGV3YXlfaWQsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdBcG9pbzogJyArIGNvbnRyaWJ1dGlvbi5jb250cmlidXRpb25faWQsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdDaGF2ZTrCoFxcbicsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbi5rZXksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdNZWlvOiAnICsgY29udHJpYnV0aW9uLmdhdGV3YXksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdPcGVyYWRvcmE6ICcgKyAoY29udHJpYnV0aW9uLmdhdGV3YXlfZGF0YSAmJiBjb250cmlidXRpb24uZ2F0ZXdheV9kYXRhLmFjcXVpcmVyX25hbWUpLFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLCAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29udHJpYnV0aW9uLmlzX3NlY29uZF9zbGlwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFttKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIjXCJdJywgJ0JvbGV0byBiYW5jw6FyaW8nKSwgJyAnLCBtKCdzcGFuLmJhZGdlJywgJzJhIHZpYScpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSgpKSxcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5BZG1pblVzZXJEZXRhaWwgY29tcG9uZW50XG4gKiBSZXR1cm4gYWN0aW9uIGlucHV0cyB0byBiZSB1c2VkIGluc2lkZSBBZG1pbkxpc3QgY29tcG9uZW50LlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkFkbWluTGlzdCwge1xuICogICAgIGRhdGE6IHt9LFxuICogICAgIGxpc3REZXRhaWw6IGMuQWRtaW5Vc2VyRGV0YWlsXG4gKiB9KVxuICovXG53aW5kb3cuYy5BZG1pblVzZXJEZXRhaWwgPSAoZnVuY3Rpb24obSwgXywgYyl7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYWN0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICByZXNldDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICdwYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdSZWRlZmluaXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5uZXJMYWJlbDogJ05vdmEgc2VuaGEgZGUgVXN1w6FyaW86JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdSZWRlZmluaXIgc2VuaGEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdleDogMTIzbXVkQHInLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLnVzZXJcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVhY3RpdmF0ZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICdkZWFjdGl2YXRlZF9hdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdpZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdSZWF0aXZhcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnVGVtIGNlcnRlemEgcXVlIGRlc2VqYSByZWF0aXZhciBlc3NlIHVzdcOhcmlvPycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzTWVzc2FnZTogJ1VzdcOhcmlvIHJlYXRpdmFkbyBjb20gc3VjZXNzbyEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlOiAnTyB1c3XDoXJpbyBuw6NvIHDDtGRlIHNlciByZWF0aXZhZG8hJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdSZWF0aXZhciB1c3XDoXJpbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JjZVZhbHVlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLnVzZXJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICAgICAgICB2YXIgYWN0aW9ucyA9IGN0cmwuYWN0aW9ucyxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgIGRldGFpbHMgPSBhcmdzLmRldGFpbHM7XG5cbiAgICAgICAgICAgIGNvbnN0IGFkZE9wdGlvbnMgPSAoYnVpbGRlciwgaWQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5leHRlbmQoe30sIGJ1aWxkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogKGAvdXNlcnMvJHtpZH0vbmV3X3Bhc3N3b3JkYCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnI2FkbWluLWNvbnRyaWJ1dGlvbi1kZXRhaWwtYm94JywgW1xuICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTIwJyksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluUmVzZXRQYXNzd29yZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYWRkT3B0aW9ucyhhY3Rpb25zLnJlc2V0LCBpdGVtLmlkKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChpdGVtLmRlYWN0aXZhdGVkX2F0KSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluSW5wdXRBY3Rpb24sIHtkYXRhOiBhY3Rpb25zLnJlYWN0aXZhdGUsIGl0ZW06IGl0ZW19KSA6ICcnXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93LmNhcmQuY2FyZC10ZXJjaWFyeS51LXJhZGl1cycsIFtcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbk5vdGlmaWNhdGlvbkhpc3RvcnksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluVXNlckl0ZW0gPSAoZnVuY3Rpb24obSwgYywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKFxuICAgICAgICAgICAgICAgICcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblVzZXIsIGFyZ3MpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5Vc2VyID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgdXNlciA9IGFyZ3MuaXRlbTtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tdXNlcicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpbWcudXNlci1hdmF0YXJbc3JjPVwiJyArIGgudXNlQXZhdGFyT3JEZWZhdWx0KHVzZXIucHJvZmlsZV9pbWdfdGh1bWJuYWlsKSArICdcIl0nKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC05LnctY29sLXNtYWxsLTknLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cIi91c2Vycy8nICsgdXNlci5pZCArICcvZWRpdFwiXScsIHVzZXIubmFtZSB8fCB1c2VyLmVtYWlsKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgJ1VzdcOhcmlvOiAnICsgdXNlci5pZCksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0VtYWlsOiAnICsgdXNlci5lbWFpbCksXG4gICAgICAgICAgICAgICAgICAgIGFyZ3MuYWRkaXRpb25hbF9kYXRhXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuQW9uQWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uIGNvbXBvbmVudFxuICogcmVuZGVyIGFuIGV4cGxhbmF0aW9uIGFib3V0IHByb2plY3QgYWxsIG9yIG5vdGhpbmcgcHJvamVjdCBtZGUuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQW9uQWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uLCB7XG4gKiAgICAgcHJvamVjdDogcHJvamVjdERldGFpbCBPYmplY3QsXG4gKiB9KVxuICovXG53aW5kb3cuYy5Bb25BZG1pblByb2plY3REZXRhaWxzRXhwbGFuYXRpb24gPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBleHBsYW5hdGlvbiA9IGZ1bmN0aW9uKHJlc291cmNlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlVGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgb25saW5lOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuJywgJ1ZvY8OqIHBvZGUgcmVjZWJlciBhcG9pb3MgYXTDqSAyM2hzNTltaW41OXMgZG8gZGlhICcgKyBoLm1vbWVudGlmeShyZXNvdXJjZS56b25lX2V4cGlyZXNfYXQpICsgJy4gTGVtYnJlLXNlLCDDqSB0dWRvLW91LW5hZGEgZSB2b2PDqiBzw7MgbGV2YXLDoSBvcyByZWN1cnNvcyBjYXB0YWRvcyBzZSBiYXRlciBhIG1ldGEgZGVudHJvIGRlc3NlIHByYXpvLicpXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NmdWw6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGNvbWVtb3JlIHF1ZSB2b2PDqiBtZXJlY2UhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnIFNldSBwcm9qZXRvIGZvaSBiZW0gc3VjZWRpZG8gZSBhZ29yYSDDqSBhIGhvcmEgZGUgaW5pY2lhciBvIHRyYWJhbGhvIGRlIHJlbGFjaW9uYW1lbnRvIGNvbSBzZXVzIGFwb2lhZG9yZXMhICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQXRlbsOnw6NvIGVzcGVjaWFsIMOgIGVudHJlZ2EgZGUgcmVjb21wZW5zYXMuIFByb21ldGV1PyBFbnRyZWd1ZSEgTsOjbyBkZWl4ZSBkZSBvbGhhciBhIHNlw6fDo28gZGUgcMOzcy1wcm9qZXRvIGRvICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIvZ3VpZGVzXCJdJywgJ0d1aWEgZG9zIFJlYWxpemFkb3JlcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgZSBkZSBpbmZvcm1hci1zZSBzb2JyZcKgJywgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjb21vIG8gcmVwYXNzZSBkbyBkaW5oZWlybyBzZXLDoSBmZWl0by4nKVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICB3YWl0aW5nX2Z1bmRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBlc3RhbW9zIHByb2Nlc3NhbmRvIG9zIMO6bHRpbW9zIHBhZ2FtZW50b3MhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnIFNldSBwcm9qZXRvIGZvaSBmaW5hbGl6YWRvIGVtICcgKyBoLm1vbWVudGlmeShyZXNvdXJjZS56b25lX2V4cGlyZXNfYXQpICsgJyBlIGVzdMOhIGFndWFyZGFuZG8gY29uZmlybWHDp8OjbyBkZSBib2xldG9zIGUgcGFnYW1lbnRvcy4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdEZXZpZG8gw6AgZGF0YSBkZSB2ZW5jaW1lbnRvIGRlIGJvbGV0b3MsIHByb2pldG9zIHF1ZSB0aXZlcmFtIGFwb2lvcyBkZSDDumx0aW1hIGhvcmEgZmljYW0gcG9yIGF0w6kgNCBkaWFzIMO6dGVpcyBuZXNzZSBzdGF0dXMsIGNvbnRhZG9zIGEgcGFydGlyIGRhIGRhdGEgZGUgZmluYWxpemHDp8OjbyBkbyBwcm9qZXRvLsKgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMDM3NDkzLUZJTkFOQ0lBRE8tQ29tby1zZXIlQzMlQTEtZmVpdG8tby1yZXBhc3NlLWRvLWRpbmhlaXJvLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnRW50ZW5kYSBjb21vIG8gcmVwYXNzZSBkZSBkaW5oZWlybyDDqSBmZWl0byBwYXJhIHByb2pldG9zIGJlbSBzdWNlZGlkb3MuJylcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgZmFpbGVkOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBuw6NvIGRlc2FuaW1lIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyBTZXUgcHJvamV0byBuw6NvIGJhdGV1IGEgbWV0YSBlIHNhYmVtb3MgcXVlIGlzc28gbsOjbyDDqSBhIG1lbGhvciBkYXMgc2Vuc2HDp8O1ZXMuIE1hcyBuw6NvIGRlc2FuaW1lLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0VuY2FyZSBvIHByb2Nlc3NvIGNvbW8gdW0gYXByZW5kaXphZG8gZSBuw6NvIGRlaXhlIGRlIGNvZ2l0YXIgdW1hIHNlZ3VuZGEgdGVudGF0aXZhLiBOw6NvIHNlIHByZW9jdXBlLCB0b2RvcyBvcyBzZXVzIGFwb2lhZG9yZXMgcmVjZWJlcsOjbyBvIGRpbmhlaXJvIGRlIHZvbHRhLsKgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMzY1NTA3LVJlZ3Jhcy1lLWZ1bmNpb25hbWVudG8tZG9zLXJlZW1ib2xzb3MtZXN0b3Jub3NcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudGVuZGEgY29tbyBmYXplbW9zIGVzdG9ybm9zIGUgcmVlbWJvbHNvcy4nKVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICByZWplY3RlZDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgaW5mZWxpem1lbnRlIG7Do28gZm9pIGRlc3RhIHZlei4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgVm9jw6ogZW52aW91IHNldSBwcm9qZXRvIHBhcmEgYW7DoWxpc2UgZG8gQ2F0YXJzZSBlIGVudGVuZGVtb3MgcXVlIGVsZSBuw6NvIGVzdMOhIGRlIGFjb3JkbyBjb20gbyBwZXJmaWwgZG8gc2l0ZS4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdUZXIgdW0gcHJvamV0byByZWN1c2FkbyBuw6NvIGltcGVkZSBxdWUgdm9jw6ogZW52aWUgbm92b3MgcHJvamV0b3MgcGFyYSBhdmFsaWHDp8OjbyBvdSByZWZvcm11bGUgc2V1IHByb2pldG8gYXR1YWwuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29udmVyc2UgY29tIG5vc3NvIGF0ZW5kaW1lbnRvISBSZWNvbWVuZGFtb3MgcXVlIHZvY8OqIGTDqiB1bWEgYm9hIG9saGFkYSBub3PCoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjM4NzYzOC1EaXJldHJpemVzLXBhcmEtY3JpYSVDMyVBNyVDMyVBM28tZGUtcHJvamV0b3NcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ2NyaXTDqXJpb3MgZGEgcGxhdGFmb3JtYScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgZSBub8KgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi9ndWlkZXNcIl0nLCAnZ3VpYSBkb3MgcmVhbGl6YWRvcmVzJyksICcuJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBkcmFmdDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgY29uc3RydWEgbyBzZXUgcHJvamV0byEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoFF1YW50byBtYWlzIGN1aWRhZG9zbyBlIGJlbSBmb3JtYXRhZG8gZm9yIHVtIHByb2pldG8sIG1haW9yZXMgYXMgY2hhbmNlcyBkZSBlbGUgc2VyIGJlbSBzdWNlZGlkbyBuYSBzdWEgY2FtcGFuaGEgZGUgY2FwdGHDp8Ojby4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdBbnRlcyBkZSBlbnZpYXIgc2V1IHByb2pldG8gcGFyYSBhIG5vc3NhIGFuw6FsaXNlLCBwcmVlbmNoYSB0b2RhcyBhcyBhYmFzIGFvIGxhZG8gY29tIGNhcmluaG8uIFZvY8OqIHBvZGUgc2FsdmFyIGFzIGFsdGVyYcOnw7VlcyBlIHZvbHRhciBhbyByYXNjdW5obyBkZSBwcm9qZXRvIHF1YW50YXMgdmV6ZXMgcXVpc2VyLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1F1YW5kbyB0dWRvIGVzdGl2ZXIgcHJvbnRvLCBjbGlxdWUgbm8gYm90w6NvIEVOVklBUiBlIGVudHJhcmVtb3MgZW0gY29udGF0byBwYXJhIGF2YWxpYXIgbyBzZXUgcHJvamV0by4nXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGluX2FuYWx5c2lzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCB2b2PDqiBlbnZpb3Ugc2V1IHByb2pldG8gcGFyYSBhbsOhbGlzZSBlbSAnICsgaC5tb21lbnRpZnkocmVzb3VyY2Uuc2VudF90b19hbmFseXNpc19hdCkgKyAnIGUgcmVjZWJlcsOhIG5vc3NhIGF2YWxpYcOnw6NvIGVtIGF0w6kgNCBkaWFzIMO6dGVpcyBhcMOzcyBvIGVudmlvIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgRW5xdWFudG8gZXNwZXJhIGEgc3VhIHJlc3Bvc3RhLCB2b2PDqiBwb2RlIGNvbnRpbnVhciBlZGl0YW5kbyBvIHNldSBwcm9qZXRvLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1JlY29tZW5kYW1vcyB0YW1iw6ltIHF1ZSB2b2PDqiB2w6EgY29sZXRhbmRvIGZlZWRiYWNrIGNvbSBhcyBwZXNzb2FzIHByw7N4aW1hcyBlIHBsYW5lamFuZG8gY29tbyBzZXLDoSBhIHN1YSBjYW1wYW5oYS4nXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGFwcHJvdmVkOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBzZXUgcHJvamV0byBmb2kgYXByb3ZhZG8hJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqBQYXJhIGNvbG9jYXIgbyBzZXUgcHJvamV0byBubyBhciDDqSBwcmVjaXNvIGFwZW5hcyBxdWUgdm9jw6ogcHJlZW5jaGEgb3MgZGFkb3MgbmVjZXNzw6FyaW9zIG5hIGFiYcKgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIiN1c2VyX3NldHRpbmdzXCJdJywgJ0NvbnRhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnLiDDiSBpbXBvcnRhbnRlIHNhYmVyIHF1ZSBjb2JyYW1vcyBhIHRheGEgZGUgMTMlIGRvIHZhbG9yIHRvdGFsIGFycmVjYWRhZG8gYXBlbmFzIHBvciBwcm9qZXRvcyBiZW0gc3VjZWRpZG9zLiBFbnRlbmRhwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjb21vIGZhemVtb3MgbyByZXBhc3NlIGRvIGRpbmhlaXJvLicpXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZVRleHRbcmVzb3VyY2Uuc3RhdGVdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBleHBsYW5hdGlvbjogZXhwbGFuYXRpb24oYXJncy5yZXNvdXJjZSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCdwLicgKyBhcmdzLnJlc291cmNlLnN0YXRlICsgJy1wcm9qZWN0LXRleHQuZm9udHNpemUtc21hbGwubGluZWhlaWdodC1sb29zZScsIGN0cmwuZXhwbGFuYXRpb24pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuQ2F0ZWdvcnlCdXR0b24gY29tcG9uZW50XG4gKiBSZXR1cm4gYSBsaW5rIHdpdGggYSBidG4tY2F0ZWdvcnkgY2xhc3MuXG4gKiBJdCB1c2VzIGEgY2F0ZWdvcnkgcGFyYW1ldGVyLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkNhdGVnb3J5QnV0dG9uLCB7XG4gKiAgICAgY2F0ZWdvcnk6IHtcbiAqICAgICAgICAgaWQ6IDEsXG4gKiAgICAgICAgIG5hbWU6ICdWaWRlbycsXG4gKiAgICAgICAgIG9ubGluZV9wcm9qZWN0czogMVxuICogICAgIH1cbiAqIH0pXG4gKi9cbndpbmRvdy5jLkNhdGVnb3J5QnV0dG9uID0gKChtLCBjKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gYXJncy5jYXRlZ29yeTtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICBtKGBhLnctaW5saW5lLWJsb2NrLmJ0bi1jYXRlZ29yeSR7Y2F0ZWdvcnkubmFtZS5sZW5ndGggPiAxMyA/ICcuZG91YmxlLWxpbmUnIDogJyd9W2hyZWY9JyNieV9jYXRlZ29yeV9pZC8ke2NhdGVnb3J5LmlkfSddYCxcbiAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2UuZXhwbG9yZScsIGNhdGVnb3J5Lm9ubGluZV9wcm9qZWN0cylcbiAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkZpbHRlckJ1dHRvbiBjb21wb25lbnRcbiAqIFJldHVybiBhIGxpbmsgd2l0aCBhIGZpbHRlcnMgY2xhc3MuXG4gKiBJdCB1c2VzIGEgaHJlZiBhbmQgYSB0aXRsZSBwYXJhbWV0ZXIuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuRmlsdGVyQnV0dG9uLCB7XG4gKiAgICAgdGl0bGU6ICdGaWx0ZXIgYnkgY2F0ZWdvcnknLFxuICogICAgIGhyZWY6ICdmaWx0ZXJfYnlfY2F0ZWdvcnknXG4gKiB9KVxuICovXG53aW5kb3cuYy5GaWx0ZXJCdXR0b24gPSAoKG0sIGMpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBhcmdzLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgaHJlZiA9IGFyZ3MuaHJlZjtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICBtKGBhLnctaW5saW5lLWJsb2NrLmJ0bi1jYXRlZ29yeS5maWx0ZXJzJHt0aXRsZS5sZW5ndGggPiAxMyA/ICcuZG91YmxlLWxpbmUnIDogJyd9W2hyZWY9JyMke2hyZWZ9J11gLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJEYXRlUmFuZ2UgPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICAgICAgICAgIG0oJ2xhYmVsLmZvbnRzaXplLXNtYWxsZXJbZm9yPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywgYXJncy5sYWJlbCksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVtpZD1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmZpcnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy5maXJzdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LXRleHQtY2VudGVyLmxpbmVoZWlnaHQtbG9vc2VyJywgJ2UnKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5sYXN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy5sYXN0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLkZpbHRlckRyb3Bkb3duID0gKGZ1bmN0aW9uKG0sIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICAgICAgICAgIG0oJ3NlbGVjdC53LXNlbGVjdC50ZXh0LWZpZWxkLnBvc2l0aXZlW2lkPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywge1xuICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLnZtKSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3Mudm0oKVxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgXy5tYXAoYXJncy5vcHRpb25zLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnb3B0aW9uW3ZhbHVlPVwiJyArIGRhdGEudmFsdWUgKyAnXCJdJywgZGF0YS5vcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuRmlsdGVyTWFpbiA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZS5tZWRpdW1bcGxhY2Vob2xkZXI9XCInICsgYXJncy5wbGFjZWhvbGRlciArICdcIl1bdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLnZtKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLnZtKClcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQjZmlsdGVyLWJ0bi5idG4uYnRuLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwW3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCJCdXNjYXJcIl0nKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJOdW1iZXJSYW5nZSA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTYnLCBbXG4gICAgICAgICAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW2lkPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MuZmlyc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmZpcnN0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC0yLnctY29sLXRpbnktMicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtdGV4dC1jZW50ZXIubGluZWhlaWdodC1sb29zZXInLCAnZScpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmxhc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmxhc3QoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5GbGV4QWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uIGNvbXBvbmVudFxuICogcmVuZGVyIGFuIGV4cGxhbmF0aW9uIGFib3V0IHByb2plY3QgZmxleCBwcm9qZWN0IG1kZS5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5GbGV4QWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uLCB7XG4gKiAgICAgcHJvamVjdDogcHJvamVjdERldGFpbCBPYmplY3QsXG4gKiB9KVxuICovXG53aW5kb3cuYy5GbGV4QWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uID0gKChtLCBoLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBleHBsYW5hdGlvbiA9IChyZXNvdXJjZSkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBzdGF0ZVRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIG9ubGluZTogW1xuICAgICAgICAgICAgICAgICAgICAgICAgKF8uaXNOdWxsKHJlc291cmNlLmV4cGlyZXNfYXQpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIvcHJvamVjdHMvJyArIHJlc291cmNlLmlkICsgJy9lZGl0I2Fubm91bmNlX2V4cGlyYXRpb25cIl0nLCAnUXVlcm8gaW5pY2lhcicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIGEgcmV0YSBmaW5hbCBkZSA3IGRpYXMnXG4gICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICA6IG0oJ3NwYW4nLCBgVm9jw6ogcmVjZWJlIHR1ZG8gcXVlIGFycmVjYWRhciBhdMOpIGFzICR7aC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0LCAnSEg6bW06c3MnKX0gZGUgJHtoLm1vbWVudGlmeShyZXNvdXJjZS56b25lX2V4cGlyZXNfYXQpfWApKVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzZnVsOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBjb21lbW9yZSBxdWUgdm9jw6ogbWVyZWNlIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyBTZXUgcHJvamV0byBmb2kgYmVtIHN1Y2VkaWRvIGUgYWdvcmEgw6kgYSBob3JhIGRlIGluaWNpYXIgbyB0cmFiYWxobyBkZSByZWxhY2lvbmFtZW50byBjb20gc2V1cyBhcG9pYWRvcmVzISAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0F0ZW7Dp8OjbyBlc3BlY2lhbCDDoCBlbnRyZWdhIGRlIHJlY29tcGVuc2FzLiBQcm9tZXRldT8gRW50cmVndWUhIE7Do28gZGVpeGUgZGUgb2xoYXIgYSBzZcOnw6NvIGRlIHDDs3MtcHJvamV0byBkbyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL2d1aWRlc1wiXScsICdHdWlhIGRvcyBSZWFsaXphZG9yZXMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoGUgZGUgaW5mb3JtYXItc2Ugc29icmXCoCcsIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMDM3NDkzLUZJTkFOQ0lBRE8tQ29tby1zZXIlQzMlQTEtZmVpdG8tby1yZXBhc3NlLWRvLWRpbmhlaXJvLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnY29tbyBvIHJlcGFzc2UgZG8gZGluaGVpcm8gc2Vyw6EgZmVpdG8uJylcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgd2FpdGluZ19mdW5kczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgZXN0YW1vcyBwcm9jZXNzYW5kbyBvcyDDumx0aW1vcyBwYWdhbWVudG9zIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyBTZXUgcHJvamV0byBmb2kgZmluYWxpemFkbyBlbSAnICsgaC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KSArICcgZSBlc3TDoSBhZ3VhcmRhbmRvIGNvbmZpcm1hw6fDo28gZGUgYm9sZXRvcyBlIHBhZ2FtZW50b3MuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnRGV2aWRvIMOgIGRhdGEgZGUgdmVuY2ltZW50byBkZSBib2xldG9zLCBwcm9qZXRvcyBxdWUgdGl2ZXJhbSBhcG9pb3MgZGUgw7psdGltYSBob3JhIGZpY2FtIHBvciBhdMOpIDQgZGlhcyDDunRlaXMgbmVzc2Ugc3RhdHVzLCBjb250YWRvcyBhIHBhcnRpciBkYSBkYXRhIGRlIGZpbmFsaXphw6fDo28gZG8gcHJvamV0by7CoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudGVuZGEgY29tbyBvIHJlcGFzc2UgZGUgZGluaGVpcm8gw6kgZmVpdG8gcGFyYSBwcm9qZXRvcyBiZW0gc3VjZWRpZG9zLicpXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdGVkOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBpbmZlbGl6bWVudGUgbsOjbyBmb2kgZGVzdGEgdmV6LicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyBWb2PDqiBlbnZpb3Ugc2V1IHByb2pldG8gcGFyYSBhbsOhbGlzZSBkbyBDYXRhcnNlIGUgZW50ZW5kZW1vcyBxdWUgZWxlIG7Do28gZXN0w6EgZGUgYWNvcmRvIGNvbSBvIHBlcmZpbCBkbyBzaXRlLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1RlciB1bSBwcm9qZXRvIHJlY3VzYWRvIG7Do28gaW1wZWRlIHF1ZSB2b2PDqiBlbnZpZSBub3ZvcyBwcm9qZXRvcyBwYXJhIGF2YWxpYcOnw6NvIG91IHJlZm9ybXVsZSBzZXUgcHJvamV0byBhdHVhbC4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb252ZXJzZSBjb20gbm9zc28gYXRlbmRpbWVudG8hIFJlY29tZW5kYW1vcyBxdWUgdm9jw6ogZMOqIHVtYSBib2Egb2xoYWRhIG5vc8KgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMzg3NjM4LURpcmV0cml6ZXMtcGFyYS1jcmlhJUMzJUE3JUMzJUEzby1kZS1wcm9qZXRvc1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnY3JpdMOpcmlvcyBkYSBwbGF0YWZvcm1hJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqBlIG5vwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL2d1aWRlc1wiXScsICdndWlhIGRvcyByZWFsaXphZG9yZXMnKSwgJy4nXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGRyYWZ0OiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBjb25zdHJ1YSBvIHNldSBwcm9qZXRvIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgUXVhbnRvIG1haXMgY3VpZGFkb3NvIGUgYmVtIGZvcm1hdGFkbyBmb3IgdW0gcHJvamV0bywgbWFpb3JlcyBhcyBjaGFuY2VzIGRlIGVsZSBzZXIgYmVtIHN1Y2VkaWRvIG5hIHN1YSBjYW1wYW5oYSBkZSBjYXB0YcOnw6NvLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0FudGVzIGRlIGVudmlhciBzZXUgcHJvamV0byBwYXJhIGEgbm9zc2EgYW7DoWxpc2UsIHByZWVuY2hhIHRvZGFzIGFzIGFiYXMgYW8gbGFkbyBjb20gY2FyaW5oby4gVm9jw6ogcG9kZSBzYWx2YXIgYXMgYWx0ZXJhw6fDtWVzIGUgdm9sdGFyIGFvIHJhc2N1bmhvIGRlIHByb2pldG8gcXVhbnRhcyB2ZXplcyBxdWlzZXIuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnUXVhbmRvIHR1ZG8gZXN0aXZlciBwcm9udG8sIGNsaXF1ZSBubyBib3TDo28gUFVCTElDQVIuJ1xuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGVUZXh0W3Jlc291cmNlLnN0YXRlXTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXhwbGFuYXRpb246IGV4cGxhbmF0aW9uKGFyZ3MucmVzb3VyY2UpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJ3AuJyArIGFyZ3MucmVzb3VyY2Uuc3RhdGUgKyAnLXByb2plY3QtdGV4dC5mb250c2l6ZS1zbWFsbC5saW5laGVpZ2h0LWxvb3NlJywgY3RybC5leHBsYW5hdGlvbik7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIi8qKlxuICogd2luZG93LmMubGFuZGluZ1FBIGNvbXBvbmVudFxuICogQSB2aXN1YWwgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgYSBxdWVzdGlvbi9hbnN3ZXIgYm94IHdpdGggdG9nZ2xlXG4gKlxuICogRXhhbXBsZTpcbiAqIHZpZXc6ICgpID0+IHtcbiAqICAgICAgLi4uXG4gKiAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gKiAgICAgICAgICBxdWVzdGlvbjogJ1doYXRzIHlvdXIgbmFtZT8nLFxuICogICAgICAgICAgYW5zd2VyOiAnRGFydGggVmFkZXIuJ1xuICogICAgICB9KVxuICogICAgICAuLi5cbiAqICB9XG4gKi9cbndpbmRvdy5jLmxhbmRpbmdRQSA9IChmdW5jdGlvbihtLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc2hvd0Fuc3dlcjogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcuY2FyZC5xYS1jYXJkLnUtbWFyZ2luYm90dG9tLTIwLnUtcmFkaXVzLmJ0bi10ZXJjaWFyeScsW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlJywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnNob3dBbnN3ZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgYXJncy5xdWVzdGlvbiksXG4gICAgICAgICAgICAgICAgY3RybC5zaG93QW5zd2VyKCkgPyBtKCdwLnUtbWFyZ2ludG9wLTIwLmZvbnRzaXplLXNtYWxsJywgbS50cnVzdChhcmdzLmFuc3dlcikpIDogJydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMubGFuZGluZ1NpZ251cCBjb21wb25lbnRcbiAqIEEgdmlzdWFsIGNvbXBvbmVudCB0aGF0IGRpc3BsYXlzIHNpZ251cCBlbWFpbCB0eXBpY2FsbHkgdXNlZCBvbiBsYW5kaW5nIHBhZ2VzLlxuICogSXQgYWNjZXB0cyBhIGN1c3RvbSBmb3JtIGFjdGlvbiB0byBhdHRhY2ggdG8gdGhpcmQtcGFydHkgc2VydmljZXMgbGlrZSBNYWlsY2hpbXBcbiAqXG4gKiBFeGFtcGxlOlxuICogdmlldzogKCkgPT4ge1xuICogICAgICAuLi5cbiAqICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nU2lnbnVwLCB7XG4gKiAgICAgICAgICBidWlsZGVyOiB7XG4gKiAgICAgICAgICAgICAgY3VzdG9tQWN0aW9uOiAnaHR0cDovL2Zvcm1lbmRwb2ludC5jb20nXG4gKiAgICAgICAgICB9XG4gKiAgICAgIH0pXG4gKiAgICAgIC4uLlxuICogIH1cbiAqL1xud2luZG93LmMubGFuZGluZ1NpZ251cCA9IChmdW5jdGlvbihtLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJ1aWxkZXIgPSBhcmdzLmJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgZW1haWwgPSBtLnByb3AoJycpLFxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBzdWJtaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChoLnZhbGlkYXRlRW1haWwoZW1haWwoKSkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcih0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgZXJyb3JDbGFzc2VzID0gKCFjdHJsLmVycm9yKSA/ICcucG9zaXRpdmUuZXJyb3InIDogJyc7XG4gICAgICAgICAgICByZXR1cm4gbSgnZm9ybS53LWZvcm1baWQ9XCJlbWFpbC1mb3JtXCJdW21ldGhvZD1cInBvc3RcIl1bYWN0aW9uPVwiJyArIGFyZ3MuYnVpbGRlci5jdXN0b21BY3Rpb24gKyAnXCJdJyx7XG4gICAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICB9LFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgbShgaW5wdXQke2Vycm9yQ2xhc3Nlc30udy1pbnB1dC50ZXh0LWZpZWxkLm1lZGl1bVtuYW1lPVwiRU1BSUxcIl1bcGxhY2Vob2xkZXI9XCJEaWdpdGUgc2V1IGVtYWlsXCJdW3R5cGU9XCJ0ZXh0XCJdYCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgY3RybC5lbWFpbCksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3RybC5lbWFpbCgpXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAoY3RybC5lcnJvcigpID8gbSgnc3Bhbi5mb250c2l6ZS1zbWFsbGVyLnRleHQtZXJyb3InLCAnRS1tYWlsIGludsOhbGlkbycpIDogJycpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tbGFyZ2VbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIkNhZGFzdHJhclwiXScpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuTW9kYWxCb3ggY29tcG9uZW50XG4gKiBCdWlscyB0aGUgdGVtcGxhdGUgZm9yIHVzaW5nIG1vZGFsXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuTW9kYWxCb3gsIHtcbiAqICAgICBkaXNwbGF5TW9kYWw6IHRvb2dsZVByb3BPYmplY3QsXG4gKiAgICAgY29udGVudDogWydDb21wb25lbnROYW1lJywge2FyZ3g6ICd4JywgYXJneTogJ3knfV1cbiAqIH0pXG4gKiBDb21wb25lbnROYW1lIHN0cnVjdHVyZSA9PiAgbSgnZGl2JywgW1xuICogICAgICAgICAgICAgICAgICBtKCcubW9kYWwtZGlhbG9nLWhlYWRlcicsIFtdKSxcbiAqICAgICAgICAgICAgICAgICAgbSgnLm1vZGFsLWRpYWxvZy1jb250ZW50JywgW10pLFxuICogICAgICAgICAgICAgICAgICBtKCcubW9kYWwtZGlhbG9nLW5hdi1ib3R0b20nLCBbXSksXG4gKiAgICAgICAgICAgICAgXSlcbiAqL1xuXG53aW5kb3cuYy5Nb2RhbEJveCA9ICgobSwgYywgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLm1vZGFsLWJhY2tkcm9wJywgW1xuICAgICAgICAgICAgICAgIG0oJy5tb2RhbC1kaWFsb2ctb3V0ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5tb2RhbC1kaWFsb2ctaW5uZXIubW9kYWwtZGlhbG9nLXNtYWxsJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS53LWlubGluZS1ibG9jay5tb2RhbC1jbG9zZS5mYS5mYS1jbG9zZS5mYS1sZ1tocmVmPVwianM6dm9pZCgwKTtcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogYXJncy5kaXNwbGF5TW9kYWwudG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGNbYXJncy5jb250ZW50WzBdXSwgYXJncy5jb250ZW50WzFdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5QYXltZW50U3RhdHVzID0gKGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcGF5bWVudCA9IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgICBjYXJkID0gbnVsbCxcbiAgICAgICAgICAgICAgICBkaXNwbGF5UGF5bWVudE1ldGhvZCwgcGF5bWVudE1ldGhvZENsYXNzLCBzdGF0ZUNsYXNzO1xuXG4gICAgICAgICAgICBjYXJkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBheW1lbnQuZ2F0ZXdheV9kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAocGF5bWVudC5nYXRld2F5LnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ21vaXAnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FydGFvX2JpbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcnRhb19maW5hbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJhbmQ6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcnRhb19iYW5kZWlyYVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdwYWdhcm1lJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdF9kaWdpdHM6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcmRfZmlyc3RfZGlnaXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FyZF9sYXN0X2RpZ2l0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJhbmQ6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcmRfYnJhbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZGlzcGxheVBheW1lbnRNZXRob2QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHBheW1lbnQucGF5bWVudF9tZXRob2QudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdib2xldG9iYW5jYXJpbyc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnc3BhbiNib2xldG8tZGV0YWlsJywgJycpO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdjYXJ0YW9kZWNyZWRpdG8nOlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNhcmREYXRhID0gY2FyZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhcmREYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJyNjcmVkaXRjYXJkLWRldGFpbC5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmREYXRhLmZpcnN0X2RpZ2l0cyArICcqKioqKionICsgY2FyZERhdGEubGFzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhcmREYXRhLmJyYW5kICsgJyAnICsgcGF5bWVudC5pbnN0YWxsbWVudHMgKyAneCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBwYXltZW50TWV0aG9kQ2xhc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHBheW1lbnQucGF5bWVudF9tZXRob2QudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdib2xldG9iYW5jYXJpbyc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy5mYS1iYXJjb2RlJztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnY2FydGFvZGVjcmVkaXRvJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLmZhLWNyZWRpdC1jYXJkJztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLmZhLXF1ZXN0aW9uJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzdGF0ZUNsYXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChwYXltZW50LnN0YXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3BhaWQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcudGV4dC1zdWNjZXNzJztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncmVmdW5kZWQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcudGV4dC1yZWZ1bmRlZCc7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3BlbmRpbmcnOlxuICAgICAgICAgICAgICAgICAgICBjYXNlICdwZW5kaW5nX3JlZnVuZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy50ZXh0LXdhaXRpbmcnO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcudGV4dC1lcnJvcic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5UGF5bWVudE1ldGhvZDogZGlzcGxheVBheW1lbnRNZXRob2QsXG4gICAgICAgICAgICAgICAgcGF5bWVudE1ldGhvZENsYXNzOiBwYXltZW50TWV0aG9kQ2xhc3MsXG4gICAgICAgICAgICAgICAgc3RhdGVDbGFzczogc3RhdGVDbGFzc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcGF5bWVudCA9IGFyZ3MuaXRlbTtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cucGF5bWVudC1zdGF0dXMnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtY2lyY2xlJyArIGN0cmwuc3RhdGVDbGFzcygpKSwgJ8KgJyArIHBheW1lbnQuc3RhdGVcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYScgKyBjdHJsLnBheW1lbnRNZXRob2RDbGFzcygpKSwgJyAnLCBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIjXCJdJywgcGF5bWVudC5wYXltZW50X21ldGhvZClcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0JywgW1xuICAgICAgICAgICAgICAgICAgICBjdHJsLmRpc3BsYXlQYXltZW50TWV0aG9kKClcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuUG9wTm90aWZpY2F0aW9uID0gKChtLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGRpc3BsYXlOb3RpZmljYXRpb24gPSBoLnRvZ2dsZVByb3AodHJ1ZSwgZmFsc2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlOb3RpZmljYXRpb246IGRpc3BsYXlOb3RpZmljYXRpb25cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKGN0cmwuZGlzcGxheU5vdGlmaWNhdGlvbigpID8gbSgnLmZsYXNoLnctY2xlYXJmaXguY2FyZC5jYXJkLW5vdGlmaWNhdGlvbi51LXJhZGl1cy56aW5kZXgtMjAnLCBbXG4gICAgICAgICAgICAgICAgbSgnaW1nLmljb24tY2xvc2Vbc3JjPVwiL2Fzc2V0cy9jYXRhcnNlX2Jvb3RzdHJhcC94LnBuZ1wiXVt3aWR0aD1cIjEyXCJdW2FsdD1cImZlY2hhclwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5kaXNwbGF5Tm90aWZpY2F0aW9uLnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbCcsIGFyZ3MubWVzc2FnZSlcbiAgICAgICAgICAgIF0pIDogbSgnc3BhbicpKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0QWJvdXQgPSAoKG0sIGMsIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBvbmxpbmVEYXlzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZGlmZiA9IG1vbWVudChwcm9qZWN0LnpvbmVfb25saW5lX2RhdGUpLmRpZmYobW9tZW50KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSksXG4gICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbiA9IG1vbWVudC5kdXJhdGlvbihkaWZmKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLU1hdGguY2VpbChkdXJhdGlvbi5hc0RheXMoKSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGxldCBmdW5kaW5nUGVyaW9kID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAocHJvamVjdC5pc19wdWJsaXNoZWQgJiYgaC5leGlzdHkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpKSA/IG0oJy5mdW5kaW5nLXBlcmlvZCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgJ1BlcsOtb2RvIGRlIGNhbXBhbmhhJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCBgJHtoLm1vbWVudGlmeShwcm9qZWN0LnpvbmVfb25saW5lX2RhdGUpfSAtICR7aC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpfSAoJHtvbmxpbmVEYXlzKCl9IGRpYXMpYClcbiAgICAgICAgICAgICAgICBdKSA6ICcnO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LWFib3V0JywgW1xuICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LWFib3V0LnctY29sLnctY29sLTgnLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogaC5VSUhlbHBlcigpXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdwLmZvbnRzaXplLWJhc2UnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzdHJvbmcnLCAnTyBwcm9qZXRvJyksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZVtpdGVtcHJvcD1cImFib3V0XCJdJywgbS50cnVzdChwcm9qZWN0LmFib3V0X2h0bWwpKSxcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdC5idWRnZXQgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdwLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdPcsOnYW1lbnRvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdwLmZvbnRzaXplLWJhc2UnLCBtLnRydXN0KHByb2plY3QuYnVkZ2V0KSlcbiAgICAgICAgICAgICAgICAgICAgXSA6ICcnLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCAhXy5pc0VtcHR5KGFyZ3MucmV3YXJkRGV0YWlscygpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0zMCcsICdSZWNvbXBlbnNhcycpLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RSZXdhcmRMaXN0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogYXJncy5yZXdhcmREZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgIH0pLCBmdW5kaW5nUGVyaW9kKClcbiAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTMwJywgJ1N1Z2VzdMO1ZXPCoGRlwqBhcG9pbycpLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlByb2plY3RTdWdnZXN0ZWRDb250cmlidXRpb25zLCB7cHJvamVjdDogcHJvamVjdH0pLFxuICAgICAgICAgICAgICAgICAgICBmdW5kaW5nUGVyaW9kKClcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RDYXJkID0gKChtLCBoLCBtb2RlbHMsIEkxOG4pID0+IHtcbiAgICBjb25zdCBJMThuU2NvcGUgPSBfLnBhcnRpYWwoaC5pMThuU2NvcGUsICdwcm9qZWN0cy5jYXJkJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBwcm9ncmVzcyA9IHByb2plY3QucHJvZ3Jlc3MudG9GaXhlZCgyKSxcbiAgICAgICAgICAgICAgICByZW1haW5pbmdUZXh0T2JqID0gaC50cmFuc2xhdGVkVGltZShwcm9qZWN0LnJlbWFpbmluZ190aW1lKSxcbiAgICAgICAgICAgICAgICBsaW5rID0gJy8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAoYXJncy5yZWYgPyAnP3JlZj0nICsgYXJncy5yZWYgOiAnJyk7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuY2FyZC1wcm9qZWN0LmNhcmQudS1yYWRpdXMnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oYGEuY2FyZC1wcm9qZWN0LXRodW1iW2hyZWY9XCIke2xpbmt9XCJdYCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1pbWFnZSc6IGB1cmwoJHtwcm9qZWN0LnByb2plY3RfaW1nfSlgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkaXNwbGF5JzogJ2Jsb2NrJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmNhcmQtcHJvamVjdC1kZXNjcmlwdGlvbi5hbHQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHkubGluZWhlaWdodC10aWdodC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1iYXNlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGEubGluay1oaWRkZW5baHJlZj1cIiR7bGlua31cIl1gLCBwcm9qZWN0LnByb2plY3RfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeS51LW1hcmdpbmJvdHRvbS0yMCcsIGAke0kxOG4udCgnYnknLCBJMThuU2NvcGUoKSl9ICR7cHJvamVjdC5vd25lcl9uYW1lfWApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuZm9udGNvbG9yLXNlY29uZGFyeS5mb250c2l6ZS1zbWFsbGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGEubGluay1oaWRkZW5baHJlZj1cIiR7bGlua31cIl1gLCBwcm9qZWN0LmhlYWRsaW5lKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmNhcmQtcHJvamVjdC1hdXRob3IuYWx0dCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgW20oJ3NwYW4uZmEuZmEtbWFwLW1hcmtlci5mYS0xJywgJyAnKSwgYCAke3Byb2plY3QuY2l0eV9uYW1lID8gcHJvamVjdC5jaXR5X25hbWUgOiAnJ30sICR7cHJvamVjdC5zdGF0ZV9hY3JvbnltID8gcHJvamVjdC5zdGF0ZV9hY3JvbnltIDogJyd9YF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKGAuY2FyZC1wcm9qZWN0LW1ldGVyLiR7cHJvamVjdC5zdGF0ZX1gLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAoXy5jb250YWlucyhbJ3N1Y2Nlc3NmdWwnLCAnZmFpbGVkJywgJ3dhaXRpbmdfZnVuZHMnXSwgcHJvamVjdC5zdGF0ZSkpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBJMThuLnQoJ2Rpc3BsYXlfc3RhdHVzLicgKyBwcm9qZWN0LnN0YXRlLCBJMThuU2NvcGUoKSkpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5tZXRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcubWV0ZXItZmlsbCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiBgJHsocHJvZ3Jlc3MgPiAxMDAgPyAxMDAgOiBwcm9ncmVzcyl9JWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmNhcmQtcHJvamVjdC1zdGF0cycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsIGAke01hdGguY2VpbChwcm9qZWN0LnByb2dyZXNzKX0lYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBgUiQgJHtoLmZvcm1hdE51bWJlcihwcm9qZWN0LnBsZWRnZWQpfWApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC10aWdodGVzdCcsICdMZXZhbnRhZG9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC51LXRleHQtcmlnaHQnLCBwcm9qZWN0LmV4cGlyZXNfYXQgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBgJHtyZW1haW5pbmdUZXh0T2JqLnRvdGFsfSAke3JlbWFpbmluZ1RleHRPYmoudW5pdH1gKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtdGlnaHRlc3QnLCAocmVtYWluaW5nVGV4dE9iai50b3RhbCA+IDEpID8gJ1Jlc3RhbnRlcycgOiAnUmVzdGFudGUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LXRpZ2h0JywgWydQcmF6byBlbScsbSgnYnInKSwnYWJlcnRvJ10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cuSTE4bikpO1xuIiwid2luZG93LmMuUHJvamVjdENvbW1lbnRzID0gKGZ1bmN0aW9uKG0sIGMsIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsb2FkQ29tbWVudHMgPSAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0luaXRpYWxpemVkKSB7cmV0dXJuO31cbiAgICAgICAgICAgICAgICAgICAgaC5mYlBhcnNlKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7bG9hZENvbW1lbnRzOiBsb2FkQ29tbWVudHN9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuICAgICAgICAgICAgcmV0dXJuIG0oJy5mYi1jb21tZW50c1tkYXRhLWhyZWY9XCJodHRwOi8vd3d3LmNhdGFyc2UubWUvJyArIHByb2plY3QucGVybWFsaW5rICsgJ1wiXVtkYXRhLW51bS1wb3N0cz01MF1bZGF0YS13aWR0aD1cIjYxMFwiXScsIHtjb25maWc6IGN0cmwubG9hZENvbW1lbnRzKCl9KTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdENvbnRyaWJ1dGlvbnMgPSAoKG0sIG1vZGVscywgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0Vk0gPSBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0obW9kZWxzLnByb2plY3RDb250cmlidXRpb24pLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJyxcbiAgICAgICAgICAgICAgICAgICAgd2FpdGluZ19wYXltZW50OiAnZXEnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgdG9nZ2xlV2FpdGluZyA9ICh3YWl0aW5nID0gZmFsc2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlclZNLndhaXRpbmdfcGF5bWVudCh3YWl0aW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmaWx0ZXJWTS5wcm9qZWN0X2lkKGFyZ3MucHJvamVjdC5pZCkud2FpdGluZ19wYXltZW50KGZhbHNlKTtcblxuICAgICAgICAgICAgaWYgKCFsaXN0Vk0uY29sbGVjdGlvbigpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBsaXN0Vk06IGxpc3RWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTTogZmlsdGVyVk0sXG4gICAgICAgICAgICAgICAgdG9nZ2xlV2FpdGluZzogdG9nZ2xlV2FpdGluZ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBjdHJsLmxpc3RWTTtcbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdF9jb250cmlidXRpb25zLmNvbnRlbnQudy1jb2wudy1jb2wtMTInLCBbXG4gICAgICAgICAgICAgICAgKGFyZ3MucHJvamVjdC5pc19vd25lcl9vcl9hZG1pbiA/XG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0W2NoZWNrZWQ9XCJjaGVja2VkXCJdW2lkPVwiY29udHJpYnV0aW9uX3N0YXRlX2F2YWlsYWJsZV90b19jb3VudFwiXVtuYW1lPVwid2FpdGluZ19wYXltZW50XCJdW3R5cGU9XCJyYWRpb1wiXVt2YWx1ZT1cImF2YWlsYWJsZV90b19jb3VudFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVXYWl0aW5nKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbFtmb3I9XCJjb250cmlidXRpb25fc3RhdGVfYXZhaWxhYmxlX3RvX2NvdW50XCJdJywgJ0NvbmZpcm1hZG9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXRbaWQ9XCJjb250cmlidXRpb25fc3RhdGVfd2FpdGluZ19jb25maXJtYXRpb25cIl1bdHlwZT1cInJhZGlvXCJdW25hbWU9XCJ3YWl0aW5nX3BheW1lbnRcIl1bdmFsdWU9XCJ3YWl0aW5nX2NvbmZpcm1hdGlvblwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVXYWl0aW5nKHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWxbZm9yPVwiY29udHJpYnV0aW9uX3N0YXRlX3dhaXRpbmdfY29uZmlybWF0aW9uXCJdJywgJ1BlbmRlbnRlcycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1jb250cmlidXRpb25zJywgXy5tYXAobGlzdC5jb2xsZWN0aW9uKCksIChjb250cmlidXRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2hyZWY9XCIvdXNlcnMvJyArIGNvbnRyaWJ1dGlvbi51c2VyX2lkICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy50aHVtYi51LWxlZnQudS1yb3VuZFtzdHlsZT1cImJhY2tncm91bmQtaW1hZ2U6IHVybCgnICsgKCFfLmlzRW1wdHkoY29udHJpYnV0aW9uLnByb2ZpbGVfaW1nX3RodW1ibmFpbCkgPyBjb250cmlidXRpb24ucHJvZmlsZV9pbWdfdGh1bWJuYWlsIDogJy9hc3NldHMvY2F0YXJzZV9ib290c3RyYXAvdXNlci5qcGcnKSArICcpOyBiYWNrZ3JvdW5kLXNpemU6IGNvbnRhaW47XCJdJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuLWRhcmtbaHJlZj1cIi91c2Vycy8nICsgY29udHJpYnV0aW9uLnVzZXJfaWQgKyAnXCJdJywgY29udHJpYnV0aW9uLnVzZXJfbmFtZSksIChjb250cmlidXRpb24uaXNfb3duZXJfb3JfYWRtaW4gP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUiQgJyArIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi52YWx1ZSwgMiwgMyksIChjb250cmlidXRpb24uYW5vbnltb3VzID8gW20udHJ1c3QoJyZuYnNwOy0mbmJzcDsnKSwgbSgnc3Ryb25nJywgJ0Fwb2lhZG9yIGFuw7RuaW1vJyldIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlcicsIGgubW9tZW50aWZ5KGNvbnRyaWJ1dGlvbi5jcmVhdGVkX2F0LCAnREQvTU0vWVlZWSwgSEg6bW0nKSArICdoJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlcicsIChjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgPiAxID8gJ0Fwb2lvdSBlc3RlIGUgbWFpcyBvdXRyb3MgJyArIGNvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyArICcgcHJvamV0b3MnIDogJ0Fwb2lvdSBzb21lbnRlIGVzdGUgcHJvamV0byBhdMOpIGFnb3JhJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW5ib3R0b20tMjAnKVxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLCBbIWxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgKGxpc3QuaXNMYXN0UGFnZSgpID8gJycgOiBtKCdidXR0b24jbG9hZC1tb3JlLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBsaXN0Lm5leHRQYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAnQ2FycmVnYXIgbWFpcycpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpLFxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3REYXNoYm9hcmRNZW51IGNvbXBvbmVudFxuICogYnVpbGQgZGFzaGJvYXJkIHByb2plY3QgbWVudSBmb3IgcHJvamVjdCBvd25lcnNcbiAqIGFuZCBhZG1pbi5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5Qcm9qZWN0RGFzaGJvYXJkTWVudSwge1xuICogICAgIHByb2plY3Q6IHByb2plY3REZXRhaWwgT2JqZWN0LFxuICogfSlcbiAqL1xud2luZG93LmMuUHJvamVjdERhc2hib2FyZE1lbnUgPSAoKG0sIF8sIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdLFxuICAgICAgICAgICAgICAgIGVkaXRMaW5rc1RvZ2dsZSA9IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgYm9keVRvZ2dsZUZvck5hdiA9IGgudG9nZ2xlUHJvcCgnYm9keS1wcm9qZWN0IG9wZW4nLCAnYm9keS1wcm9qZWN0IGNsb3NlZCcpO1xuXG4gICAgICAgICAgICBpZiAoIWFyZ3MucHJvamVjdC5pc19wdWJsaXNoZWQpIHtcbiAgICAgICAgICAgICAgICBlZGl0TGlua3NUb2dnbGUudG9nZ2xlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYm9keTogYm9keSxcbiAgICAgICAgICAgICAgICBlZGl0TGlua3NUb2dnbGU6IGVkaXRMaW5rc1RvZ2dsZSxcbiAgICAgICAgICAgICAgICBib2R5VG9nZ2xlRm9yTmF2OiBib2R5VG9nZ2xlRm9yTmF2XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICAgIHByb2plY3RSb3V0ZSA9ICcvcHJvamVjdHMvJyArIHByb2plY3QuaWQsXG4gICAgICAgICAgICAgICAgICBlZGl0Um91dGUgPSBwcm9qZWN0Um91dGUgKyAnL2VkaXQnLFxuICAgICAgICAgICAgICAgICAgZWRpdExpbmtDbGFzcyA9ICdkYXNoYm9hcmQtbmF2LWxpbmstbGVmdCAnICsgKHByb2plY3QuaXNfcHVibGlzaGVkID8gJ2luZGVudCcgOiAnJyk7XG4gICAgICAgICAgICBsZXQgb3B0aW9uYWxPcHQgPSAocHJvamVjdC5tb2RlID09PSAnZmxleCcgPyBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnIChvcGNpb25hbCknKSA6ICcnKTtcblxuICAgICAgICAgICAgY3RybC5ib2R5LmNsYXNzTmFtZSA9IGN0cmwuYm9keVRvZ2dsZUZvck5hdigpO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3QtbmF2JywgW1xuICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LW5hdi13cmFwcGVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCduYXYudy1zZWN0aW9uLmRhc2hib2FyZC1uYXYuc2lkZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3ByZXZpZXdfbGluay53LWlubGluZS1ibG9jay5kYXNoYm9hcmQtcHJvamVjdC1uYW1lW2hyZWY9XCInICsgKHByb2plY3QuaXNfcHVibGlzaGVkID8gJy8nICsgcHJvamVjdC5wZXJtYWxpbmsgOiBlZGl0Um91dGUgKyAnI3ByZXZpZXcnKSArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QtZGFzaGJvYXJkW3NyYz1cIicgKyAoXy5pc051bGwocHJvamVjdC5sYXJnZV9pbWFnZSkgPyAnL2Fzc2V0cy90aHVtYi1wcm9qZWN0LnBuZycgOiBwcm9qZWN0LmxhcmdlX2ltYWdlKSArICdcIl1bd2lkdGg9XCIxMTRcIl0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLW5lZ2F0aXZlLmxpbmVoZWlnaHQtdGlnaHQuZm9udHNpemUtc21hbGwnLCBwcm9qZWN0Lm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGltZy51LW1hcmdpbnRvcC0xMFtzcmM9XCIvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL2JhZGdlLSR7cHJvamVjdC5tb2RlfS1oLnBuZ1wiXVt3aWR0aD04MF1gKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNpbmZvLWxpbmtzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX2hvbWVfbGlua1tjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluay1sZWZ0ICcgKyAoaC5sb2NhdGlvbkFjdGlvbk1hdGNoKCdpbnNpZ2h0cycpID8gJ3NlbGVjdGVkJyA6ICcnKSArICdcIl1baHJlZj1cIicgKyBwcm9qZWN0Um91dGUgKyAnL2luc2lnaHRzXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWJhci1jaGFydC5mYS1sZy5mYS1mdycpLCAnIE1pbmhhIENhbXBhbmhhJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCAocHJvamVjdC5pc19wdWJsaXNoZWQgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3JlcG9ydHNfbGluay5kYXNoYm9hcmQtbmF2LWxpbmstbGVmdFtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjcmVwb3J0cycgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS5mYS10YWJsZS5mYS1sZy5mYS1mdycpLCAnIFJlbGF0w7NyaW9zIGRlIGFwb2lvcydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3JlcG9ydHNfbGluay5kYXNoYm9hcmQtbmF2LWxpbmstbGVmdC51LW1hcmdpbmJvdHRvbS0zMFtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjcG9zdHMnICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtYnVsbGhvcm4uZmEtZncuZmEtbGcnKSwgJyBOb3ZpZGFkZXMgJywgbSgnc3Bhbi5iYWRnZScsIHByb2plY3QucG9zdHNfY291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZWRpdC1wcm9qZWN0LWRpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIXByb2plY3QuaXNfcHVibGlzaGVkID8gJycgOiBtKCdidXR0b24jdG9nZ2xlLWVkaXQtbWVudS5kYXNoYm9hcmQtbmF2LWxpbmstbGVmdCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5lZGl0TGlua3NUb2dnbGUudG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLXBlbmNpbC5mYS1mdy5mYS1sZycpLCAnIEVkaXRhciBwcm9qZXRvJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pKSwgKGN0cmwuZWRpdExpbmtzVG9nZ2xlKCkgPyBtKCcjZWRpdC1tZW51LWl0ZW1zJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjZGFzaGJvYXJkLWxpbmtzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCghcHJvamVjdC5pc19wdWJsaXNoZWQgfHwgcHJvamVjdC5pc19hZG1pbl9yb2xlKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Jhc2ljc19saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNiYXNpY3MnICsgJ1wiXScsICdCw6FzaWNvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNnb2FsX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI2dvYWwnICsgJ1wiXScsICdGaW5hbmNpYW1lbnRvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkZXNjcmlwdGlvbl9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNkZXNjcmlwdGlvbicgKyAnXCJdJywgJ0Rlc2NyacOnw6NvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI3ZpZGVvX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3ZpZGVvJyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1bDrWRlbycsIG9wdGlvbmFsT3B0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjYnVkZ2V0X2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI2J1ZGdldCcgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdPcsOnYW1lbnRvJywgb3B0aW9uYWxPcHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNjYXJkX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI2NhcmQnICsgJ1wiXScsICdDYXJkIGRvIHByb2pldG8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3Jld2FyZF9saW5rW2NsYXNzPVwiJyArIGVkaXRMaW5rQ2xhc3MgKyAnXCJdW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNyZXdhcmQnICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUmVjb21wZW5zYXMnLCBvcHRpb25hbE9wdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF91c2VyX2Fib3V0X2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3VzZXJfYWJvdXQnICsgJ1wiXScsICdTb2JyZSB2b2PDqicpLCAocHJvamVjdC5tb2RlID09PSAnZmxleCcgfHwgKHByb2plY3QuaXNfcHVibGlzaGVkIHx8IHByb2plY3Quc3RhdGUgPT09ICdhcHByb3ZlZCcpIHx8IHByb2plY3QuaXNfYWRtaW5fcm9sZSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF91c2VyX3NldHRpbmdzX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3VzZXJfc2V0dGluZ3MnICsgJ1wiXScsICdDb250YScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKSwgKCFwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rhc2hib2FyZF9wcmV2aWV3X2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3ByZXZpZXcnICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1mdy5mYS1leWUuZmEtbGcnKSwgJyBQcmV2aWV3J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICghcHJvamVjdC5pc19wdWJsaXNoZWQgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5idG4tc2VuZC1kcmFmdC1maXhlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHByb2plY3QubW9kZSA9PT0gJ2FvbicgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwcm9qZWN0LnN0YXRlID09PSAnZHJhZnQnID8gbSgnYS5idG4uYnRuLW1lZGl1bVtocmVmPVwiL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkICsgJy9zZW5kX3RvX2FuYWx5c2lzXCJdJywgJ0VudmlhcicpIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5zdGF0ZSA9PT0gJ2FwcHJvdmVkJyA/IG0oJ2EuYnRuLmJ0bi1tZWRpdW1baHJlZj1cIi9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvcHVibGlzaFwiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQdWJsaWNhcicsIG0udHJ1c3QoJyZuYnNwOyZuYnNwOycpLCBtKCdzcGFuLmZhLmZhLWNoZXZyb24tcmlnaHQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwcm9qZWN0LnN0YXRlID09PSAnZHJhZnQnID8gbSgnYS5idG4uYnRuLW1lZGl1bVtocmVmPVwiL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkICsgJy9lZGl0I3ByZXZpZXdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUHVibGljYXInLCBtLnRydXN0KCcmbmJzcDsmbmJzcDsnKSwgbSgnc3Bhbi5mYS5mYS1jaGV2cm9uLXJpZ2h0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwcm9qZWN0Lm1vZGUgPT09ICdmbGV4JyA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5idG4tc2VuZC1kcmFmdC1maXhlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfLmlzTnVsbChwcm9qZWN0LmV4cGlyZXNfYXQpID8gbSgnYS53LWJ1dHRvbi5idG4uYnRuLXNtYWxsLmJ0bi1zZWNvbmRhcnktZGFya1tocmVmPVwiL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkICsgJy9lZGl0I2Fubm91bmNlX2V4cGlyYXRpb25cIl0nLCAnSW5pY2lhciByZXRhIGZpbmFsJykgOiAnJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJ2EuYnRuLWRhc2hib2FyZCBocmVmPVwianM6dm9pZCgwKTtcIicsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5ib2R5VG9nZ2xlRm9yTmF2LnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1iYXJzLmZhLWxnJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuUHJvamVjdERhdGFDaGFydCBjb21wb25lbnRcbiAqIEEgZ3JhcGggYnVpbGRlciBpbnRlcmZhY2UgdG8gYmUgdXNlZCBvbiBwcm9qZWN0IHJlbGF0ZWQgZGFzaGJvYXJkcy5cbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLlByb2plY3REYXRhQ2hhcnQsIHtcbiAqICAgICBjb2xsZWN0aW9uOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJEYXksXG4gKiAgICAgbGFiZWw6ICdSJCBhcnJlY2FkYWRvcyBwb3IgZGlhJyxcbiAqICAgICBkYXRhS2V5OiAndG90YWxfYW1vdW50J1xuICogfSlcbiAqL1xud2luZG93LmMuUHJvamVjdERhdGFDaGFydCA9ICgobSwgQ2hhcnQsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVzb3VyY2UgPSBfLmZpcnN0KGFyZ3MuY29sbGVjdGlvbigpKSxcbiAgICAgICAgICAgICAgICAgIHNvdXJjZSA9ICghXy5pc1VuZGVmaW5lZChyZXNvdXJjZSkgPyByZXNvdXJjZS5zb3VyY2UgOiBbXSksXG5cbiAgICAgICAgICAgICAgICBtb3VudERhdGFzZXQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDAuMiknLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMSknLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludFN0cm9rZUNvbG9yOiAnI2ZmZicsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludEhpZ2hsaWdodEZpbGw6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0U3Ryb2tlOiAncmdiYSgyMjAsMjIwLDIyMCwxKScsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBfLm1hcChzb3VyY2UsIChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1bYXJncy5kYXRhS2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVuZGVyQ2hhcnQgPSAoZWxlbWVudCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGN0eCA9IGVsZW1lbnQuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IENoYXJ0KGN0eCkuTGluZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxzOiBfLm1hcChzb3VyY2UsIChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhcmdzLnhBeGlzKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFzZXRzOiBtb3VudERhdGFzZXQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcmVuZGVyQ2hhcnQ6IHJlbmRlckNoYXJ0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy5jYXJkLnUtcmFkaXVzLm1lZGl1bS51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgYXJncy5sYWJlbCksXG4gICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIub3ZlcmZsb3ctYXV0bycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2NhbnZhc1tpZD1cImNoYXJ0XCJdW3dpZHRoPVwiODYwXCJdW2hlaWdodD1cIjMwMFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwucmVuZGVyQ2hhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuQ2hhcnQsIHdpbmRvdy5fKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3REYXRhVGFibGUgY29tcG9uZW50XG4gKiBBIHRhYmxlIGludGVyZmFjZSBjb25zdHJ1Y3RvciB0aGF0IHNob3VsZCBiZSB1c2VkIG9uIHByb2plY3QgcmVsYXRlZCBkYXNoYm9hcmRzLlxuICogSXQgdGFrZXMgYW4gYXJyYXkgYW5kIGEgbGFibGUgYXMgaXQncyBzb3VyY2VzLlxuICogVGhlIGZpcnN0IGl0ZW0gaW4gdGhlIGFycmF5IGlzIHRoZSBoZWFkZXIgZGVzY3JpcHRvciBhbmQgdGhlIHJlc3Qgb2YgdGhlbSBhcmUgcm93IGRhdGEuXG4gKiBSb3dzIG1heSByZXR1cm4gYSBzdHJpbmcgb3IgYW4gYXJyYXkgYW5kIHRoaXMgdmFsdWUgd2lsbCBiZSB1c2VkIGFzIGEgcm93IG91dHB1dC5cbiAqIEFsbCB0YWJsZSByb3dzIGFyZSBzb3J0YWJsZSBieSBkZWZhdWx0LiBJZiB5b3Ugd2FudCB0byB1c2UgYSBjdXN0b20gdmFsdWUgYXMgc29ydCBwYXJhbWV0ZXJcbiAqIHlvdSBtYXkgc2V0IGEgMkQgYXJyYXkgYXMgcm93LiBJbiB0aGlzIGNhc2UsIHRoZSBmaXJzdCBhcnJheSB2YWx1ZSB3aWxsIGJlIHRoZSBjdXN0b20gdmFsdWVcbiAqIHdoaWxlIHRoZSBvdGhlciB3aWxsIGJlIHRoZSBhY3R1YWwgb3V0cHV0LlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuUHJvamVjdERhdGFUYWJsZSwge1xuICogICAgICBsYWJlbDogJ1RhYmxlIGxhYmVsJyxcbiAqICAgICAgdGFibGU6IFtcbiAqICAgICAgICAgIFsnY29sIGhlYWRlciAxJywgJ2NvbCBoZWFkZXIgMiddLFxuICogICAgICAgICAgWyd2YWx1ZSAxeDEnLCBbMywgJ3ZhbHVlIDF4MiddXSxcbiAqICAgICAgICAgIFsndmFsdWUgMngxJywgWzEsICd2YWx1ZSAyeDInXV0gLy9XZSBhcmUgdXNpbmcgYSBjdXN0b20gY29tcGFyYXRvciB0d28gY29sIDIgdmFsdWVzXG4gKiAgICAgIF0sXG4gKiAgICAgIC8vQWxsb3dzIHlvdSB0byBzZXQgYSBzcGVjaWZpYyBjb2x1bW4gdG8gYmUgb3JkZXJlZCBieSBkZWZhdWx0LlxuICogICAgICAvL0lmIG5vIHZhbHVlIGlzIHNldCwgdGhlIGZpcnN0IHJvdyB3aWxsIGJlIHRoZSBkZWZhdWx0IG9uZSB0byBiZSBvcmRlcmVkLlxuICogICAgICAvL05lZ2F0aXZlIHZhbHVlcyBtZWFuIHRoYXQgdGhlIG9yZGVyIHNob3VsZCBiZSByZXZlcnRlZFxuICogICAgICBkZWZhdWx0U29ydEluZGV4OiAtM1xuICogIH0pXG4gKi9cbndpbmRvdy5jLlByb2plY3REYXRhVGFibGUgPSAoKG0sIG1vZGVscywgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgdGFibGUgPSBtLnByb3AoYXJncy50YWJsZSksXG4gICAgICAgICAgICAgICAgc29ydEluZGV4ID0gbS5wcm9wKC0xKTtcblxuICAgICAgICAgICAgY29uc3QgY29tcGFyYXRvciA9IChhLCBiKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGlkeCA9IHNvcnRJbmRleCgpLFxuICAgICAgICAgICAgICAgICAgICAvL0NoZWNrIGlmIGEgY3VzdG9tIGNvbXBhcmF0b3IgaXMgdXNlZCA9PiBSZWFkIGNvbXBvbmVudCBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgICAgICB4ID0gKF8uaXNBcnJheShhW2lkeF0pICYmIGFbaWR4XS5sZW5ndGggPiAxKSA/IGFbaWR4XVswXSA6IGFbaWR4XSxcbiAgICAgICAgICAgICAgICAgICAgeSA9IChfLmlzQXJyYXkoYltpZHhdKSAmJiBiW2lkeF0ubGVuZ3RoID4gMSkgPyBiW2lkeF1bMF0gOiBiW2lkeF07XG5cbiAgICAgICAgICAgICAgICBpZiAoeCA8IHkpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh5IDwgeCl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHNvcnRUYWJsZSA9IChpZHgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgaGVhZGVyID0gXy5maXJzdCh0YWJsZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgYm9keTtcbiAgICAgICAgICAgICAgICBpZiAoc29ydEluZGV4KCkgPT09IGlkeCl7XG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSBfLnJlc3QodGFibGUoKSkucmV2ZXJzZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNvcnRJbmRleChpZHgpO1xuICAgICAgICAgICAgICAgICAgICBib2R5ID0gXy5yZXN0KHRhYmxlKCkpLnNvcnQoY29tcGFyYXRvcik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGFibGUoXy51bmlvbihbaGVhZGVyXSxib2R5KSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzb3J0VGFibGUoTWF0aC5hYnMoYXJncy5kZWZhdWx0U29ydEluZGV4KSB8fCAwKTtcblxuICAgICAgICAgICAgaWYgKGFyZ3MuZGVmYXVsdFNvcnRJbmRleCA8IDApe1xuICAgICAgICAgICAgICAgIHNvcnRUYWJsZShNYXRoLmFicyhhcmdzLmRlZmF1bHRTb3J0SW5kZXgpIHx8IDApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRhYmxlOiB0YWJsZSxcbiAgICAgICAgICAgICAgICBzb3J0VGFibGU6IHNvcnRUYWJsZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBoZWFkZXIgPSBfLmZpcnN0KGN0cmwudGFibGUoKSksXG4gICAgICAgICAgICAgICAgYm9keSA9IF8ucmVzdChjdHJsLnRhYmxlKCkpO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy50YWJsZS1vdXRlci51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cudGFibGUtcm93LmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5oZWFkZXInLFxuICAgICAgICAgICAgICAgICAgICBfLm1hcChoZWFkZXIsIChoZWFkaW5nLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzb3J0ID0gKCkgPT4gY3RybC5zb3J0VGFibGUoaWR4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2wnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogc29ydFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7aGVhZGluZ30gYCwgbSgnc3Bhbi5mYS5mYS1zb3J0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKSwgbSgnLnRhYmxlLWlubmVyLmZvbnRzaXplLXNtYWxsJyxcbiAgICAgICAgICAgICAgICAgICAgXy5tYXAoYm9keSwgKHJvd0RhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cudGFibGUtcm93JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChyb3dEYXRhLCAocm93KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQ2hlY2sgaWYgYSBjdXN0b20gY29tcGFyYXRvciBpcyB1c2VkID0+IFJlYWQgY29tcG9uZW50IGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdyA9IChfLmlzQXJyYXkocm93KSAmJiByb3cubGVuZ3RoID4gMSkgPyByb3dbMV0gOiByb3c7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC50YWJsZS1jb2wnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCByb3cpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlByb2plY3RIZWFkZXIgPSAoZnVuY3Rpb24obSwgYykge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LWhlYWRlcicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24tcHJvZHVjdC4nICsgcHJvamVjdC5tb2RlKSxcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnBhZ2UtaGVhZGVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2gxLmZvbnRzaXplLWxhcmdlci5mb250d2VpZ2h0LXNlbWlib2xkLnByb2plY3QtbmFtZVtpdGVtcHJvcD1cIm5hbWVcIl0nLCBwcm9qZWN0Lm5hbWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaDIuZm9udHNpemUtYmFzZS5saW5laGVpZ2h0LWxvb3NlcltpdGVtcHJvcD1cImF1dGhvclwiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncG9yICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdC51c2VyLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5wcm9qZWN0LW1haW4nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy5wcm9qZWN0LW1haW4nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgucHJvamVjdC1oaWdobGlnaHQnLCBtLmNvbXBvbmVudChjLlByb2plY3RIaWdobGlnaHQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIG0uY29tcG9uZW50KGMuUHJvamVjdFNpZGViYXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlckRldGFpbHM6IGFyZ3MudXNlckRldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0SGlnaGxpZ2h0ID0gKChtLCBfLCBoLCBjKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKCkgPT4ge1xuICAgICAgICAgICAgdmFyIGRpc3BsYXlTaGFyZUJveCA9IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheVNoYXJlQm94OiBkaXNwbGF5U2hhcmVCb3hcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1oaWdobGlnaHQnLCBbXG4gICAgICAgICAgICAgICAgKHByb2plY3QudmlkZW9fZW1iZWRfdXJsID8gbSgnLnctZW1iZWQudy12aWRlby5wcm9qZWN0LXZpZGVvJywge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ21pbi1oZWlnaHQ6IDI0MHB4OydcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lmcmFtZS5lbWJlZGx5LWVtYmVkW2l0ZW1wcm9wPVwidmlkZW9cIl1bc3JjPVwiJyArIHByb2plY3QudmlkZW9fZW1iZWRfdXJsICsgJ1wiXVtmcmFtZWJvcmRlcj1cIjBcIl1bYWxsb3dGdWxsU2NyZWVuXScpXG4gICAgICAgICAgICAgICAgXSkgOiBtKCcucHJvamVjdC1pbWFnZScsIHtcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdiYWNrZ3JvdW5kLWltYWdlOnVybCgnICsgcHJvamVjdC5vcmlnaW5hbF9pbWFnZSArICcpOydcbiAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgbSgnLnByb2plY3QtYmx1cmInLCBwcm9qZWN0LmhlYWRsaW5lKSxcbiAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5LnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICAoIV8uaXNOdWxsKHByb2plY3QuYWRkcmVzcykgP1xuICAgICAgICAgICAgICAgICAgICAgbShgYS5idG4uYnRuLWlubGluZS5idG4tc21hbGwuYnRuLXRyYW5zcGFyZW50LmxpbmstaGlkZGVuLWxpZ2h0LnUtbWFyZ2luYm90dG9tLTEwW2hyZWY9XCIvcHQvZXhwbG9yZT9wZ19zZWFyY2g9JHtwcm9qZWN0LmFkZHJlc3Muc3RhdGVfYWNyb255bX1cIl1gLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1tYXAtbWFya2VyJyksIGAgJHtwcm9qZWN0LmFkZHJlc3MuY2l0eX0sICR7cHJvamVjdC5hZGRyZXNzLnN0YXRlX2Fjcm9ueW19YFxuICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBtKGBhLmJ0bi5idG4taW5saW5lLmJ0bi1zbWFsbC5idG4tdHJhbnNwYXJlbnQubGluay1oaWRkZW4tbGlnaHRbaHJlZj1cIi9wdC9leHBsb3JlI2J5X2NhdGVnb3J5X2lkLyR7cHJvamVjdC5jYXRlZ29yeV9pZH1cIl1gLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLXRhZycpLCAnICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmNhdGVnb3J5X25hbWVcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2J1dHRvbiNzaGFyZS1ib3guYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnkuYnRuLWlubGluZScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuZGlzcGxheVNoYXJlQm94LnRvZ2dsZVxuICAgICAgICAgICAgICAgICAgICB9LCAnQ29tcGFydGlsaGFyJyksIChjdHJsLmRpc3BsYXlTaGFyZUJveCgpID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0U2hhcmVCb3gsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5U2hhcmVCb3g6IGN0cmwuZGlzcGxheVNoYXJlQm94XG4gICAgICAgICAgICAgICAgICAgIH0pIDogJycpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuUHJvamVjdE1haW4gPSAoKG0sIGMsIF8sIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBkaXNwbGF5VGFiQ29udGVudCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLFxuICAgICAgICAgICAgICAgICAgICAgICAgY19vcHRzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWJzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjcmV3YXJkcyc6IG0oJy53LWNvbC53LWNvbC0xMicsIG0uY29tcG9uZW50KGMuUHJvamVjdFJld2FyZExpc3QsIF8uZXh0ZW5kKHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZERldGFpbHM6IGFyZ3MucmV3YXJkRGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGNfb3B0cykpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI2NvbnRyaWJ1dGlvbl9zdWdnZXN0aW9ucyc6IG0uY29tcG9uZW50KGMuUHJvamVjdFN1Z2dlc3RlZENvbnRyaWJ1dGlvbnMsIGNfb3B0cyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNjb250cmlidXRpb25zJzogbS5jb21wb25lbnQoYy5Qcm9qZWN0Q29udHJpYnV0aW9ucywgY19vcHRzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI2Fib3V0JzogbS5jb21wb25lbnQoYy5Qcm9qZWN0QWJvdXQsIF8uZXh0ZW5kKHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZERldGFpbHM6IGFyZ3MucmV3YXJkRGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGNfb3B0cykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjY29tbWVudHMnOiBtLmNvbXBvbmVudChjLlByb2plY3RDb21tZW50cywgY19vcHRzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI3Bvc3RzJzogbS5jb21wb25lbnQoYy5Qcm9qZWN0UG9zdHMsIGNfb3B0cylcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKF8uaXNFbXB0eShoYXNoKSB8fCBoYXNoID09PSAnI189XycgfHwgaGFzaCA9PT0gJyNwcmV2aWV3Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhYnNbJyNhYm91dCddO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhYnNbaGFzaF07XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBtLnJlZHJhdywgZmFsc2UpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlUYWJDb250ZW50OiBkaXNwbGF5VGFiQ29udGVudFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJ3NlY3Rpb24uc2VjdGlvbltpdGVtdHlwZT1cImh0dHA6Ly9zY2hlbWEub3JnL0NyZWF0aXZlV29ya1wiXScsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIGN0cmwuZGlzcGxheVRhYkNvbnRlbnQoKSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3RNb2RlIGNvbXBvbmVudFxuICogQSBzaW1wbGUgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgYSBiYWRnZSB3aXRoIHRoZSBjdXJyZW50IHByb2plY3QgbW9kZVxuICogdG9nZXRoZXIgd2l0aCBhIGRlc2NyaXB0aW9uIG9mIHRoZSBtb2RlLCBzaG93biBpbnNpZGUgYSB0b29sdGlwLlxuICogSXQgcmVjZWl2ZXMgYSBwcm9qZWN0IGFzIHJlc291cmNlXG4gKlxuICogRXhhbXBsZTpcbiAqICB2aWV3OiB7XG4gKiAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RNb2RlLCB7cHJvamVjdDogcHJvamVjdH0pXG4gKiAgfVxuICovXG53aW5kb3cuYy5Qcm9qZWN0TW9kZSA9ICgobSwgYywgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIG1vZGUgPSBwcm9qZWN0Lm1vZGUsXG4gICAgICAgICAgICAgICAgdG9vbHRpcFRleHQgPSAobW9kZSA9PT0gJ2FvbicpID8gYFNvbWVudGUgcmVjZWJlcsOhIG9zIHJlY3Vyc29zIHNlIGF0aW5naXIgb3UgdWx0cmFwYXNzYXIgYSBtZXRhIGF0w6kgbyBkaWEgJHtoLm1vbWVudGlmeShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCwgJ0REL01NL1lZWVknKX0uYCA6ICdPIHJlYWxpemFkb3IgcmVjZWJlcsOhIHRvZG9zIG9zIHJlY3Vyc29zIHF1YW5kbyBlbmNlcnJhciBhIGNhbXBhbmhhLCBtZXNtbyBxdWUgbsOjbyB0ZW5oYSBhdGluZ2lkbyBlc3RhIG1ldGEuJztcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBtb2RlOiBtb2RlLFxuICAgICAgICAgICAgICAgIHRvb2x0aXBUZXh0OiB0b29sdGlwVGV4dFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBtb2RlID0gY3RybC5tb2RlLFxuICAgICAgICAgICAgICAgIG1vZGVJbWdTcmMgPSAobW9kZSA9PT0gJ2FvbicpID8gJy9hc3NldHMvYW9uLWJhZGdlLnBuZycgOiAnL2Fzc2V0cy9mbGV4LWJhZGdlLnBuZycsXG4gICAgICAgICAgICAgICAgbW9kZVRpdGxlID0gKG1vZGUgPT09ICdhb24nKSA/ICdDYW1wYW5oYSBUdWRvLW91LW5hZGEgJyA6ICdDYW1wYW5oYSBGbGV4w612ZWwgJyxcbiAgICAgICAgICAgICAgICBnb2FsID0gKF8uaXNOdWxsKGFyZ3MucHJvamVjdC5nb2FsKSA/ICduw6NvIGRlZmluaWRhJyA6IGguZm9ybWF0TnVtYmVyKGFyZ3MucHJvamVjdC5nb2FsKSksXG4gICAgICAgICAgICAgICAgdG9vbHRpcCA9IChlbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Ub29sdGlwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbDogZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiBjdHJsLnRvb2x0aXBUZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDI4MFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbShgIyR7bW9kZX0udy1yb3dgLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oYGltZ1tzcmM9XCIke21vZGVJbWdTcmN9XCJdW3dpZHRoPSczMCddYClcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAudy1jb2wtc21hbGwtMTAudy1jb2wtdGlueS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsICdNZXRhIFIkICcgKyBnb2FsKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctaW5saW5lLWJsb2NrLmZvbnRzaXplLXNtYWxsZXN0Ll93LWlubGluZS1ibG9jaycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVUaXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXAoJ3NwYW4udy1pbmxpbmUtYmxvY2sudG9vbHRpcC13cmFwcGVyLmZhLmZhLXF1ZXN0aW9uLWNpcmNsZS5mb250Y29sb3Itc2Vjb25kYXJ5JylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0UG9zdHMgPSAoKG0sIG1vZGVscywgaCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsaXN0Vk0gPSBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0obW9kZWxzLnByb2plY3RQb3N0RGV0YWlsKSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZmlsdGVyVk0ucHJvamVjdF9pZChhcmdzLnByb2plY3QuaWQpO1xuXG4gICAgICAgICAgICBpZiAoIWxpc3RWTS5jb2xsZWN0aW9uKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGxpc3RWTTogbGlzdFZNLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3QgPSBjdHJsLmxpc3RWTSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3QtcG9zdHMudy1zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LW1hcmdpbnRvcC0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgKHByb2plY3QuaXNfb3duZXJfb3JfYWRtaW4gPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAoIWxpc3QuaXNMb2FkaW5nKCkpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIChfLmlzRW1wdHkobGlzdC5jb2xsZWN0aW9uKCkpID8gbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UudS1tYXJnaW5ib3R0b20tMzAudS1tYXJnaW50b3AtMjAnLCAnVG9kYSBub3ZpZGFkZSBwdWJsaWNhZGEgbm8gQ2F0YXJzZSDDqSBlbnZpYWRhIGRpcmV0YW1lbnRlIHBhcmEgbyBlbWFpbCBkZSBxdWVtIGrDoSBhcG9pb3Ugc2V1IHByb2pldG8gZSB0YW1iw6ltIGZpY2EgZGlzcG9uw612ZWwgcGFyYSB2aXN1YWxpemHDp8OjbyBubyBzaXRlLiBWb2PDqiBwb2RlIG9wdGFyIHBvciBkZWl4w6EtbGEgcMO6YmxpY2EsIG91IHZpc8OtdmVsIHNvbWVudGUgcGFyYSBzZXVzIGFwb2lhZG9yZXMgYXF1aSBuZXN0YSBhYmEuJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYS5idG4uYnRuLWVkaXQuYnRuLXNtYWxsW2hyZWY9Jy9wdC9wcm9qZWN0cy8ke3Byb2plY3QuaWR9L2VkaXQjcG9zdHMnXWAsICdFc2NyZXZlciBub3ZpZGFkZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiAnJyksIChfLm1hcChsaXN0LmNvbGxlY3Rpb24oKSwgKHBvc3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wb3N0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtbWFyZ2luYm90dG9tLTYwIC53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtdGV4dC1jZW50ZXInLCBoLm1vbWVudGlmeShwb3N0LmNyZWF0ZWRfYXQpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZXIudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0zMCcsIHBvc3QudGl0bGUpLCAoIV8uaXNFbXB0eShwb3N0LmNvbW1lbnRfaHRtbCkgPyBtKCcuZm9udHNpemUtYmFzZScsIG0udHJ1c3QocG9zdC5jb21tZW50X2h0bWwpKSA6IG0oJy5mb250c2l6ZS1iYXNlJywgJ1Bvc3QgZXhjbHVzaXZvIHBhcmEgYXBvaWFkb3Jlcy4nKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW5ib3R0b20tNjAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXB1c2gtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIWxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAobGlzdC5pc0xhc3RQYWdlKCkgPyAnJyA6IG0oJ2J1dHRvbiNsb2FkLW1vcmUuYnRuLmJ0bi1tZWRpdW0uYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogbGlzdC5uZXh0UGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnQ2FycmVnYXIgbWFpcycpKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgubG9hZGVyKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlByb2plY3RSZW1pbmRlckNvdW50ID0gKGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucmVzb3VyY2U7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3QtcmVtaW5kZXItY291bnQuY2FyZC51LXJhZGl1cy51LXRleHQtY2VudGVyLm1lZGl1bS51LW1hcmdpbmJvdHRvbS04MCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdUb3RhbCBkZSBwZXNzb2FzIHF1ZSBjbGljYXJhbSBubyBib3TDo28gTGVtYnJhci1tZScpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtbWFyZ2luYm90dG9tLTMwJywgJ1VtIGxlbWJyZXRlIHBvciBlbWFpbCDDqSBlbnZpYWRvIDQ4IGhvcmFzIGFudGVzIGRvIHTDqXJtaW5vIGRhIHN1YSBjYW1wYW5oYScpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1qdW1ibycsIHByb2plY3QucmVtaW5kZXJfY291bnQpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlByb2plY3RSZW1pbmRlciBjb21wb25lbnRcbiAqIEEgY29tcG9uZW50IHRoYXQgZGlzcGxheXMgYSBjbGlja2FibGUgcHJvamVjdCByZW1pbmRlciBlbGVtZW50LlxuICogVGhlIGNvbXBvbmVudCBjYW4gYmUgb2YgdHdvIHR5cGVzOiBhICdsaW5rJyBvciBhICdidXR0b24nXG4gKlxuICogRXhhbXBsZTpcbiAqICB2aWV3OiB7XG4gKiAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RSZW1pbmRlciwge3Byb2plY3Q6IHByb2plY3QsIHR5cGU6ICdidXR0b24nfSlcbiAqICB9XG4gKi9cbndpbmRvdy5jLlByb2plY3RSZW1pbmRlciA9ICgobSwgbW9kZWxzLCBoLCBjKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIGZpbHRlclZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHN0b3JlUmVtaW5kZXJOYW1lID0gJ3JlbWluZF8nICsgcHJvamVjdC5pZCxcbiAgICAgICAgICAgICAgICBsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBwb3BOb3RpZmljYXRpb24gPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIHN1Ym1pdFJlbWluZGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWguZ2V0VXNlcigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoLnN0b3JlQWN0aW9uKHN0b3JlUmVtaW5kZXJOYW1lLCBzdWJtaXRSZW1pbmRlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaC5uYXZpZ2F0ZVRvRGV2aXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbGV0IGxvYWRlck9wdHMgPSBwcm9qZWN0LmluX3JlbWluZGVyID8gbW9kZWxzLnByb2plY3RSZW1pbmRlci5kZWxldGVPcHRpb25zKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkgOiBtb2RlbHMucHJvamVjdFJlbWluZGVyLnBvc3RPcHRpb25zKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6IHByb2plY3QuaWRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGwgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obG9hZGVyT3B0cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgbC5sb2FkKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmluX3JlbWluZGVyID0gIXByb2plY3QuaW5fcmVtaW5kZXI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9qZWN0LmluX3JlbWluZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wTm90aWZpY2F0aW9uKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3BOb3RpZmljYXRpb24oZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIDUwMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3BOb3RpZmljYXRpb24oZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBoLmNhbGxTdG9yZWRBY3Rpb24oc3RvcmVSZW1pbmRlck5hbWUsIHN1Ym1pdFJlbWluZGVyKTtcbiAgICAgICAgICAgIGZpbHRlclZNLnByb2plY3RfaWQocHJvamVjdC5pZCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbDogbCxcbiAgICAgICAgICAgICAgICBzdWJtaXRSZW1pbmRlcjogc3VibWl0UmVtaW5kZXIsXG4gICAgICAgICAgICAgICAgcG9wTm90aWZpY2F0aW9uOiBwb3BOb3RpZmljYXRpb25cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtYWluQ2xhc3MgPSAoYXJncy50eXBlID09PSAnYnV0dG9uJykgPyAnJyA6ICcudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0zMCcsXG4gICAgICAgICAgICAgICAgYnV0dG9uQ2xhc3MgPSAoYXJncy50eXBlID09PSAnYnV0dG9uJykgPyAndy1idXR0b24gYnRuIGJ0bi10ZXJjaWFyeSBidG4tbm8tYm9yZGVyJyA6ICdidG4tbGluayBsaW5rLWhpZGRlbiBmb250c2l6ZS1zbWFsbCcsXG4gICAgICAgICAgICAgICAgaGlkZVRleHRPbk1vYmlsZSA9IGFyZ3MuaGlkZVRleHRPbk1vYmlsZSB8fCBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuXG4gICAgICAgICAgICByZXR1cm4gbShgI3Byb2plY3QtcmVtaW5kZXIke21haW5DbGFzc31gLCBbXG4gICAgICAgICAgICAgICAgbShgYnV0dG9uW2NsYXNzPVwiJHtidXR0b25DbGFzc30gJHsocHJvamVjdC5pbl9yZW1pbmRlciA/ICdsaW5rLWhpZGRlbi1zdWNjZXNzJyA6ICdmb250Y29sb3Itc2Vjb25kYXJ5Jyl9IGZvbnR3ZWlnaHQtc2VtaWJvbGRcIl1gLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuc3VibWl0UmVtaW5kZXJcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIChjdHJsLmwoKSA/ICdhZ3VhcmRlIC4uLicgOiBtKCdzcGFuLmZhLmZhLWNsb2NrLW8nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKGBzcGFuJHtoaWRlVGV4dE9uTW9iaWxlID8gJy53LWhpZGRlbi1tZWRpdW0nIDogJyd9YCwgcHJvamVjdC5pbl9yZW1pbmRlciA/ICcgTGVtYnJldGUgYXRpdm8nIDogJyBMZW1icmFyLW1lJylcbiAgICAgICAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICAgICAgXSksIChjdHJsLnBvcE5vdGlmaWNhdGlvbigpID8gbS5jb21wb25lbnQoYy5Qb3BOb3RpZmljYXRpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ09rISBWYW1vcyB0ZSBtYW5kYXIgdW0gbGVtYnJldGUgcG9yIGUtbWFpbCA0OCBob3JhcyBhbnRlcyBkbyBmaW0gZGEgY2FtcGFuaGEnXG4gICAgICAgICAgICAgICAgfSkgOiAnJylcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLlByb2plY3RSZXdhcmRMaXN0ID0gKChtLCBoLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIC8vRklYTUU6IE1JU1NJTkcgQURKVVNUU1xuICAgICAgICAgICAgLy8gLSBhZGQgZHJhZnQgYWRtaW4gbW9kaWZpY2F0aW9uc1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3Jld2FyZHMudS1tYXJnaW5ib3R0b20tMzAnLCBfLm1hcChhcmdzLnJld2FyZERldGFpbHMoKSwgKHJld2FyZCkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBjb250cmlidXRpb25VcmxXaXRoUmV3YXJkID0gJy9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCArICcvY29udHJpYnV0aW9ucy9uZXc/cmV3YXJkX2lkPScgKyByZXdhcmQuaWQ7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnYVtjbGFzcz1cIicgKyAoaC5yZXdhcmRTb3VsZE91dChyZXdhcmQpID8gJ2NhcmQtZ29uZScgOiAnY2FyZC1yZXdhcmQgJyArIChwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgPyAnY2xpY2thYmxlJyA6ICcnKSkgKyAnIGNhcmQgY2FyZC1zZWNvbmRhcnkgdS1tYXJnaW5ib3R0b20tMTBcIl1baHJlZj1cIicgKyAocHJvamVjdC5vcGVuX2Zvcl9jb250cmlidXRpb25zICYmICFoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgPyBjb250cmlidXRpb25VcmxXaXRoUmV3YXJkIDogJ2pzOnZvaWQoMCk7JykgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1BhcmEgUiQgJyArIGguZm9ybWF0TnVtYmVyKHJld2FyZC5taW5pbXVtX3ZhbHVlKSArICcgb3UgbWFpcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIGgucGx1cmFsaXplKHJld2FyZC5wYWlkX2NvdW50LCAnIGFwb2lvJywgJyBhcG9pb3MnKSksIChyZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zID4gMCA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAocmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCA+IDAgPyBtKCcubWF4aW11bV9jb250cmlidXRpb25zLmluX3RpbWVfdG9fY29uZmlybS5jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnBlbmRpbmcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsIGgucGx1cmFsaXplKHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQsICcgYXBvaW8gZW0gcHJhem8gZGUgY29uZmlybWHDp8OjbycsICcgYXBvaW9zIGVtIHByYXpvIGRlIGNvbmZpcm1hw6fDo28uJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksIChoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgPyBtKCcudS1tYXJnaW50b3AtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2UuYmFkZ2UtZ29uZS5mb250c2l6ZS1zbWFsbGVyJywgJ0VzZ290YWRhJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6IG0oJy51LW1hcmdpbnRvcC0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZS5iYWRnZS1hdHRlbnRpb24uZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1ib2xkJywgJ0xpbWl0YWRhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICgnICsgaC5yZXdhcmRSZW1hbmluZyhyZXdhcmQpICsgJyBkZSAnICsgcmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyArICcgZGlzcG9uw612ZWlzKSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJyksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LW1hcmdpbnRvcC0yMCcsIG0udHJ1c3QoaC5zaW1wbGVGb3JtYXQocmV3YXJkLmRlc2NyaXB0aW9uKSkpLCAoIV8uaXNFbXB0eShyZXdhcmQuZGVsaXZlcl9hdCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYicsICdFc3RpbWF0aXZhIGRlIEVudHJlZ2E6ICcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgubW9tZW50aWZ5KHJld2FyZC5kZWxpdmVyX2F0LCAnTU1NL1lZWVknKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksIChwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgJiYgIWgucmV3YXJkU291bGRPdXQocmV3YXJkKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1yZXdhcmQtYm94LWhvdmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LXJld2FyZC1ib3gtc2VsZWN0LXRleHQudS10ZXh0LWNlbnRlcicsICdTZWxlY2lvbmUgZXNzYSByZWNvbXBlbnNhJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlByb2plY3RSb3cgPSAoKG0sIF8sIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IGFyZ3MuY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICByZWYgPSBhcmdzLnJlZixcbiAgICAgICAgICAgICAgICB3cmFwcGVyID0gYXJncy53cmFwcGVyIHx8ICcudy1zZWN0aW9uLnNlY3Rpb24udS1tYXJnaW5ib3R0b20tNDAnO1xuXG4gICAgICAgICAgICBpZiAoY29sbGVjdGlvbi5sb2FkZXIoKSB8fCBjb2xsZWN0aW9uLmNvbGxlY3Rpb24oKS5sZW5ndGggPiAwKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSh3cmFwcGVyLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICghXy5pc1VuZGVmaW5lZChjb2xsZWN0aW9uLnRpdGxlKSB8fCAhXy5pc1VuZGVmaW5lZChjb2xsZWN0aW9uLmhhc2gpKSA/IG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LWxvb3NlcicsIGNvbGxlY3Rpb24udGl0bGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGEuYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnlbaHJlZj1cIi9wdC9leHBsb3JlP3JlZj0ke3JlZn0jJHtjb2xsZWN0aW9uLmhhc2h9XCJdYCwgJ1ZlciB0b2RvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uLmxvYWRlcigpID8gaC5sb2FkZXIoKSA6IG0oJy53LXJvdycsIF8ubWFwKGNvbGxlY3Rpb24uY29sbGVjdGlvbigpLCAocHJvamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RDYXJkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogcmVmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJ2RpdicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0U2hhcmVCb3ggPSAoKG0sIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlFbWJlZDogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcucG9wLXNoYXJlJywge1xuICAgICAgICAgICAgICAgIHN0eWxlOiAnZGlzcGxheTogYmxvY2s7J1xuICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdhLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5LmJ0bi1pbmxpbmUudS1yaWdodCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGFyZ3MuZGlzcGxheVNoYXJlQm94LnRvZ2dsZVxuICAgICAgICAgICAgICAgICAgICB9LCAnRmVjaGFyJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTMwJywgJ0NvbXBhcnRpbGhlIGVzdGUgcHJvamV0bycpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctd2lkZ2V0Lnctd2lkZ2V0LWZhY2Vib29rLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuc2hhcmUtYmxvY2snLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lmcmFtZVthbGxvd3RyYW5zcGFyZW5jeT1cInRydWVcIl1bd2lkdGg9XCIxNTBweFwiXVtoZWlnaHQ9XCIyMnB4XCJdW2ZyYW1lYm9yZGVyPVwiMFwiXVtzY3JvbGxpbmc9XCJub1wiXVtzcmM9XCJodHRwczovL3d3dy5mYWNlYm9vay5jb20vdjIuMC9wbHVnaW5zL3NoYXJlX2J1dHRvbi5waHA/YXBwX2lkPTE3Mzc0NzA0MjY2MTQ5MSZjaGFubmVsPWh0dHBzJTNBJTJGJTJGcy1zdGF0aWMuYWsuZmFjZWJvb2suY29tJTJGY29ubmVjdCUyRnhkX2FyYml0ZXIlMkY0NE93Szc0dTBJZS5qcyUzRnZlcnNpb24lM0Q0MSUyM2NiJTNEZjdkOWI5MDBjJTI2ZG9tYWluJTNEd3d3LmNhdGFyc2UubWUlMjZvcmlnaW4lM0RodHRwcyUyNTNBJTI1MkYlMjUyRnd3dy5jYXRhcnNlLm1lJTI1MkZmNGIzYWQwYzglMjZyZWxhdGlvbiUzRHBhcmVudC5wYXJlbnQmY29udGFpbmVyX3dpZHRoPTAmaHJlZj1odHRwcyUzQSUyRiUyRnd3dy5jYXRhcnNlLm1lJTJGcHQlMkYnICsgYXJncy5wcm9qZWN0LnBlcm1hbGluayArICclM0ZyZWYlM0RmYWNlYm9vayZsYXlvdXQ9YnV0dG9uX2NvdW50JmxvY2FsZT1wdF9CUiZzZGs9am9leVwiXScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctd2lkZ2V0Lnctd2lkZ2V0LXR3aXR0ZXIudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5zaGFyZS1ibG9jaycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaWZyYW1lW2FsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiXVt3aWR0aD1cIjEyMHB4XCJdW2hlaWdodD1cIjIycHhcIl1bZnJhbWVib3JkZXI9XCIwXCJdW3Njcm9sbGluZz1cIm5vXCJdW3NyYz1cIi8vcGxhdGZvcm0udHdpdHRlci5jb20vd2lkZ2V0cy90d2VldF9idXR0b24uOGQwMDdkZGZjMTg0ZTY3NzZiZTc2ZmU5ZTVlNTJkNjkuZW4uaHRtbCNfPTE0NDI0MjU5ODQ5MzYmY291bnQ9aG9yaXpvbnRhbCZkbnQ9ZmFsc2UmaWQ9dHdpdHRlci13aWRnZXQtMSZsYW5nPWVuJm9yaWdpbmFsX3JlZmVyZXI9aHR0cHMlM0ElMkYlMkZ3d3cuY2F0YXJzZS5tZSUyRnB0JTJGJyArIGFyZ3MucHJvamVjdC5wZXJtYWxpbmsgKyAnJnNpemU9bSZ0ZXh0PUNvbmZpcmElMjBvJTIwcHJvamV0byUyMCcgKyBhcmdzLnByb2plY3QubmFtZSArICclMjBubyUyMCU0MGNhdGFyc2UmdHlwZT1zaGFyZSZ1cmw9aHR0cHMlM0ElMkYlMkZ3d3cuY2F0YXJzZS5tZSUyRnB0JTJGJyArIGFyZ3MucHJvamVjdC5wZXJtYWxpbmsgKyAnJTNGcmVmJTNEdHdpdHRlciZ2aWE9Y2F0YXJzZVwiXScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnYS53LWhpZGRlbi1zbWFsbC53aWRnZXQtZW1iZWQudy1oaWRkZW4tdGlueS5mb250c2l6ZS1zbWFsbC5saW5rLWhpZGRlbi5mb250Y29sb3Itc2Vjb25kYXJ5W2hyZWY9XCJqczp2b2lkKDApO1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5kaXNwbGF5RW1iZWQudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgJzwgZW1iZWQgPicpLCAoY3RybC5kaXNwbGF5RW1iZWQoKSA/IG0oJy5lbWJlZC1leHBhbmRlZC51LW1hcmdpbnRvcC0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMjAnLCAnSW5zaXJhIHVtIHdpZGdldCBlbSBzZXUgc2l0ZScpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dFt0eXBlPVwidGV4dFwiXVt2YWx1ZT1cIjxpZnJhbWUgZnJhbWVib3JkZXI9XCIwXCIgaGVpZ2h0PVwiMzE0cHhcIiBzcmM9XCJodHRwczovL3d3dy5jYXRhcnNlLm1lL3B0L3Byb2plY3RzLycgKyBhcmdzLnByb2plY3QuaWQgKyAnL2VtYmVkXCIgd2lkdGg9XCIzMDBweFwiIHNjcm9sbGluZz1cIm5vXCI+PC9pZnJhbWU+XCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLWVtYmVkJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaWZyYW1lW2ZyYW1lYm9yZGVyPVwiMFwiXVtoZWlnaHQ9XCIzNTBweFwiXVtzcmM9XCIvcHJvamVjdHMvJyArIGFyZ3MucHJvamVjdC5pZCArICcvZW1iZWRcIl1bd2lkdGg9XCIzMDBweFwiXVtzY3JvbGxpbmc9XCJub1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgbSgnYS53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS5idG4uYnRuLW1lZGl1bS5idG4tZmIudS1tYXJnaW5ib3R0b20tMjBbaHJlZj1cImh0dHA6Ly93d3cuZmFjZWJvb2suY29tL3NoYXJlci9zaGFyZXIucGhwP3U9aHR0cHM6Ly93d3cuY2F0YXJzZS5tZS8nICsgYXJncy5wcm9qZWN0LnBlcm1hbGluayArICc/cmVmPWZhY2Vib29rJnRpdGxlPScgKyBhcmdzLnByb2plY3QubmFtZSArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWZhY2Vib29rJyksICcgQ29tcGFydGlsaGUnXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnYS53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS5idG4uYnRuLW1lZGl1bS5idG4tdHdlZXQudS1tYXJnaW5ib3R0b20tMjBbaHJlZj1cImh0dHA6Ly90d2l0dGVyLmNvbS8/c3RhdHVzPUFjYWJlaSBkZSBhcG9pYXIgbyBwcm9qZXRvICcgKyBhcmdzLnByb2plY3QubmFtZSArICcgaHR0czovL3d3dy5jYXRhcnNlLm1lLycgKyBhcmdzLnByb2plY3QucGVybWFsaW5rICsgJz9yZWY9dHdpdHRlcnJcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLXR3aXR0ZXInKSwgJyBUd2VldCdcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RTaWRlYmFyID0gKChtLCBoLCBjLCBfLCBJMThuKSA9PiB7XG4gICAgY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAncHJvamVjdHMucHJvamVjdF9zaWRlYmFyJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBhbmltYXRlUHJvZ3Jlc3MgPSAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYW5pbWF0aW9uLCBwcm9ncmVzcyA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxlZGdlZCA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0b3JzID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGVkZ2VkSW5jcmVtZW50ID0gcHJvamVjdC5wbGVkZ2VkIC8gcHJvamVjdC5wcm9ncmVzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRvcnNJbmNyZW1lbnQgPSBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dG9ycyAvIHByb2plY3QucHJvZ3Jlc3M7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb2dyZXNzQmFyJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxlZGdlZEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsZWRnZWQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRvcnNFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250cmlidXRvcnMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb24gPSBzZXRJbnRlcnZhbChpbmNyZW1lbnRQcm9ncmVzcywgMjgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5jcmVtZW50UHJvZ3Jlc3MgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9ncmVzcyA8PSBwYXJzZUludChwcm9qZWN0LnByb2dyZXNzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBgJHtwcm9ncmVzc30lYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsZWRnZWRFbC5pbm5lclRleHQgPSBgUiQgJHtoLmZvcm1hdE51bWJlcihwbGVkZ2VkKX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0b3JzRWwuaW5uZXJUZXh0ID0gYCR7cGFyc2VJbnQoY29udHJpYnV0b3JzKX0gcGVzc29hc2A7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5pbm5lclRleHQgPSBgJHtwcm9ncmVzc30lYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsZWRnZWQgPSBwbGVkZ2VkICsgcGxlZGdlZEluY3JlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dG9ycyA9IGNvbnRyaWJ1dG9ycyArIGNvbnRyaWJ1dG9yc0luY3JlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzID0gcHJvZ3Jlc3MgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChhbmltYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMTgwMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc3BsYXlDYXJkQ2xhc3MgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICd3YWl0aW5nX2Z1bmRzJzogJ2NhcmQtd2FpdGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3VjY2Vzc2Z1bCc6ICdjYXJkLXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2ZhaWxlZCc6ICdjYXJkLWVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdkcmFmdCc6ICdjYXJkLWRhcmsnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2luX2FuYWx5c2lzJzogJ2NhcmQtZGFyaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnYXBwcm92ZWQnOiAnY2FyZC1kYXJrJ1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoc3RhdGVzW3Byb2plY3Quc3RhdGVdID8gJ2NhcmQgdS1yYWRpdXMgemluZGV4LTEwICcgKyBzdGF0ZXNbcHJvamVjdC5zdGF0ZV0gOiAnJyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkaXNwbGF5U3RhdHVzVGV4dCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdGVzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2FwcHJvdmVkJzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5hcHByb3ZlZCcsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdvbmxpbmUnOiBoLmV4aXN0eShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCkgPyBJMThuLnQoJ2Rpc3BsYXlfc3RhdHVzLm9ubGluZScsIEkxOG5TY29wZSh7ZGF0ZTogaC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpfSkpIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZmFpbGVkJzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5mYWlsZWQnLCBJMThuU2NvcGUoe2RhdGU6IGgubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSwgZ29hbDogcHJvamVjdC5nb2FsfSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3JlamVjdGVkJzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5yZWplY3RlZCcsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdpbl9hbmFseXNpcyc6IEkxOG4udCgnZGlzcGxheV9zdGF0dXMuaW5fYW5hbHlzaXMnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3VjY2Vzc2Z1bCc6IEkxOG4udCgnZGlzcGxheV9zdGF0dXMuc3VjY2Vzc2Z1bCcsIEkxOG5TY29wZSh7ZGF0ZTogaC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpfSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3dhaXRpbmdfZnVuZHMnOiBJMThuLnQoJ2Rpc3BsYXlfc3RhdHVzLndhaXRpbmdfZnVuZHMnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAnZHJhZnQnOiBJMThuLnQoJ2Rpc3BsYXlfc3RhdHVzLmRyYWZ0JywgSTE4blNjb3BlKCkpXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlc1twcm9qZWN0LnN0YXRlXTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGFuaW1hdGVQcm9ncmVzczogYW5pbWF0ZVByb2dyZXNzLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlDYXJkQ2xhc3M6IGRpc3BsYXlDYXJkQ2xhc3MsXG4gICAgICAgICAgICAgICAgZGlzcGxheVN0YXR1c1RleHQ6IGRpc3BsYXlTdGF0dXNUZXh0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIGVsYXBzZWQgPSBwcm9qZWN0LmVsYXBzZWRfdGltZSxcbiAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBwcm9qZWN0LnJlbWFpbmluZ190aW1lO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3Qtc2lkZWJhci5hc2lkZScsIFtcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1zdGF0cycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnByb2plY3Qtc3RhdHMtaW5uZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1zdGF0cy1pbmZvJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI3BsZWRnZWQuZm9udHNpemUtbGFyZ2VzdC5mb250d2VpZ2h0LXNlbWlib2xkLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsIGBSJCAke2guZm9ybWF0TnVtYmVyKHByb2plY3QucGxlZGdlZCl9YCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJMThuLnQoJ2NvbnRyaWJ1dG9yc19jYWxsJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbiNjb250cmlidXRvcnMuZm9udHdlaWdodC1zZW1pYm9sZCcsIEkxOG4udCgnY29udHJpYnV0b3JzX2NvdW50JywgSTE4blNjb3BlKHtjb3VudDogcHJvamVjdC50b3RhbF9jb250cmlidXRvcnN9KSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFwcm9qZWN0LmV4cGlyZXNfYXQpID8gJyBlbSAnICsgSTE4bi50KCdkYXRldGltZS5kaXN0YW5jZV9pbl93b3Jkcy54XycgKyBlbGFwc2VkLnVuaXQsIHtjb3VudDogZWxhcHNlZC50b3RhbH0sIEkxOG5TY29wZSgpKSA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjcHJvZ3Jlc3NCYXIubWV0ZXItZmlsbCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGAke3Byb2plY3QucHJvZ3Jlc3N9JWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW50b3AtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQubGluZWhlaWdodC10aWdodGVyJywgYCR7cGFyc2VJbnQocHJvamVjdC5wcm9ncmVzcyl9JWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNy53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNi53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtcmlnaHQuZm9udHNpemUtc21hbGwubGluZWhlaWdodC10aWdodGVyJywgcmVtYWluaW5nLnRvdGFsID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlbWFpbmluZy50b3RhbCksIEkxOG4udCgncmVtYWluaW5nX3RpbWUuJyArIHJlbWFpbmluZy51bml0LCBJMThuU2NvcGUoe2NvdW50OiByZW1haW5pbmcudG90YWx9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0TW9kZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICwgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/IG0oJ2EjY29udHJpYnV0ZV9wcm9qZWN0X2Zvcm0uYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0yMFtocmVmPVwiL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkICsgJy9jb250cmlidXRpb25zL25ld1wiXScsIEkxOG4udCgnc3VibWl0JywgSTE4blNjb3BlKCkpKSA6ICcnKSwgKChwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMpID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0UmVtaW5kZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbGluaydcbiAgICAgICAgICAgICAgICAgICAgfSkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdltjbGFzcz1cImZvbnRzaXplLXNtYWxsZXIgdS1tYXJnaW5ib3R0b20tMzAgJyArIChjdHJsLmRpc3BsYXlDYXJkQ2xhc3MoKSkgKyAnXCJdJywgY3RybC5kaXNwbGF5U3RhdHVzVGV4dCgpKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy51c2VyLWMnLCBtLmNvbXBvbmVudChjLlByb2plY3RVc2VyQ2FyZCwge1xuICAgICAgICAgICAgICAgICAgICB1c2VyRGV0YWlsczogYXJncy51c2VyRGV0YWlsc1xuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMsIHdpbmRvdy5fLCB3aW5kb3cuSTE4bikpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucyBjb21wb25lbnRcbiAqIEEgUHJvamVjdC1zaG93IHBhZ2UgaGVscGVyIHRvIHNob3cgc3VnZ2VzdGVkIGFtb3VudHMgb2YgY29udHJpYnV0aW9uc1xuICpcbiAqIEV4YW1wbGUgb2YgdXNlOlxuICogdmlldzogKCkgPT4ge1xuICogICAuLi5cbiAqICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucywge3Byb2plY3Q6IHByb2plY3R9KVxuICogICAuLi5cbiAqIH1cbiAqL1xuXG53aW5kb3cuYy5Qcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucyA9IChmdW5jdGlvbihtLCBjLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICAgICAgICBsZXQgc3VnZ2VzdGlvblVybCA9IChhbW91bnQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYC9wcm9qZWN0cy8ke3Byb2plY3QucHJvamVjdF9pZH0vY29udHJpYnV0aW9ucy9uZXc/YW1vdW50PSR7YW1vdW50fWA7XG4gICAgICAgICAgICB9LCBzdWdnZXN0ZWRWYWx1ZXMgPSBbMTAsIDI1LCA1MCwgMTAwXTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNzdWdnZXN0aW9ucycsIF8ubWFwKHN1Z2dlc3RlZFZhbHVlcywgKGFtb3VudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKGBhW2hyZWY9XCIke3N1Z2dlc3Rpb25VcmwoYW1vdW50KX1cIl0uY2FyZC1yZXdhcmQuY2FyZC1iaWcuY2FyZC1zZWNvbmRhcnkudS1tYXJnaW5ib3R0b20tMjBgLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXInLCBgUiTCoCR7YW1vdW50fWApXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0VGFicyA9ICgobSwgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgaXNGaXhlZCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbiA9IG0ucHJvcCgtMSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGZpeE9uU2Nyb2xsID0gKGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZpZXdwb3J0T2Zmc2V0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5zY3JvbGxZIDw9IG9yaWdpbmFsUG9zaXRpb24oKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbigtMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc0ZpeGVkKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAodmlld3BvcnRPZmZzZXQudG9wIDwgMCB8fCAod2luZG93LnNjcm9sbFkgPiBvcmlnaW5hbFBvc2l0aW9uKCkgJiYgb3JpZ2luYWxQb3NpdGlvbigpID4gMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNGaXhlZCgpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFBvc2l0aW9uKHdpbmRvdy5zY3JvbGxZKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0ZpeGVkKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgbmF2RGlzcGxheSA9IChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaXhOYXZCYXIgPSBmaXhPblNjcm9sbChlbCk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBmaXhOYXZCYXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbmF2RGlzcGxheTogbmF2RGlzcGxheSxcbiAgICAgICAgICAgICAgICBpc0ZpeGVkOiBpc0ZpeGVkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICByZXdhcmRzID0gYXJncy5yZXdhcmREZXRhaWxzO1xuXG4gICAgICAgICAgICBsZXQgbWFpbkNsYXNzID0gKCFjdHJsLmlzRml4ZWQoKSB8fCBwcm9qZWN0LmlzX293bmVyX29yX2FkbWluKSA/ICcudy1zZWN0aW9uLnByb2plY3QtbmF2JyA6ICcudy1zZWN0aW9uLnByb2plY3QtbmF2LnByb2plY3QtbmF2LWZpeGVkJztcblxuICAgICAgICAgICAgcmV0dXJuIG0oJ25hdi13cmFwcGVyJyxbXG4gICAgICAgICAgICAgICAgbShtYWluQ2xhc3MsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLm5hdkRpc3BsYXlcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFshXy5pc0VtcHR5KHJld2FyZHMoKSkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwicmV3YXJkcy1saW5rXCJdW2NsYXNzPVwidy1oaWRkZW4tbWFpbiB3LWhpZGRlbi1tZWRpdW0gZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNyZXdhcmRzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI3Jld2FyZHNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ1JlY29tcGVuc2FzJykgOiBtKCdhW2lkPVwicmV3YXJkcy1saW5rXCJdW2NsYXNzPVwidy1oaWRkZW4tbWFpbiB3LWhpZGRlbi1tZWRpdW0gZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNjb250cmlidXRpb25fc3VnZ2VzdGlvbnMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjY29udHJpYnV0aW9uX3N1Z2dlc3Rpb25zXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdWYWxvcmVzIFN1Z2VyaWRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwiYWJvdXQtbGlua1wiXVtjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjYWJvdXQnKSB8fCBoLmhhc2hNYXRjaCgnJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJyBcIl1baHJlZj1cIiNhYm91dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnZmxvYXQ6IGxlZnQ7J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnU29icmUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtpZD1cInBvc3RzLWxpbmtcIl1bY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI3Bvc3RzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI3Bvc3RzXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdOb3ZpZGFkZXMgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2UnLCBwcm9qZWN0LnBvc3RzX2NvdW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtpZD1cImNvbnRyaWJ1dGlvbnMtbGlua1wiXVtjbGFzcz1cInctaGlkZGVuLXNtYWxsIHctaGlkZGVuLXRpbnkgZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNjb250cmlidXRpb25zJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI2NvbnRyaWJ1dGlvbnNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0Fwb2lvcyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZS53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgcHJvamVjdC50b3RhbF9jb250cmlidXRpb25zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtpZD1cImNvbW1lbnRzLWxpbmtcIl1bY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI2NvbW1lbnRzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI2NvbW1lbnRzXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdDb21lbnTDoXJpb3MgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ZiOmNvbW1lbnRzLWNvdW50W2hyZWY9XCJodHRwOi8vd3d3LmNhdGFyc2UubWUvJyArIHByb2plY3QucGVybWFsaW5rICsgJ1wiXVtjbGFzcz1cImJhZGdlIHByb2plY3QtZmItY29tbWVudCB3LWhpZGRlbi1zbWFsbCB3LWhpZGRlbi10aW55XCJdW3N0eWxlPVwiZGlzcGxheTogaW5saW5lXCJdJywgbS50cnVzdCgnJm5ic3A7JykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy5wcm9qZWN0LW5hdi1iYWNrLWJ1dHRvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02LnctY29sLW1lZGl1bS04JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Eudy1idXR0b24uYnRuW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL2NvbnRyaWJ1dGlvbnMvbmV3XCJdJywgJ0Fwb2lhcsKg4oCNZXN0ZcKgcHJvamV0bycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02LnctY29sLW1lZGl1bS00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFJlbWluZGVyLCB7cHJvamVjdDogcHJvamVjdCwgdHlwZTogJ2J1dHRvbicsIGhpZGVUZXh0T25Nb2JpbGU6IHRydWV9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIChjdHJsLmlzRml4ZWQoKSAmJiAhcHJvamVjdC5pc19vd25lcl9vcl9hZG1pbikgPyBtKCcudy1zZWN0aW9uLnByb2plY3QtbmF2JykgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdFVzZXJDYXJkID0gKChtLCBfLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjdXNlci1jYXJkJywgXy5tYXAoYXJncy51c2VyRGV0YWlscygpLCAodXNlckRldGFpbCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcudS1tYXJnaW5ib3R0b20tMzAudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIudS1tYXJnaW5ib3R0b20tMzAudS1yb3VuZFt3aWR0aD1cIjEwMFwiXVtpdGVtcHJvcD1cImltYWdlXCJdW3NyYz1cIicgKyB1c2VyRGV0YWlsLnByb2ZpbGVfaW1nX3RodW1ibmFpbCArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwubGluay1oaWRkZW4uZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5saW5laGVpZ2h0LXRpZ2h0W2l0ZW1wcm9wPVwibmFtZVwiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiL3VzZXJzLycgKyB1c2VyRGV0YWlsLmlkICsgJ1wiXScsIHVzZXJEZXRhaWwubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgucGx1cmFsaXplKHVzZXJEZXRhaWwudG90YWxfcHVibGlzaGVkX3Byb2plY3RzLCAnIGNyaWFkbycsICcgY3JpYWRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCcmbmJzcDsmbmJzcDt8Jm5ic3A7Jm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgucGx1cmFsaXplKHVzZXJEZXRhaWwudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMsICcgYXBvaWFkbycsICcgYXBvaWFkb3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3VsLnctaGlkZGVuLXRpbnkudy1oaWRkZW4tc21hbGwudy1saXN0LXVuc3R5bGVkLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC5mYWNlYm9va19saW5rKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiJyArIHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBGYWNlYm9vaycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLCAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLnR3aXR0ZXJfdXNlcm5hbWUpID8gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCJodHRwczovL3R3aXR0ZXIuY29tLycgKyB1c2VyRGV0YWlsLnR3aXR0ZXJfdXNlcm5hbWUgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdQZXJmaWwgbm8gVHdpdHRlcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcCh1c2VyRGV0YWlsLmxpbmtzLCAobGluaykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnNlZExpbmsgPSBoLnBhcnNlVXJsKGxpbmspO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCFfLmlzRW1wdHkocGFyc2VkTGluay5ob3N0bmFtZSkgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCInICsgbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgcGFyc2VkTGluay5ob3N0bmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLmVtYWlsKSA/IG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRzaXplLXNtYWxsZXN0LmFsdC1saW5rLmZvbnR3ZWlnaHQtc2VtaWJvbGRbaXRlbXByb3A9XCJlbWFpbFwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCB1c2VyRGV0YWlsLmVtYWlsKSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlNsaWRlciBjb21wb25lbnRcbiAqIEJ1aWxkIGEgc2xpZGVyIGZyb20gYW55IGFycmF5IG9mIG1pdGhyaWwgZWxlbWVudHNcbiAqXG4gKiBFeGFtcGxlIG9mIHVzZTpcbiAqIHZpZXc6ICgpID0+IHtcbiAqICAgICAuLi5cbiAqICAgICBtLmNvbXBvbmVudChjLlNsaWRlciwge1xuICogICAgICAgICBzbGlkZXM6IFttKCdzbGlkZTEnKSwgbSgnc2xpZGUyJyksIG0oJ3NsaWRlMycpXSxcbiAqICAgICAgICAgdGl0bGU6ICdPIHF1ZSBlc3TDo28gZGl6ZW5kbyBwb3IgYcOtLi4uJ1xuICogICAgIH0pXG4gKiAgICAgLi4uXG4gKiB9XG4gKi9cbndpbmRvdy5jLlNsaWRlciA9ICgobSwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgaW50ZXJ2YWw7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFNsaWRlSWR4ID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uU2l6ZSA9IG0ucHJvcCgxNjAwKSxcbiAgICAgICAgICAgICAgICBkZWNyZW1lbnRTbGlkZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkU2xpZGVJZHgoKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkU2xpZGVJZHgoc2VsZWN0ZWRTbGlkZUlkeCgpIC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFNsaWRlSWR4KGFyZ3Muc2xpZGVzLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbmNyZW1lbnRTbGlkZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkU2xpZGVJZHgoKSA8IChhcmdzLnNsaWRlcy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRTbGlkZUlkeChzZWxlY3RlZFNsaWRlSWR4KCkgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkU2xpZGVJZHgoMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN0YXJ0U2xpZGVyVGltZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5jcmVtZW50U2xpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDY1MDApO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmVzZXRTbGlkZXJUaW1lciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0U2xpZGVyVGltZXIoKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbmZpZyA9IChlbCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRpb25TaXplKE1hdGgubWF4KGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCwgd2luZG93LmlubmVyV2lkdGggfHwgMCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gKCkgPT4gY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc3RhcnRTbGlkZXJUaW1lcigpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkU2xpZGVJZHg6IHNlbGVjdGVkU2xpZGVJZHgsXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRpb25TaXplOiB0cmFuc2xhdGlvblNpemUsXG4gICAgICAgICAgICAgICAgZGVjcmVtZW50U2xpZGU6IGRlY3JlbWVudFNsaWRlLFxuICAgICAgICAgICAgICAgIGluY3JlbWVudFNsaWRlOiBpbmNyZW1lbnRTbGlkZSxcbiAgICAgICAgICAgICAgICByZXNldFNsaWRlclRpbWVyOiByZXNldFNsaWRlclRpbWVyXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2xpZGVyQ2xpY2sgPSAoZm4sIHBhcmFtKSA9PiB7XG4gICAgICAgICAgICAgICAgZm4ocGFyYW0pO1xuICAgICAgICAgICAgICAgIGN0cmwucmVzZXRTbGlkZXJUaW1lcigpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNsaWRlci5zbGlkZS10ZXN0aW1vbmlhbHMnLCB7XG4gICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLmNvbmZpZ1xuICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXInLCBhcmdzLnRpdGxlKSxcbiAgICAgICAgICAgICAgICBtKCcudy1zbGlkZXItbWFzaycsIFtcbiAgICAgICAgICAgICAgICAgICAgXy5tYXAoYXJncy5zbGlkZXMsIChzbGlkZSwgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdHJhbnNsYXRlVmFsdWUgPSAoaWR4IC0gY3RybC5zZWxlY3RlZFNsaWRlSWR4KCkpICogY3RybC50cmFuc2xhdGlvblNpemUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGVTdHIgPSBgdHJhbnNsYXRlM2QoJHt0cmFuc2xhdGVWYWx1ZX1weCwgMCwgMClgO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnNsaWRlLnctc2xpZGUuc2xpZGUtdGVzdGltb25pYWxzLWNvbnRlbnQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IGB0cmFuc2Zvcm06ICR7dHJhbnNsYXRlU3RyfTsgLXdlYmtpdC10cmFuc2Zvcm06ICR7dHJhbnNsYXRlU3RyfTsgLW1zLXRyYW5zZm9ybToke3RyYW5zbGF0ZVN0cn07YFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtcHVzaC0yJywgc2xpZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbSgnI3NsaWRlLXByZXYudy1zbGlkZXItYXJyb3ctbGVmdC53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogKCkgPT4gc2xpZGVyQ2xpY2soY3RybC5kZWNyZW1lbnRTbGlkZSlcbiAgICAgICAgICAgICAgICAgICAgfSxbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1pY29uLXNsaWRlci1sZWZ0LmZhLmZhLWNoZXZyb24tbGVmdC5mb250Y29sb3ItdGVyY2lhcnknKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnI3NsaWRlLW5leHQudy1zbGlkZXItYXJyb3ctcmlnaHQudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6ICgpID0+IHNsaWRlckNsaWNrKGN0cmwuaW5jcmVtZW50U2xpZGUpXG4gICAgICAgICAgICAgICAgICAgIH0sW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaWNvbi1zbGlkZXItcmlnaHQuZmEuZmEtY2hldnJvbi1yaWdodC5mb250Y29sb3ItdGVyY2lhcnknKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctc2xpZGVyLW5hdi53LXNsaWRlci1uYXYtaW52ZXJ0Lnctcm91bmQuc2xpZGUtbmF2JywgXyhhcmdzLnNsaWRlcy5sZW5ndGgpLnRpbWVzKChpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKGAuc2xpZGUtYnVsbGV0Lnctc2xpZGVyLWRvdCR7Y3RybC5zZWxlY3RlZFNsaWRlSWR4KCkgPT09IGlkeCA/ICcudy1hY3RpdmUnIDogJyd9YCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6ICgpID0+IHNsaWRlckNsaWNrKGN0cmwuc2VsZWN0ZWRTbGlkZUlkeCwgaWR4KVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuVGVhbU1lbWJlcnMgPSAoZnVuY3Rpb24oXywgbSwgbW9kZWxzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdm0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IG0ucHJvcChbXSlcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgZ3JvdXBDb2xsZWN0aW9uID0gZnVuY3Rpb24oY29sbGVjdGlvbiwgZ3JvdXBUb3RhbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXy5tYXAoXy5yYW5nZShNYXRoLmNlaWwoY29sbGVjdGlvbi5sZW5ndGggLyBncm91cFRvdGFsKSksIGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uLnNsaWNlKGkgKiBncm91cFRvdGFsLCAoaSArIDEpICogZ3JvdXBUb3RhbCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIG1vZGVscy50ZWFtTWVtYmVyLmdldFBhZ2UoKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB2bS5jb2xsZWN0aW9uKGdyb3VwQ29sbGVjdGlvbihkYXRhLCA0KSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB2bTogdm1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgcmV0dXJuIG0oJyN0ZWFtLW1lbWJlcnMtc3RhdGljLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgXy5tYXAoY3RybC52bS5jb2xsZWN0aW9uKCksIGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAoZ3JvdXAsIGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnRlYW0tbWVtYmVyLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIvdXNlcnMvJyArIG1lbWJlci5pZCArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLmJpZy51LXJvdW5kLnUtbWFyZ2luYm90dG9tLTEwW3NyYz1cIicgKyBtZW1iZXIuaW1nICsgJ1wiXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWJhc2UnLCBtZW1iZXIubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnQXBvaW91ICcgKyBtZW1iZXIudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5fLCB3aW5kb3cubSwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5UZWFtVG90YWwgPSAoZnVuY3Rpb24obSwgaCwgbW9kZWxzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgdm0gPSB7XG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbjogbS5wcm9wKFtdKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbW9kZWxzLnRlYW1Ub3RhbC5nZXRSb3coKS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB2bS5jb2xsZWN0aW9uKGRhdGEpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdm06IHZtXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjdGVhbS10b3RhbC1zdGF0aWMudy1zZWN0aW9uLnNlY3Rpb24tb25lLWNvbHVtbi5zZWN0aW9uLnUtbWFyZ2ludG9wLTQwLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgY3RybC52bS5jb2xsZWN0aW9uKCkubWFwKGZ1bmN0aW9uKHRlYW1Ub3RhbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTMwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdIb2plIHNvbW9zICcgKyB0ZWFtVG90YWwubWVtYmVyX2NvdW50ICsgJyBwZXNzb2FzIGVzcGFsaGFkYXMgcG9yICcgKyB0ZWFtVG90YWwudG90YWxfY2l0aWVzICsgJyBjaWRhZGVzIGVtICcgKyB0ZWFtVG90YWwuY291bnRyaWVzLmxlbmd0aCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIHBhw61zZXMgKCcgKyB0ZWFtVG90YWwuY291bnRyaWVzLnRvU3RyaW5nKCkgKyAnKSEgTyBDYXRhcnNlIMOpIGluZGVwZW5kZW50ZSwgc2VtIGludmVzdGlkb3JlcywgZGUgY8OzZGlnbyBhYmVydG8gZSBjb25zdHJ1w61kbyBjb20gYW1vci4gTm9zc2EgcGFpeMOjbyDDqSBjb25zdHJ1aXIgdW0gYW1iaWVudGUgb25kZSBjYWRhIHZleiBtYWlzIHByb2pldG9zIHBvc3NhbSBnYW5oYXIgdmlkYS4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci5saW5laGVpZ2h0LXRpZ2h0LnRleHQtc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnTm9zc2EgZXF1aXBlLCBqdW50YSwgasOhIGFwb2lvdSBSJCcgKyBoLmZvcm1hdE51bWJlcih0ZWFtVG90YWwudG90YWxfYW1vdW50KSArICcgcGFyYSAnICsgdGVhbVRvdGFsLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcyEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIi8qKlxuICogd2luZG93LmMuVG9vbHRpcCBjb21wb25lbnRcbiAqIEEgY29tcG9uZW50IHRoYXQgYWxsb3dzIHlvdSB0byBzaG93IGEgdG9vbHRpcCBvblxuICogYSBzcGVjaWZpZWQgZWxlbWVudCBob3Zlci4gSXQgcmVjZWl2ZXMgdGhlIGVsZW1lbnQgeW91IHdhbnRcbiAqIHRvIHRyaWdnZXIgdGhlIHRvb2x0aXAgYW5kIGFsc28gdGhlIHRleHQgdG8gZGlzcGxheSBhcyB0b29sdGlwLlxuICpcbiAqIEV4YW1wbGUgb2YgdXNlOlxuICogdmlldzogKCkgPT4ge1xuICogICAgIGxldCB0b29sdGlwID0gKGVsKSA9PiB7XG4gKiAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Ub29sdGlwLCB7XG4gKiAgICAgICAgICAgICAgZWw6IGVsLFxuICogICAgICAgICAgICAgIHRleHQ6ICd0ZXh0IHRvIHRvb2x0aXAnLFxuICogICAgICAgICAgICAgIHdpZHRoOiAzMDBcbiAqICAgICAgICAgIH0pXG4gKiAgICAgfVxuICpcbiAqICAgICByZXR1cm4gdG9vbHRpcCgnYSNsaW5rLXd0aC10b29sdGlwW2hyZWY9XCIjXCJdJyk7XG4gKlxuICogfVxuICovXG53aW5kb3cuYy5Ub29sdGlwID0gKChtLCBjLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBwYXJlbnRIZWlnaHQgPSBtLnByb3AoMCksXG4gICAgICAgICAgICAgICAgd2lkdGggPSBtLnByb3AoYXJncy53aWR0aCB8fCAyODApLFxuICAgICAgICAgICAgICAgIHRvcCA9IG0ucHJvcCgwKSxcbiAgICAgICAgICAgICAgICBsZWZ0ID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgICAgIG9wYWNpdHkgPSBtLnByb3AoMCksXG4gICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0ID0gbS5wcm9wKHt0b3A6IDAsIGxlZnQ6IDB9KSxcbiAgICAgICAgICAgICAgICB0b29sdGlwID0gaC50b2dnbGVQcm9wKDAsIDEpLFxuICAgICAgICAgICAgICAgIHRvZ2dsZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdG9vbHRpcC50b2dnbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBzZXRQYXJlbnRQb3NpdGlvbiA9IChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldChoLmN1bXVsYXRpdmVPZmZzZXQoZWwpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldFBvc2l0aW9uID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZWxUb3AgPSBlbC5vZmZzZXRIZWlnaHQgKyBlbC5vZmZzZXRQYXJlbnQub2Zmc2V0SGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPCAoZWwub2Zmc2V0V2lkdGggKyAyICogcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nTGVmdCkgKyAzMCkpeyAvLzMwIGhlcmUgaXMgYSBzYWZlIG1hcmdpblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsLnN0eWxlLndpZHRoID0gd2luZG93LmlubmVyV2lkdGggLSAzMDsgLy9BZGRpbmcgdGhlIHNhZmUgbWFyZ2luXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCgtcGFyZW50T2Zmc2V0KCkubGVmdCArIDE1KTsgLy9wb3NpdGlvbmluZyBjZW50ZXIgb2Ygd2luZG93LCBjb25zaWRlcmluZyBtYXJnaW5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoKHBhcmVudE9mZnNldCgpLmxlZnQgKyAoZWwub2Zmc2V0V2lkdGggLyAyKSkgPD0gd2luZG93LmlubmVyV2lkdGggJiYgKHBhcmVudE9mZnNldCgpLmxlZnQgLSAoZWwub2Zmc2V0V2lkdGggLyAyKSkgPj0gMCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCgtZWwub2Zmc2V0V2lkdGggLyAyKTsgLy9Qb3NpdGlvbmluZyB0byB0aGUgY2VudGVyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKChwYXJlbnRPZmZzZXQoKS5sZWZ0ICsgKGVsLm9mZnNldFdpZHRoIC8gMikpID4gd2luZG93LmlubmVyV2lkdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0KC1lbC5vZmZzZXRXaWR0aCArIGVsLm9mZnNldFBhcmVudC5vZmZzZXRXaWR0aCk7IC8vUG9zaXRpb25pbmcgdG8gdGhlIGxlZnRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoKHBhcmVudE9mZnNldCgpLmxlZnQgLSAoZWwub2Zmc2V0V2lkdGggLyAyKSkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCgtZWwub2Zmc2V0UGFyZW50Lm9mZnNldFdpZHRoKTsgLy9Qb3NpdGlvbmluZyB0byB0aGUgcmlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcCgtZWxUb3ApOyAvL1NldHRpbmcgdG9wIHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgICAgICBsZWZ0OiBsZWZ0LFxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IG9wYWNpdHksXG4gICAgICAgICAgICAgICAgdG9vbHRpcDogdG9vbHRpcCxcbiAgICAgICAgICAgICAgICB0b2dnbGU6IHRvZ2dsZSxcbiAgICAgICAgICAgICAgICBzZXRQb3NpdGlvbjogc2V0UG9zaXRpb24sXG4gICAgICAgICAgICAgICAgc2V0UGFyZW50UG9zaXRpb246IHNldFBhcmVudFBvc2l0aW9uXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHdpZHRoID0gY3RybC53aWR0aCgpO1xuICAgICAgICAgICAgcmV0dXJuIG0oYXJncy5lbCwge1xuICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlLFxuICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC5zZXRQYXJlbnRQb3NpdGlvbixcbiAgICAgICAgICAgICAgICBzdHlsZToge2N1cnNvcjogJ3BvaW50ZXInfVxuICAgICAgICAgICAgfSwgY3RybC50b29sdGlwKCkgPyBbXG4gICAgICAgICAgICAgICAgbShgLnRvb2x0aXAuZGFya1tzdHlsZT1cIndpZHRoOiAke3dpZHRofXB4OyB0b3A6ICR7Y3RybC50b3AoKX1weDsgbGVmdDogJHtjdHJsLmxlZnQoKX1weDtcIl1gLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC5zZXRQb3NpdGlvblxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgYXJncy50ZXh0KVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdIDogJycpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlVzZXJCYWxhbmNlUmVxdWVzdE1vZGFsQ29udGVudCBjb21wb25lbnRcbiAqIFJlbmRlciB0aGUgY3VycmVudCB1c2VyIGJhbmsgYWNjb3VudCB0byBjb25maXJtIGZ1bmQgcmVxdWVzdFxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLlVzZXJCYWxhbmNlUmVxdWVzdE1vZGVsQ29udGVudCwge1xuICogICAgIGJhbGFuY2U6IHt1c2VyX2lkOiAxMjMsIGFtb3VudDogMTIzfSAvLyB1c2VyQmFsYW5jZSBzdHJ1Y3RcbiAqIH0pXG4gKi9cbndpbmRvdy5jLlVzZXJCYWxhbmNlUmVxdWVzdE1vZGFsQ29udGVudCA9ICgobSwgaCwgXywgbW9kZWxzLCBJMThuKSA9PiB7XG4gICAgY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAndXNlcnMuYmFsYW5jZScpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHt1c2VyX2lkOiAnZXEnfSksXG4gICAgICAgICAgICAgICAgICBiYWxhbmNlID0gYXJncy5iYWxhbmNlLFxuICAgICAgICAgICAgICAgICAgbG9hZGVyT3B0cyA9IG1vZGVscy5iYWxhbmNlVHJhbnNmZXIucG9zdE9wdGlvbnMoe1xuICAgICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6IGJhbGFuY2UudXNlcl9pZH0pLFxuICAgICAgICAgICAgICAgICAgcmVxdWVzdExvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihsb2FkZXJPcHRzKSxcbiAgICAgICAgICAgICAgICAgIGRpc3BsYXlEb25lID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKSxcbiAgICAgICAgICAgICAgICAgIHJlcXVlc3RGdW5kID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIHJlcXVlc3RMb2FkZXIubG9hZCgpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXJncy5iYWxhbmNlTWFuYWdlci5sb2FkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MuYmFsYW5jZVRyYW5zYWN0aW9uTWFuYWdlci5sb2FkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlEb25lLnRvZ2dsZSgpO1xuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgYXJncy5iYW5rQWNjb3VudE1hbmFnZXIubG9hZCgpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlcXVlc3RMb2FkZXI6IHJlcXVlc3RMb2FkZXIsXG4gICAgICAgICAgICAgICAgcmVxdWVzdEZ1bmQ6IHJlcXVlc3RGdW5kLFxuICAgICAgICAgICAgICAgIGJhbmtBY2NvdW50czogYXJncy5iYW5rQWNjb3VudE1hbmFnZXIuY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICBkaXNwbGF5RG9uZTogZGlzcGxheURvbmUsXG4gICAgICAgICAgICAgICAgbG9hZEJhbmtBOiBhcmdzLmJhbmtBY2NvdW50TWFuYWdlci5sb2FkZXJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgYmFsYW5jZSA9IGFyZ3MuYmFsYW5jZTtcblxuICAgICAgICAgICAgcmV0dXJuIChjdHJsLmxvYWRCYW5rQSgpID8gaC5sb2FkZXIoKSA6IG0oJ2RpdicsIF8ubWFwKGN0cmwuYmFua0FjY291bnRzKCksIChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLm1vZGFsLWRpYWxvZy1oZWFkZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlcicsIEkxOG4udCgnd2l0aGRyYXcnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAoY3RybC5kaXNwbGF5RG9uZSgpID8gbSgnLm1vZGFsLWRpYWxvZy1jb250ZW50LnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZmEuZmEtY2hlY2stY2lyY2xlLmZhLTV4LnRleHQtc3VjY2Vzcy51LW1hcmdpbmJvdHRvbS00MCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1sYXJnZScsIEkxOG4udCgnc3VjZXNzX21lc3NhZ2UnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgIF0pIDogbSgnLm1vZGFsLWRpYWxvZy1jb250ZW50JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1ZhbG9yOicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJyZuYnNwOycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udGV4dC1zdWNjZXNzJywgYFIkICR7aC5mb3JtYXROdW1iZXIoYmFsYW5jZS5hbW91bnQsIDIsIDMpfWApXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCB7c3R5bGU6IHsnZm9udC13ZWlnaHQnOiAnIDYwMCd9fSwgSTE4bi50KCdiYW5rLmFjY291bnQnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgnYmFuay5uYW1lJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnJm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ub3duZXJfbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250Y29sb3Itc2Vjb25kYXJ5JywgSTE4bi50KCdiYW5rLmNwZl9jbnBqJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnJm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ub3duZXJfZG9jdW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgnYmFuay5iYW5rX25hbWUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCcmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5iYW5rX25hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgnYmFuay5hZ2VuY3knLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCcmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7aXRlbS5hZ2VuY3l9LSR7aXRlbS5hZ2VuY3lfZGlnaXR9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250Y29sb3Itc2Vjb25kYXJ5JywgSTE4bi50KCdiYW5rLmFjY291bnQnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCcmbmJzcDsnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7aXRlbS5hY2NvdW50fS0ke2l0ZW0uYWNjb3VudF9kaWdpdH1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICBdKSksXG4gICAgICAgICAgICAgICAgICAgICghY3RybC5kaXNwbGF5RG9uZSgpID9cbiAgICAgICAgICAgICAgICAgICAgIG0oJy5tb2RhbC1kaWFsb2ctbmF2LWJvdHRvbScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGN0cmwucmVxdWVzdExvYWRlcigpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBtKCdhLmJ0bi5idG4tbGFyZ2UuYnRuLXJlcXVlc3QtZnVuZFtocmVmPVwianM6dm9pZCgwKTtcIl0nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7b25jbGljazogY3RybC5yZXF1ZXN0RnVuZH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdTb2xpY2l0YXIgc2FxdWUnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zJylcbiAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJylcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfSkpKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXywgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuSTE4bikpO1xuIiwid2luZG93LmMuVXNlckJhbGFuY2VUcmFuc2FjdGlvblJvdyA9ICgobSwgaCkgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3VzZXJzLmJhbGFuY2UnKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBleHBhbmRlZCA9IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmIChhcmdzLmluZGV4ID09IDApIHtcbiAgICAgICAgICAgICAgICBleHBhbmRlZC50b2dnbGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBleHBhbmRlZDogZXhwYW5kZWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0ID0gaC5tb21lbnRGcm9tU3RyaW5nKGl0ZW0uY3JlYXRlZF9hdCwgJ1lZWVktTU0tREQnKTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oYGRpdltjbGFzcz0nYmFsYW5jZS1jYXJkICR7KGN0cmwuZXhwYW5kZWQoKSA/ICdjYXJkLWRldGFpbGVkLW9wZW4nIDogJycpfSddYCxcbiAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNsZWFyZml4LmNhcmQuY2FyZC1jbGlja2FibGUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwubGluZWhlaWdodC10aWdodGVzdCcsIGNyZWF0ZWRBdC5mb3JtYXQoJ0QgTU1NJykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci10ZXJjaWFyeScsIGNyZWF0ZWRBdC5mb3JtYXQoJ1lZWVknKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMC53LWNvbC10aW55LTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXIuZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgnZGViaXQnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnJm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRzaXplLWJhc2UudGV4dC1lcnJvcicsIGBSJCAke2guZm9ybWF0TnVtYmVyKE1hdGguYWJzKGl0ZW0uZGViaXQpLCAyLCAzKX1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXIuZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgnY3JlZGl0JywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJyZuYnNwOycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1iYXNlLnRleHQtc3VjY2VzcycsIGBSJCAke2guZm9ybWF0TnVtYmVyKGl0ZW0uY3JlZGl0LCAyLCAzKX1gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnRzaXplLXNtYWxsZXIuZm9udGNvbG9yLXNlY29uZGFyeScsIEkxOG4udCgndG90YWxzJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJyZuYnNwOycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250c2l6ZS1iYXNlJywgYFIkICR7aC5mb3JtYXROdW1iZXIoaXRlbS50b3RhbF9hbW91bnQsIDIsIDMpfWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgbShgYS53LWlubGluZS1ibG9jay5hcnJvdy1hZG1pbi4keyhjdHJsLmV4cGFuZGVkKCkgPyAnYXJyb3ctYWRtaW4tb3BlbmVkJyA6ICcnKX0uZmEuZmEtY2hldnJvbi1kb3duLmZvbnRjb2xvci1zZWNvbmRhcnlbaHJlZj1cImpzOih2b2lkKDApKTtcIl1gLCB7b25jbGljazogY3RybC5leHBhbmRlZC50b2dnbGV9KVxuICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAoY3RybC5leHBhbmRlZCgpID8gbSgnLmNhcmQnLCBfLm1hcChpdGVtLnNvdXJjZSwgKHRyYW5zYWN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBvcyA9IHRyYW5zYWN0aW9uLmFtb3VudCA+PSAwO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJ2RpdicsW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cuZm9udHNpemUtc21hbGwudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGAudGV4dC0keyhwb3MgPyAnc3VjY2VzcycgOiAnZXJyb3InKX1gLCBgJHtwb3MgPyAnKycgOiAnLSd9IFIkICR7aC5mb3JtYXROdW1iZXIoTWF0aC5hYnModHJhbnNhY3Rpb24uYW1vdW50KSwgMiwgMyl9YClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIGAke3RyYW5zYWN0aW9uLmV2ZW50X25hbWV9ICR7dHJhbnNhY3Rpb24ub3JpZ2luX29iamVjdC5uYW1lfWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW5ib3R0b20tMTAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgfSkpIDogJycpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuVXNlckJhbGFuY2VUcmFuc2FjdGlvbnMgPSAoKG0sIGgsIG1vZGVscywgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBhcmdzLmJhbGFuY2VUcmFuc2FjdGlvbk1hbmFnZXIubG9hZCgpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGxpc3Q6IGFyZ3MuYmFsYW5jZVRyYW5zYWN0aW9uTWFuYWdlci5saXN0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGN0cmwubGlzdDtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uc2VjdGlvbi5jYXJkLXRlcmNpYXJ5LmJlZm9yZS1mb290ZXIuYmFsYW5jZS10cmFuc2FjdGlvbnMtYXJlYScsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBfLm1hcChsaXN0LmNvbGxlY3Rpb24oKSwgKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIGMuVXNlckJhbGFuY2VUcmFuc2FjdGlvblJvdywge2l0ZW06IGl0ZW0sIGluZGV4OiBpbmRleH0pO1xuICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICBtKCcuY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW50b3AtNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIWxpc3QuaXNMb2FkaW5nKCkgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QuaXNMYXN0UGFnZSgpID8gJycgOiBtKCdidXR0b24jbG9hZC1tb3JlLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGxpc3QubmV4dFBhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ0NhcnJlZ2FyIG1haXMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgubG9hZGVyKClcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jLm1vZGVscywgd2luZG93Ll8pKTtcbiIsIi8qKlxuICogd2luZG93LmMuVXNlckJhbGFuY2UgY29tcG9uZW50XG4gKiBSZW5kZXIgdGhlIGN1cnJlbnQgdXNlciB0b3RhbCBiYWxhbmNlIGFuZCByZXF1ZXN0IGZ1bmQgYWN0aW9uXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuVXNlckJhbGFuY2UsIHtcbiAqICAgICB1c2VyX2lkOiAxMjMsXG4gKiB9KVxuICovXG53aW5kb3cuYy5Vc2VyQmFsYW5jZSA9ICgobSwgaCwgXywgbW9kZWxzLCBjKSA9PiB7XG4gICAgY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAndXNlcnMuYmFsYW5jZScpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBkaXNwbGF5TW9kYWwgPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICBhcmdzLmJhbGFuY2VNYW5hZ2VyLmxvYWQoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1c2VyQmFsYW5jZXM6IGFyZ3MuYmFsYW5jZU1hbmFnZXIuY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICBkaXNwbGF5TW9kYWw6IGRpc3BsYXlNb2RhbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBiYWxhbmNlID0gXy5maXJzdChjdHJsLnVzZXJCYWxhbmNlcygpKSxcbiAgICAgICAgICAgICAgICBiYWxhbmNlUmVxdWVzdE1vZGFsQyA9IFtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZXJCYWxhbmNlUmVxdWVzdE1vZGFsQ29udGVudCcsXG4gICAgICAgICAgICAgICAgICAgIF8uZXh0ZW5kKHt9LCB7YmFsYW5jZTogYmFsYW5jZX0sIGFyZ3MpXG4gICAgICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uc2VjdGlvbi51c2VyLWJhbGFuY2Utc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAoY3RybC5kaXNwbGF5TW9kYWwoKSA/IG0uY29tcG9uZW50KGMuTW9kYWxCb3gsIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU1vZGFsOiBjdHJsLmRpc3BsYXlNb2RhbCxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogYmFsYW5jZVJlcXVlc3RNb2RhbENcbiAgICAgICAgICAgICAgICB9KSA6ICcnKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnUtdGV4dC1jZW50ZXItc21hbGwtb25seS51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJMThuLnQoJ3RvdGFscycsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi50ZXh0LXN1Y2Nlc3MnLCBgUiQgJHtoLmZvcm1hdE51bWJlcihiYWxhbmNlLmFtb3VudCwgMiwgMyl9YClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhW2NsYXNzPVwici1mdW5kLWJ0biB3LWJ1dHRvbiBidG4gYnRuLW1lZGl1bSB1LW1hcmdpbmJvdHRvbS0xMCAkeyhiYWxhbmNlLmFtb3VudCA8PSAwID8gJ2J0bi1pbmFjdGl2ZScgOiAnJyl9XCJdW2hyZWY9XCJqczp2b2lkKDApO1wiXWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7b25jbGljazogKGJhbGFuY2UuYW1vdW50ID4gMCA/IGN0cmwuZGlzcGxheU1vZGFsLnRvZ2dsZSA6ICdqczp2b2lkKDApOycpfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEkxOG4udCgnd2l0aGRyYXdfY3RhJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Ll8sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLlVzZXJDYXJkID0gKGZ1bmN0aW9uKG0sIF8sIG1vZGVscywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciB2bSA9IGguaWRWTSxcbiAgICAgICAgICAgICAgICB1c2VyRGV0YWlscyA9IG0ucHJvcChbXSk7XG5cbiAgICAgICAgICAgIHZtLmlkKGFyZ3MudXNlcklkKTtcblxuICAgICAgICAgICAgLy9GSVhNRTogY2FuIGNhbGwgYW5vbiByZXF1ZXN0cyB3aGVuIHRva2VuIGZhaWxzIChyZXF1ZXN0TWF5YmVXaXRoVG9rZW4pXG4gICAgICAgICAgICBtb2RlbHMudXNlckRldGFpbC5nZXRSb3dXaXRoVG9rZW4odm0ucGFyYW1ldGVycygpKS50aGVuKHVzZXJEZXRhaWxzKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1c2VyRGV0YWlsczogdXNlckRldGFpbHNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjdXNlci1jYXJkJywgXy5tYXAoY3RybC51c2VyRGV0YWlscygpLCBmdW5jdGlvbih1c2VyRGV0YWlsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJy5jYXJkLmNhcmQtdXNlci51LXJhZGl1cy51LW1hcmdpbmJvdHRvbS0zMFtpdGVtcHJvcD1cImF1dGhvclwiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy5jb2wtc21hbGwtNC53LWNvbC10aW55LTQudy1jbGVhcmZpeCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIudS1yb3VuZFt3aWR0aD1cIjEwMFwiXVtpdGVtcHJvcD1cImltYWdlXCJdW3NyYz1cIicgKyB1c2VyRGV0YWlsLnByb2ZpbGVfaW1nX3RodW1ibmFpbCArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC53LWNvbC1zbWFsbC04LnctY29sLXRpbnktOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXJbaXRlbXByb3A9XCJuYW1lXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCIvdXNlcnMvJyArIHVzZXJEZXRhaWwuaWQgKyAnXCJdJywgdXNlckRldGFpbC5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3NlcltpdGVtcHJvcD1cImFkZHJlc3NcIl0nLCB1c2VyRGV0YWlsLmFkZHJlc3NfY2l0eSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0JywgdXNlckRldGFpbC50b3RhbF9wdWJsaXNoZWRfcHJvamVjdHMgKyAnIHByb2pldG9zIGNyaWFkb3MnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCAnYXBvaW91ICcgKyB1c2VyRGV0YWlsLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LWF1dGhvci1jb250YWN0cycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3VsLnctbGlzdC11bnN0eWxlZC5mb250c2l6ZS1zbWFsbGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC5mYWNlYm9va19saW5rKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCInICsgdXNlckRldGFpbC5mYWNlYm9va19saW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnUGVyZmlsIG5vIEZhY2Vib29rJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSwgKCFfLmlzRW1wdHkodXNlckRldGFpbC50d2l0dGVyX3VzZXJuYW1lKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCJodHRwczovL3R3aXR0ZXIuY29tLycgKyB1c2VyRGV0YWlsLnR3aXR0ZXJfdXNlcm5hbWUgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdQZXJmaWwgbm8gVHdpdHRlcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5tYXAodXNlckRldGFpbC5saW5rcywgZnVuY3Rpb24obGluaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCInICsgbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgbGluaylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKSwgKCFfLmlzRW1wdHkodXNlckRldGFpbC5lbWFpbCkgPyBtKCdhLmJ0bi5idG4tbWVkaXVtLmJ0bi1tZXNzYWdlW2hyZWY9XCJtYWlsdG86JyArIHVzZXJEZXRhaWwuZW1haWwgKyAnXCJdW2l0ZW1wcm9wPVwiZW1haWxcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudmlhciBtZW5zYWdlbScpIDogJycpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy55b3V0dWJlTGlnaHRib3ggY29tcG9uZW50XG4gKiBBIHZpc3VhbCBjb21wb25lbnQgdGhhdCBkaXNwbGF5cyBhIGxpZ2h0Ym94IHdpdGggYSB5b3V0dWJlIHZpZGVvXG4gKlxuICogRXhhbXBsZTpcbiAqIHZpZXc6ICgpID0+IHtcbiAqICAgICAgLi4uXG4gKiAgICAgIG0uY29tcG9uZW50KGMueW91dHViZUxpZ2h0Ym94LCB7c3JjOiAnaHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1GbEZUY0RTS25MTSd9KVxuICogICAgICAuLi5cbiAqICB9XG4gKi9cbndpbmRvdy5jLllvdXR1YmVMaWdodGJveCA9ICgobSwgYywgaCwgbW9kZWxzKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBwbGF5ZXI7XG4gICAgICAgICAgICBjb25zdCBzaG93TGlnaHRib3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgICAgIHNldFlvdXR1YmUgPSAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0YWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFNjcmlwdFRhZyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZy5zcmMgPSAnaHR0cHM6Ly93d3cueW91dHViZS5jb20vaWZyYW1lX2FwaSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFNjcmlwdFRhZy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0YWcsIGZpcnN0U2NyaXB0VGFnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vbllvdVR1YmVJZnJhbWVBUElSZWFkeSA9IGNyZWF0ZVBsYXllcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY2xvc2VWaWRlbyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKHBsYXllcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci5wYXVzZVZpZGVvKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzaG93TGlnaHRib3gudG9nZ2xlKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY3JlYXRlUGxheWVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIgPSBuZXcgWVQuUGxheWVyKCd5dHZpZGVvJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnNTI4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnOTQwJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZGVvSWQ6IGFyZ3Muc3JjLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyVmFyczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dJbmZvOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVzdEJyYW5kaW5nOiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ29uU3RhdGVDaGFuZ2UnOiAoc3RhdGUpID0+IChzdGF0ZS5kYXRhID09PSAwKSA/IGNsb3NlVmlkZW8oKSA6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc2hvd0xpZ2h0Ym94OiBzaG93TGlnaHRib3gsXG4gICAgICAgICAgICAgICAgc2V0WW91dHViZTogc2V0WW91dHViZSxcbiAgICAgICAgICAgICAgICBjbG9zZVZpZGVvOiBjbG9zZVZpZGVvXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJyN5b3V0dWJlLWxpZ2h0Ym94JywgW1xuICAgICAgICAgICAgICAgIG0oJ2EjeW91dHViZS1wbGF5LnctbGlnaHRib3gudy1pbmxpbmUtYmxvY2suZmEuZmEtcGxheS1jaXJjbGUuZm9udGNvbG9yLW5lZ2F0aXZlLmZhLTV4W2hyZWY9XFwnamF2YXNjcmlwdDp2b2lkKDApO1xcJ10nLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuc2hvd0xpZ2h0Ym94LnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG0oYCNsaWdodGJveC53LWxpZ2h0Ym94LWJhY2tkcm9wW3N0eWxlPVwiZGlzcGxheToke2N0cmwuc2hvd0xpZ2h0Ym94KCkgPyAnYmxvY2snIDogJ25vbmUnfVwiXWAsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctbGlnaHRib3gtY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctbGlnaHRib3gtY29udGVudCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC12aWV3JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1mcmFtZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ZpZ3VyZS53LWxpZ2h0Ym94LWZpZ3VyZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudy1saWdodGJveC1pbWcudy1saWdodGJveC1pbWFnZVtzcmM9XFwnZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmLTgsJTNDc3ZnJTIweG1sbnM9JTIyaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmclMjIlMjB3aWR0aD0lMjI5NDAlMjIlMjBoZWlnaHQ9JTIyNTI4JTIyLyUzRVxcJ10nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjeXR2aWRlby5lbWJlZGx5LWVtYmVkLnctbGlnaHRib3gtZW1iZWQnLCB7Y29uZmlnOiBjdHJsLnNldFlvdXR1YmV9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1zcGlubmVyLnctbGlnaHRib3gtaGlkZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWxpZ2h0Ym94LWNvbnRyb2wudy1saWdodGJveC1sZWZ0LnctbGlnaHRib3gtaW5hY3RpdmUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1jb250cm9sLnctbGlnaHRib3gtcmlnaHQudy1saWdodGJveC1pbmFjdGl2ZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJyN5b3V0dWJlLWNsb3NlLnctbGlnaHRib3gtY29udHJvbC53LWxpZ2h0Ym94LWNsb3NlJywge29uY2xpY2s6IGN0cmwuY2xvc2VWaWRlb30pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWxpZ2h0Ym94LXN0cmlwJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMuYWRtaW4uQ29udHJpYnV0aW9ucyA9IChmdW5jdGlvbihtLCBjLCBoKSB7XG4gICAgdmFyIGFkbWluID0gYy5hZG1pbjtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBsaXN0Vk0gPSBhZG1pbi5jb250cmlidXRpb25MaXN0Vk0sXG4gICAgICAgICAgICAgICAgZmlsdGVyVk0gPSBhZG1pbi5jb250cmlidXRpb25GaWx0ZXJWTSxcbiAgICAgICAgICAgICAgICBlcnJvciA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlciA9IFt7IC8vZnVsbF90ZXh0X2luZGV4XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uZnVsbF90ZXh0X2luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdCdXNxdWUgcG9yIHByb2pldG8sIGVtYWlsLCBJZHMgZG8gdXN1w6FyaW8gZSBkbyBhcG9pby4uLidcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHsgLy9zdGF0ZVxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEcm9wZG93bicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQ29tIG8gZXN0YWRvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdzdGF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uc3RhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdRdWFscXVlciB1bSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3BhaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ3BhaWQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdyZWZ1c2VkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdyZWZ1c2VkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncGVuZGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAncGVuZGluZydcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3BlbmRpbmdfcmVmdW5kJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdwZW5kaW5nX3JlZnVuZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3JlZnVuZGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdyZWZ1bmRlZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ2NoYXJnZWJhY2snLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ2NoYXJnZWJhY2snXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdkZWxldGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdkZWxldGVkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHsgLy9nYXRld2F5XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlckRyb3Bkb3duJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdnYXRld2F5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdnYXRld2F5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5nYXRld2F5LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnUXVhbHF1ZXIgdW0nXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdQYWdhcm1lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdQYWdhcm1lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnTW9JUCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnTW9JUCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ1BheVBhbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnUGF5UGFsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnQ3JlZGl0cycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnQ3LDqWRpdG9zJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHsgLy92YWx1ZVxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJOdW1iZXJSYW5nZScsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnVmFsb3JlcyBlbnRyZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdDogZmlsdGVyVk0udmFsdWUuZ3RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdDogZmlsdGVyVk0udmFsdWUubHRlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB7IC8vY3JlYXRlZF9hdFxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEYXRlUmFuZ2UnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1BlcsOtb2RvIGRvIGFwb2lvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0OiBmaWx0ZXJWTS5jcmVhdGVkX2F0Lmd0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Q6IGZpbHRlclZNLmNyZWF0ZWRfYXQubHRlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICBzdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkudGhlbihudWxsLCBmdW5jdGlvbihzZXJ2ZXJFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3Ioc2VydmVyRXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTTogZmlsdGVyVk0sXG4gICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlcjogZmlsdGVyQnVpbGRlcixcbiAgICAgICAgICAgICAgICBsaXN0Vk06IHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdDogbGlzdFZNLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdBcG9pb3MnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5GaWx0ZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgZm9ybTogY3RybC5maWx0ZXJWTS5mb3JtRGVzY3JpYmVyLFxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyOiBjdHJsLmZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgICAgIHN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluTGlzdCwge1xuICAgICAgICAgICAgICAgICAgICB2bTogY3RybC5saXN0Vk0sXG4gICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtOiBjLkFkbWluQ29udHJpYnV0aW9uSXRlbSxcbiAgICAgICAgICAgICAgICAgICAgbGlzdERldGFpbDogYy5BZG1pbkNvbnRyaWJ1dGlvbkRldGFpbFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5Vc2VycyA9IChmdW5jdGlvbihtLCBjLCBoKSB7XG4gICAgdmFyIGFkbWluID0gYy5hZG1pbjtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBsaXN0Vk0gPSBhZG1pbi51c2VyTGlzdFZNLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNID0gYWRtaW4udXNlckZpbHRlclZNLFxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKCcnKSxcbiAgICAgICAgICAgICAgICBpdGVtQnVpbGRlciA9IFt7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluVXNlcicsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgIGZpbHRlckJ1aWxkZXIgPSBbeyAvL25hbWVcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyTWFpbicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5mdWxsX3RleHRfaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ0J1c3F1ZSBwb3Igbm9tZSwgZS1tYWlsLCBJZHMgZG8gdXN1w6FyaW8uLi4nLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sIHsgLy9zdGF0dXNcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyRHJvcGRvd24nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0NvbSBvIGVzdGFkbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogJ3N0YXR1cycsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZGVhY3RpdmF0ZWRfYXQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmRlYWN0aXZhdGVkX2F0LFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnUXVhbHF1ZXIgdW0nXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnYXRpdm8nXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICFudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ2Rlc2F0aXZhZG8nXG4gICAgICAgICAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3RWTS5maXJzdFBhZ2UoZmlsdGVyVk0ucGFyYW1ldGVycygpKS50aGVuKG51bGwsIGZ1bmN0aW9uKHNlcnZlckVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcihzZXJ2ZXJFcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyOiBmaWx0ZXJCdWlsZGVyLFxuICAgICAgICAgICAgICAgIGxpc3RWTToge1xuICAgICAgICAgICAgICAgICAgICBsaXN0OiBsaXN0Vk0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvclxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VibWl0OiBzdWJtaXRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgY29uc3QgbGFiZWwgPSAnVXN1w6FyaW9zJztcblxuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluRmlsdGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm06IGN0cmwuZmlsdGVyVk0uZm9ybURlc2NyaWJlcixcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlcjogY3RybC5maWx0ZXJCdWlsZGVyLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgIHN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluTGlzdCwge1xuICAgICAgICAgICAgICAgICAgICB2bTogY3RybC5saXN0Vk0sXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgbGlzdEl0ZW06IGMuQWRtaW5Vc2VySXRlbSxcbiAgICAgICAgICAgICAgICAgICAgbGlzdERldGFpbDogYy5BZG1pblVzZXJEZXRhaWxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMudm1zLnByb2plY3RGaWx0ZXJzID0gKChtLCBoLCBtb21lbnQpID0+IHtcbiAgICByZXR1cm4gKCkgPT57XG4gICAgICAgIGNvbnN0IGZpbHRlcnMgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0sXG5cbiAgICAgICAgICAgICAgbmVhck1lID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICBuZWFyX21lOiAnZXEnLFxuICAgICAgICAgICAgICAgICAgb3Blbl9mb3JfY29udHJpYnV0aW9uczogJ2VxJ1xuICAgICAgICAgICAgICB9KS5vcGVuX2Zvcl9jb250cmlidXRpb25zKCd0cnVlJykubmVhcl9tZSh0cnVlKSxcblxuICAgICAgICAgICAgICBleHBpcmluZyA9IGZpbHRlcnMoe1xuICAgICAgICAgICAgICAgICAgZXhwaXJlc19hdDogJ2x0ZScsXG4gICAgICAgICAgICAgICAgICBvcGVuX2Zvcl9jb250cmlidXRpb25zOiAnZXEnXG4gICAgICAgICAgICAgIH0pLm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMoJ3RydWUnKS5leHBpcmVzX2F0KG1vbWVudCgpLmFkZCgxNCwgJ2RheXMnKS5mb3JtYXQoJ1lZWVktTU0tREQnKSksXG5cbiAgICAgICAgICAgICAgcmVjZW50ID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICBvbmxpbmVfZGF0ZTogJ2d0ZScsXG4gICAgICAgICAgICAgICAgICBvcGVuX2Zvcl9jb250cmlidXRpb25zOiAnZXEnXG4gICAgICAgICAgICAgIH0pLm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMoJ3RydWUnKS5vbmxpbmVfZGF0ZShtb21lbnQoKS5zdWJ0cmFjdCg1LCAnZGF5cycpLmZvcm1hdCgnWVlZWS1NTS1ERCcpKSxcblxuICAgICAgICAgICAgICByZWNvbW1lbmRlZCA9IGZpbHRlcnMoe1xuICAgICAgICAgICAgICAgICAgcmVjb21tZW5kZWQ6ICdlcScsXG4gICAgICAgICAgICAgICAgICBvcGVuX2Zvcl9jb250cmlidXRpb25zOiAnZXEnXG4gICAgICAgICAgICAgIH0pLnJlY29tbWVuZGVkKCd0cnVlJykub3Blbl9mb3JfY29udHJpYnV0aW9ucygndHJ1ZScpLFxuXG4gICAgICAgICAgICAgIG9ubGluZSA9IGZpbHRlcnMoe1xuICAgICAgICAgICAgICAgICAgb3Blbl9mb3JfY29udHJpYnV0aW9uczogJ2VxJ1xuICAgICAgICAgICAgICB9KS5vcGVuX2Zvcl9jb250cmlidXRpb25zKCd0cnVlJyksXG5cbiAgICAgICAgICAgICAgc3VjY2Vzc2Z1bCA9IGZpbHRlcnMoe1xuICAgICAgICAgICAgICAgICAgc3RhdGU6ICdlcSdcbiAgICAgICAgICAgICAgfSkuc3RhdGUoJ3N1Y2Nlc3NmdWwnKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVjb21tZW5kZWQ6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1JlY29tZW5kYWRvcycsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiByZWNvbW1lbmRlZFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9ubGluZToge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnTm8gYXInLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogb25saW5lXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXhwaXJpbmc6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1JldGEgZmluYWwnLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogZXhwaXJpbmdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdWNjZXNzZnVsOiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdCZW0tc3VjZWRpZG9zJyxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IHN1Y2Nlc3NmdWxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZWNlbnQ6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1JlY2VudGVzJyxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IHJlY2VudFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG5lYXJfbWU6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1Byw7N4aW1vcyBhIG1pbScsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBuZWFyTWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Lm1vbWVudCkpO1xuIiwid2luZG93LmMudm1zLnByb2plY3QgPSAoKG0sIGgsIF8sIG1vZGVscykgPT4ge1xuICAgIHJldHVybiAocHJvamVjdF9pZCwgcHJvamVjdF91c2VyX2lkKSA9PntcbiAgICAgICAgY29uc3Qgdm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICB9KSxcbiAgICAgICAgICAgICAgaWRWTSA9IGguaWRWTSxcbiAgICAgICAgICAgICAgcHJvamVjdERldGFpbHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICB1c2VyRGV0YWlscyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgIHJld2FyZERldGFpbHMgPSBtLnByb3AoW10pO1xuXG4gICAgICAgIHZtLnByb2plY3RfaWQocHJvamVjdF9pZCk7XG4gICAgICAgIGlkVk0uaWQocHJvamVjdF91c2VyX2lkKTtcblxuICAgICAgICBjb25zdCBsUHJvamVjdCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihtb2RlbHMucHJvamVjdERldGFpbC5nZXRSb3dPcHRpb25zKHZtLnBhcmFtZXRlcnMoKSkpLFxuICAgICAgICAgICAgICBsVXNlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihtb2RlbHMudXNlckRldGFpbC5nZXRSb3dPcHRpb25zKGlkVk0ucGFyYW1ldGVycygpKSksXG4gICAgICAgICAgICAgIGxSZXdhcmQgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnJld2FyZERldGFpbC5nZXRQYWdlT3B0aW9ucyh2bS5wYXJhbWV0ZXJzKCkpKSxcbiAgICAgICAgICAgICAgaXNMb2FkaW5nID0gKCkgPT4geyByZXR1cm4gKGxQcm9qZWN0KCkgfHwgbFVzZXIoKSB8fCBsUmV3YXJkKCkpOyB9O1xuXG4gICAgICAgIGxQcm9qZWN0LmxvYWQoKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBsVXNlci5sb2FkKCkudGhlbih1c2VyRGV0YWlscyk7XG4gICAgICAgICAgICBsUmV3YXJkLmxvYWQoKS50aGVuKHJld2FyZERldGFpbHMpO1xuXG4gICAgICAgICAgICBwcm9qZWN0RGV0YWlscyhkYXRhKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHByb2plY3REZXRhaWxzOiBfLmNvbXBvc2UoXy5maXJzdCwgcHJvamVjdERldGFpbHMpLFxuICAgICAgICAgICAgdXNlckRldGFpbHM6IHVzZXJEZXRhaWxzLFxuICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogcmV3YXJkRGV0YWlscyxcbiAgICAgICAgICAgIGlzTG9hZGluZzogaXNMb2FkaW5nXG4gICAgICAgIH07XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLnZtcy5zdGFydCA9ICgoXykgPT4ge1xuICAgIHJldHVybiAoSTE4bikgPT4ge1xuICAgICAgICBjb25zdCBpMThuU3RhcnQgPSBJMThuLnRyYW5zbGF0aW9uc1tJMThuLmN1cnJlbnRMb2NhbGUoKV0ucGFnZXMuc3RhcnQsXG4gICAgICAgICAgICB0ZXN0aW1vbmlhbHMgPSBpMThuU3RhcnQudGVzdGltb25pYWxzLFxuICAgICAgICAgICAgY2F0ZWdvcnlQcm9qZWN0cyA9IGkxOG5TdGFydC5jYXRlZ29yeVByb2plY3RzLFxuICAgICAgICAgICAgcGFuZXMgPSBpMThuU3RhcnQucGFuZXMsXG4gICAgICAgICAgICBxYSA9IGkxOG5TdGFydC5xYTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGVzdGltb25pYWxzOiBfLm1hcCh0ZXN0aW1vbmlhbHMsICh0ZXN0aW1vbmlhbCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHRodW1iVXJsOiB0ZXN0aW1vbmlhbC50aHVtYixcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogdGVzdGltb25pYWwuY29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogdGVzdGltb25pYWwubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxzOiB0ZXN0aW1vbmlhbC50b3RhbHNcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBwYW5lczogXy5tYXAocGFuZXMsIChwYW5lKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHBhbmUubGFiZWwsXG4gICAgICAgICAgICAgICAgICAgIHNyYzogcGFuZS5zcmNcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBxdWVzdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBjb2xfMTogXy5tYXAocWEuY29sXzEsIChxdWVzdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246IHF1ZXN0aW9uLnF1ZXN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiBxdWVzdGlvbi5hbnN3ZXJcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBjb2xfMjogXy5tYXAocWEuY29sXzIsIChxdWVzdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246IHF1ZXN0aW9uLnF1ZXN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiBxdWVzdGlvbi5hbnN3ZXJcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNhdGVnb3J5UHJvamVjdHM6IF8ubWFwKGNhdGVnb3J5UHJvamVjdHMsIChjYXRlZ29yeSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5SWQ6IGNhdGVnb3J5LmNhdGVnb3J5X2lkLFxuICAgICAgICAgICAgICAgICAgICBzYW1wbGVQcm9qZWN0czogW1xuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnkuc2FtcGxlX3Byb2plY3RfaWRzLnByaW1hcnksXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeS5zYW1wbGVfcHJvamVjdF9pZHMuc2Vjb25kYXJ5XG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfTtcbiAgICB9O1xufSh3aW5kb3cuXykpO1xuIiwid2luZG93LmMuYWRtaW4uY29udHJpYnV0aW9uRmlsdGVyVk0gPSAoZnVuY3Rpb24obSwgaCwgcmVwbGFjZURpYWNyaXRpY3MpIHtcbiAgICB2YXIgdm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgZnVsbF90ZXh0X2luZGV4OiAnQEAnLFxuICAgICAgICAgICAgc3RhdGU6ICdlcScsXG4gICAgICAgICAgICBnYXRld2F5OiAnZXEnLFxuICAgICAgICAgICAgdmFsdWU6ICdiZXR3ZWVuJyxcbiAgICAgICAgICAgIGNyZWF0ZWRfYXQ6ICdiZXR3ZWVuJ1xuICAgICAgICB9KSxcblxuICAgICAgICBwYXJhbVRvU3RyaW5nID0gZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgcmV0dXJuIChwIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKTtcbiAgICAgICAgfTtcblxuICAgIC8vIFNldCBkZWZhdWx0IHZhbHVlc1xuICAgIHZtLnN0YXRlKCcnKTtcbiAgICB2bS5nYXRld2F5KCcnKTtcbiAgICB2bS5vcmRlcih7XG4gICAgICAgIGlkOiAnZGVzYydcbiAgICB9KTtcblxuICAgIHZtLmNyZWF0ZWRfYXQubHRlLnRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmNyZWF0ZWRfYXQubHRlKCkpO1xuICAgICAgICByZXR1cm4gZmlsdGVyICYmIGgubW9tZW50RnJvbVN0cmluZyhmaWx0ZXIpLmVuZE9mKCdkYXknKS5mb3JtYXQoJycpO1xuICAgIH07XG5cbiAgICB2bS5jcmVhdGVkX2F0Lmd0ZS50b0ZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5jcmVhdGVkX2F0Lmd0ZSgpKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlciAmJiBoLm1vbWVudEZyb21TdHJpbmcoZmlsdGVyKS5mb3JtYXQoKTtcbiAgICB9O1xuXG4gICAgdm0uZnVsbF90ZXh0X2luZGV4LnRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmZ1bGxfdGV4dF9pbmRleCgpKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlciAmJiByZXBsYWNlRGlhY3JpdGljcyhmaWx0ZXIpIHx8IHVuZGVmaW5lZDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHZtO1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LnJlcGxhY2VEaWFjcml0aWNzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5jb250cmlidXRpb25MaXN0Vk0gPSAoZnVuY3Rpb24obSwgbW9kZWxzKSB7XG4gICAgcmV0dXJuIG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShtb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsLCAnaWQuZGVzYycsIHsnUHJlZmVyJzogJ2NvdW50PWV4YWN0J30pO1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi51c2VyRmlsdGVyVk0gPSAoZnVuY3Rpb24obSwgcmVwbGFjZURpYWNyaXRpY3MpIHtcbiAgICB2YXIgdm0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgZnVsbF90ZXh0X2luZGV4OiAnQEAnLFxuICAgICAgICAgICAgZGVhY3RpdmF0ZWRfYXQ6ICdpcy5udWxsJ1xuICAgICAgICB9KSxcblxuICAgICAgICBwYXJhbVRvU3RyaW5nID0gZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgcmV0dXJuIChwIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKTtcbiAgICAgICAgfTtcblxuICAgIC8vIFNldCBkZWZhdWx0IHZhbHVlc1xuICAgIHZtLmRlYWN0aXZhdGVkX2F0KG51bGwpLm9yZGVyKHtcbiAgICAgICAgaWQ6ICdkZXNjJ1xuICAgIH0pO1xuXG4gICAgdm0uZGVhY3RpdmF0ZWRfYXQudG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IEpTT04ucGFyc2Uodm0uZGVhY3RpdmF0ZWRfYXQoKSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXI7XG4gICAgfTtcblxuICAgIHZtLmZ1bGxfdGV4dF9pbmRleC50b0ZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5mdWxsX3RleHRfaW5kZXgoKSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXIgJiYgcmVwbGFjZURpYWNyaXRpY3MoZmlsdGVyKSB8fCB1bmRlZmluZWQ7XG4gICAgfTtcblxuICAgIHJldHVybiB2bTtcbn0od2luZG93Lm0sIHdpbmRvdy5yZXBsYWNlRGlhY3JpdGljcykpO1xuIiwid2luZG93LmMuYWRtaW4udXNlckxpc3RWTSA9IChmdW5jdGlvbihtLCBtb2RlbHMpIHtcbiAgICByZXR1cm4gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy51c2VyLCAnaWQuZGVzYycsIHsnUHJlZmVyJzogJ2NvdW50PWV4YWN0J30pO1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzKSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
