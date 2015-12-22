"use strict";

window.c = (function () {
    return {
        models: {},
        root: {},
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
})(window.m, window.moment, window.I18n);
'use strict';

window.c.models = (function (m) {
    var contributionDetail = m.postgrest.model('contribution_details'),
        projectDetail = m.postgrest.model('project_details'),
        userDetail = m.postgrest.model('user_details'),
        user = m.postgrest.model('users'),
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
                projects: { collection: projects }
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
                filtersMap = c.root.projectFilters(),
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
                        category_id: 'eq',
                        online_date: 'gt'
                    }).state_order('published').online_date(moment().subtract(60, 'days').format('YYYY-MM-DD'));

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
                filters = c.root.projectFilters();

            var collections = _.map(['near_me', 'recommended', 'expiring', 'recent'], function (name) {
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

window.c.root.ProjectsShow = (function (m, c, _, models, h) {
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
            return !(ctrl.lProject() || ctrl.lUser() || ctrl.lReward()) ? _.map(ctrl.projectDetails(), function (project) {
                return m('.project-show', {
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
                }) : '']);
            }) : h.loader();
        }
    };
})(window.m, window.c, window._, window.c.models, window.c.h);
"use strict";

window.c.root.startVM = (function (_) {
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
                startvm = c.pages.startVM(I18n),
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
                selectCategory = function selectCategory(id) {
                return function () {
                    selectedCategoryIdx(id);
                    categoryvm.category_id(id);
                    selectedCategory([]);
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

            return [m('.w-section.hero-full.hero-start', [m('.w-container.u-text-center', [m('.fontsize-megajumbo.fontweight-semibold.u-marginbottom-40', I18n.t('slogan', I18nScope())), m('.w-row.u-marginbottom-40', [m('.w-col.w-col-4.w-col-push-4', [m('a.btn.btn-large.u-marginbottom-10[href=\'/projects/new\']', I18n.t('submit', I18nScope()))])]), m('.w-row', _.isEmpty(stats) ? '' : [m('.w-col.w-col-4', [m('.fontsize-largest.lineheight-loose', h.formatNumber(stats.total_contributors, 0, 3)), m('p.fontsize-small.start-stats', I18n.t('header.people', I18nScope()))]), m('.w-col.w-col-4', [m('.fontsize-largest.lineheight-loose', stats.total_contributed.toString().slice(0, 2) + ' milhões'), m('p.fontsize-small.start-stats', I18n.t('header.money', I18nScope()))]), m('.w-col.w-col-4', [m('.fontsize-largest.lineheight-loose', h.formatNumber(stats.total_projects_success, 0, 3)), m('p.fontsize-small.start-stats', I18n.t('header.success', I18nScope()))])])])]), m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-10.w-col-push-1.u-text-center', [m('.fontsize-larger.u-marginbottom-10.fontweight-semibold', I18n.t('page-title', I18nScope())), m('.fontsize-small', I18n.t('page-subtitle', I18nScope()))])]), m('.w-clearfix.how-row', [m('.w-hidden-small.w-hidden-tiny.how-col-01', [m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.1', I18nScope())), m('.fontsize-base', I18n.t('banner.2', I18nScope()))]), m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.3', I18nScope())), m('.fontsize-base', I18n.t('banner.4', I18nScope()))])]), m('.how-col-02'), m('.how-col-03', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.5', I18nScope())), m('.fontsize-base', I18n.t('banner.6', I18nScope())), m('.fontweight-semibold.fontsize-large.u-margintop-30', I18n.t('banner.7', I18nScope())), m('.fontsize-base', I18n.t('banner.8', I18nScope()))]), m('.w-hidden-main.w-hidden-medium.how-col-01', [m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.1', I18nScope())), m('.fontsize-base', I18n.t('banner.2', I18nScope()))]), m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.3', I18nScope())), m('.fontsize-base', I18n.t('banner.4', I18nScope()))]), m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.5', I18nScope())), m('.fontsize-base', I18n.t('banner.6', I18nScope()))]), m('.info-howworks-backers', [m('.fontweight-semibold.fontsize-large', I18n.t('banner.7', I18nScope())), m('.fontsize-base', I18n.t('banner.8', I18nScope()))])])])])]), m('.w-section.divider'), m('.w-section.section-large', [m('.w-container.u-text-center.u-marginbottom-60', [m('div', [m('span.fontsize-largest.fontweight-semibold', I18n.t('features.title', I18nScope()))]), m('.w-hidden-small.w-hidden-tiny.fontsize-large.u-marginbottom-20', I18n.t('features.subtitle', I18nScope())), m('.w-hidden-main.w-hidden-medium.u-margintop-30', [m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_1', I18nScope())), m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_2', I18nScope())), m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_3', I18nScope())), m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_4', I18nScope())), m('.fontsize-large.u-marginbottom-30', I18n.t('features.feature_5', I18nScope()))])]), m('.w-container', [m('.w-tabs.w-hidden-small.w-hidden-tiny', [m('.w-tab-menu.w-col.w-col-4', _.map(ctrl.paneImages, function (pane, idx) {
                return m('a.w-tab-link.w-inline-block.tab-list-item' + (idx === ctrl.selectedPane() ? '.selected' : ''), {
                    onclick: ctrl.selectPane(idx)
                }, pane.label);
            })), m('.w-tab-content.w-col.w-col-8', _.map(ctrl.paneImages, function (pane, idx) {
                return m('.w-tab-pane', [m('img[src="' + pane.src + '"].pane-image' + (idx === ctrl.selectedPane() ? '.selected' : ''))]);
            }))])])]), m('.w-section.section-large.bg-blue-one', [m('.w-container.u-text-center', [m('.fontsize-larger.lineheight-tight.fontcolor-negative.u-marginbottom-20', [I18n.t('video.title', I18nScope()), m('br'), I18n.t('video.subtitle', I18nScope())]), m.component(c.YoutubeLightbox, {
                src: I18n.t('video.src', I18nScope())
            })])]), m('.w-hidden-small.w-hidden-tiny.section-categories', [m('.w-container', [m('.u-text-center', [m('.w-row', [m('.w-col.w-col-10.w-col-push-1', [m('.fontsize-large.u-marginbottom-40.fontcolor-negative', I18n.t('categories.title', I18nScope()))])])]), m('.w-tabs', [m('.w-tab-menu.u-text-center', _.map(ctrl.categories(), function (category) {
                return m('a.w-tab-link.w-inline-block.btn-category.small.btn-inline' + (ctrl.selectedCategoryIdx() === category.id ? '.w--current' : ''), {
                    onclick: ctrl.selectCategory(category.id)
                }, [m('div', category.name)]);
            })), m('.w-tab-content.u-margintop-40', [m('.w-tab-pane.w--tab-active', [m('.w-row', !(_.isEmpty(ctrl.selectedCategory()) && ctrl.selectedCategoryIdx() !== -1) ? _.map(ctrl.selectedCategory(), function (category) {
                return [m('.w-col.w-col-5', [m('.fontsize-jumbo.u-marginbottom-20', category.name), m('a.w-button.btn.btn-medium.btn-inline.btn-dark[href="/projects/new"]', 'Comece o seu projeto')]), m('.w-col.w-col-7', [m('.fontsize-megajumbo.fontcolor-negative', 'R$ ' + h.formatNumber(category.total_successful_value, 2, 3)), m('.fontsize-large.u-marginbottom-20', 'Doados para projetos'), m('.fontsize-megajumbo.fontcolor-negative', category.successful_projects), m('.fontsize-large.u-marginbottom-30', 'Projetos financiados'), !_.isEmpty(ctrl.featuredProjects()) ? _.map(ctrl.featuredProjects(), function (project) {
                    return !_.isUndefined(project) ? m('.w-row.u-marginbottom-10', [m('.w-col.w-col-1', [m('img.user-avatar[src="' + project.userThumb + '"]')]), m('.w-col.w-col-11', [m('.fontsize-base.fontweight-semibold', project.user.name), m('.fontsize-smallest', [I18n.t('categories.pledged', I18nScope({ pledged: h.formatNumber(project.pledged), contributors: project.total_contributors })), m('a.link-hidden[href="/' + project.permalink + '"]', project.name)])])]) : m('.fontsize-base', I18n.t('categories.loading_featured', I18nScope()));
                }) : m('.fontsize-base', I18n.t('categories.no_featured', I18nScope()))])];
            }) : h.loader())])])])])]), m.component(c.Slider, {
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
            }))])]), m('.w-section.section-large.u-text-center.bg-purple.before-footer', [m('.w-container', [m('.fontsize-jumbo.fontcolor-negative.u-marginbottom-60', 'Crie o seu rascunho gratuitamente!'), m('form[action="/projects/new"][method="GET"].w-row.w-form', [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.fontsize-larger.fontcolor-negative.u-marginbottom-10', I18n.t('form.title', I18nScope())), m('input.w-input.text-field.medium.u-marginbottom-30[name=\'name\'][type=\'text\']'), m('.fontsize-larger.fontcolor-negative.u-marginbottom-10', 'na categoria'), m('select.w-select.text-field.medium.u-marginbottom-40[name=\'category_id\']', [m('option[value=""]', I18n.t('form.select_default', I18nScope())), _.map(ctrl.categories(), function (category) {
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
'use strict';

window.c.root.projectFilters = (function (m, h, moment) {
    return function () {
        var filters = m.postgrest.filtersVM,
            nearMe = filters({
            near_me: 'eq',
            open_for_contributions: 'eq',
            online_date: 'gt'
        }).open_for_contributions('true').near_me(true).online_date(moment().subtract(60, 'days').format('YYYY-MM-DD')),
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
            state: 'eq',
            expires_at: 'gt'
        }).state('successful').expires_at(moment().subtract(30, 'days').format('YYYY-MM-DD'));

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
                if (window.document.querySelectorAll('meta[name="csrf-token"]').length > 0) {
                    xhr.setRequestHeader('X-CSRF-Token', window.document.querySelectorAll('meta[name="csrf-token"]')[0].content);
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
                if (window.document.querySelectorAll('meta[name="csrf-token"]').length > 0) {
                    xhr.setRequestHeader('X-CSRF-Token', window.document.querySelectorAll('meta[name="csrf-token"]')[0].content);
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
            return m('.card.qa-card.u-marginbottom-20.u-radius.btn-terciary', {
                onclick: ctrl.showAnswer.toggle
            }, [m('.fontsize-base', args.question), ctrl.showAnswer() ? m('p.u-margintop-20.fontsize-small', args.answer) : '']);
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
            }, [m('span.fa.fa-pencil.fa-fw.fa-lg'), ' Editar projeto']), ctrl.editLinksToggle() ? m('#edit-menu-items', [m('#dashboard-links', [!project.is_published || project.is_admin_role ? [m('a#basics_link[class="' + editLinkClass + '"][href="' + editRoute + '#basics' + '"]', 'Básico'), m('a#goal_link[class="' + editLinkClass + '"][href="' + editRoute + '#goal' + '"]', project.mode === 'aon' ? 'Meta e prazo' : 'Financiamento')] : '', m('a#description_link[class="' + editLinkClass + '"][href="' + editRoute + '#description' + '"]', 'Descrição'), m('a#video_link[class="' + editLinkClass + '"][href="' + editRoute + '#video' + '"]', ['Vídeo', optionalOpt]), m('a#budget_link[class="' + editLinkClass + '"][href="' + editRoute + '#budget' + '"]', ['Orçamento', optionalOpt]), m('a#card_link[class="' + editLinkClass + '"][href="' + editRoute + '#card' + '"]', 'Card do projeto'), m('a#dashboard_reward_link[class="' + editLinkClass + '"][href="' + editRoute + '#reward' + '"]', ['Recompensas', optionalOpt]), m('a#dashboard_user_about_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_about' + '"]', 'Sobre você'), project.is_published || project.state === 'approved' || project.is_admin_role ? [m('a#dashboard_user_settings_link[class="' + editLinkClass + '"][href="' + editRoute + '#user_settings' + '"]', 'Conta')] : '', !project.is_published ? [m('a#dashboard_preview_link[class="' + editLinkClass + '"][href="' + editRoute + '#preview' + '"]', [m('span.fa.fa-fw.fa-eye.fa-lg'), ' Preview'])] : ''])]) : '', !project.is_published ? [m('.btn-send-draft-fixed', project.mode === 'aon' ? [project.state === 'draft' ? m('a.btn.btn-medium[href="/projects/' + project.id + '/send_to_analysis"]', 'Enviar') : '', project.state === 'approved' ? m('a.btn.btn-medium[href="/projects/' + project.id + '/publish"]', ['Publicar', m.trust('&nbsp;&nbsp;'), m('span.fa.fa-chevron-right')]) : ''] : [project.state === 'draft' ? m('a.btn.btn-medium[href="/projects/' + project.id + '/edit#preview"]', ['Publicar', m.trust('&nbsp;&nbsp;'), m('span.fa.fa-chevron-right')]) : ''])] : [project.mode === 'flex' ? [m('.btn-send-draft-fixed', _.isNull(project.expires_at) ? m('a.w-button.btn.btn-small.btn-secondary-dark[href="/projects/' + project.id + '/edit#announce_expiration"]', 'Iniciar reta final') : '')] : '']])])]), m('a.btn-dashboard href="js:void(0);"', {
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
            return m(wrapper, [m('.w-container', [!_.isUndefined(collection.title) || !_.isUndefined(collection.hash) ? m('.w-row.u-marginbottom-30', [m('.w-col.w-col-10.w-col-small-6.w-col-tiny-6', [m('.fontsize-large.lineheight-looser', collection.title)]), m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m('a.btn.btn-small.btn-terciary[href="/pt/explore?ref=' + ref + '#' + collection.hash + '"]', 'Ver todos')])]) : '', collection.collection().length ? m('.w-row', _.map(collection.collection(), function (project) {
                return m.component(c.ProjectCard, {
                    project: project,
                    ref: ref
                });
            })) : h.loader()])]);
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
                changeSlideTimer = setInterval(function () {
                incrementSlide();
                m.redraw();
            }, 6500),
                config = function config(el, isInitialized, context) {
                if (!isInitialized) {
                    translationSize(Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
                    m.redraw();
                };

                context.onunload = function () {
                    return clearInterval(changeSlideTimer);
                };
            };

            return {
                config: config,
                selectedSlideIdx: selectedSlideIdx,
                translationSize: translationSize,
                decrementSlide: decrementSlide,
                incrementSlide: incrementSlide
            };
        },
        view: function view(ctrl, args) {
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
                    return ctrl.decrementSlide();
                }
            }, [m('.w-icon-slider-left.fa.fa-chevron-left.fontcolor-terciary')]), m('#slide-next.w-slider-arrow-right.w-hidden-small.w-hidden-tiny', {
                onclick: function onclick() {
                    return ctrl.incrementSlide();
                }
            }, [m('.w-icon-slider-right.fa.fa-chevron-right.fontcolor-terciary')]), m('.w-slider-nav.w-slider-nav-invert.w-round.slide-nav', _(args.slides.length).times(function (idx) {
                return m('.slide-bullet.w-slider-dot' + (ctrl.selectedSlideIdx() === idx ? '.w-active' : ''), {
                    onclick: function onclick() {
                        return ctrl.selectedSlideIdx(idx);
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
        controller: function controller() {
            var showLightbox = h.toggleProp(false, true);

            return {
                showLightbox: showLightbox
            };
        },
        view: function view(ctrl, args) {
            return m('#youtube-lightbox', [m('a#youtube-play.w-lightbox.w-inline-block.fa.fa-play-circle.fontcolor-negative.fa-5x[href=\'javascript:void(0);\']', { onclick: ctrl.showLightbox.toggle }), ctrl.showLightbox() ? m('#lightbox.w-lightbox-backdrop', [m('.w-lightbox-container', [m('.w-lightbox-content', [m('.w-lightbox-view', [m('.w-lightbox-frame', [m('figure.w-lightbox-figure', [m('img.w-lightbox-img.w-lightbox-image[src=\'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22940%22%20height=%22528%22/%3E\']'), m('iframe#video-lightbox.embedly-embed.w-lightbox-embed[allowfullscreen=\'\'][frameborder=\'0\'][height=\'528\'][scrolling=\'no\'][src=\'https://cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FFlFTcDSKnLM%3Fautoplay%3D1%26feature%3Doembed&url=' + encodeURI(args.src) + '&image=https%3A%2F%2Fi.ytimg.com%2Fvi%2FFlFTcDSKnLM%2Fhqdefault.jpg&key=c4e54deccf4d4ec997a64902e9a30300&autoplay=1&type=text%2Fhtml&schema=youtube\'][width=\'940\']')])])]), m('.w-lightbox-spinner.w-lightbox-hide'), m('.w-lightbox-control.w-lightbox-left.w-lightbox-inactive'), m('.w-lightbox-control.w-lightbox-right.w-lightbox-inactive'), m('#youtube-close.w-lightbox-control.w-lightbox-close', { onclick: ctrl.showLightbox.toggle })]), m('.w-lightbox-strip')])]) : '']);
        }
    };
})(window.m, window.c, window.c.h, window.c.models);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImMuanMiLCJoLmpzIiwibW9kZWxzLmpzIiwiZmxleC5qcyIsImluc2lnaHRzLmpzIiwibGl2ZS1zdGF0aXN0aWNzLmpzIiwicHJvamVjdHMtZXhwbG9yZS5qcyIsInByb2plY3RzLWhvbWUuanMiLCJwcm9qZWN0cy1zaG93LmpzIiwic3RhcnQtdm0uanMiLCJzdGFydC5qcyIsInRlYW0uanMiLCJ2bXMvcHJvamVjdHMtdm1zLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLWRldGFpbC5qcyIsImFkbWluLWNvbnRyaWJ1dGlvbi1pdGVtLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLXVzZXIuanMiLCJhZG1pbi1jb250cmlidXRpb24uanMiLCJhZG1pbi1leHRlcm5hbC1hY3Rpb24uanMiLCJhZG1pbi1maWx0ZXIuanMiLCJhZG1pbi1pbnB1dC1hY3Rpb24uanMiLCJhZG1pbi1pdGVtLmpzIiwiYWRtaW4tbGlzdC5qcyIsImFkbWluLW5vdGlmaWNhdGlvbi1oaXN0b3J5LmpzIiwiYWRtaW4tcHJvamVjdC1kZXRhaWxzLWNhcmQuanMiLCJhZG1pbi1wcm9qZWN0LmpzIiwiYWRtaW4tcmFkaW8tYWN0aW9uLmpzIiwiYWRtaW4tcmVzZXQtcGFzc3dvcmQuanMiLCJhZG1pbi1yZXdhcmQuanMiLCJhZG1pbi10cmFuc2FjdGlvbi1oaXN0b3J5LmpzIiwiYWRtaW4tdHJhbnNhY3Rpb24uanMiLCJhZG1pbi11c2VyLWRldGFpbC5qcyIsImFkbWluLXVzZXItaXRlbS5qcyIsImFkbWluLXVzZXIuanMiLCJhb24tYWRtaW4tcHJvamVjdC1kZXRhaWxzLWV4cGxhbmF0aW9uLmpzIiwiY2F0ZWdvcnktYnV0dG9uLmpzIiwiZmlsdGVyLWJ1dHRvbi5qcyIsImZpbHRlci1kYXRlLXJhbmdlLmpzIiwiZmlsdGVyLWRyb3Bkb3duLmpzIiwiZmlsdGVyLW1haW4uanMiLCJmaWx0ZXItbnVtYmVyLXJhbmdlLmpzIiwiZmxleC1wcm9qZWN0LWRldGFpbHMtZXhwbGFuYXRpb24uanMiLCJsYW5kaW5nLXFhLmpzIiwibGFuZGluZy1zaWdudXAuanMiLCJwYXltZW50LXN0YXR1cy5qcyIsInBvcC1ub3RpZmljYXRpb24uanMiLCJwcm9qZWN0LWFib3V0LmpzIiwicHJvamVjdC1jYXJkLmpzIiwicHJvamVjdC1jb21tZW50cy5qcyIsInByb2plY3QtY29udHJpYnV0aW9ucy5qcyIsInByb2plY3QtZGFzaGJvYXJkLW1lbnUuanMiLCJwcm9qZWN0LWRhdGEtY2hhcnQuanMiLCJwcm9qZWN0LWRhdGEtdGFibGUuanMiLCJwcm9qZWN0LWhlYWRlci5qcyIsInByb2plY3QtaGlnaGxpZ2h0LmpzIiwicHJvamVjdC1tYWluLmpzIiwicHJvamVjdC1tb2RlLmpzIiwicHJvamVjdC1wb3N0cy5qcyIsInByb2plY3QtcmVtaW5kZXItY291bnQuanMiLCJwcm9qZWN0LXJlbWluZGVyLmpzIiwicHJvamVjdC1yZXdhcmQtbGlzdC5qcyIsInByb2plY3Qtcm93LmpzIiwicHJvamVjdC1zaGFyZS1ib3guanMiLCJwcm9qZWN0LXNpZGViYXIuanMiLCJwcm9qZWN0LXN1Z2dlc3RlZC1jb250cmlidXRpb25zLmpzIiwicHJvamVjdC10YWJzLmpzIiwicHJvamVjdC11c2VyLWNhcmQuanMiLCJzbGlkZXIuanMiLCJ0ZWFtLW1lbWJlcnMuanMiLCJ0ZWFtLXRvdGFsLmpzIiwidG9vbHRpcC5qcyIsInVzZXItY2FyZC5qcyIsInlvdXR1YmUtbGlnaHRib3guanMiLCJhZG1pbi9jb250cmlidXRpb25zL2NvbnRyaWJ1dGlvbi1maWx0ZXItdm0uanMiLCJhZG1pbi9jb250cmlidXRpb25zL2NvbnRyaWJ1dGlvbi1saXN0LXZtLmpzIiwiYWRtaW4vdXNlcnMvdXNlci1maWx0ZXItdm0uanMiLCJhZG1pbi91c2Vycy91c2VyLWxpc3Qtdm0uanMiLCJhZG1pbi9jb250cmlidXRpb25zLmpzIiwiYWRtaW4vdXNlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNLENBQUMsQ0FBQyxHQUFJLENBQUEsWUFBVztBQUNuQixXQUFPO0FBQ0gsY0FBTSxFQUFFLEVBQUU7QUFDVixZQUFJLEVBQUUsRUFBRTtBQUNSLGFBQUssRUFBRSxFQUFFO0FBQ1QsU0FBQyxFQUFFLEVBQUU7S0FDUixDQUFDO0NBQ0wsQ0FBQSxFQUFFLEFBQUMsQ0FBQzs7O0FDUEwsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFLOzs7QUFHL0IsUUFBTSxTQUFTLEdBQUcsU0FBWixTQUFTLENBQUksR0FBRyxFQUFLO0FBQUUsZUFBTyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSyxHQUFHLENBQUM7S0FBRTtRQUMvRCxXQUFXLEdBQUcsU0FBZCxXQUFXLENBQUksSUFBSSxFQUFLO0FBQ3BCLFlBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDO1lBQ2pFLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEdBQUcsVUFBVSxHQUFHLFdBQVcsQ0FBQztZQUN2RCxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUMsZUFBTyxPQUFPLEtBQUssSUFBSSxHQUFHLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQ3JGO1FBQ0Qsa0JBQWtCLEdBQUcsU0FBckIsa0JBQWtCLEdBQVM7QUFDdkIsY0FBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7QUFDWix1QkFBVyxFQUFFLGlEQUFpRCxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7U0FDNUUsQ0FBQyxDQUFDO0tBQ1Y7UUFDRCxNQUFNLEdBQUcsU0FBVCxNQUFNLENBQUksQ0FBQyxFQUFLO0FBQ1osZUFBTyxDQUFDLElBQUksSUFBSSxDQUFDO0tBQ3BCO1FBRUQsU0FBUyxHQUFHLFNBQVosU0FBUyxDQUFJLElBQUksRUFBRSxNQUFNLEVBQUs7QUFDMUIsY0FBTSxHQUFHLE1BQU0sSUFBSSxZQUFZLENBQUM7QUFDaEMsZUFBTyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0tBQ3RFO1FBRUQsV0FBVyxHQUFHLFNBQWQsV0FBVyxDQUFJLE1BQU0sRUFBSztBQUN0QixZQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUNqQyxtQkFBTyxjQUFjLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztTQUNqRDtLQUNKO1FBRUQsZ0JBQWdCLEdBQUcsU0FBbkIsZ0JBQWdCLENBQUksTUFBTSxFQUFFLElBQUksRUFBSztBQUNqQyxZQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDaEMsZ0JBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNaLG1CQUFPLGNBQWMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDNUM7S0FDSjtRQUVELE9BQU8sR0FBRyxTQUFWLE9BQU8sQ0FBSSxJQUFJLEVBQUUsVUFBVSxFQUFLO0FBQzVCLFlBQU0sQ0FBQyxHQUFHLFFBQVE7WUFDZCxDQUFDLEdBQUcsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNsQyxjQUFNLENBQUMsYUFBYSxHQUFHLFlBQVc7QUFDOUIsZ0JBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztBQUNyQixnQkFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1NBQ3JDLENBQUM7QUFDRixTQUFDLENBQUMsR0FBRyxHQUFHLG1DQUFtQyxDQUFDO0FBQzVDLFNBQUMsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7QUFDOUMsU0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUEsQ0FBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEMsZUFBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDaEI7UUFFRCxnQkFBZ0IsR0FBRyxTQUFuQixnQkFBZ0IsQ0FBSSxJQUFJLEVBQUUsTUFBTSxFQUFLO0FBQ2pDLFlBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxJQUFJLFlBQVksQ0FBQyxDQUFDO0FBQ3RELGVBQU8sUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDdkQ7UUFFRCxtQkFBbUIsR0FBRztBQUNsQixZQUFJLEVBQUUsTUFBTTtBQUNaLGVBQU8sRUFBRSxTQUFTO0FBQ2xCLGFBQUssRUFBRSxPQUFPO0FBQ2QsZUFBTyxFQUFFLFVBQVU7S0FDdEI7OztBQUVELGtCQUFjLEdBQUcsd0JBQUMsSUFBSSxFQUFLO0FBQ3ZCLFlBQU0sY0FBYyxHQUFHLG1CQUFtQjtZQUN0QyxJQUFJLEdBQUcsU0FBUCxJQUFJLEdBQVM7QUFDVCxnQkFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksU0FBUyxDQUFDLENBQUM7O0FBRXhELG1CQUFPLEFBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEdBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUM7U0FDL0QsQ0FBQzs7QUFFTixlQUFPO0FBQ0gsZ0JBQUksRUFBRSxJQUFJLEVBQUU7QUFDWixpQkFBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1NBQ3BCLENBQUM7S0FDTDs7O0FBR0Qsd0JBQW9CLEdBQUcsU0FBdkIsb0JBQW9CLENBQUksQ0FBQyxFQUFFLENBQUMsRUFBSztBQUM3QixlQUFPLFVBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDckIsZ0JBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQ3JCLHVCQUFPLElBQUksQ0FBQzthQUNmOztBQUVELGdCQUFNLEVBQUUsR0FBRyxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQSxBQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLEdBQUcsQ0FBQSxBQUFDLEdBQUcsR0FBRztnQkFDckUsR0FBRyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsbUJBQU8sQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBLENBQUUsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQSxBQUFDLENBQUMsQ0FBQztTQUMxRixDQUFDO0tBQ0w7UUFDRCxZQUFZLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztRQUU3QyxVQUFVLEdBQUcsU0FBYixVQUFVLENBQUksWUFBWSxFQUFFLGNBQWMsRUFBSztBQUMzQyxZQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQy9CLFNBQUMsQ0FBQyxNQUFNLEdBQUcsWUFBTTtBQUNiLG1CQUFPLENBQUMsQ0FBRSxBQUFDLENBQUMsRUFBRSxLQUFLLGNBQWMsR0FBSSxZQUFZLEdBQUcsY0FBYyxDQUFFLENBQUM7U0FDeEUsQ0FBQzs7QUFFRixlQUFPLENBQUMsQ0FBQztLQUNaO1FBRUQsSUFBSSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO0FBQ3pCLFVBQUUsRUFBRSxJQUFJO0tBQ1gsQ0FBQztRQUVGLE9BQU8sR0FBRyxTQUFWLE9BQU8sR0FBUztBQUNaLFlBQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUM7WUFDOUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ25ELFlBQUksSUFBSSxFQUFFO0FBQ04sbUJBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMzQixNQUFNO0FBQ0gsbUJBQU8sS0FBSyxDQUFDO1NBQ2hCO0tBQ0o7UUFFRCxtQkFBbUIsR0FBRyxTQUF0QixtQkFBbUIsQ0FBSSxNQUFNLEVBQUs7QUFDOUIsWUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdELGVBQU8sTUFBTSxLQUFLLEdBQUcsQ0FBQztLQUN6QjtRQUVELGtCQUFrQixHQUFHLFNBQXJCLGtCQUFrQixDQUFJLFVBQVUsRUFBSztBQUNqQyxlQUFPLFVBQVUsSUFBSSxvQ0FBb0MsQ0FBQztLQUM3RDs7O0FBR0QsVUFBTSxHQUFHLFNBQVQsTUFBTSxHQUFTO0FBQ1gsZUFBTyxDQUFDLENBQUMsaURBQWlELEVBQUUsQ0FDeEQsQ0FBQyxDQUFDLDRFQUE0RSxDQUFDLENBQ2xGLENBQUMsQ0FBQztLQUNOO1FBRUQsZUFBZSxHQUFHLFNBQWxCLGVBQWUsR0FBUztBQUNwQixlQUFPLENBQUMsQ0FBQyx3Q0FBd0MsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQztLQUM1RjtRQUVELE9BQU8sR0FBRyxTQUFWLE9BQU8sR0FBUztBQUNaLFlBQU0sUUFBUSxHQUFHLFNBQVgsUUFBUSxHQUFTO0FBQ25CLGdCQUFJO0FBQ0Esc0JBQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQzNCLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDUix1QkFBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNsQjtTQUNKLENBQUM7O0FBRUYsZUFBTyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztLQUMzQztRQUVELFNBQVMsR0FBRyxTQUFaLFNBQVMsQ0FBSSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUN6QixlQUFRLEtBQUssR0FBRyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFFO0tBQzlDO1FBRUQsWUFBWSxHQUFHLFNBQWYsWUFBWSxHQUFpQjtZQUFiLEdBQUcseURBQUcsRUFBRTs7QUFDcEIsV0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pDLFlBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDaEIsZUFBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3ZDLGVBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNuQyxlQUFHLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUM7U0FDOUI7QUFDRCxlQUFPLEdBQUcsQ0FBQztLQUNkO1FBRUQsY0FBYyxHQUFHLFNBQWpCLGNBQWMsQ0FBSSxNQUFNLEVBQUs7QUFDekIsZUFBUSxNQUFNLENBQUMscUJBQXFCLEdBQUcsQ0FBQyxHQUNuQyxNQUFNLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsSUFBSSxNQUFNLENBQUMscUJBQXFCLEdBQUksS0FBSyxDQUFFO0tBQ25HO1FBRUQsY0FBYyxHQUFHLFNBQWpCLGNBQWMsQ0FBSSxNQUFNLEVBQUs7QUFDekIsZUFBTyxNQUFNLENBQUMscUJBQXFCLElBQUksTUFBTSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMscUJBQXFCLENBQUEsQUFBQyxDQUFDO0tBQzVGO1FBRUQsUUFBUSxHQUFHLFNBQVgsUUFBUSxDQUFJLElBQUksRUFBSztBQUNqQixZQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLFNBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2QsZUFBTyxDQUFDLENBQUM7S0FDWjtRQUVELGFBQWEsR0FBRyxTQUFoQixhQUFhLEdBQVM7QUFDbEIsZUFBTyxVQUFDLEVBQUUsRUFBRSxhQUFhLEVBQUs7QUFDMUIsZ0JBQUksQ0FBQyxhQUFhLEVBQUU7QUFDaEIsc0JBQU0sQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDckM7U0FDSixDQUFDO0tBQ0w7UUFFRCxRQUFRLEdBQUcsU0FBWCxRQUFRLEdBQVM7QUFDYixlQUFPLFVBQUMsRUFBRSxFQUFFLGFBQWEsRUFBSztBQUMxQixnQkFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLEVBQUU7QUFDckIsc0JBQU0sQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDakQ7U0FDSixDQUFDO0tBQ0w7UUFFRCxRQUFRLEdBQUcsU0FBWCxRQUFRLEdBQVM7QUFDYixlQUFPLFVBQUMsRUFBRSxFQUFFLGFBQWEsRUFBSztBQUMxQixnQkFBSSxDQUFDLGFBQWEsRUFBQztBQUNmLG9CQUFNLElBQUksR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUMsb0JBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDaEIsMEJBQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUMxQiw4QkFBVSxDQUFDLFlBQVU7QUFDakIsOEJBQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7cUJBQ2hDLENBQUMsQ0FBQztpQkFDTjthQUNKO1NBQ0osQ0FBQztLQUNMO1FBRUQsYUFBYSxHQUFHLFNBQWhCLGFBQWEsQ0FBSSxLQUFLLEVBQUs7QUFDdkIsWUFBTSxFQUFFLEdBQUcsc0hBQXNILENBQUM7QUFDbEksZUFBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3pCO1FBRUQsZ0JBQWdCLEdBQUcsU0FBbkIsZ0JBQWdCLEdBQVM7QUFDckIsY0FBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDO0FBQ25DLGVBQU8sS0FBSyxDQUFDO0tBQ2hCO1FBRUQsZ0JBQWdCLEdBQUcsU0FBbkIsZ0JBQWdCLENBQUksT0FBTyxFQUFLO0FBQzVCLFlBQUksR0FBRyxHQUFHLENBQUM7WUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLFdBQUc7QUFDQyxlQUFHLElBQUksT0FBTyxDQUFDLFNBQVMsSUFBSyxDQUFDLENBQUM7QUFDL0IsZ0JBQUksSUFBSSxPQUFPLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQztBQUNoQyxtQkFBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7U0FDbEMsUUFBUSxPQUFPLEVBQUU7O0FBRWxCLGVBQU87QUFDSCxlQUFHLEVBQUUsR0FBRztBQUNSLGdCQUFJLEVBQUUsSUFBSTtTQUNiLENBQUM7S0FDTDtRQUVELFVBQVUsR0FBRyxTQUFiLFVBQVUsR0FBUztBQUNmLFlBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRCxZQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUM7QUFDaEIsY0FBRSxDQUFDLE9BQU8sR0FBRyxVQUFDLEtBQUssRUFBSztBQUNwQixxQkFBSyxDQUFDLGNBQWMsRUFBRSxDQUFDOztBQUV2QixrQkFBRSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUM3QixDQUFDO1NBQ0wsQ0FBQztLQUNMO1FBRUQsU0FBUyxHQUFHLFNBQVosU0FBUyxDQUFJLEtBQUssRUFBRSxHQUFHLEVBQUs7QUFDeEIsV0FBRyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUM7QUFDaEIsZUFBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztLQUM1QyxDQUFDOztBQUVOLHNCQUFrQixFQUFFLENBQUM7QUFDckIsY0FBVSxFQUFFLENBQUM7O0FBRWIsV0FBTztBQUNILHdCQUFnQixFQUFFLGdCQUFnQjtBQUNsQyxlQUFPLEVBQUUsT0FBTztBQUNoQixjQUFNLEVBQUUsTUFBTTtBQUNkLHFCQUFhLEVBQUUsYUFBYTtBQUM1QixpQkFBUyxFQUFFLFNBQVM7QUFDcEIsd0JBQWdCLEVBQUUsZ0JBQWdCO0FBQ2xDLG9CQUFZLEVBQUUsWUFBWTtBQUMxQixZQUFJLEVBQUUsSUFBSTtBQUNWLGVBQU8sRUFBRSxPQUFPO0FBQ2hCLGtCQUFVLEVBQUUsVUFBVTtBQUN0QixjQUFNLEVBQUUsTUFBTTtBQUNkLHVCQUFlLEVBQUUsZUFBZTtBQUNoQyxlQUFPLEVBQUUsT0FBTztBQUNoQixpQkFBUyxFQUFFLFNBQVM7QUFDcEIsb0JBQVksRUFBRSxZQUFZO0FBQzFCLHNCQUFjLEVBQUUsY0FBYztBQUM5QixzQkFBYyxFQUFFLGNBQWM7QUFDOUIsc0JBQWMsRUFBRSxjQUFjO0FBQzlCLGdCQUFRLEVBQUUsUUFBUTtBQUNsQixpQkFBUyxFQUFFLFNBQVM7QUFDcEIsMEJBQWtCLEVBQUUsa0JBQWtCO0FBQ3RDLDJCQUFtQixFQUFFLG1CQUFtQjtBQUN4QyxxQkFBYSxFQUFFLGFBQWE7QUFDNUIsd0JBQWdCLEVBQUUsZ0JBQWdCO0FBQ2xDLG1CQUFXLEVBQUUsV0FBVztBQUN4Qix3QkFBZ0IsRUFBRSxnQkFBZ0I7QUFDbEMsZ0JBQVEsRUFBRSxRQUFRO0FBQ2xCLGdCQUFRLEVBQUUsUUFBUTtBQUNsQixtQkFBVyxFQUFFLFdBQVc7QUFDeEIsaUJBQVMsRUFBRSxTQUFTO0tBQ3ZCLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQUFBQyxDQUFDOzs7QUN2UnpDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUU7QUFDM0IsUUFBSSxrQkFBa0IsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQztRQUM5RCxhQUFhLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUM7UUFDcEQsVUFBVSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQztRQUM5QyxJQUFJLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ2pDLFlBQVksR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztRQUNsRCxlQUFlLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUM7UUFDeEQsYUFBYSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztRQUNsRCxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDO1FBQzVDLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDO1FBQ2hFLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDO1FBQzlELDBCQUEwQixHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLCtCQUErQixDQUFDO1FBQy9FLCtCQUErQixHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLG9DQUFvQyxDQUFDO1FBQ3pGLDBCQUEwQixHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLCtCQUErQixDQUFDO1FBQy9FLE9BQU8sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7UUFDdkMsYUFBYSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDO1FBQ3ZELFFBQVEsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUM7UUFDMUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDO1FBQ3JELGdCQUFnQixHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDO1FBQzFELFVBQVUsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7UUFDOUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQztRQUNqRCxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRWhELGNBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsZ0JBQVksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDN0IsV0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNyQixZQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUV0QixXQUFPO0FBQ0gsMEJBQWtCLEVBQUUsa0JBQWtCO0FBQ3RDLHFCQUFhLEVBQUUsYUFBYTtBQUM1QixrQkFBVSxFQUFFLFVBQVU7QUFDdEIsWUFBSSxFQUFFLElBQUk7QUFDVixvQkFBWSxFQUFFLFlBQVk7QUFDMUIscUJBQWEsRUFBRSxhQUFhO0FBQzVCLGlCQUFTLEVBQUUsU0FBUztBQUNwQixrQkFBVSxFQUFFLFVBQVU7QUFDdEIsZUFBTyxFQUFFLE9BQU87QUFDaEIscUJBQWEsRUFBRSxhQUFhO0FBQzVCLGdCQUFRLEVBQUUsUUFBUTtBQUNsQixzQkFBYyxFQUFFLGNBQWM7QUFDOUIsd0JBQWdCLEVBQUUsZ0JBQWdCO0FBQ2xDLGtDQUEwQixFQUFFLDBCQUEwQjtBQUN0RCx1Q0FBK0IsRUFBRSwrQkFBK0I7QUFDaEUsa0NBQTBCLEVBQUUsMEJBQTBCO0FBQ3RELDJCQUFtQixFQUFFLG1CQUFtQjtBQUN4Qyx5QkFBaUIsRUFBRSxpQkFBaUI7QUFDcEMsdUJBQWUsRUFBRSxlQUFlO0FBQ2hDLG9CQUFZLEVBQUUsWUFBWTtBQUMxQixpQkFBUyxFQUFFLFNBQVM7S0FDdkIsQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDbkRiLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFO0FBQzVDLFdBQU87QUFDSCxrQkFBVSxFQUFFLHNCQUFXO0FBQ25CLGdCQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDcEIsUUFBUSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNyQixDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRTtnQkFDWixPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ25DLE9BQU8sR0FBRztBQUNOLDRCQUFZLEVBQUUsNEZBQTRGO2FBQzdHO2dCQUNELFNBQVMsR0FBRyxTQUFaLFNBQVMsQ0FBSSxFQUFFLEVBQUUsYUFBYSxFQUFLO0FBQy9CLG9CQUFJLENBQUMsYUFBYSxFQUFFO0FBQ2hCLHFCQUFDLENBQUMsT0FBTyxDQUFDLHlCQUF5QixFQUFFLFdBQVcsQ0FBQyxDQUFDO2lCQUNyRDthQUNKO2dCQUNELE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztBQUMzQixvQkFBSSxFQUFFLElBQUk7QUFDVixxQkFBSyxFQUFFLElBQUk7YUFDZCxDQUFDO2dCQUNGLFdBQVcsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7O0FBRWhGLGtCQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFcEMsZ0JBQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRW5ILHVCQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUUvQiwwQkFBYyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDOztBQUV6RCxtQkFBTztBQUNILHlCQUFTLEVBQUUsU0FBUztBQUNwQix1QkFBTyxFQUFFLE9BQU87QUFDaEIsMkJBQVcsRUFBRSxXQUFXO0FBQ3hCLHFCQUFLLEVBQUUsS0FBSztBQUNaLDhCQUFjLEVBQUUsY0FBYztBQUM5Qix3QkFBUSxFQUFFLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBQzthQUNuQyxDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ2xDLG1CQUFPLENBQ0gsQ0FBQyxDQUFDLGdDQUFnQyxFQUFFLENBQ2hDLENBQUMsQ0FBQyw0QkFBNEIsRUFBRSxDQUM1QixDQUFDLENBQUMsa0VBQWtFLENBQUMsRUFDckUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQyw4REFBOEQsRUFBRSwwR0FBMEcsQ0FBQyxDQUNoTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUNuQixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUU7QUFDekIsdUJBQU8sRUFBRSxJQUFJLENBQUMsT0FBTzthQUN4QixDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQ3RCLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUFFLENBQ0EsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUNWLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FDZCxDQUFDLENBQUMsZ0RBQWdELEVBQUUsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUMsZ0RBQWdELEVBQUUscUVBQXFFLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQ3hNLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxDQUMxQixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLGtDQUFrQyxFQUFFLENBQ2xDLENBQUMsQ0FBQyxzSUFBc0ksQ0FBQyxFQUFFLENBQUMsQ0FBQyxvQ0FBb0MsRUFBRSxRQUFRLENBQUMsQ0FDL0wsQ0FBQyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSwwVUFBMFUsQ0FBQyxDQUN2VyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ3BCLENBQUMsQ0FBQyxrQ0FBa0MsRUFBRSxDQUNsQyxDQUFDLENBQUMsMElBQTBJLENBQUMsRUFBRSxDQUFDLENBQUMsb0NBQW9DLEVBQUUsV0FBVyxDQUFDLENBQ3RNLENBQUMsRUFBRSxDQUFDLENBQUMsaUJBQWlCLEVBQUUsaVZBQWlWLENBQUMsQ0FDOVcsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFBRSxDQUFDLENBQUMsb0RBQW9ELEVBQUUsQ0FDeEQsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUNkLENBQUMsQ0FBQyxrRUFBa0UsRUFBRSxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxDQUNySCxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxtSUFBbUksQ0FBQyxDQUN6SSxDQUFDLEVBQUUsQ0FBQyxDQUFDLHFFQUFxRSxFQUFFLDRCQUE0QixDQUFDLEVBQUUsQ0FBQyxDQUFDLCtCQUErQixFQUFFLGlIQUFpSCxDQUFDLENBQ3BRLENBQUMsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDcEIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxvSUFBb0ksQ0FBQyxDQUMxSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLHFFQUFxRSxFQUFFLDRCQUE0QixDQUFDLEVBQUUsQ0FBQyxDQUFDLCtCQUErQixFQUFFLGlIQUFpSCxDQUFDLENBQ3BRLENBQUMsQ0FDTCxDQUFDLEVBQUUsQ0FBQyxDQUFDLDBCQUEwQixFQUFFLENBQzlCLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLG1JQUFtSSxDQUFDLENBQ3pJLENBQUMsRUFBRSxDQUFDLENBQUMscUVBQXFFLEVBQUUsZ0NBQWdDLENBQUMsRUFBRSxDQUFDLENBQUMsK0JBQStCLEVBQUUseUhBQXlILENBQUMsQ0FDaFIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNwQixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLGtJQUFrSSxDQUFDLENBQ3hJLENBQUMsRUFBRSxDQUFDLENBQUMscUVBQXFFLEVBQUUsa0NBQWtDLENBQUMsRUFBRSxDQUFDLENBQUMsK0JBQStCLEVBQUUsa0hBQWtILENBQUMsQ0FDM1EsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxDQUNwQixDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLDZFQUE2RSxFQUFFLDRDQUE0QyxDQUFDLEVBQzlILElBQUksQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLEVBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUMsQ0FBQyxDQUNuSixDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxFQUN2QixDQUFDLENBQUMsb0JBQW9CLEVBQUUsQ0FDcEIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUNkLENBQUMsQ0FBQyxpRUFBaUUsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsMEJBQTBCLEVBQUUsQ0FDM0csQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRTtBQUNyQix3QkFBUSxFQUFFLDZDQUE2QztBQUN2RCxzQkFBTSxFQUFFLDZJQUE2STthQUN4SixDQUFDLEVBQ0YsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFO0FBQ3JCLHdCQUFRLEVBQUUsd0NBQXdDO0FBQ2xELHNCQUFNLEVBQUUsMFBBQTBQO2FBQ3JRLENBQUMsRUFDRixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUU7QUFDckIsd0JBQVEsRUFBRSx1REFBdUQ7QUFDakUsc0JBQU0sRUFBRSx1Y0FBdWM7YUFDbGQsQ0FBQyxDQUNMLENBQUMsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDcEIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFO0FBQ3JCLHdCQUFRLEVBQUUseURBQXlEO0FBQ25FLHNCQUFNLEVBQUUsb1FBQW9RO2FBQy9RLENBQUMsRUFDRixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUU7QUFDckIsd0JBQVEsRUFBRSw0Q0FBNEM7QUFDdEQsc0JBQU0sRUFBRSxxUkFBcVI7YUFDaFMsQ0FBQyxFQUNGLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRTtBQUNyQix3QkFBUSxFQUFFLDBDQUEwQztBQUNwRCxzQkFBTSxFQUFFLGlRQUFpUTthQUM1USxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxrREFBa0QsRUFBRSxDQUNsRCxDQUFDLENBQUMsaUNBQWlDLEVBQUUsQ0FDakMsQ0FBQyxDQUFDLG1CQUFtQixFQUFFLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDLGtDQUFrQyxFQUFFLHdEQUF3RCxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUN0SixDQUFDLENBQUMsZ0JBQWdCLENBQUMsRUFDbkIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFO0FBQ3pCLHVCQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87YUFDeEIsQ0FBQyxFQUNGLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUN0QixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFBRSxDQUFDLENBQUMsd0ZBQXdGLEVBQUUsQ0FDNUYsQ0FBQyxDQUFDLDRCQUE0QixFQUFFLENBQzVCLENBQUMsQ0FBQyxtRkFBbUYsRUFBRSw4RkFBOEYsQ0FBQyxFQUN0TCxDQUFDLENBQUMsc0JBQXNCLEVBQUUsQUFBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQzFELENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsK0NBQStDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGdEQUFnRCxFQUFFLHNEQUFzRCxDQUFDLENBQ2xOLENBQUMsRUFDRixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLCtDQUErQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxnREFBZ0QsRUFBRSwwQ0FBMEMsQ0FBQyxDQUMxTSxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQywrQ0FBK0MsRUFBRSxLQUFLLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsZ0RBQWdELEVBQUUsa0RBQWtELENBQUMsQ0FDM04sQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxtREFBbUQsRUFBRSxDQUNuRCxDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLGlEQUFpRCxFQUFFLHdDQUF3QyxDQUFDLEVBQzlGLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsZ0JBQWdCLENBQUMsRUFDbkIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsNERBQTRELEVBQUUsQ0FDNUQsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUNMLENBQUMsQ0FBQyx3SUFBd0ksQ0FBQyxFQUMzSSxDQUFDLENBQUMsbUlBQW1JLEdBQUcsa0JBQWtCLENBQUMsOEJBQThCLENBQUMsR0FBRyxxQkFBcUIsRUFBRSxjQUFjLENBQUMsQ0FDdE8sQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsMkNBQTJDLEVBQUUsQ0FDM0MsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUNMLENBQUMsQ0FBQyx1SUFBdUksQ0FBQyxFQUMxSSxDQUFDLENBQUMsc0VBQXNFLEdBQUcsa0JBQWtCLENBQUMseUdBQXlHLENBQUMsR0FBRyw0REFBNEQsRUFBRSxRQUFRLENBQUMsQ0FDclIsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUN0QixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFBRSxDQUFDLENBQUMsdUNBQXVDLEVBQUUsQ0FDM0MsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUNkLENBQUMsQ0FBQyxvQ0FBb0MsRUFBRSxFQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUMsRUFBRSxDQUM1RCxDQUFDLENBQUMsd0NBQXdDLEVBQUMseUJBQXlCLENBQUMsRUFBRSxDQUFDLENBQUMscURBQXFELEVBQUUsb0VBQW9FLENBQUMsQ0FDeE0sQ0FBQyxFQUNGLENBQUMsQ0FBQyx5REFBeUQsRUFBRTtBQUN6RCxzQkFBTSxFQUFFLElBQUksQ0FBQyxTQUFTO2FBQ3pCLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQ0osQ0FBQztTQUNMO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQUFBQyxDQUFDOzs7QUN6TXBELE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUs7QUFDcEQsUUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLG1CQUFtQixDQUFDLENBQUM7O0FBRTlELFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFDLElBQUksRUFBSztBQUNsQixnQkFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7QUFDOUIsMEJBQVUsRUFBRSxJQUFJO2FBQ25CLENBQUM7Z0JBQ0YsVUFBVSxHQUFHLENBQUMsQ0FBQyxVQUFVO2dCQUN6QixjQUFjLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQzNCLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNoQyx3QkFBd0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDckMsTUFBTSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDOztBQUV6QyxxQkFBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDOztBQUV4RCxnQkFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDN0UsYUFBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFFOUIsZ0JBQU0sb0JBQW9CLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM3RyxnQ0FBb0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7QUFFdEQsZ0JBQUksNkJBQTZCLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO0FBQ3ZGLGdCQUFNLHFCQUFxQixHQUFHLFNBQXhCLHFCQUFxQixDQUFJLGFBQWEsRUFBSztBQUM3Qyx1QkFBTyxBQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLFVBQUMsWUFBWSxFQUFLO0FBQ3hGLHdCQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7O0FBRWhCLDBCQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLElBQUksYUFBYSxDQUFDLENBQUM7QUFDekQsMEJBQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDOUMsMEJBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLEVBQUM7QUFDeEMscUJBQUMsa0NBQWdDLFlBQVksQ0FBQyxpQkFBaUIsT0FBSSxFQUNuRSxLQUFLLEVBQ0wsQ0FBQyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNwRCxDQUFDLENBQUMsbUNBQW1DLEVBQUUsSUFBSSxHQUFHLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQ3BHLENBQUMsQ0FBQyxDQUFDO0FBQ0osMkJBQU8sNkJBQTZCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUNyRCxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQ1gsQ0FBQzs7QUFFRixnQkFBTSx5QkFBeUIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLCtCQUErQixDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZILHFDQUF5QixDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUU3RCxnQkFBSSx3QkFBd0IsR0FBRyxDQUFDLENBQzVCLElBQUksQ0FBQyxDQUFDLENBQUMseUJBQXlCLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFDOUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxnQ0FBZ0MsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUNyRCxJQUFJLENBQUMsQ0FBQyxDQUFDLHlCQUF5QixFQUFFLFNBQVMsRUFBRSxDQUFDLENBQ2pELENBQUMsQ0FBQztBQUNILGdCQUFNLGdCQUFnQixHQUFHLFNBQW5CLGdCQUFnQixDQUFJLGFBQWEsRUFBSztBQUN4Qyx1QkFBTyxBQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLFVBQUMsWUFBWSxFQUFLO0FBQ3hGLHdCQUFNLEVBQUUsR0FBRyxnQkFBZ0I7d0JBQ3ZCLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFL0Msd0JBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQzs7QUFFaEIsd0JBQUksSUFBSSxFQUFDO0FBQ0wsb0NBQVksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUN4Qzs7QUFFRCwwQkFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLEVBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDM0wsMEJBQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hDLDBCQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBQyxDQUNuQyxDQUFDLGtDQUFnQyxZQUFZLENBQUMsaUJBQWlCLE9BQUksRUFDbkUsS0FBSyxFQUNMLENBQUMsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQy9DLENBQUMsQ0FBQyxtQ0FBbUMsRUFBRSxJQUFJLEdBQUcsWUFBWSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FDcEcsQ0FBQyxDQUFDLENBQUM7QUFDSiwyQkFBTyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ2hELENBQUMsR0FBRyxFQUFFLENBQUM7YUFDWCxDQUFDOztBQUVGLGdCQUFNLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDN0csZ0NBQW9CLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7O0FBRW5ELGdCQUFNLHdCQUF3QixHQUFHLFNBQTNCLHdCQUF3QixDQUFJLFdBQVcsRUFBSztBQUM5QyxvQkFBTSxLQUFLLEdBQUc7QUFDVix5QkFBSyxFQUFFLENBQUMsQ0FBQyxpQ0FBaUM7QUFDMUMsMEJBQU0sRUFBRSxDQUFDLENBQUMsa0NBQWtDO2lCQUMvQyxDQUFDOztBQUVGLHVCQUFPLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUM3QixDQUFDOztBQUVGLG1CQUFPO0FBQ0gsaUJBQUMsRUFBRSxDQUFDO0FBQ0osb0NBQW9CLEVBQUUsb0JBQW9CO0FBQzFDLHlDQUF5QixFQUFFLHlCQUF5QjtBQUNwRCxvQ0FBb0IsRUFBRSxvQkFBb0I7QUFDMUMseUJBQVMsRUFBRSxTQUFTO0FBQ3BCLDhCQUFjLEVBQUUsY0FBYztBQUM5QixtQ0FBbUIsRUFBRSxtQkFBbUI7QUFDeEMsNkNBQTZCLEVBQUUsNkJBQTZCO0FBQzVELHdDQUF3QixFQUFFLHdCQUF3QjtBQUNsRCx3Q0FBd0IsRUFBRSx3QkFBd0I7YUFDckQsQ0FBQztTQUNMO0FBQ0QsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFLO0FBQ1osZ0JBQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUMxQyxPQUFPLEdBQUcsU0FBVixPQUFPLENBQUksRUFBRSxFQUFLO0FBQ2QsdUJBQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFO0FBQzFCLHNCQUFFLEVBQUUsRUFBRTtBQUNOLHdCQUFJLEVBQUUsQ0FDRiwySEFBMkgsRUFDM0gsQ0FBQyxjQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsb0JBQW9CLEVBQUUsU0FBUyxFQUFFLENBQUMsNEJBQXVCLE9BQU8sQ0FBQyxDQUN4RjtBQUNELHlCQUFLLEVBQUUsR0FBRztpQkFDYixDQUFDLENBQUM7YUFDTixDQUFDOztBQUVOLG1CQUFPLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUNyQyxPQUFPLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLEVBQUU7QUFDN0QsdUJBQU8sRUFBRSxPQUFPO2FBQ25CLENBQUMsR0FBRyxFQUFFLEVBQ1AsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUNkLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxDQUMxQixDQUFDLENBQUMsZ0JBQWdCLENBQUMsRUFDbkIsQ0FBQyxDQUFDLCtDQUErQyxFQUFFLENBQy9DLENBQUMsQ0FBQywwRUFBMEUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFDcEgsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLEVBQUU7QUFDbkMsd0JBQVEsRUFBRSxPQUFPO2FBQ3BCLENBQUMsRUFDRixDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDckQsd0JBQVEsRUFBRSxPQUFPO2FBQ3BCLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQ3RCLENBQUMsQ0FDTCxDQUFDLEVBQUUsQUFBQyxPQUFPLENBQUMsWUFBWSxHQUFJLENBQ3pCLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFDYixDQUFDLENBQUMsNkRBQTZELEVBQUUsQ0FDN0QsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUNkLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsK0JBQStCLEVBQUU7QUFDL0IscUJBQUssRUFBRTtBQUNILGdDQUFZLEVBQUUsT0FBTztpQkFDeEI7YUFDSixFQUFFLENBQ0MsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRTtBQUMzRCwwQkFBVSxFQUFFLElBQUksQ0FBQyxtQkFBbUI7QUFDcEMscUJBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixFQUFFLFNBQVMsRUFBRSxDQUFDO0FBQ2xELHVCQUFPLEVBQUUsY0FBYztBQUN2QixxQkFBSyxFQUFFLGVBQUMsSUFBSTsyQkFBSyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7aUJBQUE7YUFDN0MsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FDbEIsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLCtCQUErQixFQUFFO0FBQy9CLHFCQUFLLEVBQUU7QUFDSCxnQ0FBWSxFQUFFLE9BQU87aUJBQ3hCO2FBQ0osRUFBRSxDQUNDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUU7QUFDM0QsMEJBQVUsRUFBRSxJQUFJLENBQUMsbUJBQW1CO0FBQ3BDLHFCQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyw2QkFBNkIsRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUN6RCx1QkFBTyxFQUFFLE9BQU87QUFDaEIscUJBQUssRUFBRSxlQUFDLElBQUk7MkJBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO2lCQUFBO2FBQzdDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQ2xCLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQywrQkFBK0IsRUFBRSxDQUMvQixDQUFDLENBQUMsZ0NBQWdDLEVBQUUsQ0FDaEMsQ0FBQyxDQUFDLHFFQUFxRSxFQUFFLENBQ3JFLElBQUksQ0FBQyxDQUFDLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFDdkMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxFQUNuQixPQUFPLENBQUMsa0ZBQWtGLENBQUMsQ0FDOUYsQ0FBQyxFQUNGLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUU7QUFDM0QscUJBQUssRUFBRSxJQUFJLENBQUMsd0JBQXdCO0FBQ3BDLGdDQUFnQixFQUFFLENBQUMsQ0FBQzthQUN2QixDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUNsQixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLCtCQUErQixFQUFFLENBQy9CLENBQUMsQ0FBQyxnQ0FBZ0MsRUFBRSxDQUNoQyxDQUFDLENBQUMscUVBQXFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQ3RILENBQUMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUU7QUFDaEUscUJBQUssRUFBRSxJQUFJLENBQUMsNkJBQTZCO0FBQ3pDLGdDQUFnQixFQUFFLENBQUMsQ0FBQzthQUN2QixDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUNsQixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLCtCQUErQixFQUFFLENBQy9CLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixFQUFFO0FBQ2hDLHdCQUFRLEVBQUUsT0FBTzthQUNwQixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLEdBQUcsRUFBRSxDQUNULEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7U0FDbkI7S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQUFBQyxDQUFDOzs7QUNyTTNFLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBSztBQUN2RCxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxzQkFBZTtnQkFBZCxJQUFJLHlEQUFHLEVBQUU7O0FBQ2xCLGdCQUFJLGNBQWMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDM0IsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFbEMsa0JBQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDOzs7QUFHL0MsZ0JBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDN0Msb0JBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLHdCQUF3QixFQUFFLFVBQUMsR0FBRyxFQUFLO0FBQzlDLG9DQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDMUMsMEJBQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQy9DLHFCQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBQ2QsQ0FBQyxDQUFDO2FBQ047O0FBRUQsbUJBQU87QUFDSCw4QkFBYyxFQUFFLGNBQWM7QUFDOUIsZ0NBQWdCLEVBQUUsZ0JBQWdCO2FBQ3JDLENBQUM7U0FDTDtBQUNELFlBQUksRUFBRSxjQUFDLElBQUksRUFBSztBQUNaLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzs7QUFFbkMsbUJBQU8sQ0FBQyxDQUFDLDRDQUE0QyxFQUFFLENBQ25ELENBQUMsQ0FBQyw0QkFBNEIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxVQUFDLElBQUksRUFBSztBQUNuRSx1QkFBTyxDQUFDLENBQUMsQ0FBQyx3SUFBd0ksQ0FBQyxFQUMvSSxDQUFDLENBQUMsdUNBQXVDLEVBQUUsQ0FDdkMsQ0FBQyxDQUFDLHlDQUF5QyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDbEcsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLDBDQUEwQyxDQUFDLENBQ25FLENBQUMsRUFDRixDQUFDLENBQUMsdUNBQXVDLEVBQUUsQ0FDdkMsQ0FBQyxDQUFDLHlDQUF5QyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUNyRSxDQUFDLENBQUMsaUJBQWlCLEVBQUUscURBQXFELENBQUMsQ0FDOUUsQ0FBQyxDQUNMLENBQUM7YUFDTCxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUN2QyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQ0wsQ0FBQyxDQUFDLHlDQUF5QyxFQUFFLENBQ3pDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQyw4QkFBOEIsRUFBRSxDQUM5QixDQUFDLENBQUMseUJBQXlCLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FDOUUsQ0FBQyxFQUNGLENBQUMsQ0FBQyw4QkFBOEIsRUFBRSxDQUM5QixDQUFDLENBQUMsa0NBQWtDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUN4RCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsMkRBQTJELEVBQUUsQ0FDM0QsQ0FBQyxDQUFDLEtBQUssRUFBRSxvQkFBb0IsQ0FBQyxDQUNqQyxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsOEJBQThCLEVBQUUsQ0FDOUIsQ0FBQyxDQUFDLGtDQUFrQyxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsQ0FDaEYsQ0FBQyxFQUNGLENBQUMsQ0FBQyw4QkFBOEIsRUFBRSxDQUM5QixDQUFDLENBQUMsa0NBQWtDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUMzRCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLEdBQUcsRUFBRSxFQUNQLENBQUMsQ0FBQyxvRUFBb0UsRUFBRSxDQUNwRSxDQUFDLENBQUMsc0ZBQXNGLEVBQUUsQ0FDdEYsQ0FBQyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxFQUFFLDRCQUE0QixDQUM1RCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxBQUFDLENBQUM7Ozs7Ozs7Ozs7O0FDcEVqRSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUs7QUFDckQsV0FBTzs7QUFFSCxrQkFBVSxFQUFFLHNCQUFNO0FBQ2QsZ0JBQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUztnQkFDL0IsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCO2dCQUNsQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7Z0JBQ3BDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDOzs7QUFFL0Isb0JBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLHFCQUFNO0FBQUUsMkJBQU8sSUFBSSxDQUFDO2lCQUFFLEVBQUMsQ0FBQztnQkFDOUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUU7Z0JBQ2hCLFVBQVUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFO2dCQUNyQixZQUFZLEdBQUcsU0FBZixZQUFZLENBQUksRUFBRSxFQUFLO0FBQ25CLHVCQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxVQUFTLENBQUMsRUFBQztBQUFFLDJCQUFPLENBQUMsQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUFFLENBQUMsQ0FBQzthQUNyRjtnQkFDRCxRQUFRLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDO2dCQUU5QyxjQUFjLEdBQUcsU0FBakIsY0FBYyxHQUFTO0FBQ25CLHVCQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQ3JIO2dCQUVELGNBQWMsR0FBRyxTQUFqQixjQUFjLENBQUksRUFBRSxFQUFLO0FBQ3JCLHVCQUFPLFlBQU07QUFDVCwwQkFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFDLFdBQVcsRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUM3RCwyQkFBTyxLQUFLLENBQUM7aUJBQ2hCLENBQUM7YUFDTDtnQkFDRCxnQkFBZ0IsR0FBRyxTQUFuQixnQkFBZ0IsQ0FBSSxFQUFFLEVBQUs7QUFDdkIsdUJBQU8sWUFBTTtBQUNULDBCQUFNLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN2RywyQkFBTyxLQUFLLENBQUM7aUJBQ2hCLENBQUM7YUFDTDtnQkFFRCxTQUFTLEdBQUcsU0FBWixTQUFTLEdBQVM7QUFDZCxvQkFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDO29CQUV6RCxHQUFHLEdBQUcsS0FBSyxJQUNQLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFDUixZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUUxQixlQUFlLEdBQUksU0FBbkIsZUFBZSxHQUFTO0FBQ3BCLHdCQUFNLFVBQVUsR0FBRyxPQUFPLENBQUM7QUFDdkIsbUNBQVcsRUFBRSxLQUFLO0FBQ2xCLG1DQUFXLEVBQUUsSUFBSTtBQUNqQixtQ0FBVyxFQUFFLElBQUk7cUJBQ3BCLENBQUMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7O0FBRTVGLDJCQUFPLEtBQUssSUFDUixLQUFLLENBQUMsQ0FBQyxDQUFDLElBQ1IsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUNwQixHQUFHLElBQ0gsRUFBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQztpQkFDakU7b0JBRUQsTUFBTSxHQUFHLGVBQWUsRUFBRSxJQUFJLFVBQVUsQ0FBQyxXQUFXO29CQUNwRCxNQUFNLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUM7b0JBRW5DLGNBQWMsR0FBRyxTQUFqQixjQUFjLEdBQVM7QUFDbkIsd0JBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO3dCQUNwRixJQUFJLEdBQUc7QUFDSCxrQ0FBVSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ3RCLGlDQUFTLEVBQUUsQ0FBQztBQUNaLGdDQUFRLEVBQUUsb0JBQU07QUFBRSxtQ0FBTyxLQUFLLENBQUM7eUJBQUU7cUJBQ3BDLENBQUM7QUFDUixxQkFBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDL0IsMkJBQU8sSUFBSSxDQUFDO2lCQUNmO29CQUVELFlBQVksR0FBRyxTQUFmLFlBQVksR0FBUztBQUNqQix3QkFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6RCx5QkFBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNoQyw4Q0FBc0IsRUFBRSxNQUFNO0FBQzlCLG1DQUFXLEVBQUUsS0FBSztBQUNsQixrQ0FBVSxFQUFFLE1BQU07cUJBQ3JCLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0FBQ2pCLDJCQUFPLEtBQUssQ0FBQztpQkFDaEIsQ0FBQzs7QUFFUixvQkFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7QUFDM0QseUJBQUssQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLENBQUM7QUFDekIsNEJBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO2lCQUM5QixNQUFNO0FBQ0gseUJBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDcEIsNEJBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO2lCQUM1QjtBQUNELDBCQUFVLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUMxQixnQ0FBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUM3QjtnQkFFRCxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFbkQsa0JBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsWUFBTTtBQUN4Qyx5QkFBUyxFQUFFLENBQUM7QUFDWixpQkFBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ2QsRUFBRSxLQUFLLENBQUMsQ0FBQzs7O0FBR1YsYUFBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLDBCQUFjLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRWpDLG1CQUFPO0FBQ0gsMEJBQVUsRUFBRSxrQkFBa0I7QUFDOUIsOEJBQWMsRUFBRSxjQUFjO0FBQzlCLGdDQUFnQixFQUFFLGdCQUFnQjtBQUNsQyx3QkFBUSxFQUFFLFFBQVE7QUFDbEIsd0JBQVEsRUFBRSxRQUFRO0FBQ2xCLHFCQUFLLEVBQUUsS0FBSztBQUNaLDBCQUFVLEVBQUUsVUFBVTtBQUN0QixnQ0FBZ0IsRUFBRSxnQkFBZ0I7YUFDckMsQ0FBQztTQUNMOztBQUVELFlBQUksRUFBRSxjQUFDLElBQUksRUFBSztBQUNaLG1CQUFPLENBQ0gsQ0FBQyxDQUFDLHdCQUF3QixFQUFFLENBQ3hCLENBQUMsQ0FBQyxnQ0FBZ0MsRUFBRSxDQUNoQyxDQUFDLENBQUMsa0NBQWtDLEVBQUUsQ0FDbEMsQ0FBQyxDQUFDLDhGQUE4RixFQUFDLEVBQUMsT0FBTyxFQUFFOzJCQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUU7aUJBQUEsRUFBQyxFQUFFLENBQUMsNkJBQTZCLEVBQUMsQ0FBQyx3Q0FBcUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsU0FBUyxHQUFHLEVBQUUsQ0FBQSxFQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FDM1EsQ0FBQyxFQUNGLENBQUMsa0NBQStCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLFNBQVMsR0FBRyxFQUFFLENBQUEsRUFBSSxDQUN4RSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUUsVUFBQyxRQUFRLEVBQUs7QUFDbkMsdUJBQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7YUFDOUQsQ0FBQyxDQUNMLENBQUMsRUFFRixDQUFDLENBQUMsMEJBQTBCLEVBQUUsQ0FDMUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFVBQUMsTUFBTSxFQUFFLElBQUksRUFBSztBQUNyQyx1QkFBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsRUFBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQzthQUN6RSxDQUFDLENBRUwsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUVGLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FDWixDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQywyQ0FBMkMsRUFBRSxDQUMzQyxDQUFDLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQ3RDLENBQUMsRUFFRixDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQywyQ0FBMkMsRUFBRSxDQUN6RSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLHdEQUF3RCxFQUFFLENBQ3hELENBQUMsQ0FBQyx1REFBdUQsRUFBSyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsU0FBUyxpQkFBYyxDQUN4RyxDQUFDLEVBQ0YsQ0FBQyxDQUFDLDZDQUE2QyxFQUFFLENBQzdDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxTQUFTLEdBQ3JCLENBQUMsQ0FBQyx3REFBd0QsRUFBRSxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsa0JBQWtCLENBQUMsR0FDckksQ0FBQyxDQUFDLHlDQUF5QyxFQUFFLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDLEVBQUUsUUFBUSxDQUFDLENBQ2pILENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxHQUFHLEVBQUUsQ0FFVixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFFRixDQUFDLENBQUMsb0JBQW9CLEVBQUUsQ0FDcEIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUNkLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLFVBQVUsRUFBRSxFQUFFLFVBQUMsT0FBTyxFQUFLO0FBQ3pELHVCQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLGVBQWUsRUFBQyxDQUFDLENBQUM7YUFDL0UsQ0FBQyxDQUFDLEVBQ0gsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQ2hELENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUVGLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FDWixDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUNuQixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLG1EQUFtRCxFQUFFLEVBQUMsT0FBTyxFQUFFLG1CQUFNO0FBQUUsd0JBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxBQUFDLE9BQU8sS0FBSyxDQUFDO2lCQUFFLEVBQUMsRUFBRSxlQUFlLENBQUMsQ0FDMUksQ0FBQyxFQUNGLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUN0QixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FBQyxDQUFDO1NBQ1g7S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQUFBQyxDQUFDOzs7QUNqTTVELE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUNuRCxRQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUM7O0FBRTFELFdBQU87QUFDSCxrQkFBVSxFQUFFLHNCQUFNO0FBQ2QsZ0JBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNuQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxlQUFlO2dCQUM3QyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7Z0JBQzlELE9BQU8sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU87Z0JBQzFCLE9BQU8sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDOztBQUV0QyxnQkFBTSxXQUFXLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxFQUFFLFVBQUMsSUFBSSxFQUFLO0FBQ2xGLG9CQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO29CQUNqQixPQUFPLEdBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO29CQUN4RSxVQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFOUIsdUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQzs7QUFFcEQsdUJBQU87QUFDSCx5QkFBSyxFQUFFLENBQUMsQ0FBQyxLQUFLO0FBQ2Qsd0JBQUksRUFBRSxJQUFJO0FBQ1YsOEJBQVUsRUFBRSxVQUFVO0FBQ3RCLDBCQUFNLEVBQUUsT0FBTztpQkFDbEIsQ0FBQzthQUNMLENBQUMsQ0FBQzs7QUFFSCxtQkFBTztBQUNILDJCQUFXLEVBQUUsV0FBVzthQUMzQixDQUFDO1NBQ0w7O0FBRUQsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFLO0FBQ1osbUJBQU8sQ0FDSCxDQUFDLENBQUMsZ0NBQWdDLEVBQUUsQ0FDaEMsQ0FBQyxDQUFDLDRCQUE0QixFQUFFLENBQzVCLENBQUMsQ0FBQyw4RUFBOEUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQy9HLENBQUMsQ0FBQyw4RUFBOEUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQ2hILENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQUMsVUFBVSxFQUFLO0FBQ3BDLHVCQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRTtBQUM3Qiw4QkFBVSxFQUFFLFVBQVU7QUFDdEIsdUJBQUcsWUFBVSxVQUFVLENBQUMsSUFBSSxBQUFFO2lCQUNqQyxDQUFDLENBQUM7YUFDTixDQUFDLENBQ0wsQ0FBQztTQUNMO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDaEQ3RCxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUs7QUFDbEQsV0FBTztBQUNILGtCQUFVLEVBQUUsb0JBQUMsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztBQUN6QiwwQkFBVSxFQUFFLElBQUk7YUFDbkIsQ0FBQztnQkFDRixJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUk7Z0JBQ2IsY0FBYyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUMzQixXQUFXLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3hCLGFBQWEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUUvQixjQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMvQixnQkFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7O0FBRTlCLGdCQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztnQkFDN0YsS0FBSyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO2dCQUN2RixPQUFPLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFL0Ysb0JBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJLEVBQUs7QUFDM0IscUJBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDL0IsdUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7O0FBRW5DLDhCQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDeEIsQ0FBQyxDQUFDOztBQUVILG1CQUFPO0FBQ0gsOEJBQWMsRUFBRSxjQUFjO0FBQzlCLDJCQUFXLEVBQUUsV0FBVztBQUN4Qiw2QkFBYSxFQUFFLGFBQWE7QUFDNUIsd0JBQVEsRUFBRSxRQUFRO0FBQ2xCLHFCQUFLLEVBQUUsS0FBSztBQUNaLHVCQUFPLEVBQUUsT0FBTzthQUNuQixDQUFDO1NBQ0w7O0FBRUQsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFLO0FBQ1osbUJBQU8sQUFBQyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFBLEFBQUMsR0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxVQUFDLE9BQU8sRUFBSztBQUN0Ryx1QkFBTyxDQUFDLENBQUMsZUFBZSxFQUFFO0FBQ3RCLDBCQUFNLEVBQUUsQ0FBQyxDQUFDLGFBQWEsRUFBRTtpQkFDNUIsRUFBRSxDQUNDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBRTtBQUN6QiwyQkFBTyxFQUFFLE9BQU87QUFDaEIsK0JBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztpQkFDaEMsQ0FBQyxFQUNGLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRTtBQUN2QiwyQkFBTyxFQUFFLE9BQU87QUFDaEIsaUNBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtpQkFDcEMsQ0FBQyxFQUNGLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRTtBQUN2QiwyQkFBTyxFQUFFLE9BQU87QUFDaEIsaUNBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtpQkFDcEMsQ0FBQyxFQUNELE9BQU8sQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsRUFBRTtBQUM3RCwyQkFBTyxFQUFFLE9BQU87aUJBQ25CLENBQUMsR0FBRyxFQUFFLENBQ1YsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNuQjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7QUMzRDlELE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFLO0FBQzVCLFdBQU8sVUFBQyxJQUFJLEVBQUs7QUFDYixZQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLO1lBQ2pFLFlBQVksR0FBRyxTQUFTLENBQUMsWUFBWTtZQUNyQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsZ0JBQWdCO1lBQzdDLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSztZQUN2QixFQUFFLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQzs7QUFFdEIsZUFBTztBQUNILHdCQUFZLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsVUFBQyxXQUFXLEVBQUs7QUFDL0MsdUJBQU87QUFDSCw0QkFBUSxFQUFFLFdBQVcsQ0FBQyxLQUFLO0FBQzNCLDJCQUFPLEVBQUUsV0FBVyxDQUFDLE9BQU87QUFDNUIsd0JBQUksRUFBRSxXQUFXLENBQUMsSUFBSTtBQUN0QiwwQkFBTSxFQUFFLFdBQVcsQ0FBQyxNQUFNO2lCQUM3QixDQUFDO2FBQ0wsQ0FBQztBQUNGLGlCQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDMUIsdUJBQU87QUFDSCx5QkFBSyxFQUFFLElBQUksQ0FBQyxLQUFLO0FBQ2pCLHVCQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7aUJBQ2hCLENBQUM7YUFDTCxDQUFDO0FBQ0YscUJBQVMsRUFBRTtBQUNQLHFCQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFVBQUMsUUFBUSxFQUFLO0FBQ2pDLDJCQUFPO0FBQ0gsZ0NBQVEsRUFBRSxRQUFRLENBQUMsUUFBUTtBQUMzQiw4QkFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNO3FCQUMxQixDQUFDO2lCQUNMLENBQUM7QUFDRixxQkFBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxVQUFDLFFBQVEsRUFBSztBQUNqQywyQkFBTztBQUNILGdDQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7QUFDM0IsOEJBQU0sRUFBRSxRQUFRLENBQUMsTUFBTTtxQkFDMUIsQ0FBQztpQkFDTCxDQUFDO2FBQ0w7QUFDRCw0QkFBZ0IsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLFVBQUMsUUFBUSxFQUFLO0FBQ3BELHVCQUFPO0FBQ0gsOEJBQVUsRUFBRSxRQUFRLENBQUMsV0FBVztBQUNoQyxrQ0FBYyxFQUFFLENBQ1osUUFBUSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFDbkMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FDeEM7aUJBQ0osQ0FBQzthQUNMLENBQUM7U0FDTCxDQUFDO0tBQ0wsQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDaERiLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBSztBQUM5QyxRQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7O0FBRXhELFdBQU87QUFDSCxrQkFBVSxFQUFFLHNCQUFNO0FBQ2QsZ0JBQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNwQixVQUFVLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZCLFlBQVksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDeEIsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQzdCLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUM3QixtQkFBbUIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO2dCQUMvQixPQUFPLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTO2dCQUMvQixVQUFVLEdBQUcsT0FBTyxDQUFDLEtBQUs7Z0JBQzFCLFVBQVUsR0FBRyxPQUFPLENBQUM7QUFDakIsMkJBQVcsRUFBRSxJQUFJO2FBQ3BCLENBQUM7Z0JBQ0YsU0FBUyxHQUFHLE9BQU8sQ0FBQztBQUNoQiwwQkFBVSxFQUFFLElBQUk7YUFDbkIsQ0FBQztnQkFDRixNQUFNLEdBQUcsT0FBTyxDQUFDO0FBQ2Isa0JBQUUsRUFBRSxJQUFJO2FBQ1gsQ0FBQztnQkFDRixNQUFNLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxlQUFlO2dCQUNwQyxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3RELGNBQWMsR0FBRyxTQUFqQixjQUFjLEdBQVM7QUFDbkIsdUJBQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUN4RCx3QkFBSSxFQUFFLEtBQUs7aUJBQ2QsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3JDO2dCQUNELFVBQVUsR0FBRyxTQUFiLFVBQVUsQ0FBSSxHQUFHLEVBQUs7QUFDbEIsdUJBQU8sWUFBTTtBQUNULGdDQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3JCLENBQUM7YUFDTDtnQkFDRCxTQUFTLEdBQUcsU0FBWixTQUFTLEdBQVM7QUFDZCx1QkFBTyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUMvRTtnQkFDRCxRQUFRLEdBQUcsU0FBWCxRQUFRLEdBQVM7QUFDYix1QkFBTyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUM3RTtnQkFDRCxLQUFLLEdBQUcsU0FBUixLQUFLLEdBQVM7QUFDVix1QkFBTyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN2RTtnQkFDRCxjQUFjLEdBQUcsU0FBakIsY0FBYyxDQUFJLEVBQUUsRUFBSztBQUNyQix1QkFBTyxZQUFNO0FBQ1QsdUNBQW1CLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEIsOEJBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDM0Isb0NBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDckIscUJBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNYLDZCQUFTLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztpQkFDakQsQ0FBQzthQUNMO2dCQUNELE9BQU8sR0FBRyxTQUFWLE9BQU8sQ0FBSSxJQUFJLEVBQUUsR0FBRyxFQUFLO0FBQ3JCLGdDQUFnQixFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUM1RCw2QkFBUyxFQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMscUJBQXFCO2lCQUNsRCxDQUFDLENBQUM7YUFDTjtnQkFDRCxVQUFVLEdBQUcsU0FBYixVQUFVLENBQUksT0FBTyxFQUFFLEdBQUcsRUFBSztBQUMzQixnQ0FBZ0IsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDM0Msc0JBQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEMscUJBQUssRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLElBQUk7MkJBQUssT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUM7aUJBQUEsQ0FBQyxDQUFDO2FBQ3JEO2dCQUNELG9CQUFvQixHQUFHLFNBQXZCLG9CQUFvQixDQUFJLFFBQVEsRUFBSztBQUNqQyxnQ0FBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMzQixvQkFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRTtBQUN6RCw4QkFBVSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVztpQkFDNUMsQ0FBQyxDQUFDO0FBQ0gsZ0NBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDckIsb0JBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7QUFDbEMscUJBQUMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLFVBQUMsVUFBVSxFQUFFLEdBQUcsRUFBSztBQUN4RCw0QkFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDNUIscUNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDakMsb0NBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLE9BQU87dUNBQUssVUFBVSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUM7NkJBQUEsQ0FBQyxDQUFDO3lCQUNqRTtxQkFDSixDQUFDLENBQUM7aUJBQ047YUFDSixDQUFDOztBQUVOLHVCQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9CLDBCQUFjLEVBQUUsQ0FBQzs7QUFFakIsbUJBQU87QUFDSCxxQkFBSyxFQUFFLEtBQUs7QUFDWiwwQkFBVSxFQUFFLFVBQVU7QUFDdEIsMEJBQVUsRUFBRSxVQUFVO0FBQ3RCLDhCQUFjLEVBQUUsY0FBYztBQUM5QixnQ0FBZ0IsRUFBRSxnQkFBZ0I7QUFDbEMsbUNBQW1CLEVBQUUsbUJBQW1CO0FBQ3hDLDBCQUFVLEVBQUUsVUFBVTtBQUN0Qiw0QkFBWSxFQUFFLFlBQVk7QUFDMUIsZ0NBQWdCLEVBQUUsZ0JBQWdCO0FBQ2xDLDRCQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVk7QUFDbEMseUJBQVMsRUFBRSxPQUFPLENBQUMsU0FBUzthQUMvQixDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ2xDLGdCQUFNLFlBQVksR0FBRyxTQUFmLFlBQVksR0FBUztBQUN2Qix1QkFBTyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsVUFBQyxXQUFXLEVBQUs7QUFDN0MsMkJBQU8sQ0FBQyxDQUFDLHVDQUF1QyxFQUFFLENBQzlDLENBQUMsQ0FBQyxrQ0FBa0MsRUFBRSxDQUNsQyxDQUFDLDJEQUF5RCxXQUFXLENBQUMsUUFBUSxRQUFLLENBQ3RGLENBQUMsRUFDRixDQUFDLENBQUMsb0NBQW9DLFFBQU0sV0FBVyxDQUFDLE9BQU8sT0FBSSxFQUNuRSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLHFDQUFxQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDMUQsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FDMUMsQ0FBQyxDQUNMLENBQUMsQ0FBQztpQkFDTixDQUFDLENBQUM7YUFFTixDQUFDOztBQUVGLG1CQUFPLENBQ0gsQ0FBQyxDQUFDLGlDQUFpQyxFQUFFLENBQ2pDLENBQUMsQ0FBQyw0QkFBNEIsRUFBRSxDQUM1QixDQUFDLENBQUMsMkRBQTJELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUM3RixDQUFDLENBQUMsMEJBQTBCLEVBQUUsQ0FDMUIsQ0FBQyxDQUFDLDZCQUE2QixFQUFFLENBQzdCLENBQUMsQ0FBQywyREFBMkQsRUFBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQ2pHLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUNoQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLG9DQUFvQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUN2RixDQUFDLENBQUMsOEJBQThCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUMxRSxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxvQ0FBb0MsRUFBRSxLQUFLLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsRUFDcEcsQ0FBQyxDQUFDLDhCQUE4QixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FDekUsQ0FBQyxFQUNGLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsb0NBQW9DLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQzNGLENBQUMsQ0FBQyw4QkFBOEIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FDM0UsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxDQUNwQixDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQyw0Q0FBNEMsRUFBRSxDQUM1QyxDQUFDLENBQUMsd0RBQXdELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUM5RixDQUFDLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUM3RCxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxxQkFBcUIsRUFBRSxDQUNyQixDQUFDLENBQUMsMENBQTBDLEVBQUUsQ0FDMUMsQ0FBQyxDQUFDLHdCQUF3QixFQUFFLENBQ3hCLENBQUMsQ0FBQyxxQ0FBcUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQ3pFLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQ3ZELENBQUMsRUFDRixDQUFDLENBQUMsd0JBQXdCLEVBQUUsQ0FDeEIsQ0FBQyxDQUFDLHFDQUFxQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFDekUsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FDdkQsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsYUFBYSxDQUFDLEVBQ2hCLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FDYixDQUFDLENBQUMscUNBQXFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUN6RSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUNwRCxDQUFDLENBQUMsb0RBQW9ELEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUN4RixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUN2RCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLDJDQUEyQyxFQUFFLENBQzNDLENBQUMsQ0FBQyx3QkFBd0IsRUFBRSxDQUN4QixDQUFDLENBQUMscUNBQXFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUN6RSxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUN2RCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLHdCQUF3QixFQUFFLENBQ3hCLENBQUMsQ0FBQyxxQ0FBcUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQ3pFLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQ3hELENBQUMsRUFDRixDQUFDLENBQUMsd0JBQXdCLEVBQUUsQ0FDeEIsQ0FBQyxDQUFDLHFDQUFxQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFDekUsQ0FBQyxDQUFDLGdCQUFnQixFQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FDeEQsQ0FBQyxFQUNGLENBQUMsQ0FBQyx3QkFBd0IsRUFBRSxDQUN4QixDQUFDLENBQUMscUNBQXFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUN6RSxDQUFDLENBQUMsZ0JBQWdCLEVBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUN4RCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxFQUN2QixDQUFDLENBQUMsMEJBQTBCLEVBQUUsQ0FDMUIsQ0FBQyxDQUFDLDhDQUE4QyxFQUFFLENBQzlDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FDTCxDQUFDLENBQUMsMkNBQTJDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQ3hGLENBQUMsRUFDRixDQUFDLENBQUMsZ0VBQWdFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQzdHLENBQUMsQ0FBQywrQ0FBK0MsRUFBRSxDQUMvQyxDQUFDLENBQUMsbUNBQW1DLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQ2pGLENBQUMsQ0FBQyxtQ0FBbUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFDakYsQ0FBQyxDQUFDLG1DQUFtQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsb0JBQW9CLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUNqRixDQUFDLENBQUMsbUNBQW1DLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQ2pGLENBQUMsQ0FBQyxtQ0FBbUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FDcEYsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLHNDQUFzQyxFQUFFLENBQ3RDLENBQUMsQ0FBQywyQkFBMkIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsVUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFLO0FBQ2pFLHVCQUFPLENBQUMsZ0RBQTZDLEFBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBSSxXQUFXLEdBQUcsRUFBRSxDQUFBLEVBQUk7QUFDckcsMkJBQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztpQkFDaEMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDbEIsQ0FBQyxDQUFDLEVBQ0gsQ0FBQyxDQUFDLDhCQUE4QixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxVQUFDLElBQUksRUFBRSxHQUFHLEVBQUs7QUFDcEUsdUJBQU8sQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUNwQixDQUFDLGVBQWEsSUFBSSxDQUFDLEdBQUcsc0JBQWdCLEFBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBSSxXQUFXLEdBQUcsRUFBRSxDQUFBLENBQUcsQ0FDNUYsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxDQUFDLENBQ04sQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLHNDQUFzQyxFQUFFLENBQ3RDLENBQUMsQ0FBQyw0QkFBNEIsRUFBRSxDQUM1QixDQUFDLENBQUMsd0VBQXdFLEVBQUUsQ0FDeEUsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFDbEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUNQLElBQUksQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FDeEMsQ0FBQyxFQUNGLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRTtBQUMzQixtQkFBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLFNBQVMsRUFBRSxDQUFDO2FBQ3hDLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxrREFBa0QsRUFBRSxDQUNsRCxDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsOEJBQThCLEVBQUUsQ0FDOUIsQ0FBQyxDQUFDLHNEQUFzRCxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUNyRyxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsU0FBUyxFQUFFLENBQ1QsQ0FBQyxDQUFDLDJCQUEyQixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLFVBQUMsUUFBUSxFQUFLO0FBQ2xFLHVCQUFPLENBQUMsZ0VBQTZELEFBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEtBQUssUUFBUSxDQUFDLEVBQUUsR0FBSSxhQUFhLEdBQUcsRUFBRSxDQUFBLEVBQUk7QUFDdEksMkJBQU8sRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7aUJBQzVDLEVBQUUsQ0FDQyxDQUFDLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FDMUIsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxDQUFDLEVBQ0gsQ0FBQyxDQUFDLCtCQUErQixFQUFFLENBQy9CLENBQUMsQ0FBQywyQkFBMkIsRUFBRSxDQUMzQixDQUFDLENBQUMsUUFBUSxFQUFFLEFBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUEsQUFBQyxHQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsVUFBQyxRQUFRLEVBQUs7QUFDcEksdUJBQU8sQ0FDSCxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLG1DQUFtQyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFDckQsQ0FBQyxDQUFDLHFFQUFxRSxFQUFFLHNCQUFzQixDQUFDLENBQ25HLENBQUMsRUFDRixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLHdDQUF3QyxVQUFRLENBQUMsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBRyxFQUMxRyxDQUFDLENBQUMsbUNBQW1DLEVBQUUsc0JBQXNCLENBQUMsRUFDOUQsQ0FBQyxDQUFDLHdDQUF3QyxFQUFFLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxFQUN6RSxDQUFDLENBQUMsbUNBQW1DLEVBQUUsc0JBQXNCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLFVBQUMsT0FBTyxFQUFLO0FBQzlJLDJCQUFPLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsMEJBQTBCLEVBQUUsQ0FDM0QsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsMkJBQXlCLE9BQU8sQ0FBQyxTQUFTLFFBQUssQ0FDbkQsQ0FBQyxFQUNGLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUNqQixDQUFDLENBQUMsb0NBQW9DLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDMUQsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLENBQ3BCLElBQUksQ0FBQyxDQUFDLENBQUMsb0JBQW9CLEVBQUUsU0FBUyxDQUFDLEVBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFlBQVksRUFBRSxPQUFPLENBQUMsa0JBQWtCLEVBQUMsQ0FBQyxDQUFDLEVBQzdILENBQUMsMkJBQXlCLE9BQU8sQ0FBQyxTQUFTLFNBQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUNqRSxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsR0FBRyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyw2QkFBNkIsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ2hGLENBQUMsR0FBRyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQzFFLENBQUMsQ0FDTCxDQUFDO2FBQ0wsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUNuQixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRTtBQUNsQixzQkFBTSxFQUFFLFlBQVksRUFBRTtBQUN0QixxQkFBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsb0JBQW9CLEVBQUUsU0FBUyxFQUFFLENBQUM7YUFDbkQsQ0FBQyxFQUNGLENBQUMsQ0FBQyxtQ0FBbUMsQ0FBQyxFQUN0QyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLGlFQUFpRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFDckcsQ0FBQyxDQUFDLDBCQUEwQixFQUFFLENBQzFCLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLFVBQUMsUUFBUSxFQUFLO0FBQzFELHVCQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRTtBQUM1Qiw0QkFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRO0FBQzNCLDBCQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU07aUJBQzFCLENBQUMsQ0FBQzthQUNOLENBQUMsQ0FBQyxFQUNILENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLFVBQUMsUUFBUSxFQUFLO0FBQzFELHVCQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRTtBQUM1Qiw0QkFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRO0FBQzNCLDBCQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU07aUJBQzFCLENBQUMsQ0FBQzthQUNOLENBQUMsQ0FBQyxDQUNOLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdFQUFnRSxFQUFFLENBQ2hFLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FDZCxDQUFDLENBQUMsc0RBQXNELEVBQUUsb0NBQW9DLENBQUMsRUFDL0YsQ0FBQyxDQUFDLHlEQUF5RCxFQUFFLENBQ3pELENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUNuQixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLHVEQUF1RCxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFDN0YsQ0FBQyxDQUFDLGlGQUFpRixDQUFDLEVBQ3BGLENBQUMsQ0FBQyx1REFBdUQsRUFBRSxjQUFjLENBQUMsRUFDMUUsQ0FBQyxDQUFDLDJFQUEyRSxFQUFFLENBQzNFLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFDakUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUUsVUFBQyxRQUFRLEVBQUs7QUFDbkMsdUJBQU8sQ0FBQyxvQkFBa0IsUUFBUSxDQUFDLEVBQUUsU0FBTSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDN0QsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQ25CLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxDQUMxQixDQUFDLENBQUMsNENBQTRDLEVBQUUsQ0FDNUMsQ0FBQyxrQ0FBZ0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLENBQUMsK0JBQTRCLENBQ2xHLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQztTQUNMO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxBQUFDLENBQUM7OztBQ3pVakUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2pDLFdBQU87QUFDSCxZQUFJLEVBQUUsZ0JBQVc7QUFDYixtQkFBTyxDQUFDLENBQUMsa0JBQWtCLEVBQUUsQ0FDekIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQ3hCLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUM3QixDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDVHZCLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUs7QUFDOUMsV0FBTyxZQUFLO0FBQ1IsWUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTO1lBRS9CLE1BQU0sR0FBRyxPQUFPLENBQUM7QUFDYixtQkFBTyxFQUFFLElBQUk7QUFDYixrQ0FBc0IsRUFBRSxJQUFJO0FBQzVCLHVCQUFXLEVBQUUsSUFBSTtTQUNwQixDQUFDLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUvRyxRQUFRLEdBQUcsT0FBTyxDQUFDO0FBQ2Ysc0JBQVUsRUFBRSxLQUFLO0FBQ2pCLGtDQUFzQixFQUFFLElBQUk7U0FDL0IsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUzRixNQUFNLEdBQUcsT0FBTyxDQUFDO0FBQ2IsdUJBQVcsRUFBRSxLQUFLO0FBQ2xCLGtDQUFzQixFQUFFLElBQUk7U0FDL0IsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUVoRyxXQUFXLEdBQUcsT0FBTyxDQUFDO0FBQ2xCLHVCQUFXLEVBQUUsSUFBSTtBQUNqQixrQ0FBc0IsRUFBRSxJQUFJO1NBQy9CLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsc0JBQXNCLENBQUMsTUFBTSxDQUFDO1lBRXJELE1BQU0sR0FBRyxPQUFPLENBQUM7QUFDYixrQ0FBc0IsRUFBRSxJQUFJO1NBQy9CLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUM7WUFFakMsVUFBVSxHQUFHLE9BQU8sQ0FBQztBQUNqQixpQkFBSyxFQUFFLElBQUk7QUFDWCxzQkFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQzs7QUFFNUYsZUFBTztBQUNILHVCQUFXLEVBQUU7QUFDVCxxQkFBSyxFQUFFLGNBQWM7QUFDckIsc0JBQU0sRUFBRSxXQUFXO2FBQ3RCO0FBQ0Qsa0JBQU0sRUFBRTtBQUNKLHFCQUFLLEVBQUUsT0FBTztBQUNkLHNCQUFNLEVBQUUsTUFBTTthQUNqQjtBQUNELG9CQUFRLEVBQUU7QUFDTixxQkFBSyxFQUFFLFlBQVk7QUFDbkIsc0JBQU0sRUFBRSxRQUFRO2FBQ25CO0FBQ0Qsc0JBQVUsRUFBRTtBQUNSLHFCQUFLLEVBQUUsZUFBZTtBQUN0QixzQkFBTSxFQUFFLFVBQVU7YUFDckI7QUFDRCxrQkFBTSxFQUFFO0FBQ0oscUJBQUssRUFBRSxVQUFVO0FBQ2pCLHNCQUFNLEVBQUUsTUFBTTthQUNqQjtBQUNELG1CQUFPLEVBQUU7QUFDTCxxQkFBSyxFQUFFLGdCQUFnQjtBQUN2QixzQkFBTSxFQUFFLE1BQU07YUFDakI7U0FDSixDQUFDO0tBQ0wsQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQUFBQyxDQUFDOzs7QUM3RHhDLE1BQU0sQ0FBQyxDQUFDLENBQUMsdUJBQXVCLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNyRCxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBUyxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksQ0FBQyxZQUFBLENBQUM7QUFDTixnQkFBTSxVQUFVLEdBQUcsU0FBYixVQUFVLEdBQVM7QUFDckIsb0JBQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWTtvQkFDL0IsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztvQkFDL0IsSUFBSSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQzdELE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGlCQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEMsb0JBQUksU0FBUyxFQUFFO0FBQ1gscUJBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7aUJBQzdDO0FBQ0QsdUJBQU8sTUFBTSxDQUFDO2FBQ2pCLENBQUM7QUFDRixnQkFBTSxNQUFNLEdBQUcsVUFBVSxFQUFFLENBQUM7QUFDNUIsbUJBQU87QUFDSCxzQkFBTSxFQUFFLE1BQU07QUFDZCx1QkFBTyxFQUFFO0FBQ0wsNEJBQVEsRUFBRTtBQUNOLGdDQUFRLEVBQUUsU0FBUztBQUNuQixpQ0FBUyxFQUFFLElBQUk7QUFDZixvQ0FBWSxFQUFFLFlBQVk7QUFDMUIsa0NBQVUsRUFBRSxzQkFBc0I7QUFDbEMsa0NBQVUsRUFBRSxrQkFBa0I7QUFDOUIsbUNBQVcsRUFBRSxZQUFZO0FBQ3pCLHNDQUFjLEVBQUUsZ0NBQWdDO0FBQ2hELG9DQUFZLEVBQUUsOEJBQThCO0FBQzVDLDZCQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0I7cUJBQ3JDO0FBQ0QsMEJBQU0sRUFBRTtBQUNKLDhCQUFNLEVBQUUsWUFBWTtBQUNwQixpQ0FBUyxFQUFFLGlCQUFpQjtBQUM1QixpQ0FBUyxFQUFFLFdBQVc7QUFDdEIsOEJBQU0sRUFBRSxTQUFTO0FBQ2pCLG9DQUFZLEVBQUUsb0JBQW9CO0FBQ2xDLGtDQUFVLEVBQUUsWUFBWTtBQUN4QixnQ0FBUSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWTtBQUMvQixtQ0FBVyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsa0JBQWtCO0FBQ3hDLG9DQUFZLEVBQUUsTUFBTTtBQUNwQixnQ0FBUSxFQUFFLGtCQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUs7QUFDaEMsZ0NBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUMsRUFBRSxFQUFFLFdBQVcsRUFBQyxDQUFDLENBQUM7QUFDckQsbUNBQU8sQUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsYUFBYSxHQUFJLFNBQVMsR0FBRyxvRUFBb0UsQ0FBQzt5QkFDdkk7cUJBQ0o7QUFDRCwwQkFBTSxFQUFFO0FBQ0osaUNBQVMsRUFBRSxJQUFJO0FBQ2Ysb0NBQVksRUFBRSxrQkFBa0I7QUFDaEMsa0NBQVUsRUFBRSwrQ0FBK0M7QUFDM0Qsa0NBQVUsRUFBRSxrQkFBa0I7QUFDOUIsNkJBQUssRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLGtCQUFrQjtxQkFDckM7QUFDRCwwQkFBTSxFQUFFO0FBQ0osZ0NBQVEsRUFBRSxPQUFPO0FBQ2pCLGlDQUFTLEVBQUUsSUFBSTtBQUNmLG9DQUFZLEVBQUUsUUFBUTtBQUN0QixrQ0FBVSxFQUFFLDJDQUEyQztBQUN2RCxrQ0FBVSxFQUFFLGNBQWM7QUFDMUIsa0NBQVUsRUFBRSxTQUFTO0FBQ3JCLHNDQUFjLEVBQUUsNkJBQTZCO0FBQzdDLG9DQUFZLEVBQUUsMkJBQTJCO0FBQ3pDLDZCQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0I7cUJBQ3JDO2lCQUNKO0FBQ0QsaUJBQUMsRUFBRSxDQUFDO2FBQ1AsQ0FBQztTQUNMOztBQUVELFlBQUksRUFBRSxjQUFTLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPO2dCQUN0QixJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUk7Z0JBQ2hCLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDOztBQUV6QixnQkFBTSxVQUFVLEdBQUcsU0FBYixVQUFVLENBQUksT0FBTyxFQUFFLEVBQUUsRUFBSztBQUNoQyx1QkFBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUU7QUFDekIsa0NBQWMsRUFBRTtBQUNaLDJCQUFHLDRCQUEyQixFQUFFLG9CQUFrQjtBQUNsRCw4QkFBTSxFQUFFLEtBQUs7cUJBQ2hCO2lCQUNKLENBQUMsQ0FBQzthQUNOLENBQUM7O0FBRUYsbUJBQU8sQ0FBQyxDQUFDLGdDQUFnQyxFQUFFLENBQ3ZDLENBQUMsQ0FBQywyQ0FBMkMsQ0FBQyxFQUM5QyxDQUFDLENBQUMsMEJBQTBCLEVBQUUsQ0FDMUIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUU7QUFDNUIsb0JBQUksRUFBRSxPQUFPLENBQUMsUUFBUTtBQUN0QixvQkFBSSxFQUFFLElBQUk7YUFDYixDQUFDLEVBQ0YsQUFBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUksQ0FBQyxDQUFDLE1BQU0sR0FDckIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUU7QUFDNUIsb0JBQUksRUFBRSxPQUFPLENBQUMsTUFBTTtBQUNwQixvQkFBSSxFQUFFLE1BQU07QUFDWiwyQkFBVyxFQUFFLElBQUksQ0FBQyxVQUFVO0FBQzVCLDhCQUFjLEVBQUUsSUFBSSxDQUFDLGVBQWU7YUFDdkMsQ0FBQyxFQUNGLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixFQUFFO0FBQy9CLG9CQUFJLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUN6QyxvQkFBSSxFQUFFLElBQUk7YUFDYixDQUFDLEVBQ0YsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUU7QUFDNUIsb0JBQUksRUFBRSxPQUFPLENBQUMsTUFBTTtBQUNwQixvQkFBSSxFQUFFLElBQUk7YUFDYixDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxvQ0FBb0MsRUFBRSxDQUNwQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRTtBQUM1Qiw0QkFBWSxFQUFFLElBQUk7YUFDckIsQ0FBQyxFQUNGLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixFQUFFO0FBQ25DLDRCQUFZLEVBQUUsSUFBSTthQUNyQixDQUFDLEVBQ0YsQUFBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUksQ0FBQyxDQUFDLE1BQU0sR0FDckIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFO0FBQ3ZCLHNCQUFNLEVBQUUsTUFBTTtBQUNkLG1CQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7YUFDaEIsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7QUN6SDdDLE1BQU0sQ0FBQyxDQUFDLENBQUMscUJBQXFCLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2hELFdBQU87QUFDSCxrQkFBVSxFQUFFLHNCQUFXO0FBQ25CLG1CQUFPO0FBQ0gsMkJBQVcsRUFBRSxDQUFDO0FBQ1YsNkJBQVMsRUFBRSx1QkFBdUI7QUFDbEMsZ0NBQVksRUFBRSxnQkFBZ0I7aUJBQ2pDLEVBQUU7QUFDQyw2QkFBUyxFQUFFLGNBQWM7QUFDekIsZ0NBQVksRUFBRSxnQkFBZ0I7aUJBQ2pDLEVBQUU7QUFDQyw2QkFBUyxFQUFFLG1CQUFtQjtBQUM5QixnQ0FBWSxFQUFFLGdCQUFnQjtpQkFDakMsRUFBRTtBQUNDLDZCQUFTLEVBQUUsZUFBZTtBQUMxQixnQ0FBWSxFQUFFLGdCQUFnQjtpQkFDakMsQ0FBQzthQUNMLENBQUM7U0FDTDs7QUFFRCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLG1CQUFPLENBQUMsQ0FDSixRQUFRLEVBQ1IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVMsS0FBSyxFQUFFO0FBQ3BDLHVCQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQ3pCLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUM1Qix3QkFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO0FBQ2YsdUJBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztpQkFDaEIsQ0FBQyxDQUNMLENBQUMsQ0FBQzthQUNOLENBQUMsQ0FDTCxDQUFDO1NBQ0w7S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ25CbkMsTUFBTSxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFO0FBQzFDLFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSTtnQkFDaEIsSUFBSSxHQUFHO0FBQ0gscUNBQXFCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtBQUM1QyxrQkFBRSxFQUFFLElBQUksQ0FBQyxPQUFPO0FBQ2hCLG9CQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVM7QUFDcEIscUJBQUssRUFBRSxJQUFJLENBQUMsS0FBSzthQUNwQixDQUFDOztBQUVSLGdCQUFNLGNBQWMsR0FBRyxDQUFDLENBQUMsd0NBQXdDLEVBQUUsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNuRyxtQkFBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUMsQ0FBQyxDQUFDO1NBQ2xGO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDOUJiLE1BQU0sQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDekMsV0FBTztBQUNILFlBQUksRUFBRSxjQUFTLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDN0IsbUJBQU8sQ0FBQyxDQUFDLDJCQUEyQixFQUFFLENBQ2xDLENBQUMsQ0FBQywwRUFBMEUsRUFBRSxJQUFJLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUN4RyxDQUFDLENBQUMsd0NBQXdDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLHFCQUFxQixDQUFDLENBQUMsRUFDeEcsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLENBQ3BCLGlCQUFpQixFQUNqQixDQUFDLENBQUMsOEVBQThFLEdBQUcsWUFBWSxDQUFDLFVBQVUsR0FBRyxJQUFJLEVBQUUsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUM5SSxDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7Ozs7Ozs7Ozs7OztBQ0h6QixNQUFNLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixHQUFJLENBQUMsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDbEQsV0FBTztBQUNILGtCQUFVLEVBQUUsb0JBQVMsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSTtnQkFDbkIsUUFBUSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUN4QixLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ3JCLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDcEIsSUFBSSxHQUFHLEVBQUU7Z0JBQ1QsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7O0FBRXJCLG1CQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxVQUFDLEdBQUcsRUFBSztBQUNyQyxvQkFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLHlCQUF5QixDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUN4RSx1QkFBRyxDQUFDLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQ2hIO2FBQ0osQ0FBQzs7QUFFRixnQkFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO2dCQUNsRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRTlELGdCQUFNLFVBQVUsR0FBRyxTQUFiLFVBQVUsQ0FBSSxJQUFJLEVBQUs7QUFDekIsc0JBQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUM3QixDQUFDOztBQUVGLGdCQUFNLFlBQVksR0FBRyxTQUFmLFlBQVksQ0FBSSxHQUFHLEVBQUs7QUFDMUIsd0JBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNmLHFCQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDZixDQUFDOztBQUVGLGdCQUFNLFVBQVUsR0FBRyxTQUFiLFVBQVUsQ0FBSSxHQUFHLEVBQUs7QUFDeEIsaUJBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLHdCQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDZixxQkFBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2hCLENBQUM7O0FBRUYsZ0JBQU0sTUFBTSxHQUFHLFNBQVQsTUFBTSxHQUFTO0FBQ2pCLGlCQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUN4Qyx1QkFBTyxLQUFLLENBQUM7YUFDaEIsQ0FBQzs7QUFFRixnQkFBTSxNQUFNLEdBQUcsU0FBVCxNQUFNLENBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUs7QUFDcEMsdUJBQU8sQ0FBQyxRQUFRLEdBQUcsWUFBVztBQUMxQiw0QkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hCLHlCQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ2hCLENBQUM7YUFDTCxDQUFDOztBQUVGLG1CQUFPO0FBQ0gsd0JBQVEsRUFBRSxRQUFRO0FBQ2xCLHFCQUFLLEVBQUUsS0FBSztBQUNaLGlCQUFDLEVBQUUsQ0FBQztBQUNKLHNCQUFNLEVBQUUsTUFBTTtBQUNkLHVCQUFPLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO0FBQ2xDLHNCQUFNLEVBQUUsTUFBTTthQUNqQixDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSTtnQkFDaEIsUUFBUSxHQUFHLEFBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFJLHVCQUF1QixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7O0FBRXhFLG1CQUFPLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUN2QixDQUFDLENBQUMsbUNBQW1DLEVBQUU7QUFDbkMsdUJBQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU07YUFDL0IsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQ3BDLENBQUMsQ0FBQyw2REFBNkQsRUFBRTtBQUM3RCxzQkFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2FBQ3RCLEVBQUUsQ0FDQyxDQUFDLENBQUMsYUFBYSxFQUFFO0FBQ2Isd0JBQVEsRUFBRSxJQUFJLENBQUMsTUFBTTthQUN4QixFQUFFLEFBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUksQ0FDcEIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQzNCLENBQUMsQ0FBQyxxREFBcUQsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQzdFLEdBQUcsQUFBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBSSxDQUNsQixDQUFDLENBQUMsc0NBQXNDLEVBQUUsQ0FDdEMsQ0FBQyxDQUFDLEdBQUcsRUFBRSwrQkFBK0IsQ0FBQyxDQUMxQyxDQUFDLENBQ0wsR0FBRyxDQUNBLENBQUMsQ0FBQyx1Q0FBdUMsRUFBRSxDQUN2QyxDQUFDLENBQUMsR0FBRyxFQUFFLGtDQUFrQyxDQUFDLENBQzdDLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxHQUFHLEVBQUUsQ0FDVixDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7QUMvRjlDLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDekMsV0FBTztBQUNILGtCQUFVLEVBQUUsc0JBQVc7QUFDbkIsbUJBQU87QUFDSCx1QkFBTyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQzthQUNyQyxDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYTtnQkFDbEMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJO2dCQUNoQixLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUN4QixJQUFJLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUU7QUFDOUIseUJBQVMsRUFBRSxZQUFZO2FBQzFCLENBQUMsQ0FBQzs7QUFFUCxtQkFBTyxDQUFDLENBQUMsbURBQW1ELEVBQUUsQ0FDMUQsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUNkLENBQUMsQ0FBQyxrREFBa0QsRUFBRSxLQUFLLENBQUMsRUFDNUQsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUNULENBQUMsQ0FBQyxNQUFNLEVBQUU7QUFDTix3QkFBUSxFQUFFLElBQUksQ0FBQyxNQUFNO2FBQ3hCLEVBQUUsQ0FDQyxBQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFO0FBQ3hCLHlCQUFTLEVBQUUsWUFBWTthQUMxQixDQUFDLEdBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQ3BELENBQUMsQ0FBQywwQkFBMEIsRUFDeEIsQ0FBQyxDQUFDLG9KQUFvSixFQUFFO0FBQ3BKLHVCQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNO2FBQy9CLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxFQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FDNUMsQ0FBQyxDQUFDLHNDQUFzQyxFQUFFLENBQ3RDLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFVBQVMsQ0FBQyxFQUFFO0FBQzdCLHVCQUFPLEFBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxZQUFZLEdBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7YUFDcEYsQ0FBQyxDQUNMLENBQUMsR0FBRyxFQUFFLENBRWQsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDekM3QyxNQUFNLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUMzQyxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBUyxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJO2dCQUNuQixRQUFRLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ3hCLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDckIsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUNwQixJQUFJLEdBQUcsRUFBRTtnQkFDVCxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUk7Z0JBQ2hCLEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUTtnQkFDdEIsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLElBQUksSUFBSTtnQkFDdkMsUUFBUSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWxDLGFBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzs7QUFFbkMsZ0JBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzs7QUFFM0YsZ0JBQUksVUFBVSxHQUFHLFNBQWIsVUFBVSxDQUFZLEdBQUcsRUFBRTtBQUMzQixpQkFBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkIsd0JBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNmLHFCQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDaEIsQ0FBQzs7QUFFRixnQkFBSSxNQUFNLEdBQUcsU0FBVCxNQUFNLEdBQWM7QUFDcEIsb0JBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLEVBQUUsQ0FBQztBQUN2QixpQkFBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsWUFBVztBQUNqQyw0QkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2YseUJBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDZixDQUFDLENBQUM7QUFDSCx1QkFBTyxLQUFLLENBQUM7YUFDaEIsQ0FBQzs7QUFFRixnQkFBSSxNQUFNLEdBQUcsU0FBVCxNQUFNLENBQVksRUFBRSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUU7QUFDdkMsdUJBQU8sQ0FBQyxRQUFRLEdBQUcsWUFBVztBQUMxQiw0QkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hCLHlCQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDYiw0QkFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUN4QixDQUFDO2FBQ0wsQ0FBQzs7QUFFRixtQkFBTztBQUNILHdCQUFRLEVBQUUsUUFBUTtBQUNsQixxQkFBSyxFQUFFLEtBQUs7QUFDWixpQkFBQyxFQUFFLENBQUM7QUFDSix3QkFBUSxFQUFFLFFBQVE7QUFDbEIsc0JBQU0sRUFBRSxNQUFNO0FBQ2QsdUJBQU8sRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7QUFDbEMsc0JBQU0sRUFBRSxNQUFNO2FBQ2pCLENBQUM7U0FDTDtBQUNELFlBQUksRUFBRSxjQUFTLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJO2dCQUNoQixRQUFRLEdBQUcsQUFBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUksdUJBQXVCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQzs7QUFFeEUsbUJBQU8sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ3ZCLENBQUMsQ0FBQyxtQ0FBbUMsRUFBRTtBQUNuQyx1QkFBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTTthQUMvQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxBQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FDcEMsQ0FBQyxDQUFDLDZEQUE2RCxFQUFFO0FBQzdELHNCQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07YUFDdEIsRUFBRSxDQUNDLENBQUMsQ0FBQyxhQUFhLEVBQUU7QUFDYix3QkFBUSxFQUFFLElBQUksQ0FBQyxNQUFNO2FBQ3hCLEVBQUUsQUFBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBSSxDQUNwQixDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxBQUFDLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxHQUMzRCxDQUFDLENBQUMscURBQXFELEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEVBQUU7QUFDL0Usd0JBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQzVDLHFCQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRTthQUN6QixDQUFDLEdBQUcsRUFBRSxFQUNQLENBQUMsQ0FBQyxxREFBcUQsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQzdFLEdBQUcsQUFBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBSSxDQUNsQixDQUFDLENBQUMsc0NBQXNDLEVBQUUsQ0FDdEMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQzlCLENBQUMsQ0FDTCxHQUFHLENBQ0EsQ0FBQyxDQUFDLHVDQUF1QyxFQUFFLENBQ3ZDLENBQUMsQ0FBQyxHQUFHLEVBQUUsbUNBQW1DLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUNsRSxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsR0FBRyxFQUFFLENBQ1YsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQ25GbkMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN2QyxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBUyxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRWpELG1CQUFPO0FBQ0gsZ0NBQWdCLEVBQUUsZ0JBQWdCO2FBQ3JDLENBQUM7U0FDTDs7QUFFRCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDOztBQUVyQixtQkFBTyxDQUFDLENBQUMsaUVBQWlFLEVBQUUsQ0FDeEUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ3ZCLG9CQUFJLEVBQUUsSUFBSTtBQUNWLG1CQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7YUFDaEIsQ0FBQyxFQUNGLENBQUMsQ0FBQywwRUFBMEUsRUFBRTtBQUMxRSx1QkFBTyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNO2FBQ3hDLENBQUMsRUFDRixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDbkQsb0JBQUksRUFBRSxJQUFJO0FBQ1YsbUJBQUcsRUFBRSxJQUFJLENBQUMsR0FBRzthQUNoQixDQUFDLEdBQUcsRUFBRSxDQUNWLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQzVCN0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3BDLFFBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDcEIsV0FBTztBQUNILGtCQUFVLEVBQUUsb0JBQVMsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQztBQUN4QixnQkFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUM3QyxvQkFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBUyxXQUFXLEVBQUU7QUFDOUMsd0JBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDdEMsQ0FBQyxDQUFDO2FBQ047U0FDSjs7QUFFRCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUk7Z0JBQ25CLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUs7Z0JBQ3JCLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztBQUM3QixtQkFBTyxDQUFDLENBQUMsb0JBQW9CLEVBQUUsQ0FDM0IsQ0FBQyxDQUFDLGNBQWMsRUFDWixLQUFLLEVBQUUsR0FDUCxDQUFDLENBQUMsMkNBQTJDLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUN0RCxDQUFDLENBQUMsMEJBQTBCLEVBQUUsQ0FDMUIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxnQkFBZ0IsRUFDZCxJQUFJLENBQUMsU0FBUyxFQUFFLG1CQUNGLEtBQUssQ0FBQyxXQUFXLEVBQUUsV0FBUSxDQUFDLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBTSxLQUFLLENBQUMsV0FBVyxFQUFFLGtCQUFlLENBQ2hJLENBQ0osQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsdUNBQXVDLEVBQUUsQ0FDdkMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFTLElBQUksRUFBRTtBQUNqQyx1QkFBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUU7QUFDNUIsNEJBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtBQUN2Qiw4QkFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO0FBQzNCLHdCQUFJLEVBQUUsSUFBSTtBQUNWLHVCQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUU7aUJBQ2YsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxFQUNGLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxDQUNwQixDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQyw2QkFBNkIsRUFBRSxDQUM3QixJQUFJLENBQUMsU0FBUyxFQUFFLEdBQ2hCLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FDVixDQUFDLENBQUMsOENBQThDLEVBQUU7QUFDOUMsdUJBQU8sRUFBRSxJQUFJLENBQUMsUUFBUTthQUN6QixFQUFFLGVBQWUsQ0FBQyxDQUN0QixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQ0osQ0FDSixDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7Ozs7Ozs7Ozs7OztBQzlDbkMsTUFBTSxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFLO0FBQ3RELFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFDLElBQUksRUFBSztBQUNsQixnQkFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQzVCLGdCQUFnQixHQUFHLFNBQW5CLGdCQUFnQixDQUFJLElBQUksRUFBSztBQUN6QixvQkFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN2Qyw0QkFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO0FBQ2hELDJCQUFPLEVBQUUsSUFBSTtBQUNiLDJCQUFPLEVBQUUsU0FBUztpQkFDckIsQ0FBQyxDQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQ2hCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUNkLEtBQUssQ0FBQztBQUNILDJCQUFPLEVBQUUsTUFBTTtpQkFDbEIsQ0FBQyxDQUNELFVBQVUsRUFBRSxDQUFDLENBQ2IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQ3hCLENBQUM7O0FBRU4sNEJBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUU1QixtQkFBTztBQUNILDZCQUFhLEVBQUUsYUFBYTthQUMvQixDQUFDO1NBQ0w7O0FBRUQsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFLO0FBQ1osbUJBQU8sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ3ZCLENBQUMsQ0FBQyw0RUFBNEUsRUFBRSwyQkFBMkIsQ0FBQyxFQUM1RyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUMsTUFBTSxFQUFLO0FBQ2pDLHVCQUFPLENBQUMsQ0FBQyx1REFBdUQsRUFBRSxDQUM5RCxDQUFDLENBQUMsaUJBQWlCLEVBQUUsQ0FDakIsQ0FBQyxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxFQUN4RSxLQUFLLEVBQUUsTUFBTSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsTUFBTSxHQUFHLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUM3RSxDQUFDLENBQ0wsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQUFBQyxDQUFDOzs7Ozs7Ozs7Ozs7QUN6Q3BELE1BQU0sQ0FBQyxDQUFDLENBQUMsdUJBQXVCLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFLO0FBQ2xELFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFDLElBQUksRUFBSztBQUNsQixnQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVE7Z0JBQ3ZCLGtCQUFrQixHQUFHLFNBQXJCLGtCQUFrQixHQUFTO0FBQ3ZCLG9CQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDMUIsVUFBVSxHQUFHO0FBQ1QsMEJBQU0sRUFBRTtBQUNKLGdDQUFRLEVBQUUsY0FBYztBQUN4Qiw0QkFBSSxFQUFFLE9BQU87cUJBQ2hCO0FBQ0QsOEJBQVUsRUFBRTtBQUNSLGdDQUFRLEVBQUUsY0FBYztBQUN4Qiw0QkFBSSxFQUFFLFlBQVk7cUJBQ3JCO0FBQ0QsMEJBQU0sRUFBRTtBQUNKLGdDQUFRLEVBQUUsWUFBWTtBQUN0Qiw0QkFBSSxFQUFFLGdCQUFnQjtxQkFDekI7QUFDRCxpQ0FBYSxFQUFFO0FBQ1gsZ0NBQVEsRUFBRSxjQUFjO0FBQ3hCLDRCQUFJLEVBQUUsWUFBWTtxQkFDckI7QUFDRCw0QkFBUSxFQUFFO0FBQ04sZ0NBQVEsRUFBRSxZQUFZO0FBQ3RCLDRCQUFJLEVBQUUsVUFBVTtxQkFDbkI7QUFDRCx5QkFBSyxFQUFFO0FBQ0gsZ0NBQVEsRUFBRSxFQUFFO0FBQ1osNEJBQUksRUFBRSxVQUFVO3FCQUNuQjtBQUNELCtCQUFXLEVBQUU7QUFDVCxnQ0FBUSxFQUFFLEVBQUU7QUFDWiw0QkFBSSxFQUFFLFlBQVk7cUJBQ3JCO0FBQ0QsNEJBQVEsRUFBRTtBQUNOLGdDQUFRLEVBQUUsY0FBYztBQUN4Qiw0QkFBSSxFQUFFLFVBQVU7cUJBQ25CO2lCQUNKLENBQUM7O0FBRU4sNkJBQWEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7O0FBRXpDLHVCQUFPLGFBQWEsQ0FBQzthQUN4QjtnQkFDRCxVQUFVLEdBQUcsU0FBYixVQUFVLEdBQVM7O0FBRWYsdUJBQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDdEcsQ0FBQztBQUNOLG1CQUFPO0FBQ0gsdUJBQU8sRUFBRSxPQUFPO0FBQ2hCLDZCQUFhLEVBQUUsa0JBQWtCLEVBQUU7QUFDbkMsZ0NBQWdCLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDO0FBQzFELDhCQUFjLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO0FBQ3RELDBCQUFVLEVBQUUsVUFBVTthQUN6QixDQUFDO1NBQ0w7O0FBRUQsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFLO0FBQ1osZ0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPO2dCQUN0QixRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRTtnQkFDcEMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQjtnQkFDeEMsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7O0FBRXpDLG1CQUFPLENBQUMsQ0FBQyxxRUFBcUUsRUFBRSxDQUM1RSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQ0wsQ0FBQyxDQUFDLHFDQUFxQyxFQUFFLENBQ3JDLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQzdDLENBQUMsQ0FBQyxNQUFNLEVBQUU7QUFDTix5QkFBTyxhQUFhLENBQUMsUUFBUTthQUNoQyxFQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxPQUFPLENBQUMsc0JBQXNCLEdBQUcsWUFBWSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUUsRUFBRSxHQUFHLENBQ3JHLENBQUMsRUFBRyxDQUFBLFlBQU07QUFDUCxvQkFBSSxPQUFPLENBQUMsWUFBWSxFQUFFO0FBQ3RCLDJCQUFPLENBQ0gsQ0FBQyxDQUFDLHlDQUF5QyxFQUFFLENBQ3pDLENBQUMsQ0FBQyxhQUFhLEVBQUU7QUFDYiw2QkFBSyxFQUFFO0FBQ0gsaUNBQUssRUFBRSxDQUFDLFFBQVEsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLFFBQVEsQ0FBQSxHQUFJLEdBQUc7eUJBQ2pEO3FCQUNKLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQywyQ0FBMkMsRUFBRSxDQUMzQyxDQUFDLENBQUMsd0RBQXdELEVBQUUsWUFBWSxDQUFDLEVBQ3pFLENBQUMsQ0FBQyxzREFBc0QsRUFBRSxRQUFRLEdBQUcsR0FBRyxDQUFDLENBQzVFLENBQUMsRUFDRixDQUFDLENBQUMsMkNBQTJDLEVBQUUsQ0FDM0MsQ0FBQyxDQUFDLHdEQUF3RCxFQUFFLFlBQVksQ0FBQyxFQUN6RSxDQUFDLENBQUMsc0RBQXNELEVBQUUsQ0FDdEQsS0FBSyxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FDN0MsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsMkNBQTJDLEVBQUUsQ0FDM0MsQ0FBQyxDQUFDLHdEQUF3RCxFQUFFLFFBQVEsQ0FBQyxFQUNyRSxDQUFDLENBQUMsc0RBQXNELEVBQUUsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQ3pGLENBQUMsRUFDRixDQUFDLENBQUMsMkNBQTJDLEVBQUUsQ0FDMUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FDNUIsQ0FBQyxDQUFDLHdEQUF3RCxFQUFFLGFBQWEsQ0FBQyxFQUMxRSxDQUFDLENBQUMsc0RBQXNELEVBQUUsY0FBYyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUM5RyxHQUFHLENBQ0MsQ0FBQyxDQUFDLHdEQUF3RCxFQUFFLFFBQVEsQ0FBQyxFQUNyRSxDQUFDLENBQUMsc0RBQXNELEVBQUUsZ0JBQWdCLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FDbEgsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUM7aUJBQ0w7QUFDRCx1QkFBTyxFQUFFLENBQUM7YUFDYixDQUFBLEVBQUUsQ0FDTixDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxBQUFDLENBQUM7OztBQzVIeEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxZQUFZLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDcEMsV0FBTztBQUNILFlBQUksRUFBRSxjQUFTLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDeEIsbUJBQU8sQ0FBQyxDQUFDLHNCQUFzQixFQUFFLENBQzdCLENBQUMsQ0FBQyxnREFBZ0QsRUFBRSxDQUNoRCxDQUFDLENBQUMsaUNBQWlDLEdBQUcsT0FBTyxDQUFDLFdBQVcsR0FBRyxhQUFhLENBQUMsQ0FDN0UsQ0FBQyxFQUNGLENBQUMsQ0FBQyw4QkFBOEIsRUFBRSxDQUM5QixDQUFDLENBQUMsNEVBQTRFLEVBQUUsQ0FDNUUsQ0FBQyxDQUFDLHFDQUFxQyxHQUFHLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FDNUYsQ0FBQyxFQUNGLENBQUMsQ0FBQyx3Q0FBd0MsRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQ2xFLENBQUMsQ0FBQyx3Q0FBd0MsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQzFJLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQ2xCekIsTUFBTSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzlDLFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFTLElBQUksRUFBRTtBQUN2QixnQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUk7Z0JBQ25CLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDeEIsSUFBSSxHQUFHLEVBQUU7OztBQUVULGlCQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ3JCLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDcEIsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2xCLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDO2dCQUM1QyxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU07Z0JBQ3BCLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDbEIsU0FBUyxHQUFHLEVBQUU7Z0JBQ2QsU0FBUyxHQUFHLEVBQUU7Z0JBQ2QsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUU7Z0JBQ2pCLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTTtnQkFDeEIsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNO2dCQUN2QixXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVc7Z0JBQzlCLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUztnQkFDN0IsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjO2dCQUNwQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVE7Z0JBQzNCLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7QUFFcEQscUJBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDNUIsZ0JBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzdDLGlCQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7O0FBRWpDLHFCQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLGdCQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3QyxpQkFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUUzQixnQkFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFakcsZ0JBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUV4RyxnQkFBSSxVQUFVLEdBQUcsU0FBYixVQUFVLENBQVksSUFBSSxFQUFFO0FBQzVCLG9CQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ2pCLHdCQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxFQUFFO0FBQ2xDLDBCQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7cUJBQ2pDLENBQUMsQ0FBQztBQUNILGdDQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQ3pCLE1BQU07QUFDSCx5QkFBSyxDQUFDO0FBQ0YsK0JBQU8sRUFBRSx3QkFBd0I7cUJBQ3BDLENBQUMsQ0FBQztpQkFDTjtBQUNELHdCQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDbEIsQ0FBQzs7QUFFRixnQkFBTSxLQUFLLEdBQUcsU0FBUixLQUFLLEdBQWM7QUFDckIseUJBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3hDLENBQUM7O0FBRUYsZ0JBQUksTUFBTSxHQUFHLFNBQVQsTUFBTSxHQUFjO0FBQ3BCLG9CQUFJLEtBQUssRUFBRSxFQUFFO0FBQ1Qsd0JBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQzdDLHdCQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDM0IsNEJBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUM7QUFDbEMsaUNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO3FCQUM1QyxNQUFNO0FBQ0gsZ0NBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNmLDZCQUFLLENBQUM7QUFDRixtQ0FBTyxFQUFFLFVBQVU7eUJBQ3RCLENBQUMsQ0FBQztxQkFDTjtpQkFDSjtBQUNELHVCQUFPLEtBQUssQ0FBQzthQUNoQixDQUFDOztBQUVGLGdCQUFJLE1BQU0sR0FBRyxTQUFULE1BQU0sQ0FBWSxFQUFFLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRTtBQUN2Qyx1QkFBTyxDQUFDLFFBQVEsR0FBRyxZQUFXO0FBQzFCLDRCQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEIseUJBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNiLHlCQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ2IsQ0FBQzthQUNMLENBQUM7O0FBRUYsZ0JBQUksY0FBYyxHQUFHLFNBQWpCLGNBQWMsQ0FBWSxJQUFJLEVBQUU7QUFDaEMsMkJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsQixpQkFBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQ2QsQ0FBQzs7QUFFRixpQkFBSyxFQUFFLENBQUM7O0FBRVIsbUJBQU87QUFDSCx3QkFBUSxFQUFFLFFBQVE7QUFDbEIsMkJBQVcsRUFBRSxXQUFXO0FBQ3hCLDhCQUFjLEVBQUUsY0FBYztBQUM5QixxQkFBSyxFQUFFLEtBQUs7QUFDWix5QkFBUyxFQUFFLFNBQVM7QUFDcEIseUJBQVMsRUFBRSxTQUFTO0FBQ3BCLHFCQUFLLEVBQUUsS0FBSztBQUNaLHNCQUFNLEVBQUUsTUFBTTtBQUNkLHVCQUFPLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO0FBQ2xDLHNCQUFNLEVBQUUsTUFBTTtBQUNkLHNCQUFNLEVBQUUsTUFBTTthQUNqQixDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSTtnQkFDaEIsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2xCLFFBQVEsR0FBRyxBQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUksdUJBQXVCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQzs7QUFFcEcsbUJBQU8sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ3ZCLENBQUMsQ0FBQyxtQ0FBbUMsRUFBRTtBQUNuQyx1QkFBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTTthQUMvQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxBQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FDcEMsQ0FBQyxDQUFDLDZEQUE2RCxFQUFFO0FBQzdELHNCQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07YUFDdEIsRUFBRSxDQUNDLENBQUMsQ0FBQyxhQUFhLEVBQUU7QUFDYix3QkFBUSxFQUFFLElBQUksQ0FBQyxNQUFNO2FBQ3hCLEVBQUUsQUFBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBSSxDQUNwQixBQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FDZCxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxVQUFTLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDeEMsb0JBQUksR0FBRyxHQUFHLFNBQU4sR0FBRyxHQUFjO0FBQ2pCLHdCQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNyQix3QkFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7aUJBQzFDLENBQUM7QUFDRixvQkFBSSxRQUFRLEdBQUcsQUFBQyxLQUFLLENBQUMsRUFBRSxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQSxBQUFDLEdBQUksSUFBSSxHQUFHLEtBQUssQ0FBQzs7QUFFL0UsdUJBQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUNqQixDQUFDLENBQUMsVUFBVSxHQUFHLEtBQUssR0FBRyx3REFBd0QsR0FBRyxLQUFLLENBQUMsRUFBRSxHQUFHLElBQUksSUFBSSxBQUFDLFFBQVEsR0FBSSxXQUFXLEdBQUcsRUFBRSxDQUFBLEFBQUMsRUFBRTtBQUNqSSwyQkFBTyxFQUFFLEdBQUc7aUJBQ2YsQ0FBQyxFQUNGLENBQUMsQ0FBQyw0QkFBNEIsR0FBRyxLQUFLLEdBQUcsSUFBSSxFQUFFLElBQUksR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQzdFLENBQUMsQ0FBQzthQUNOLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQ2YsQ0FBQyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFDeEIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsRUFDMUIsQ0FBQyxDQUFDLHFEQUFxRCxHQUFHLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FDN0UsR0FBRyxBQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFJLENBQ2xCLENBQUMsQ0FBQyxzQ0FBc0MsRUFBRSxDQUN0QyxDQUFDLENBQUMsR0FBRyxFQUFFLGtDQUFrQyxDQUFDLENBQzdDLENBQUMsQ0FDTCxHQUFHLENBQ0EsQ0FBQyxDQUFDLHVDQUF1QyxFQUFFLENBQ3ZDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUMvQixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsR0FBRyxFQUFFLENBQ1YsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7Ozs7Ozs7Ozs7OztBQ3ZJN0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsR0FBSSxDQUFDLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2pELFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFTLElBQUksRUFBRTtBQUN2QixnQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUk7Z0JBQ25CLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDeEIsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUNyQixJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ3BCLEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUTtnQkFDdEIsSUFBSSxHQUFHLEVBQUU7Z0JBQ1QsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7O0FBRXJCLG1CQUFPLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxVQUFDLEdBQUcsRUFBSztBQUNyQyxvQkFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLHlCQUF5QixDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtBQUN4RSx1QkFBRyxDQUFDLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQ2hIO2FBQ0osQ0FBQzs7QUFFRixnQkFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFDLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUM7Z0JBQ3ZGLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDeEIsYUFBYSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRS9CLGdCQUFNLFlBQVksR0FBRyxTQUFmLFlBQVksQ0FBSSxHQUFHLEVBQUs7QUFDMUIsNkJBQWEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0Isd0JBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNmLHFCQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDZixDQUFDO0FBQ0YsZ0JBQU0sVUFBVSxHQUFHLFNBQWIsVUFBVSxDQUFJLEdBQUcsRUFBSztBQUN4QixpQkFBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkIsd0JBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNmLHFCQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDaEIsQ0FBQzs7QUFFRixnQkFBTSxNQUFNLEdBQUcsU0FBVCxNQUFNLEdBQVM7QUFDakIsb0JBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxXQUFXLEVBQUUsQ0FBQztBQUMxQixpQkFBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDeEMsdUJBQU8sS0FBSyxDQUFDO2FBQ2hCLENBQUM7O0FBRUYsZ0JBQU0sTUFBTSxHQUFHLFNBQVQsTUFBTSxDQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFLO0FBQ3BDLHVCQUFPLENBQUMsUUFBUSxHQUFHLFlBQVc7QUFDMUIsNEJBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoQix5QkFBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNoQixDQUFDO2FBQ0wsQ0FBQzs7QUFFRixtQkFBTztBQUNILHdCQUFRLEVBQUUsUUFBUTtBQUNsQixxQkFBSyxFQUFFLEtBQUs7QUFDWiw2QkFBYSxFQUFFLGFBQWE7QUFDNUIsaUJBQUMsRUFBRSxDQUFDO0FBQ0osMkJBQVcsRUFBRSxXQUFXO0FBQ3hCLHNCQUFNLEVBQUUsTUFBTTtBQUNkLHVCQUFPLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO0FBQ2xDLHNCQUFNLEVBQUUsTUFBTTthQUNqQixDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSTtnQkFDaEIsUUFBUSxHQUFHLEFBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFJLHVCQUF1QixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7O0FBRXhFLG1CQUFPLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUN2QixDQUFDLENBQUMsbUNBQW1DLEVBQUU7QUFDbkMsdUJBQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU07YUFDL0IsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQ3BDLENBQUMsQ0FBQyw2REFBNkQsRUFBRTtBQUM3RCxzQkFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2FBQ3RCLEVBQUUsQ0FDQyxDQUFDLENBQUMsYUFBYSxFQUFFO0FBQ2Isd0JBQVEsRUFBRSxJQUFJLENBQUMsTUFBTTthQUN4QixFQUFFLEFBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUksQ0FDcEIsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQzNCLENBQUMsQ0FBQyw4Q0FBOEMsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLGtCQUFrQixHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxFQUFFO0FBQzdHLHdCQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUMvQyxxQkFBSyxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUU7YUFDNUIsQ0FBQyxFQUNGLENBQUMsQ0FBQyxxREFBcUQsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQzdFLEdBQUcsQUFBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBSSxDQUNsQixDQUFDLENBQUMsc0NBQXNDLEVBQUUsQ0FDdEMsQ0FBQyxDQUFDLEdBQUcsRUFBRSw2QkFBNkIsQ0FBQyxDQUN4QyxDQUFDLENBQ0wsR0FBRyxDQUNBLENBQUMsQ0FBQyx1Q0FBdUMsRUFBRSxDQUN2QyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUMvQixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsR0FBRyxFQUFFLENBQ1YsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDbkc5QyxNQUFNLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3pDLFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUN4QixTQUFTLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0FBRXJGLG1CQUFPLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUN2QixDQUFDLENBQUMsNEVBQTRFLEVBQUUsWUFBWSxDQUFDLEVBQzdGLENBQUMsQ0FBQyxzQ0FBc0MsRUFBRSxNQUFNLENBQUMsRUFBRSxHQUFHLENBQ2xELE1BQU0sR0FBRyxNQUFNLENBQUMsRUFBRSxFQUNsQixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ1Asa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDL0QsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUNQLENBQUMsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLFNBQVMsR0FBRyxLQUFLLElBQUksTUFBTSxDQUFDLHFCQUFxQixJQUFJLFNBQVMsQ0FBQSxBQUFDLENBQUMsRUFDMUYsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUNQLDBCQUEwQixHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsRUFDekQsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUNQLGFBQWEsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUNyQyxHQUFHLHNCQUFzQixDQUFDLENBQzlCLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQ3RCN0MsTUFBTSxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDbEQsV0FBTztBQUNILGtCQUFVLEVBQUUsb0JBQVMsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWTtnQkFDaEMsU0FBUyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsQixvQkFBSSxFQUFFLFlBQVksQ0FBQyxPQUFPO0FBQzFCLG9CQUFJLEVBQUUsa0JBQWtCO2FBQzNCLEVBQUU7QUFDQyxvQkFBSSxFQUFFLFlBQVksQ0FBQyxpQkFBaUI7QUFDcEMsb0JBQUksRUFBRSxzQkFBc0I7YUFDL0IsRUFBRTtBQUNDLG9CQUFJLEVBQUUsWUFBWSxDQUFDLFdBQVc7QUFDOUIsb0JBQUksRUFBRSxtQkFBbUI7YUFDNUIsRUFBRTtBQUNDLG9CQUFJLEVBQUUsWUFBWSxDQUFDLFVBQVU7QUFDN0Isb0JBQUksRUFBRSxjQUFjO2FBQ3ZCLEVBQUU7QUFDQyxvQkFBSSxFQUFFLFlBQVksQ0FBQyxVQUFVO0FBQzdCLG9CQUFJLEVBQUUsaUJBQWlCO2FBQzFCLEVBQUU7QUFDQyxvQkFBSSxFQUFFLFlBQVksQ0FBQyxVQUFVO0FBQzdCLG9CQUFJLEVBQUUsZ0JBQWdCO2FBQ3pCLEVBQUU7QUFDQyxvQkFBSSxFQUFFLFlBQVksQ0FBQyxhQUFhO0FBQ2hDLG9CQUFJLEVBQUUsWUFBWTthQUNyQixDQUFDLEVBQUUsVUFBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3JCLG9CQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO0FBQy9DLHdCQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDOUIsd0JBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLG1CQUFtQixDQUFDLENBQUM7QUFDeEQsMkJBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDNUI7O0FBRUQsdUJBQU8sSUFBSSxDQUFDO2FBQ2YsRUFBRSxFQUFFLENBQUMsQ0FBQzs7QUFFWCxtQkFBTztBQUNILDZCQUFhLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDO2FBQ3JELENBQUM7U0FDTDs7QUFFRCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUU7QUFDakIsbUJBQU8sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ3ZCLENBQUMsQ0FBQyw0RUFBNEUsRUFBRSx3QkFBd0IsQ0FBQyxFQUN6RyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFTLE1BQU0sRUFBRTtBQUNwQyx1QkFBTyxDQUFDLENBQUMsdURBQXVELEVBQUUsQ0FDOUQsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxzQkFBc0IsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQ3pDLENBQUMsRUFDRixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQ3hCLENBQUMsQ0FDTCxDQUFDLENBQUM7YUFDTixDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQ3hEbkMsTUFBTSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN4QyxXQUFPO0FBQ0gsWUFBSSxFQUFFLGNBQVMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUN2QixnQkFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUNyQyxtQkFBTyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDdkIsQ0FBQyxDQUFDLDRFQUE0RSxFQUFFLG1CQUFtQixDQUFDLEVBQ3BHLENBQUMsQ0FBQyxzQ0FBc0MsRUFBRSxDQUN0QyxXQUFXLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDdEQsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUNQLFVBQVUsR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUMzRCxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ1AsMEJBQTBCLElBQUksWUFBWSxDQUFDLGVBQWUsR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFBLEFBQUMsRUFDM0UsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUNQLFdBQVcsSUFBSSxZQUFZLENBQUMsU0FBUyxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUEsQUFBQyxFQUN0RCxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ1AsZ0JBQWdCLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFDMUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUNQLFNBQVMsR0FBRyxZQUFZLENBQUMsZUFBZSxFQUN4QyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ1AsV0FBVyxFQUNYLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFDUCxZQUFZLENBQUMsR0FBRyxFQUNoQixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQ1AsUUFBUSxHQUFHLFlBQVksQ0FBQyxPQUFPLEVBQy9CLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFDUCxhQUFhLElBQUksWUFBWSxDQUFDLFlBQVksSUFBSSxZQUFZLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQSxBQUFDLEVBQ3RGLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRyxDQUFBLFlBQVc7QUFDakIsb0JBQUksWUFBWSxDQUFDLGNBQWMsRUFBRTtBQUM3QiwyQkFBTyxDQUFDLENBQUMsQ0FBQyx5QkFBeUIsRUFBRSxpQkFBaUIsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7aUJBQzVGO2FBQ0osQ0FBQSxFQUFFLENBQ04sQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7Ozs7Ozs7Ozs7OztBQ3pCekIsTUFBTSxDQUFDLENBQUMsQ0FBQyxlQUFlLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDO0FBQ3pDLFdBQU87QUFDSCxrQkFBVSxFQUFFLHNCQUFVO0FBQ2xCLG1CQUFPO0FBQ0gsdUJBQU8sRUFBRTtBQUNMLHlCQUFLLEVBQUU7QUFDSCxnQ0FBUSxFQUFFLFVBQVU7QUFDcEIsb0NBQVksRUFBRSxXQUFXO0FBQ3pCLGtDQUFVLEVBQUUsd0JBQXdCO0FBQ3BDLGtDQUFVLEVBQUUsaUJBQWlCO0FBQzdCLG1DQUFXLEVBQUUsY0FBYztBQUMzQiw2QkFBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSTtxQkFDdkI7QUFDRCw4QkFBVSxFQUFFO0FBQ1IsZ0NBQVEsRUFBRSxnQkFBZ0I7QUFDMUIsaUNBQVMsRUFBRSxJQUFJO0FBQ2Ysb0NBQVksRUFBRSxVQUFVO0FBQ3hCLGtDQUFVLEVBQUUsK0NBQStDO0FBQzNELHNDQUFjLEVBQUUsZ0NBQWdDO0FBQ2hELG9DQUFZLEVBQUUsbUNBQW1DO0FBQ2pELGtDQUFVLEVBQUUsa0JBQWtCO0FBQzlCLGtDQUFVLEVBQUUsSUFBSTtBQUNoQiw2QkFBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSTtxQkFDdkI7aUJBQ0o7YUFDSixDQUFDO1NBQ0w7O0FBRUQsWUFBSSxFQUFFLGNBQVMsSUFBSSxFQUFFLElBQUksRUFBQztBQUN0QixnQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU87Z0JBQ3RCLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSTtnQkFDaEIsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7O0FBRTNCLGdCQUFNLFVBQVUsR0FBRyxTQUFiLFVBQVUsQ0FBSSxPQUFPLEVBQUUsRUFBRSxFQUFLO0FBQ2hDLHVCQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRTtBQUN6QixrQ0FBYyxFQUFFO0FBQ1osMkJBQUcsY0FBYSxFQUFFLGtCQUFnQjtBQUNsQyw4QkFBTSxFQUFFLE1BQU07cUJBQ2pCO2lCQUNKLENBQUMsQ0FBQzthQUNOLENBQUM7O0FBRUYsbUJBQU8sQ0FBQyxDQUFDLGdDQUFnQyxFQUFFLENBQ3ZDLENBQUMsQ0FBQywyQ0FBMkMsQ0FBQyxFQUM5QyxDQUFDLENBQUMsMEJBQTBCLEVBQUUsQ0FDMUIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLEVBQUU7QUFDOUIsb0JBQUksRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ3hDLG9CQUFJLEVBQUUsSUFBSTthQUNiLENBQUMsRUFDRixBQUFDLElBQUksQ0FBQyxjQUFjLEdBQ2hCLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLEVBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDLEdBQUcsRUFBRSxDQUNuRixDQUFDLEVBQ0YsQ0FBQyxDQUFDLG9DQUFvQyxFQUFFLENBQ3BDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixFQUFFO0FBQ3BDLG9CQUFJLEVBQUUsSUFBSTthQUNiLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDdEVqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGFBQWEsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDeEMsV0FBTztBQUNILFlBQUksRUFBRSxjQUFTLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDdkIsbUJBQU8sQ0FBQyxDQUNKLFFBQVEsRUFBRSxDQUNOLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQ2pDLENBQUMsQ0FDTCxDQUNKLENBQUM7U0FDTDtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDWm5DLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2pDLFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3JCLG1CQUFPLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUMxQixDQUFDLENBQUMsZ0RBQWdELEVBQUUsQ0FDaEQsQ0FBQyxDQUFDLHVCQUF1QixHQUFHLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FDdkYsQ0FBQyxFQUNGLENBQUMsQ0FBQyw4QkFBOEIsRUFBRSxDQUM5QixDQUFDLENBQUMsNEVBQTRFLEVBQUUsQ0FDNUUsQ0FBQyxDQUFDLDJDQUEyQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUNoRyxDQUFDLEVBQ0YsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLFdBQVcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQzlDLENBQUMsQ0FBQyx3Q0FBd0MsRUFBRSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUNuRSxJQUFJLENBQUMsZUFBZSxDQUN2QixDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7Ozs7Ozs7Ozs7QUNWekIsTUFBTSxDQUFDLENBQUMsQ0FBQyxpQ0FBaUMsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN6RCxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBUyxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksV0FBVyxHQUFHLFNBQWQsV0FBVyxDQUFZLFFBQVEsRUFBRTtBQUNqQyxvQkFBSSxTQUFTLEdBQUc7QUFDWiwwQkFBTSxFQUFFLENBQ0osQ0FBQyxDQUFDLE1BQU0sRUFBRSxtREFBbUQsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsR0FBRyx1R0FBdUcsQ0FBQyxDQUNuTjtBQUNELDhCQUFVLEVBQUUsQ0FDUixDQUFDLENBQUMsMEJBQTBCLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsNkJBQTZCLENBQUMsRUFDakYsOEdBQThHLEVBQzlHLDhHQUE4RyxFQUM5RyxDQUFDLENBQUMsNEJBQTRCLEVBQUUsdUJBQXVCLENBQUMsRUFDeEQsMEJBQTBCLEVBQUUsQ0FBQyxDQUFDLGtKQUFrSixFQUFFLHdDQUF3QyxDQUFDLENBQzlOO0FBQ0QsaUNBQWEsRUFBRSxDQUNYLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyw4Q0FBOEMsQ0FBQyxFQUNsRyxpQ0FBaUMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsR0FBRywwREFBMEQsRUFDdEksbUxBQW1MLEVBQ25MLENBQUMsQ0FBQyxrSkFBa0osRUFBRSx5RUFBeUUsQ0FBQyxDQUNuTztBQUNELDBCQUFNLEVBQUUsQ0FDSixDQUFDLENBQUMsMEJBQTBCLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsaUJBQWlCLENBQUMsRUFDckUsbUdBQW1HLEVBQ25HLCtKQUErSixFQUMvSixDQUFDLENBQUMsMElBQTBJLEVBQUUsNkNBQTZDLENBQUMsQ0FDL0w7QUFDRCw0QkFBUSxFQUFFLENBQ04sQ0FBQyxDQUFDLDBCQUEwQixFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLG1DQUFtQyxDQUFDLEVBQ3ZGLGlIQUFpSCxFQUNqSCxrSEFBa0gsRUFDbEgsOEVBQThFLEVBQzlFLENBQUMsQ0FBQyx5SUFBeUksRUFBRSx5QkFBeUIsQ0FBQyxFQUN2SyxRQUFRLEVBQ1IsQ0FBQyxDQUFDLDRCQUE0QixFQUFFLHVCQUF1QixDQUFDLEVBQUUsR0FBRyxDQUNoRTtBQUNELHlCQUFLLEVBQUUsQ0FDSCxDQUFDLENBQUMsMEJBQTBCLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsMkJBQTJCLENBQUMsRUFDL0UsaUlBQWlJLEVBQ2pJLHFMQUFxTCxFQUNyTCx3R0FBd0csQ0FDM0c7QUFDRCwrQkFBVyxFQUFFLENBQ1QsQ0FBQyxDQUFDLDBCQUEwQixFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLDRDQUE0QyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsK0RBQStELENBQUMsRUFDOU0sK0VBQStFLEVBQy9FLG1IQUFtSCxDQUN0SDtBQUNELDRCQUFRLEVBQUUsQ0FDTixDQUFDLENBQUMsMEJBQTBCLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsNkJBQTZCLENBQUMsRUFDakYsbUdBQW1HLEVBQ25HLENBQUMsQ0FBQyxtQ0FBbUMsRUFBRSxPQUFPLENBQUMsRUFDL0MsdUhBQXVILEVBQ3ZILENBQUMsQ0FBQyxrSkFBa0osRUFBRSxxQ0FBcUMsQ0FBQyxDQUMvTDtpQkFDSixDQUFDOztBQUVGLHVCQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDcEMsQ0FBQzs7QUFFRixtQkFBTztBQUNILDJCQUFXLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDMUMsQ0FBQztTQUNMO0FBQ0QsWUFBSSxFQUFFLGNBQVMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUN2QixtQkFBTyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLCtDQUErQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUM1RztLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDOUR6QixNQUFNLENBQUMsQ0FBQyxDQUFDLGNBQWMsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUNqQyxXQUFPO0FBQ0gsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFFLElBQUksRUFBSztBQUNsQixnQkFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMvQixtQkFBTyxDQUFDLENBQUMsMkNBQTJDLEVBQUUsQ0FDbEQsQ0FBQyxvQ0FBaUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxHQUFHLGNBQWMsR0FBRyxFQUFFLENBQUEsZ0NBQTBCLFFBQVEsQ0FBQyxFQUFFLFVBQ3BILENBQ0ksQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUNMLFFBQVEsQ0FBQyxJQUFJLEVBQ2IsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FDcEQsQ0FBQyxDQUNMLENBQUMsQ0FDUCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUNsQnZCLE1BQU0sQ0FBQyxDQUFDLENBQUMsWUFBWSxHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQy9CLFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSztnQkFDbEIsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDdkIsbUJBQU8sQ0FBQyxDQUFDLDJDQUEyQyxFQUFFLENBQ2xELENBQUMsNENBQXlDLEtBQUssQ0FBQyxNQUFNLEdBQUcsRUFBRSxHQUFHLGNBQWMsR0FBRyxFQUFFLENBQUEsaUJBQVcsSUFBSSxVQUFNLENBQ2xHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FDTCxLQUFLLENBQ1IsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDekJ2QixNQUFNLENBQUMsQ0FBQyxDQUFDLGVBQWUsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFO0FBQ3BDLFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLG1CQUFPLENBQUMsQ0FBQyw4QkFBOEIsRUFBRSxDQUNyQyxDQUFDLENBQUMsOEJBQThCLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUNqRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLDJDQUEyQyxFQUFFLENBQzNDLENBQUMsQ0FBQyx3Q0FBd0MsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLGlCQUFpQixFQUFFO0FBQ3pFLHdCQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN6QyxxQkFBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUU7YUFDdEIsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsMkNBQTJDLEVBQUUsQ0FDM0MsQ0FBQyxDQUFDLG1EQUFtRCxFQUFFLEdBQUcsQ0FBQyxDQUM5RCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLDJDQUEyQyxFQUFFLENBQzNDLENBQUMsQ0FBQyxnREFBZ0QsRUFBRTtBQUNoRCx3QkFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDeEMscUJBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFO2FBQ3JCLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDekJiLE1BQU0sQ0FBQyxDQUFDLENBQUMsY0FBYyxHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3RDLFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLG1CQUFPLENBQUMsQ0FBQyw4QkFBOEIsRUFBRSxDQUNyQyxDQUFDLENBQUMsOEJBQThCLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUNqRSxDQUFDLENBQUMsMENBQTBDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQUU7QUFDOUQsd0JBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ3RDLHFCQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRTthQUNuQixFQUFFLENBQ0MsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVMsSUFBSSxFQUFFO0FBQy9CLHVCQUFPLENBQUMsQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDL0QsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDaEJ2QixNQUFNLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFO0FBQy9CLFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3ZCLG1CQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDZixDQUFDLENBQUMsaUJBQWlCLEVBQUUsQ0FDakIsQ0FBQyxDQUFDLHdEQUF3RCxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsaUJBQWlCLEVBQUU7QUFDL0Ysd0JBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ3RDLHFCQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRTthQUNuQixDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsaUZBQWlGLENBQUMsQ0FDdkYsQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDaEJiLE1BQU0sQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRTtBQUN0QyxXQUFPO0FBQ0gsWUFBSSxFQUFFLGNBQVMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUN2QixtQkFBTyxDQUFDLENBQUMsOEJBQThCLEVBQUUsQ0FDckMsQ0FBQyxDQUFDLDhCQUE4QixHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFDakUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQywyQ0FBMkMsRUFBRSxDQUMzQyxDQUFDLENBQUMsd0NBQXdDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxpQkFBaUIsRUFBRTtBQUN6RSx3QkFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDekMscUJBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFO2FBQ3RCLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLDJDQUEyQyxFQUFFLENBQzNDLENBQUMsQ0FBQyxtREFBbUQsRUFBRSxHQUFHLENBQUMsQ0FDOUQsQ0FBQyxFQUNGLENBQUMsQ0FBQywyQ0FBMkMsRUFBRSxDQUMzQyxDQUFDLENBQUMsZ0RBQWdELEVBQUU7QUFDaEQsd0JBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3hDLHFCQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRTthQUNyQixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7Ozs7Ozs7Ozs7OztBQ2hCYixNQUFNLENBQUMsQ0FBQyxDQUFDLGtDQUFrQyxHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUN4RCxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBQyxJQUFJLEVBQUs7QUFDbEIsZ0JBQUksV0FBVyxHQUFHLFNBQWQsV0FBVyxDQUFJLFFBQVEsRUFBSztBQUM1QixvQkFBSSxTQUFTLEdBQUc7QUFDWiwwQkFBTSxFQUFFLENBQ0gsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQzdCLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FDTixDQUFDLENBQUMsNkJBQTZCLEdBQUcsUUFBUSxDQUFDLEVBQUUsR0FBRyw2QkFBNkIsRUFBRSxlQUFlLENBQUMsRUFDL0YseUJBQXlCLENBQzVCLENBQUMsR0FDQSxDQUFDLENBQUMsTUFBTSw2Q0FBMkMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLFVBQVUsQ0FBQyxZQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFHLENBQ3pKO0FBQ0QsOEJBQVUsRUFBRSxDQUNSLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyw2QkFBNkIsQ0FBQyxFQUNqRiw4R0FBOEcsRUFDOUcsOEdBQThHLEVBQzlHLENBQUMsQ0FBQyw0QkFBNEIsRUFBRSx1QkFBdUIsQ0FBQyxFQUN4RCwwQkFBMEIsRUFBRSxDQUFDLENBQUMsa0pBQWtKLEVBQUUsd0NBQXdDLENBQUMsQ0FDOU47QUFDRCxpQ0FBYSxFQUFFLENBQ1gsQ0FBQyxDQUFDLDBCQUEwQixFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLDhDQUE4QyxDQUFDLEVBQ2xHLGlDQUFpQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxHQUFHLDBEQUEwRCxFQUN0SSxtTEFBbUwsRUFDbkwsQ0FBQyxDQUFDLGtKQUFrSixFQUFFLHlFQUF5RSxDQUFDLENBQ25PO0FBQ0QsNEJBQVEsRUFBRSxDQUNOLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxtQ0FBbUMsQ0FBQyxFQUN2RixpSEFBaUgsRUFDakgsa0hBQWtILEVBQ2xILDhFQUE4RSxFQUM5RSxDQUFDLENBQUMseUlBQXlJLEVBQUUseUJBQXlCLENBQUMsRUFDdkssUUFBUSxFQUNSLENBQUMsQ0FBQyw0QkFBNEIsRUFBRSx1QkFBdUIsQ0FBQyxFQUFFLEdBQUcsQ0FDaEU7QUFDRCx5QkFBSyxFQUFFLENBQ0gsQ0FBQyxDQUFDLDBCQUEwQixFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLDJCQUEyQixDQUFDLEVBQy9FLGlJQUFpSSxFQUNqSSxxTEFBcUwsRUFDckwsdURBQXVELENBQzFEO2lCQUNKLENBQUM7O0FBRUYsdUJBQU8sU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNwQyxDQUFDOztBQUVGLG1CQUFPO0FBQ0gsMkJBQVcsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQzthQUMxQyxDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLG1CQUFPLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsK0NBQStDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQzVHO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztBQ2pEbkMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDakMsV0FBTztBQUNILGtCQUFVLEVBQUUsb0JBQUMsSUFBSSxFQUFLO0FBQ2xCLG1CQUFPO0FBQ0gsMEJBQVUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7YUFDeEMsQ0FBQztTQUNMO0FBQ0QsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFFLElBQUksRUFBSztBQUNsQixtQkFBTyxDQUFDLENBQUMsdURBQXVELEVBQUU7QUFDOUQsdUJBQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU07YUFDbEMsRUFBQyxDQUNFLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQ2xDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUMsaUNBQWlDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FDN0UsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDZHpCLE1BQU0sQ0FBQyxDQUFDLENBQUMsYUFBYSxHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3JDLFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFDLElBQUksRUFBSztBQUNsQixnQkFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU87Z0JBQ3hCLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDbEIsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUNyQixNQUFNLEdBQUcsU0FBVCxNQUFNLEdBQVM7QUFDWCxvQkFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUM7QUFDekIsMkJBQU8sSUFBSSxDQUFDO2lCQUNmLE1BQU07QUFDSCx5QkFBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ1osMkJBQU8sS0FBSyxDQUFDO2lCQUNoQjthQUNKLENBQUM7QUFDTixtQkFBTztBQUNILHFCQUFLLEVBQUUsS0FBSztBQUNaLHNCQUFNLEVBQUUsTUFBTTtBQUNkLHFCQUFLLEVBQUUsS0FBSzthQUNmLENBQUM7U0FDTDtBQUNELFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsZ0JBQUksWUFBWSxHQUFHLEFBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFJLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztBQUMxRCxtQkFBTyxDQUFDLENBQUMsc0RBQXNELEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsSUFBSSxFQUFDO0FBQy9GLHdCQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU07YUFDeEIsRUFBQyxDQUNFLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLFdBQVMsWUFBWSw0RkFBeUY7QUFDM0csd0JBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3pDLHFCQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRTthQUN0QixDQUFDLEVBQ0QsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxrQ0FBa0MsRUFBRSxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsQ0FDaEYsQ0FBQyxFQUNGLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsZ0VBQWdFLENBQUMsQ0FDdEUsQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDdER6QixNQUFNLENBQUMsQ0FBQyxDQUFDLGFBQWEsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFO0FBQ2xDLFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFTLElBQUksRUFBRTtBQUN2QixnQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUk7Z0JBQ25CLElBQUksR0FBRyxJQUFJO2dCQUNYLG9CQUFvQjtnQkFBRSxrQkFBa0I7Z0JBQUUsVUFBVSxDQUFDOztBQUV6RCxnQkFBSSxHQUFHLFlBQVc7QUFDZCxvQkFBSSxPQUFPLENBQUMsWUFBWSxFQUFFO0FBQ3RCLDRCQUFRLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFO0FBQ2pDLDZCQUFLLE1BQU07QUFDUCxtQ0FBTztBQUNILDRDQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxVQUFVO0FBQzdDLDJDQUFXLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxZQUFZO0FBQzlDLHFDQUFLLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxlQUFlOzZCQUM5QyxDQUFDO0FBQUEsQUFDTiw2QkFBSyxTQUFTO0FBQ1YsbUNBQU87QUFDSCw0Q0FBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsaUJBQWlCO0FBQ3BELDJDQUFXLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxnQkFBZ0I7QUFDbEQscUNBQUssRUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLFVBQVU7NkJBQ3pDLENBQUM7QUFBQSxxQkFDVDtpQkFDSjthQUNKLENBQUM7O0FBRUYsZ0NBQW9CLEdBQUcsWUFBVztBQUM5Qix3QkFBUSxPQUFPLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRTtBQUN4Qyx5QkFBSyxnQkFBZ0I7QUFDakIsK0JBQU8sQ0FBQyxDQUFDLG9CQUFvQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQUEsQUFDdkMseUJBQUssaUJBQWlCO0FBQ2xCLDRCQUFJLFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FBQztBQUN0Qiw0QkFBSSxRQUFRLEVBQUU7QUFDVixtQ0FBTyxDQUFDLENBQUMsMkVBQTJFLEVBQUUsQ0FDbEYsUUFBUSxDQUFDLFlBQVksR0FBRyxRQUFRLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFDdkQsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUNQLFFBQVEsQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUNwRCxDQUFDLENBQUM7eUJBQ047QUFDRCwrQkFBTyxFQUFFLENBQUM7QUFBQSxpQkFDakI7YUFDSixDQUFDOztBQUVGLDhCQUFrQixHQUFHLFlBQVc7QUFDNUIsd0JBQVEsT0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUU7QUFDeEMseUJBQUssZ0JBQWdCO0FBQ2pCLCtCQUFPLGFBQWEsQ0FBQztBQUFBLEFBQ3pCLHlCQUFLLGlCQUFpQjtBQUNsQiwrQkFBTyxpQkFBaUIsQ0FBQztBQUFBLEFBQzdCO0FBQ0ksK0JBQU8sY0FBYyxDQUFDO0FBQUEsaUJBQzdCO2FBQ0osQ0FBQzs7QUFFRixzQkFBVSxHQUFHLFlBQVc7QUFDcEIsd0JBQVEsT0FBTyxDQUFDLEtBQUs7QUFDakIseUJBQUssTUFBTTtBQUNQLCtCQUFPLGVBQWUsQ0FBQztBQUFBLEFBQzNCLHlCQUFLLFVBQVU7QUFDWCwrQkFBTyxnQkFBZ0IsQ0FBQztBQUFBLEFBQzVCLHlCQUFLLFNBQVMsQ0FBQztBQUNmLHlCQUFLLGdCQUFnQjtBQUNqQiwrQkFBTyxlQUFlLENBQUM7QUFBQSxBQUMzQjtBQUNJLCtCQUFPLGFBQWEsQ0FBQztBQUFBLGlCQUM1QjthQUNKLENBQUM7O0FBRUYsbUJBQU87QUFDSCxvQ0FBb0IsRUFBRSxvQkFBb0I7QUFDMUMsa0NBQWtCLEVBQUUsa0JBQWtCO0FBQ3RDLDBCQUFVLEVBQUUsVUFBVTthQUN6QixDQUFDO1NBQ0w7O0FBRUQsWUFBSSxFQUFFLGNBQVMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUN2QixnQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUN4QixtQkFBTyxDQUFDLENBQUMsdUJBQXVCLEVBQUUsQ0FDOUIsQ0FBQyxDQUFDLDBEQUEwRCxFQUFFLENBQzFELENBQUMsQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FDbEUsQ0FBQyxFQUNGLENBQUMsQ0FBQyx3Q0FBd0MsRUFBRSxDQUN4QyxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyx5QkFBeUIsRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDLENBQ3RHLENBQUMsRUFDRixDQUFDLENBQUMseURBQXlELEVBQUUsQ0FDekQsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQzlCLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQzFGYixNQUFNLENBQUMsQ0FBQyxDQUFDLGVBQWUsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUNsQyxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxzQkFBTTtBQUNkLGdCQUFJLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUVwRCxtQkFBTztBQUNILG1DQUFtQixFQUFFLG1CQUFtQjthQUMzQyxDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLG1CQUFRLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLENBQUMsQ0FBQyw2REFBNkQsRUFBRSxDQUNsRyxDQUFDLENBQUMsaUZBQWlGLEVBQUU7QUFDakYsdUJBQU8sRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTTthQUMzQyxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FDckMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBRTtTQUNuQjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQ2xCekIsTUFBTSxDQUFDLENBQUMsQ0FBQyxZQUFZLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQ2xDLFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTztnQkFDeEIsVUFBVSxHQUFHLFNBQWIsVUFBVSxHQUFTO0FBQ2Ysb0JBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFDN0UsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJDLHVCQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzthQUN4QyxDQUFDO0FBQ04sZ0JBQUksYUFBYSxHQUFHLFNBQWhCLGFBQWEsR0FBUztBQUN0Qix1QkFBTyxBQUFDLE9BQU8sQ0FBQyxZQUFZLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEdBQUksQ0FBQyxDQUFDLGlCQUFpQixFQUFFLENBQ3RGLENBQUMsQ0FBQyw4REFBOEQsRUFBRSxxQkFBcUIsQ0FBQyxFQUN4RixDQUFDLENBQUMsMENBQTBDLEVBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsV0FBTSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsVUFBSyxVQUFVLEVBQUUsWUFBUyxDQUM3SixDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQ1gsQ0FBQzs7QUFFRixtQkFBTyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDdkIsQ0FBQyxDQUFDLDhCQUE4QixFQUFFO0FBQzlCLHNCQUFNLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRTthQUN2QixFQUFFLENBQ0MsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLENBQ2pCLENBQUMsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQzNCLENBQUMsRUFDRixDQUFDLENBQUMsa0NBQWtDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsRUFDbEUsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUNiLENBQUMsQ0FBQyxxQ0FBcUMsRUFBRSxXQUFXLENBQUMsRUFDckQsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQ2hELEdBQUcsRUFBRSxDQUNULENBQUMsRUFDRixDQUFDLENBQUMsNkNBQTZDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxHQUFHLENBQ2hGLENBQUMsQ0FBQyxzREFBc0QsRUFBRSxhQUFhLENBQUMsRUFDeEUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEVBQUU7QUFDN0IsdUJBQU8sRUFBRSxPQUFPO0FBQ2hCLDZCQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWE7YUFDcEMsQ0FBQyxFQUFFLGFBQWEsRUFBRSxDQUN0QixHQUFHLENBQ0EsQ0FBQyxDQUFDLHNEQUFzRCxFQUFFLG9CQUFvQixDQUFDLEVBQy9FLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLDZCQUE2QixFQUFFLEVBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQyxDQUFDLEVBQ2hFLGFBQWEsRUFBRSxDQUNsQixDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQzVDbkMsTUFBTSxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBSztBQUM1QyxRQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUM7O0FBRTFELFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTztnQkFDeEIsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDdEMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDO2dCQUMzRCxJQUFJLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLEdBQUcsR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUEsQUFBQyxDQUFDOztBQUUxRSxtQkFBTyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDdkIsQ0FBQyxDQUFDLDZCQUE2QixFQUFFLENBQzdCLENBQUMsaUNBQStCLElBQUksU0FBTTtBQUN0QyxxQkFBSyxFQUFFO0FBQ0gsc0NBQWtCLFdBQVMsT0FBTyxDQUFDLFdBQVcsTUFBRztBQUNqRCw2QkFBUyxFQUFFLE9BQU87aUJBQ3JCO2FBQ0osQ0FBQyxFQUNGLENBQUMsQ0FBQywrQkFBK0IsRUFBRSxDQUMvQixDQUFDLENBQUMsZ0dBQWdHLEVBQUUsQ0FDaEcsQ0FBQywwQkFBd0IsSUFBSSxTQUFNLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FDM0QsQ0FBQyxFQUNGLENBQUMsQ0FBQyx1RkFBdUYsRUFBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxTQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUcsRUFDaEosQ0FBQyxDQUFDLG9FQUFvRSxFQUFFLENBQ3BFLENBQUMsMEJBQXdCLElBQUksU0FBTSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQ3ZELENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLHdEQUF3RCxFQUFFLENBQ3hELENBQUMsQ0FBQyx3Q0FBd0MsRUFBRSxDQUFDLENBQUMsQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLENBQUMsU0FBTSxPQUFPLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFBLFdBQUssT0FBTyxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQSxDQUFHLENBQUMsQ0FDL0wsQ0FBQyxFQUNGLENBQUMsMEJBQXdCLE9BQU8sQ0FBQyxLQUFLLEVBQUksQ0FDdEMsQUFBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsWUFBWSxFQUFFLFFBQVEsRUFBRSxlQUFlLENBQUMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQ2pFLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsR0FBRyxPQUFPLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsR0FDcEUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQyxhQUFhLEVBQUU7QUFDYixxQkFBSyxFQUFFO0FBQ0gseUJBQUssR0FBTSxRQUFRLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxRQUFRLENBQUEsTUFBSTtpQkFDakQ7YUFDSixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMscUJBQXFCLEVBQUUsQ0FDckIsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQywyQ0FBMkMsRUFBRSxDQUMzQyxDQUFDLENBQUMsb0NBQW9DLEVBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQUksQ0FDN0UsQ0FBQyxFQUNGLENBQUMsQ0FBQyxvRUFBb0UsRUFBRSxDQUNwRSxDQUFDLENBQUMsdUNBQXVDLFVBQVEsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUcsRUFDbkYsQ0FBQyxDQUFDLHdDQUF3QyxFQUFFLFlBQVksQ0FBQyxDQUM1RCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLHdEQUF3RCxFQUFFLE9BQU8sQ0FBQyxVQUFVLEdBQUcsQ0FDN0UsQ0FBQyxDQUFDLHVDQUF1QyxFQUFLLGdCQUFnQixDQUFDLEtBQUssU0FBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUcsRUFDaEcsQ0FBQyxDQUFDLHdDQUF3QyxFQUFFLEFBQUMsZ0JBQWdCLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBSSxXQUFXLEdBQUcsVUFBVSxDQUFDLENBQ3ZHLEdBQUcsQ0FDQSxDQUFDLENBQUMscUNBQXFDLEVBQUUsQ0FBQyxVQUFVLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFDLFFBQVEsQ0FBQyxDQUFDLENBQzFFLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQUFBQyxDQUFDOzs7QUM5RGhELE1BQU0sQ0FBQyxDQUFDLENBQUMsZUFBZSxHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUMxQyxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxzQkFBTTtBQUNkLGdCQUFNLFlBQVksR0FBRyxTQUFmLFlBQVksQ0FBSSxFQUFFLEVBQUUsYUFBYSxFQUFLO0FBQ3hDLHVCQUFPLFVBQUMsRUFBRSxFQUFFLGFBQWEsRUFBSztBQUMxQix3QkFBSSxhQUFhLEVBQUU7QUFBQywrQkFBTztxQkFBQztBQUM1QixxQkFBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO2lCQUNmLENBQUM7YUFDTCxDQUFDOztBQUVGLG1CQUFPLEVBQUMsWUFBWSxFQUFFLFlBQVksRUFBQyxDQUFDO1NBQ3ZDOztBQUVELFlBQUksRUFBRSxjQUFTLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDM0IsbUJBQU8sQ0FBQyxDQUFDLGdEQUFnRCxHQUFHLE9BQU8sQ0FBQyxTQUFTLEdBQUcseUNBQXlDLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFDLENBQUMsQ0FBQztTQUM3SjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDbEJuQyxNQUFNLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDbEQsV0FBTztBQUNILGtCQUFVLEVBQUUsb0JBQUMsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUM7Z0JBQy9ELFFBQVEsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztBQUM3QiwwQkFBVSxFQUFFLElBQUk7QUFDaEIsK0JBQWUsRUFBRSxJQUFJO2FBQ3hCLENBQUM7Z0JBQ0YsYUFBYSxHQUFHLFNBQWhCLGFBQWEsR0FBd0I7b0JBQXBCLE9BQU8seURBQUcsS0FBSzs7QUFDNUIsdUJBQU8sWUFBTTtBQUNULDRCQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2xDLDBCQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO2lCQUMzQyxDQUFDO2FBQ0wsQ0FBQzs7QUFFTixvQkFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFNUQsZ0JBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsTUFBTSxFQUFFO0FBQzdCLHNCQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO2FBQzNDOztBQUVELG1CQUFPO0FBQ0gsc0JBQU0sRUFBRSxNQUFNO0FBQ2Qsd0JBQVEsRUFBRSxRQUFRO0FBQ2xCLDZCQUFhLEVBQUUsYUFBYTthQUMvQixDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ3pCLG1CQUFPLENBQUMsQ0FBQywrQ0FBK0MsRUFBRSxDQUNyRCxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixHQUMzQixDQUFDLENBQUMsMEJBQTBCLEVBQUUsQ0FDMUIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyx3SUFBd0ksRUFBRTtBQUN4SSx1QkFBTyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUU7YUFDaEMsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLG9EQUFvRCxFQUFFLGFBQWEsQ0FBQyxDQUN6RSxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyx5SEFBeUgsRUFBRTtBQUN6SCx1QkFBTyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDO2FBQ3BDLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxzREFBc0QsRUFBRSxXQUFXLENBQUMsQ0FDekUsQ0FBQyxDQUNMLENBQUMsR0FBRyxFQUFFLEVBQ1gsQ0FBQyxDQUFDLHdCQUF3QixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLFVBQUMsWUFBWSxFQUFLO0FBQ25FLHVCQUFPLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FDcEIsQ0FBQyxDQUFDLDBCQUEwQixFQUFFLENBQzFCLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUNoQixDQUFDLENBQUMsaUJBQWlCLEdBQUcsWUFBWSxDQUFDLE9BQU8sR0FBRyxJQUFJLEVBQUUsQ0FDL0MsQ0FBQyxDQUFDLHFEQUFxRCxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUMsR0FBRyxZQUFZLENBQUMscUJBQXFCLEdBQUcsb0NBQW9DLENBQUEsQUFBQyxHQUFHLGdDQUFnQyxDQUFDLENBQzdOLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGlCQUFpQixFQUFFLENBQ2pCLENBQUMsQ0FBQyxvQ0FBb0MsRUFBRSxDQUNwQyxDQUFDLENBQUMsa0NBQWtDLEdBQUcsWUFBWSxDQUFDLE9BQU8sR0FBRyxJQUFJLEVBQUUsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFHLFlBQVksQ0FBQyxpQkFBaUIsR0FDeEgsQ0FBQyxDQUFDLG1CQUFtQixFQUFFLENBQ25CLEtBQUssR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFHLFlBQVksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FDL0ksQ0FBQyxHQUFHLEVBQUUsRUFDWCxDQUFDLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLG1CQUFtQixDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQ3ZGLENBQUMsQ0FBQyxtQkFBbUIsRUFBRyxZQUFZLENBQUMsMEJBQTBCLEdBQUcsQ0FBQyxHQUFHLDRCQUE0QixHQUFHLFlBQVksQ0FBQywwQkFBMEIsR0FBRyxXQUFXLEdBQUcsdUNBQXVDLENBQUUsQ0FDek0sQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLDRCQUE0QixDQUFDLENBQ2xDLENBQUMsQ0FBQzthQUNOLENBQUMsQ0FBQyxFQUNILENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsNkJBQTZCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FDOUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsOENBQThDLEVBQUU7QUFDeEUsdUJBQU8sRUFBRSxJQUFJLENBQUMsUUFBUTthQUN6QixFQUFFLGVBQWUsQ0FBQyxHQUNuQixDQUFDLENBQUMsTUFBTSxFQUFFLENBQ2IsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7Ozs7Ozs7Ozs7OztBQ3hFcEQsTUFBTSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDMUMsV0FBTztBQUNILGtCQUFVLEVBQUUsb0JBQUMsSUFBSSxFQUFLO0FBQ2xCLGdCQUFJLElBQUksR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO2dCQUMzQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUFFLHFCQUFxQixDQUFDLENBQUM7O0FBRWhGLGdCQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUU7QUFDNUIsK0JBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUM1Qjs7QUFFRCxtQkFBTztBQUNILG9CQUFJLEVBQUUsSUFBSTtBQUNWLCtCQUFlLEVBQUUsZUFBZTtBQUNoQyxnQ0FBZ0IsRUFBRSxnQkFBZ0I7YUFDckMsQ0FBQztTQUNMO0FBQ0QsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFFLElBQUksRUFBSztBQUNsQixnQkFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU87Z0JBQ3RCLFlBQVksR0FBRyxZQUFZLEdBQUcsT0FBTyxDQUFDLEVBQUU7Z0JBQ3hDLFNBQVMsR0FBRyxZQUFZLEdBQUcsT0FBTztnQkFDbEMsYUFBYSxHQUFHLDBCQUEwQixJQUFJLE9BQU8sQ0FBQyxZQUFZLEdBQUcsUUFBUSxHQUFHLEVBQUUsQ0FBQSxBQUFDLENBQUM7QUFDMUYsZ0JBQUksV0FBVyxHQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxHQUFHLENBQUMsQ0FBQyw0Q0FBNEMsRUFBRSxhQUFhLENBQUMsR0FBRyxFQUFFLEFBQUMsQ0FBQzs7QUFFbEgsZ0JBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDOztBQUU5QyxtQkFBTyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQ3JCLENBQUMsQ0FBQyxzQkFBc0IsRUFBRSxDQUN0QixDQUFDLENBQUMsa0NBQWtDLEVBQUUsQ0FDbEMsQ0FBQyxDQUFDLHVFQUF1RSxJQUFJLE9BQU8sQ0FBQyxZQUFZLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxHQUFHLFVBQVUsQ0FBQSxBQUFDLEdBQUcsSUFBSSxFQUFFLENBQzFKLENBQUMsQ0FBQyxtQ0FBbUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRywyQkFBMkIsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFBLEFBQUMsR0FBRyxpQkFBaUIsQ0FBQyxFQUNoSixDQUFDLENBQUMscURBQXFELEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUN0RSxDQUFDLDhEQUE0RCxPQUFPLENBQUMsSUFBSSx3QkFBcUIsQ0FFakcsQ0FBQyxFQUNGLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FDYixDQUFDLENBQUMsdURBQXVELElBQUksQ0FBQyxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxHQUFHLFVBQVUsR0FBRyxFQUFFLENBQUEsQUFBQyxHQUFHLFdBQVcsR0FBRyxZQUFZLEdBQUcsYUFBYSxFQUFFLENBQzVKLENBQUMsQ0FBQyxrQ0FBa0MsQ0FBQyxFQUFFLGlCQUFpQixDQUMzRCxDQUFDLEVBQUcsT0FBTyxDQUFDLFlBQVksR0FBRyxDQUN4QixDQUFDLENBQUMseURBQXlELEdBQUcsU0FBUyxHQUFHLFVBQVUsR0FBRyxJQUFJLEVBQUUsQ0FDekYsQ0FBQyxDQUFDLGlDQUFpQyxDQUFDLEVBQUUsdUJBQXVCLENBQ2hFLENBQUMsRUFDRixDQUFDLENBQUMsMkVBQTJFLEdBQUcsU0FBUyxHQUFHLFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FDekcsQ0FBQyxDQUFDLGlDQUFpQyxDQUFDLEVBQUUsYUFBYSxFQUFFLENBQUMsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUM1RixDQUFDLENBQ0wsR0FBRyxFQUFFLENBQ1QsQ0FBQyxFQUNGLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUNsQixDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxpREFBaUQsRUFBRTtBQUMvRSx1QkFBTyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTTthQUN2QyxFQUFFLENBQ0MsQ0FBQyxDQUFDLCtCQUErQixDQUFDLEVBQUUsaUJBQWlCLENBQ3hELENBQUMsRUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQixFQUFFLENBQ2pELENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxDQUNqQixBQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksSUFBSSxPQUFPLENBQUMsYUFBYSxHQUFJLENBQ2hELENBQUMsQ0FBQyx1QkFBdUIsR0FBRyxhQUFhLEdBQUcsV0FBVyxHQUFHLFNBQVMsR0FBRyxTQUFTLEdBQUcsSUFBSSxFQUFFLFFBQVEsQ0FBQyxFQUNqRyxDQUFDLENBQUMscUJBQXFCLEdBQUcsYUFBYSxHQUFHLFdBQVcsR0FBRyxTQUFTLEdBQUcsT0FBTyxHQUFHLElBQUksRUFDL0UsT0FBTyxDQUFDLElBQUksS0FBSyxLQUFLLEdBQUcsY0FBYyxHQUFHLGVBQWUsQ0FBRSxDQUNqRSxHQUFHLEVBQUUsRUFDTixDQUFDLENBQUMsNEJBQTRCLEdBQUcsYUFBYSxHQUFHLFdBQVcsR0FBRyxTQUFTLEdBQUcsY0FBYyxHQUFHLElBQUksRUFBRSxXQUFXLENBQUMsRUFDOUcsQ0FBQyxDQUFDLHNCQUFzQixHQUFHLGFBQWEsR0FBRyxXQUFXLEdBQUcsU0FBUyxHQUFHLFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FDbEYsT0FBTyxFQUFFLFdBQVcsQ0FDdkIsQ0FBQyxFQUNGLENBQUMsQ0FBQyx1QkFBdUIsR0FBRyxhQUFhLEdBQUcsV0FBVyxHQUFHLFNBQVMsR0FBRyxTQUFTLEdBQUcsSUFBSSxFQUFFLENBQ3BGLFdBQVcsRUFBRSxXQUFXLENBQzNCLENBQUMsRUFDRixDQUFDLENBQUMscUJBQXFCLEdBQUcsYUFBYSxHQUFHLFdBQVcsR0FBRyxTQUFTLEdBQUcsT0FBTyxHQUFHLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxFQUN0RyxDQUFDLENBQUMsaUNBQWlDLEdBQUcsYUFBYSxHQUFHLFdBQVcsR0FBRyxTQUFTLEdBQUcsU0FBUyxHQUFHLElBQUksRUFBRSxDQUM5RixhQUFhLEVBQUUsV0FBVyxDQUM3QixDQUFDLEVBQ0YsQ0FBQyxDQUFDLHFDQUFxQyxHQUFHLGFBQWEsR0FBRyxXQUFXLEdBQUcsU0FBUyxHQUFHLGFBQWEsR0FBRyxJQUFJLEVBQUUsWUFBWSxDQUFDLEVBQUcsQUFBQyxPQUFPLENBQUMsWUFBWSxJQUFJLE9BQU8sQ0FBQyxLQUFLLEtBQUssVUFBVSxJQUFLLE9BQU8sQ0FBQyxhQUFhLEdBQUcsQ0FDeE0sQ0FBQyxDQUFDLHdDQUF3QyxHQUFHLGFBQWEsR0FBRyxXQUFXLEdBQUcsU0FBUyxHQUFHLGdCQUFnQixHQUFHLElBQUksRUFBRSxPQUFPLENBQUMsQ0FDM0gsR0FBRyxFQUFFLEVBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLENBQzlCLENBQUMsQ0FBQyxrQ0FBa0MsR0FBRyxhQUFhLEdBQUcsV0FBVyxHQUFHLFNBQVMsR0FBRyxVQUFVLEdBQUcsSUFBSSxFQUFFLENBQ2hHLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFLFVBQVUsQ0FDOUMsQ0FBQyxDQUNMLEdBQUcsRUFBRSxDQUNULENBQUMsQ0FDTCxDQUFDLEdBQUcsRUFBRSxFQUNOLENBQUMsT0FBTyxDQUFDLFlBQVksR0FBRyxDQUNyQixDQUFDLENBQUMsdUJBQXVCLEVBQ3RCLE9BQU8sQ0FBQyxJQUFJLEtBQUssS0FBSyxHQUFHLENBQ3JCLE9BQU8sQ0FBQyxLQUFLLEtBQUssT0FBTyxHQUFHLENBQUMsQ0FBQyxtQ0FBbUMsR0FBRyxPQUFPLENBQUMsRUFBRSxHQUFHLHFCQUFxQixFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsRUFDdEgsT0FBTyxDQUFDLEtBQUssS0FBSyxVQUFVLEdBQUcsQ0FBQyxDQUFDLG1DQUFtQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLEdBQUcsWUFBWSxFQUFFLENBQy9GLFVBQVUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxDQUNyRSxDQUFDLEdBQUcsRUFBRSxDQUNWLEdBQUcsQ0FDQyxPQUFPLENBQUMsS0FBSyxLQUFLLE9BQU8sR0FBRyxDQUFDLENBQUMsbUNBQW1DLEdBQUcsT0FBTyxDQUFDLEVBQUUsR0FBRyxpQkFBaUIsRUFBRSxDQUNqRyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUMsMEJBQTBCLENBQUMsQ0FDckUsQ0FBQyxHQUFHLEVBQUUsQ0FDVixDQUNELENBQ0wsR0FBRyxDQUNDLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTSxHQUFHLENBQ3ZCLENBQUMsQ0FBQyx1QkFBdUIsRUFDdEIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLDhEQUE4RCxHQUFHLE9BQU8sQ0FBQyxFQUFFLEdBQUcsNkJBQTZCLEVBQUUsb0JBQW9CLENBQUMsR0FBRyxFQUFFLENBQUUsQ0FDaEwsR0FBRyxFQUFFLENBQ1QsQ0FDSixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsb0NBQW9DLEVBQUU7QUFDcEMsdUJBQU8sRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTTthQUN4QyxFQUFFLENBQ0MsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQzdCLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7Ozs7Ozs7Ozs7OztBQzdHbkMsTUFBTSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUs7QUFDMUMsV0FBTztBQUNILGtCQUFVLEVBQUUsb0JBQUMsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDckMsTUFBTSxHQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLEVBQUUsQUFBQztnQkFFNUQsWUFBWSxHQUFHLFNBQWYsWUFBWSxHQUFTO0FBQ2pCLHVCQUFPLENBQUM7QUFDSiw2QkFBUyxFQUFFLHNCQUFzQjtBQUNqQywrQkFBVyxFQUFFLG9CQUFvQjtBQUNqQyw4QkFBVSxFQUFFLG9CQUFvQjtBQUNoQyxvQ0FBZ0IsRUFBRSxNQUFNO0FBQ3hCLHNDQUFrQixFQUFFLE1BQU07QUFDMUIsd0NBQW9CLEVBQUUscUJBQXFCO0FBQzNDLHdCQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDMUIsK0JBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztxQkFDN0IsQ0FBQztpQkFDTCxDQUFDLENBQUM7YUFDTjtnQkFDRCxXQUFXLEdBQUcsU0FBZCxXQUFXLENBQUksT0FBTyxFQUFFLGFBQWEsRUFBSztBQUN0QyxvQkFBSSxDQUFDLGFBQWEsRUFBRTtBQUNoQix3QkFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFckMsd0JBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNoQiw4QkFBTSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQUMsSUFBSSxFQUFLO0FBQzVCLG1DQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7eUJBQzNCLENBQUM7QUFDRixnQ0FBUSxFQUFFLFlBQVksRUFBRTtxQkFDM0IsQ0FBQyxDQUFDO2lCQUNOO2FBRUosQ0FBQzs7QUFFTixtQkFBTztBQUNILDJCQUFXLEVBQUUsV0FBVzthQUMzQixDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLG1CQUFPLENBQUMsQ0FBQyx5Q0FBeUMsRUFBRSxDQUNoRCxDQUFDLENBQUMscUVBQXFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUNwRixDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLCtCQUErQixFQUFFLENBQy9CLENBQUMsQ0FBQywrQ0FBK0MsRUFBRTtBQUMvQyxzQkFBTSxFQUFFLElBQUksQ0FBQyxXQUFXO2FBQzNCLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDckNyQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDOUMsV0FBTztBQUNILGtCQUFVLEVBQUUsb0JBQUMsSUFBSSxFQUFLO0FBQ2xCLGdCQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQzFCLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTNCLGdCQUFNLFVBQVUsR0FBRyxTQUFiLFVBQVUsQ0FBSSxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQ3pCLG9CQUFJLEdBQUcsR0FBRyxTQUFTLEVBQUU7OztBQUVqQixpQkFBQyxHQUFHLEFBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQztvQkFDakUsQ0FBQyxHQUFHLEFBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUV0RSxvQkFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDO0FBQ04sMkJBQU8sQ0FBQyxDQUFDLENBQUM7aUJBQ2I7QUFDRCxvQkFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDO0FBQ04sMkJBQU8sQ0FBQyxDQUFDO2lCQUNaO0FBQ0QsdUJBQU8sQ0FBQyxDQUFDO2FBQ1osQ0FBQzs7QUFFRixnQkFBTSxTQUFTLEdBQUcsU0FBWixTQUFTLENBQUksR0FBRyxFQUFLO0FBQ3ZCLG9CQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUN6QixJQUFJLFlBQUEsQ0FBQztBQUNULG9CQUFJLFNBQVMsRUFBRSxLQUFLLEdBQUcsRUFBQztBQUNwQix3QkFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztpQkFDcEMsTUFBTTtBQUNILDZCQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDZix3QkFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQzNDOztBQUVELHFCQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDakMsQ0FBQzs7QUFFRixxQkFBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7O0FBRWhELGdCQUFJLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLEVBQUM7QUFDMUIseUJBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQ25EOztBQUVELG1CQUFPO0FBQ0gscUJBQUssRUFBRSxLQUFLO0FBQ1oseUJBQVMsRUFBRSxTQUFTO2FBQ3ZCLENBQUM7U0FDTDtBQUNELFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsZ0JBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUM5QixJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUNoQyxtQkFBTyxDQUFDLENBQUMsZ0NBQWdDLEVBQUUsQ0FDdkMsQ0FBQyxDQUFDLDhEQUE4RCxFQUM1RCxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUs7QUFDNUIsb0JBQUksSUFBSSxHQUFHLFNBQVAsSUFBSTsyQkFBUyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQztpQkFBQSxDQUFDO0FBQ3JDLHVCQUFPLENBQUMsQ0FBQyxxREFBcUQsRUFBRSxDQUM1RCxDQUFDLENBQUMsMkNBQTJDLEVBQUU7QUFDM0MsMkJBQU8sRUFBRSxJQUFJO2lCQUNoQixFQUFFLENBQ0ksT0FBTyxRQUFLLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUN0QyxDQUFDLENBQ0wsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxDQUNMLEVBQUUsQ0FBQyxDQUFDLDZCQUE2QixFQUM5QixDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxVQUFDLE9BQU8sRUFBSztBQUNyQix1QkFBTyxDQUFDLENBQUMsa0JBQWtCLEVBQ3ZCLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQUMsR0FBRyxFQUFLOztBQUVwQix1QkFBRyxHQUFHLEFBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3hELDJCQUFPLENBQUMsQ0FBQyxxREFBcUQsRUFBRSxDQUM1RCxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUNoQixDQUFDLENBQUM7aUJBQ04sQ0FBQyxDQUNMLENBQUM7YUFDTCxDQUFDLENBQ0wsQ0FDSixDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDbkdwRCxNQUFNLENBQUMsQ0FBQyxDQUFDLGFBQWEsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNyQyxXQUFPO0FBQ0gsWUFBSSxFQUFFLGNBQVMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUN2QixnQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUMzQixtQkFBTyxDQUFDLENBQUMsaUJBQWlCLEVBQUUsQ0FDeEIsQ0FBQyxDQUFDLDZCQUE2QixHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFDL0MsQ0FBQyxDQUFDLHNDQUFzQyxFQUFFLENBQ3RDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FDZCxDQUFDLENBQUMsc0VBQXNFLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUN2RixDQUFDLENBQUMsdURBQXVELEVBQUUsQ0FDdkQsTUFBTSxFQUNOLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUNwQixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMseUJBQXlCLEVBQUUsQ0FDekIsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUNkLENBQUMsQ0FBQyxxQkFBcUIsRUFBRSxDQUNyQixDQUFDLENBQUMsa0NBQWtDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUU7QUFDbEUsdUJBQU8sRUFBRSxPQUFPO2FBQ25CLENBQUMsQ0FBQyxFQUNILENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUU7QUFDOUMsdUJBQU8sRUFBRSxPQUFPO0FBQ2hCLDJCQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7YUFDaEMsQ0FBQyxDQUFDLENBQ04sQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQy9CdkIsTUFBTSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQ3pDLFdBQU87QUFDSCxrQkFBVSxFQUFFLHNCQUFNO0FBQ2QsZ0JBQUksZUFBZSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUVoRCxtQkFBTztBQUNILCtCQUFlLEVBQUUsZUFBZTthQUNuQyxDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQzNCLG1CQUFPLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxDQUMxQixPQUFPLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxnQ0FBZ0MsRUFBRTtBQUMzRCxxQkFBSyxFQUFFLG9CQUFvQjthQUM5QixFQUFFLENBQ0MsQ0FBQyxDQUFDLDhDQUE4QyxHQUFHLE9BQU8sQ0FBQyxlQUFlLEdBQUcsc0NBQXNDLENBQUMsQ0FDdkgsQ0FBQyxHQUFHLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRTtBQUNyQixxQkFBSyxFQUFFLHVCQUF1QixHQUFHLE9BQU8sQ0FBQyxjQUFjLEdBQUcsSUFBSTthQUNqRSxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFDckMsQ0FBQyxDQUFDLDZDQUE2QyxFQUFFLENBQzVDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQzFCLENBQUMsaUhBQStHLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxTQUFNLENBQzVJLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFNLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxVQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUN6RixDQUFDLEdBQUcsRUFBRSxFQUVYLENBQUMsb0dBQWtHLE9BQU8sQ0FBQyxXQUFXLFNBQU0sQ0FDeEgsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsR0FBRyxFQUN4QixPQUFPLENBQUMsYUFBYSxDQUN4QixDQUFDLEVBQ0YsQ0FBQyxDQUFDLHdEQUF3RCxFQUFFO0FBQ3hELHVCQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNO2FBQ3ZDLEVBQUUsY0FBYyxDQUFDLEVBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRTtBQUN6RSx1QkFBTyxFQUFFLE9BQU87QUFDaEIsK0JBQWUsRUFBRSxJQUFJLENBQUMsZUFBZTthQUN4QyxDQUFDLEdBQUcsRUFBRSxDQUNWLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7QUN4QzdDLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDcEMsV0FBTztBQUNILGtCQUFVLEVBQUUsb0JBQUMsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTztnQkFDeEIsaUJBQWlCLEdBQUcsU0FBcEIsaUJBQWlCLEdBQVM7QUFDdEIsb0JBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSTtvQkFDN0IsTUFBTSxHQUFHO0FBQ0wsMkJBQU8sRUFBRSxPQUFPO2lCQUNuQjtvQkFDRCxJQUFJLEdBQUc7QUFDSCw4QkFBVSxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRTtBQUMzRSxxQ0FBYSxFQUFFLElBQUksQ0FBQyxhQUFhO3FCQUNwQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDWiwrQ0FBMkIsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyw2QkFBNkIsRUFBRSxNQUFNLENBQUM7QUFDakYsb0NBQWdCLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLEVBQUUsTUFBTSxDQUFDO0FBQzdELDRCQUFRLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFO0FBQy9DLHFDQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWE7cUJBQ3BDLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDWCwrQkFBVyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUM7QUFDbkQsNEJBQVEsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDO2lCQUNoRCxDQUFDOztBQUVOLG9CQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssVUFBVSxFQUFFO0FBQzNELDJCQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDekI7O0FBRUQsdUJBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3JCLENBQUM7O0FBRU4sa0JBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFdkQsbUJBQU87QUFDSCxpQ0FBaUIsRUFBRSxpQkFBaUI7YUFDdkMsQ0FBQztTQUNMOztBQUVELFlBQUksRUFBRSxjQUFDLElBQUksRUFBSztBQUNaLG1CQUFPLENBQUMsQ0FBQyw0REFBNEQsRUFBRSxDQUNuRSxDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUN4QyxDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUNqQzdDLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDcEMsV0FBTztBQUNILGtCQUFVLEVBQUUsb0JBQUMsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTztnQkFDeEIsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJO2dCQUNuQixXQUFXLEdBQUcsQUFBQyxJQUFJLEtBQUssS0FBSyxnRkFBK0UsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxTQUFNLDZHQUE2RyxDQUFDOztBQUV0UixtQkFBTztBQUNILG9CQUFJLEVBQUUsSUFBSTtBQUNWLDJCQUFXLEVBQUUsV0FBVzthQUMzQixDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSTtnQkFDaEIsVUFBVSxHQUFHLEFBQUMsSUFBSSxLQUFLLEtBQUssR0FBSSx1QkFBdUIsR0FBRyx3QkFBd0I7Z0JBQ2xGLFNBQVMsR0FBRyxBQUFDLElBQUksS0FBSyxLQUFLLEdBQUksd0JBQXdCLEdBQUcsb0JBQW9CO2dCQUM5RSxJQUFJLEdBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLGNBQWMsR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEFBQUM7Z0JBQ3pGLE9BQU8sR0FBRyxTQUFWLE9BQU8sQ0FBSSxFQUFFLEVBQUs7QUFDZCx1QkFBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUU7QUFDMUIsc0JBQUUsRUFBRSxFQUFFO0FBQ04sd0JBQUksRUFBRSxJQUFJLENBQUMsV0FBVztBQUN0Qix5QkFBSyxFQUFFLEdBQUc7aUJBQ2IsQ0FBQyxDQUFDO2FBQ04sQ0FBQzs7QUFFTixtQkFBTyxDQUFDLE9BQUssSUFBSSxhQUFVLENBQ3ZCLENBQUMsQ0FBQywyQ0FBMkMsRUFBRSxDQUMzQyxDQUFDLGVBQWEsVUFBVSxzQkFBaUIsQ0FDNUMsQ0FBQyxFQUNGLENBQUMsQ0FBQyw4Q0FBOEMsRUFBRSxDQUM5QyxDQUFDLENBQUMsdUNBQXVDLEVBQUUsVUFBVSxHQUFHLElBQUksQ0FBQyxFQUM3RCxDQUFDLENBQUMsbURBQW1ELEVBQUUsQ0FDbkQsU0FBUyxFQUNULE9BQU8sQ0FBQywrRUFBK0UsQ0FBQyxDQUMzRixDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQ2xEN0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxZQUFZLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUMxQyxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBQyxJQUFJLEVBQUs7QUFDbEIsZ0JBQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztnQkFDN0QsUUFBUSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDO0FBQzdCLDBCQUFVLEVBQUUsSUFBSTthQUNuQixDQUFDLENBQUM7O0FBRVAsb0JBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFckMsZ0JBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsTUFBTSxFQUFFO0FBQzdCLHNCQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO2FBQzNDOztBQUVELG1CQUFPO0FBQ0gsc0JBQU0sRUFBRSxNQUFNO0FBQ2Qsd0JBQVEsRUFBRSxRQUFRO2FBQ3JCLENBQUM7U0FDTDtBQUNELFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsZ0JBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNO2dCQUNwQixPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQzs7QUFFM0IsbUJBQU8sQ0FBQyxDQUFDLDBCQUEwQixFQUFFLENBQ2pDLENBQUMsQ0FBQyw2QkFBNkIsRUFBRSxDQUM1QixPQUFPLENBQUMsaUJBQWlCLEdBQUcsQ0FDekIsQUFBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FDakIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsK0JBQStCLEVBQUUsQ0FDL0QsQ0FBQyxDQUFDLGlEQUFpRCxFQUFFLHVQQUF1UCxDQUFDLENBQ2hULENBQUMsR0FBRyxFQUFFLEdBQUksRUFBRSxFQUNiLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxDQUMxQixDQUFDLENBQUMsZ0JBQWdCLENBQUMsRUFDbkIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsbURBQWdELE9BQU8sQ0FBQyxFQUFFLHFCQUFpQixtQkFBbUIsQ0FBQyxDQUNuRyxDQUFDLEVBQ0YsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQ3RCLENBQUMsQ0FDTCxHQUFHLEVBQUUsRUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxVQUFDLElBQUksRUFBSztBQUN6Qyx1QkFBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQ2YsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQ25CLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUNqQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQ1AsQ0FBQyxDQUFDLGdDQUFnQyxFQUFFLENBQ2hDLENBQUMsQ0FBQyxtREFBbUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUNwRixDQUFDLENBQUMsc0VBQXNFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLGlDQUFpQyxDQUFDLENBQ25PLENBQUMsRUFDRixDQUFDLENBQUMsNEJBQTRCLENBQUMsQ0FDbEMsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FDdEIsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxFQUNGLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsNkJBQTZCLEVBQUUsQ0FDNUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQ2IsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsOENBQThDLEVBQUU7QUFDeEUsdUJBQU8sRUFBRSxJQUFJLENBQUMsUUFBUTthQUN6QixFQUFFLGVBQWUsQ0FBQyxHQUNuQixDQUFDLENBQUMsTUFBTSxFQUFFLENBQ2pCLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7QUNqRXBELE1BQU0sQ0FBQyxDQUFDLENBQUMsb0JBQW9CLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRTtBQUN6QyxXQUFPO0FBQ0gsWUFBSSxFQUFFLGNBQVMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUN2QixnQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUM1QixtQkFBTyxDQUFDLENBQUMsOEVBQThFLEVBQUUsQ0FDckYsQ0FBQyxDQUFDLHFDQUFxQyxFQUFFLG1EQUFtRCxDQUFDLEVBQzdGLENBQUMsQ0FBQyxxQ0FBcUMsRUFBRSwyRUFBMkUsQ0FBQyxFQUNySCxDQUFDLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUMvQyxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7QUNEYixNQUFNLENBQUMsQ0FBQyxDQUFDLGVBQWUsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQzdDLFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFDLElBQUksRUFBSztBQUNsQixnQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU87Z0JBQ3RCLFFBQVEsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztBQUM3QiwwQkFBVSxFQUFFLElBQUk7YUFDbkIsQ0FBQztnQkFDRixpQkFBaUIsR0FBRyxTQUFTLEdBQUcsT0FBTyxDQUFDLEVBQUU7Z0JBQzFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDakIsZUFBZSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUMvQixjQUFjLEdBQUcsU0FBakIsY0FBYyxHQUFTO0FBQ25CLG9CQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQ2QscUJBQUMsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDakQsMkJBQU8sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7aUJBQy9CO0FBQ0Qsb0JBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUM7QUFDcEksOEJBQVUsRUFBRSxPQUFPLENBQUMsRUFBRTtpQkFDekIsQ0FBQyxDQUFDO0FBQ0gsaUJBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFNUMsaUJBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUNoQiwyQkFBTyxDQUFDLFdBQVcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUM7O0FBRTNDLHdCQUFJLE9BQU8sQ0FBQyxXQUFXLEVBQUU7QUFDckIsdUNBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QixrQ0FBVSxDQUFDLFlBQU07QUFDYiwyQ0FBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3ZCLDZCQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7eUJBQ2QsRUFBRSxJQUFJLENBQUMsQ0FBQztxQkFDWixNQUFNO0FBQ0gsdUNBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDMUI7aUJBQ0osQ0FBQyxDQUFDO2FBQ04sQ0FBQzs7QUFFTixhQUFDLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDdEQsb0JBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUVoQyxtQkFBTztBQUNILGlCQUFDLEVBQUUsQ0FBQztBQUNKLDhCQUFjLEVBQUUsY0FBYztBQUM5QiwrQkFBZSxFQUFFLGVBQWU7YUFDbkMsQ0FBQztTQUNMO0FBQ0QsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFFLElBQUksRUFBSztBQUNsQixnQkFBTSxTQUFTLEdBQUcsQUFBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsR0FBSSxFQUFFLEdBQUcsa0NBQWtDO2dCQUNoRixXQUFXLEdBQUcsQUFBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsR0FBSSx5Q0FBeUMsR0FBRyxxQ0FBcUM7Z0JBQzFILGdCQUFnQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxLQUFLO2dCQUNqRCxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQzs7QUFFM0IsbUJBQU8sQ0FBQyx1QkFBcUIsU0FBUyxFQUFJLENBQ3RDLENBQUMsb0JBQWtCLFdBQVcsVUFBSyxPQUFPLENBQUMsV0FBVyxHQUFHLHFCQUFxQixHQUFHLHFCQUFxQixDQUFBLDZCQUEyQjtBQUM3SCx1QkFBTyxFQUFFLElBQUksQ0FBQyxjQUFjO2FBQy9CLEVBQUUsQ0FDRSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsYUFBYSxHQUFHLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxDQUNoRCxDQUFDLFdBQVEsZ0JBQWdCLEdBQUcsa0JBQWtCLEdBQUcsRUFBRSxDQUFBLEVBQUksT0FBTyxDQUFDLFdBQVcsR0FBRyxpQkFBaUIsR0FBRyxhQUFhLENBQUMsQ0FDbEgsQ0FBQyxDQUNMLENBQUMsRUFBRyxJQUFJLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFO0FBQ3pELHVCQUFPLEVBQUUsOEVBQThFO2FBQzFGLENBQUMsR0FBRyxFQUFFLENBQ1YsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQ3pFcEQsTUFBTSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDdkMsV0FBTztBQUNILFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7OztBQUdsQixnQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUMzQixtQkFBTyxDQUFDLENBQUMsNEJBQTRCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUUsVUFBQyxNQUFNLEVBQUs7QUFDM0Usb0JBQUkseUJBQXlCLEdBQUcsWUFBWSxHQUFHLE9BQU8sQ0FBQyxFQUFFLEdBQUcsK0JBQStCLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQzs7QUFFeEcsdUJBQU8sQ0FBQyxDQUFDLFdBQVcsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLFdBQVcsR0FBRyxjQUFjLElBQUksT0FBTyxDQUFDLHNCQUFzQixHQUFHLFdBQVcsR0FBRyxFQUFFLENBQUEsQUFBQyxDQUFBLEFBQUMsR0FBRyxpREFBaUQsSUFBSSxPQUFPLENBQUMsc0JBQXNCLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLHlCQUF5QixHQUFHLGFBQWEsQ0FBQSxBQUFDLEdBQUcsSUFBSSxFQUFFLENBQzNTLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxDQUNwQixDQUFDLENBQUMsb0NBQW9DLEVBQUUsVUFBVSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxFQUN2RyxDQUFDLENBQUMsdUNBQXVDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFHLE1BQU0sQ0FBQyxxQkFBcUIsR0FBRyxDQUFDLEdBQUcsQ0FDaEksTUFBTSxDQUFDLHFCQUFxQixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsb0RBQW9ELEVBQUUsQ0FDeEYsQ0FBQyxDQUFDLGdEQUFnRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLGdDQUFnQyxFQUFFLGtDQUFrQyxDQUFDLENBQUMsQ0FDdkssQ0FBQyxHQUFHLEVBQUUsRUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUN2RCxDQUFDLENBQUMsd0NBQXdDLEVBQUUsVUFBVSxDQUFDLENBQzFELENBQUMsR0FBRyxDQUFDLENBQUMsaUJBQWlCLEVBQUUsQ0FDdEIsQ0FBQyxDQUFDLDZDQUE2QyxFQUFFLENBQzdDLENBQUMsQ0FBQyxzQkFBc0IsRUFBRSxVQUFVLENBQUMsRUFDckMsSUFBSSxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsR0FBRyxlQUFlLENBQzVGLENBQUMsQ0FDTCxDQUFDLENBQ0wsR0FBRyxFQUFFLENBQ1QsQ0FBQyxFQUNGLENBQUMsQ0FBQyxrQ0FBa0MsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUM5RyxDQUFDLENBQUMsbUJBQW1CLEVBQUUsQ0FDbkIsQ0FBQyxDQUFDLEdBQUcsRUFBRSx5QkFBeUIsQ0FBQyxFQUNqQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQzdDLENBQUMsR0FBRyxFQUFFLEVBQUksT0FBTyxDQUFDLHNCQUFzQixJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsR0FDdEUsQ0FBQyxDQUFDLDJCQUEyQixFQUFFLENBQzNCLENBQUMsQ0FBQywrQ0FBK0MsRUFBRSwyQkFBMkIsQ0FBQyxDQUNsRixDQUFDLEdBQUcsRUFBRSxDQUNkLENBQUMsQ0FBQzthQUNOLENBQUMsQ0FBQyxDQUFDO1NBQ1A7S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQ3JDbkMsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFLO0FBQ2hDLFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVTtnQkFDOUIsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHO2dCQUNkLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLHNDQUFzQyxDQUFDO0FBQ3JFLG1CQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FDZCxDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQUFBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUksQ0FBQyxDQUFDLDBCQUEwQixFQUFFLENBQ2xHLENBQUMsQ0FBQyw0Q0FBNEMsRUFBRSxDQUM1QyxDQUFDLENBQUMsbUNBQW1DLEVBQUUsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUMzRCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLDJDQUEyQyxFQUFFLENBQzNDLENBQUMseURBQXVELEdBQUcsU0FBSSxVQUFVLENBQUMsSUFBSSxTQUFNLFdBQVcsQ0FBQyxDQUNuRyxDQUFDLENBQ0wsQ0FBQyxHQUFHLEVBQUUsRUFDUCxBQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxNQUFNLEdBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxVQUFDLE9BQU8sRUFBSztBQUN2Rix1QkFBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUU7QUFDOUIsMkJBQU8sRUFBRSxPQUFPO0FBQ2hCLHVCQUFHLEVBQUUsR0FBRztpQkFDWCxDQUFDLENBQUM7YUFDTixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQ25CLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDMUJuQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGVBQWUsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUNsQyxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxzQkFBTTtBQUNkLG1CQUFPO0FBQ0gsNEJBQVksRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7YUFDMUMsQ0FBQztTQUNMO0FBQ0QsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFFLElBQUksRUFBSztBQUNsQixtQkFBTyxDQUFDLENBQUMsWUFBWSxFQUFFO0FBQ25CLHFCQUFLLEVBQUUsaUJBQWlCO2FBQzNCLEVBQUUsQ0FDQyxDQUFDLENBQUMsMkNBQTJDLEVBQUUsQ0FDM0MsQ0FBQyxDQUFDLGlEQUFpRCxFQUFFO0FBQ2pELHVCQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNO2FBQ3ZDLEVBQUUsUUFBUSxDQUFDLEVBQ1osQ0FBQyxDQUFDLHVEQUF1RCxFQUFFLDBCQUEwQixDQUFDLENBQ3pGLENBQUMsRUFDRixDQUFDLENBQUMsc0VBQXNFLEVBQUUsQ0FDdEUsQ0FBQyxDQUFDLHdkQUF3ZCxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLCtEQUErRCxDQUFDLENBQ3pqQixDQUFDLEVBQ0YsQ0FBQyxDQUFDLHFFQUFxRSxFQUFFLENBQ3JFLENBQUMsQ0FBQyx3VEFBd1QsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyx1Q0FBdUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyx3RUFBd0UsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxnQ0FBZ0MsQ0FBQyxDQUM1aEIsQ0FBQyxFQUNGLENBQUMsQ0FBQyxnSEFBZ0gsRUFBRTtBQUNoSCx1QkFBTyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTTthQUNwQyxFQUFFLFdBQVcsQ0FBQyxFQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUMsZ0NBQWdDLEVBQUUsQ0FDeEUsQ0FBQyxDQUFDLHVEQUF1RCxFQUFFLDhCQUE4QixDQUFDLEVBQzFGLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FDVCxDQUFDLENBQUMsbUhBQW1ILEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsa0RBQWtELENBQUMsQ0FDaE0sQ0FBQyxFQUNGLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FDYixDQUFDLENBQUMseURBQXlELEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcseUNBQXlDLENBQUMsQ0FDN0gsQ0FBQyxDQUNMLENBQUMsR0FBRyxFQUFFLEVBQ1AsQ0FBQyxDQUFDLG1KQUFtSixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLHNCQUFzQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLHFCQUFxQixFQUFFLENBQ2pQLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLGNBQWMsQ0FDM0MsQ0FBQyxFQUNGLENBQUMsQ0FBQyx5SUFBeUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyx5QkFBeUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxrQ0FBa0MsRUFBRSxDQUN2UCxDQUFDLENBQUMsb0JBQW9CLENBQUMsRUFBRSxRQUFRLENBQ3BDLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQzNDekIsTUFBTSxDQUFDLENBQUMsQ0FBQyxjQUFjLEdBQUksQ0FBQSxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUs7QUFDN0MsUUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLDBCQUEwQixDQUFDLENBQUM7O0FBRXJFLFdBQU87QUFDSCxrQkFBVSxFQUFFLG9CQUFDLElBQUksRUFBSztBQUNsQixnQkFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU87Z0JBQ3hCLGVBQWUsR0FBRyxTQUFsQixlQUFlLENBQUksRUFBRSxFQUFFLGFBQWEsRUFBSztBQUNyQyxvQkFBSSxDQUFDLGFBQWEsRUFBRTs7QUFDaEIsNEJBQUksU0FBUyxZQUFBOzRCQUFFLFFBQVEsR0FBRyxDQUFDOzRCQUN2QixPQUFPLEdBQUcsQ0FBQzs0QkFDWCxZQUFZLEdBQUcsQ0FBQzs0QkFDaEIsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsUUFBUTs0QkFDckQscUJBQXFCLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7O0FBRTFFLDRCQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQzs0QkFDdEQsU0FBUyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDOzRCQUM5QyxjQUFjLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUM7NEJBQ3hELE9BQU8sR0FBRyxTQUFWLE9BQU8sR0FBUztBQUNaLHFDQUFTLEdBQUcsV0FBVyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFDO3lCQUNsRDs0QkFDRCxpQkFBaUIsR0FBRyxTQUFwQixpQkFBaUIsR0FBUztBQUN0QixnQ0FBSSxRQUFRLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUN4QywyQ0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQU0sUUFBUSxNQUFHLENBQUM7QUFDekMseUNBQVMsQ0FBQyxTQUFTLFdBQVMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQUFBRSxDQUFDO0FBQ3RELDhDQUFjLENBQUMsU0FBUyxHQUFNLFFBQVEsQ0FBQyxZQUFZLENBQUMsYUFBVSxDQUFDO0FBQy9ELGtDQUFFLENBQUMsU0FBUyxHQUFNLFFBQVEsTUFBRyxDQUFDO0FBQzlCLHVDQUFPLEdBQUcsT0FBTyxHQUFHLGdCQUFnQixDQUFDO0FBQ3JDLDRDQUFZLEdBQUcsWUFBWSxHQUFHLHFCQUFxQixDQUFDO0FBQ3BELHdDQUFRLEdBQUcsUUFBUSxHQUFHLENBQUMsQ0FBQzs2QkFDM0IsTUFBTTtBQUNILDZDQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7NkJBQzVCO3lCQUNKLENBQUM7O0FBRU4sa0NBQVUsQ0FBQyxZQUFNO0FBQ2IsbUNBQU8sRUFBRSxDQUFDO3lCQUNiLEVBQUUsSUFBSSxDQUFDLENBQUM7O2lCQUNaO2FBQ0o7Z0JBQ0QsZ0JBQWdCLEdBQUcsU0FBbkIsZ0JBQWdCLEdBQVM7QUFDckIsb0JBQU0sTUFBTSxHQUFHO0FBQ1gsbUNBQWUsRUFBRSxjQUFjO0FBQy9CLGdDQUFZLEVBQUUsY0FBYztBQUM1Qiw0QkFBUSxFQUFFLFlBQVk7QUFDdEIsMkJBQU8sRUFBRSxXQUFXO0FBQ3BCLGlDQUFhLEVBQUUsV0FBVztBQUMxQiw4QkFBVSxFQUFFLFdBQVc7aUJBQzFCLENBQUM7O0FBRUYsdUJBQVEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRywwQkFBMEIsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBRTthQUM1RjtnQkFDRCxpQkFBaUIsR0FBRyxTQUFwQixpQkFBaUIsR0FBUztBQUN0QixvQkFBTSxNQUFNLEdBQUc7QUFDWCw4QkFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMseUJBQXlCLEVBQUUsU0FBUyxFQUFFLENBQUM7QUFDMUQsNEJBQVEsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixFQUFFLFNBQVMsQ0FBQyxFQUFDLElBQUksRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBRyxFQUFFO0FBQzNJLDRCQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsRUFBRSxTQUFTLENBQUMsRUFBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDO0FBQ3RILDhCQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyx5QkFBeUIsRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUMxRCxpQ0FBYSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsNEJBQTRCLEVBQUUsU0FBUyxFQUFFLENBQUM7QUFDaEUsZ0NBQVksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLDJCQUEyQixFQUFFLFNBQVMsQ0FBQyxFQUFDLElBQUksRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBQyxDQUFDLENBQUM7QUFDMUcsbUNBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixFQUFFLFNBQVMsRUFBRSxDQUFDO0FBQ3BFLDJCQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsRUFBRSxTQUFTLEVBQUUsQ0FBQztpQkFDdkQsQ0FBQzs7QUFFRix1QkFBTyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2hDLENBQUM7O0FBRU4sbUJBQU87QUFDSCwrQkFBZSxFQUFFLGVBQWU7QUFDaEMsZ0NBQWdCLEVBQUUsZ0JBQWdCO0FBQ2xDLGlDQUFpQixFQUFFLGlCQUFpQjthQUN2QyxDQUFDO1NBQ0w7O0FBRUQsWUFBSSxFQUFFLGNBQVMsSUFBSSxFQUFFLElBQUksRUFBRTtBQUN2QixnQkFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU87Z0JBQ3RCLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWTtnQkFDOUIsU0FBUyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUM7O0FBRXZDLG1CQUFPLENBQUMsQ0FBQyx3QkFBd0IsRUFBRSxDQUMvQixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLHNCQUFzQixFQUFFLENBQ3RCLENBQUMsQ0FBQyxxQkFBcUIsRUFBRSxDQUNyQixDQUFDLENBQUMsb0JBQW9CLEVBQUUsQ0FDcEIsQ0FBQyxDQUFDLHdFQUF3RSxVQUFRLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFHLEVBQ3BILENBQUMsQ0FBQywwQ0FBMEMsRUFBRSxDQUMxQyxJQUFJLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQ3hDLENBQUMsQ0FBQyx1Q0FBdUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLFNBQVMsQ0FBQyxFQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsa0JBQWtCLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFDeEgsQUFBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsK0JBQStCLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQ3BJLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQyx5QkFBeUIsRUFBRTtBQUN6QixxQkFBSyxFQUFFO0FBQ0gseUJBQUssRUFBSyxPQUFPLENBQUMsUUFBUSxNQUFHO2lCQUNoQzthQUNKLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLHVCQUF1QixFQUFFLENBQ3ZCLENBQUMsQ0FBQywyQ0FBMkMsRUFBRSxDQUMzQyxDQUFDLENBQUMsd0RBQXdELEVBQUssUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBSSxDQUNoRyxDQUFDLEVBQ0YsQ0FBQyxDQUFDLHNEQUFzRCxFQUFFLENBQ3RELENBQUMsQ0FBQyw0Q0FBNEMsRUFBRSxTQUFTLENBQUMsS0FBSyxHQUFHLENBQzlELENBQUMsQ0FBQywwQkFBMEIsRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxFQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUNsSSxHQUFHLEVBQUUsQ0FBQyxDQUNWLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUU7QUFDdkIsdUJBQU8sRUFBRSxPQUFPO2FBQ25CLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUNDLE9BQU8sQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLENBQUMsNEVBQTRFLEdBQUcsT0FBTyxDQUFDLEVBQUUsR0FBRyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFJLEFBQUMsT0FBTyxDQUFDLHNCQUFzQixHQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRTtBQUMvUCx1QkFBTyxFQUFFLE9BQU87QUFDaEIsb0JBQUksRUFBRSxNQUFNO2FBQ2YsQ0FBQyxHQUFHLEVBQUUsRUFDUCxDQUFDLENBQUMsZ0RBQWdELEdBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFLEFBQUMsR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FDbkgsQ0FBQyxFQUNGLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFO0FBQ3hDLDJCQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7YUFDaEMsQ0FBQyxDQUFDLENBQ04sQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQUFBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNsSDFELE1BQU0sQ0FBQyxDQUFDLENBQUMsNkJBQTZCLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3hELFdBQU87QUFDSCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQzdCLGdCQUFJLGFBQWEsR0FBRyxTQUFoQixhQUFhLENBQUksTUFBTSxFQUFLO0FBQzVCLHNDQUFvQixPQUFPLENBQUMsVUFBVSxrQ0FBNkIsTUFBTSxDQUFHO2FBQy9FO2dCQUFFLGVBQWUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDOztBQUV2QyxtQkFBTyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFVBQUMsTUFBTSxFQUFLO0FBQ3hELHVCQUFPLENBQUMsY0FBWSxhQUFhLENBQUMsTUFBTSxDQUFDLCtEQUE0RCxDQUNqRyxDQUFDLENBQUMsa0JBQWtCLFVBQVEsTUFBTSxDQUFHLENBQ3hDLENBQUMsQ0FBQzthQUNOLENBQUMsQ0FBQyxDQUFDO1NBQ1A7S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDM0JqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUM5QixXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBQyxJQUFJLEVBQUs7QUFDbEIsZ0JBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUN2QixnQkFBZ0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWxDLGdCQUFNLFdBQVcsR0FBRyxTQUFkLFdBQVcsQ0FBSSxFQUFFLEVBQUs7QUFDeEIsdUJBQU8sWUFBTTtBQUNULHdCQUFJLGNBQWMsR0FBRyxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQzs7QUFFaEQsd0JBQUksTUFBTSxDQUFDLE9BQU8sSUFBSSxnQkFBZ0IsRUFBRSxFQUFFO0FBQ3RDLHdDQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckIsK0JBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNmLHlCQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7cUJBQ2Q7O0FBRUQsd0JBQUksY0FBYyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUssTUFBTSxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsRUFBRSxJQUFJLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxBQUFDLEVBQUU7QUFDM0YsNEJBQUksQ0FBQyxPQUFPLEVBQUUsRUFBQztBQUNYLDRDQUFnQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNqQyxtQ0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2QsNkJBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzt5QkFDZDtxQkFDSjtpQkFDSixDQUFDO2FBQ0wsQ0FBQzs7QUFFRixnQkFBTSxVQUFVLEdBQUcsU0FBYixVQUFVLENBQUksRUFBRSxFQUFFLGFBQWEsRUFBSztBQUN0QyxvQkFBSSxDQUFDLGFBQWEsRUFBRTtBQUNoQix3QkFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2xDLDBCQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2lCQUNoRDthQUNKLENBQUM7O0FBRUYsbUJBQU87QUFDSCwwQkFBVSxFQUFFLFVBQVU7QUFDdEIsdUJBQU8sRUFBRSxPQUFPO2FBQ25CLENBQUM7U0FDTDtBQUNELFlBQUksRUFBRSxjQUFDLElBQUksRUFBRSxJQUFJLEVBQUs7QUFDbEIsZ0JBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPO2dCQUN4QixPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQzs7QUFFakMsZ0JBQUksU0FBUyxHQUFHLEFBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksT0FBTyxDQUFDLGlCQUFpQixHQUFJLHdCQUF3QixHQUFHLDBDQUEwQyxDQUFDOztBQUV2SSxtQkFBTyxDQUFDLENBQUMsYUFBYSxFQUFDLENBQ25CLENBQUMsQ0FBQyxTQUFTLEVBQUU7QUFDVCxzQkFBTSxFQUFFLElBQUksQ0FBQyxVQUFVO2FBQzFCLEVBQUUsQ0FDQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNSLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUN0QyxDQUFDLENBQUMsa0ZBQWtGLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxVQUFVLEdBQUcsRUFBRSxDQUFBLEFBQUMsR0FBRyxxQkFBcUIsRUFBRTtBQUN4SixxQkFBSyxFQUFFLGNBQWM7YUFDeEIsRUFBRSxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsa0ZBQWtGLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLFVBQVUsR0FBRyxFQUFFLENBQUEsQUFBQyxHQUFHLHNDQUFzQyxFQUFFO0FBQzlNLHFCQUFLLEVBQUUsY0FBYzthQUN4QixFQUFFLG1CQUFtQixDQUFDLEVBQ3ZCLENBQUMsQ0FBQyxrREFBa0QsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxHQUFHLEVBQUUsQ0FBQSxBQUFDLEdBQUcsb0JBQW9CLEVBQUU7QUFDeEkscUJBQUssRUFBRSxjQUFjO2FBQ3hCLEVBQUUsT0FBTyxDQUFDLEVBQ1gsQ0FBQyxDQUFDLGtEQUFrRCxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsVUFBVSxHQUFHLEVBQUUsQ0FBQSxBQUFDLEdBQUcsbUJBQW1CLEVBQUU7QUFDcEgscUJBQUssRUFBRSxjQUFjO2FBQ3hCLEVBQUUsQ0FDQyxZQUFZLEVBQ1osQ0FBQyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLENBQ3ZDLENBQUMsRUFDRixDQUFDLENBQUMsdUZBQXVGLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLFVBQVUsR0FBRyxFQUFFLENBQUEsQUFBQyxHQUFHLDJCQUEyQixFQUFFO0FBQ3pLLHFCQUFLLEVBQUUsY0FBYzthQUN4QixFQUFFLENBQ0MsU0FBUyxFQUNULENBQUMsQ0FBQyx5Q0FBeUMsRUFBRSxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FDNUUsQ0FBQyxFQUNGLENBQUMsQ0FBQyxxREFBcUQsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxHQUFHLFVBQVUsR0FBRyxFQUFFLENBQUEsQUFBQyxHQUFHLHNCQUFzQixFQUFFO0FBQzdILHFCQUFLLEVBQUUsY0FBYzthQUN4QixFQUFFLENBQ0MsY0FBYyxFQUNkLENBQUMsQ0FBQyxnREFBZ0QsR0FBRyxPQUFPLENBQUMsU0FBUyxHQUFHLDRGQUE0RixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FDNUwsQ0FBQyxDQUNMLENBQUMsRUFDRixDQUFDLENBQUMsNkNBQTZDLEVBQUUsT0FBTyxDQUFDLHNCQUFzQixHQUFHLENBQzlFLENBQUMsQ0FBQyxnQ0FBZ0MsRUFBRSxDQUNoQyxDQUFDLENBQUMsK0JBQStCLEVBQUUsQ0FDL0IsQ0FBQyxDQUFDLGlDQUFpQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLEdBQUcsc0JBQXNCLEVBQUUsc0JBQXNCLENBQUMsQ0FDckcsQ0FBQyxFQUNGLENBQUMsQ0FBQywrQkFBK0IsRUFBRSxDQUMvQixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FDN0YsQ0FBQyxDQUNMLENBQUMsQ0FDTCxHQUFHLEVBQUUsQ0FBQyxDQUNWLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUNGLEFBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixHQUFJLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsQ0FDcEYsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFBQyxDQUFDOzs7QUMvRnpCLE1BQU0sQ0FBQyxDQUFDLENBQUMsZUFBZSxHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUNyQyxXQUFPO0FBQ0gsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFFLElBQUksRUFBSztBQUNsQixtQkFBTyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLFVBQUMsVUFBVSxFQUFLO0FBQzdELHVCQUFPLENBQUMsQ0FBQyw2Q0FBNkMsRUFBRSxDQUNwRCxDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQywwRUFBMEUsR0FBRyxVQUFVLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLENBQzFILENBQUMsRUFDRixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsQ0FDaEIsQ0FBQyxDQUFDLHFHQUFxRyxFQUFFLENBQ3JHLENBQUMsQ0FBQyw2QkFBNkIsR0FBRyxVQUFVLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQzNFLENBQUMsRUFDRixDQUFDLENBQUMsb0JBQW9CLEVBQUUsQ0FDcEIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsd0JBQXdCLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxFQUN2RSxDQUFDLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLEVBQ3BDLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLDBCQUEwQixFQUFFLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FDOUUsQ0FBQyxFQUNGLENBQUMsQ0FBQyx1SEFBdUgsRUFBRSxDQUN0SCxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FDNUMsQ0FBQyxDQUFDLHNDQUFzQyxHQUFHLFVBQVUsQ0FBQyxhQUFhLEdBQUcscUJBQXFCLEVBQUUsb0JBQW9CLENBQUMsQ0FDckgsQ0FBQyxHQUFHLEVBQUUsRUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUN6RCxDQUFDLENBQUMsMERBQTBELEdBQUcsVUFBVSxDQUFDLGdCQUFnQixHQUFHLHFCQUFxQixFQUFFLG1CQUFtQixDQUFDLENBQzNJLENBQUMsR0FBRyxFQUFFLEVBQ1AsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLFVBQUMsSUFBSSxFQUFLO0FBQzlCLHdCQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVsQywyQkFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FDOUMsQ0FBQyxDQUFDLHNDQUFzQyxHQUFHLElBQUksR0FBRyxxQkFBcUIsRUFBRSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQ2hHLENBQUMsR0FBRyxFQUFFLENBQUU7aUJBQ1osQ0FBQyxDQUNMLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxpSEFBaUgsRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUNsTCxDQUFDLENBQ0wsQ0FBQyxDQUNMLENBQUMsQ0FBQzthQUNOLENBQUMsQ0FBQyxDQUFDO1NBQ1A7S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDeEJuQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUN6QixXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBQyxJQUFJLEVBQUs7QUFDbEIsZ0JBQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLGVBQWUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDOUIsY0FBYyxHQUFHLFNBQWpCLGNBQWMsR0FBUztBQUNuQixvQkFBSSxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsRUFBRTtBQUN4QixvQ0FBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUM1QyxNQUFNO0FBQ0gsb0NBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQzVDO2FBQ0o7Z0JBQ0QsY0FBYyxHQUFHLFNBQWpCLGNBQWMsR0FBUztBQUNuQixvQkFBSSxnQkFBZ0IsRUFBRSxHQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQUFBQyxFQUFFO0FBQy9DLG9DQUFnQixDQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQzVDLE1BQU07QUFDSCxvQ0FBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDdkI7YUFDSjtnQkFDRCxnQkFBZ0IsR0FBRyxXQUFXLENBQUMsWUFBTTtBQUNqQyw4QkFBYyxFQUFFLENBQUM7QUFDakIsaUJBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUNkLEVBQUUsSUFBSSxDQUFDO2dCQUNSLE1BQU0sR0FBRyxTQUFULE1BQU0sQ0FBSSxFQUFFLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBSztBQUNyQyxvQkFBSSxDQUFDLGFBQWEsRUFBQztBQUNmLG1DQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEYscUJBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztpQkFDZCxDQUFDOztBQUVGLHVCQUFPLENBQUMsUUFBUSxHQUFHOzJCQUFNLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQztpQkFBQSxDQUFDO2FBQzVELENBQUM7O0FBRU4sbUJBQU87QUFDSCxzQkFBTSxFQUFFLE1BQU07QUFDZCxnQ0FBZ0IsRUFBRSxnQkFBZ0I7QUFDbEMsK0JBQWUsRUFBRSxlQUFlO0FBQ2hDLDhCQUFjLEVBQUUsY0FBYztBQUM5Qiw4QkFBYyxFQUFFLGNBQWM7YUFDakMsQ0FBQztTQUNMO0FBQ0QsWUFBSSxFQUFFLGNBQUMsSUFBSSxFQUFFLElBQUksRUFBSztBQUNsQixtQkFBTyxDQUFDLENBQUMsOEJBQThCLEVBQUU7QUFDckMsc0JBQU0sRUFBRSxJQUFJLENBQUMsTUFBTTthQUN0QixFQUFFLENBQ0MsQ0FBQyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFDakMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFDLEtBQUssRUFBRSxHQUFHLEVBQUs7QUFDL0Isb0JBQUksY0FBYyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBLEdBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtvQkFDekUsWUFBWSxvQkFBa0IsY0FBYyxjQUFXLENBQUM7O0FBRTVELHVCQUFPLENBQUMsQ0FBQywyQ0FBMkMsRUFBRTtBQUNsRCx5QkFBSyxrQkFBZ0IsWUFBWSw2QkFBd0IsWUFBWSx3QkFBbUIsWUFBWSxNQUFHO2lCQUMxRyxFQUFFLENBQ0MsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUNkLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsNkJBQTZCLEVBQUUsS0FBSyxDQUFDLENBQzFDLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxFQUNGLENBQUMsQ0FBQyw4REFBOEQsRUFBRTtBQUM5RCx1QkFBTyxFQUFFOzJCQUFNLElBQUksQ0FBQyxjQUFjLEVBQUU7aUJBQUE7YUFDdkMsRUFBQyxDQUNFLENBQUMsQ0FBQywyREFBMkQsQ0FBQyxDQUNqRSxDQUFDLEVBQ0YsQ0FBQyxDQUFDLCtEQUErRCxFQUFFO0FBQy9ELHVCQUFPLEVBQUU7MkJBQU0sSUFBSSxDQUFDLGNBQWMsRUFBRTtpQkFBQTthQUN2QyxFQUFDLENBQ0UsQ0FBQyxDQUFDLDZEQUE2RCxDQUFDLENBQ25FLENBQUMsRUFDRixDQUFDLENBQUMscURBQXFELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQzFGLHVCQUFPLENBQUMsaUNBQThCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEdBQUcsR0FBRyxXQUFXLEdBQUcsRUFBRSxDQUFBLEVBQUk7QUFDeEYsMkJBQU8sRUFBRTsrQkFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDO3FCQUFBO2lCQUM1QyxDQUFDLENBQUM7YUFDTixDQUFDLENBQUMsQ0FDTixDQUFDLENBQ0wsQ0FBQyxDQUFDO1NBQ047S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQzdGdkIsTUFBTSxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFO0FBQzNDLFdBQU87QUFDSCxrQkFBVSxFQUFFLHNCQUFXO0FBQ25CLGdCQUFJLEVBQUUsR0FBRztBQUNELDBCQUFVLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7YUFDekI7Z0JBRUQsZUFBZSxHQUFHLFNBQWxCLGVBQWUsQ0FBWSxVQUFVLEVBQUUsVUFBVSxFQUFFO0FBQy9DLHVCQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLENBQUMsRUFBRSxVQUFTLENBQUMsRUFBRTtBQUN6RSwyQkFBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEdBQUksVUFBVSxDQUFDLENBQUM7aUJBQ2pFLENBQUMsQ0FBQzthQUNOLENBQUM7O0FBRU4sa0JBQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVMsSUFBSSxFQUFFO0FBQzVDLGtCQUFFLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMzQyxDQUFDLENBQUM7O0FBRUgsbUJBQU87QUFDSCxrQkFBRSxFQUFFLEVBQUU7YUFDVCxDQUFDO1NBQ0w7O0FBRUQsWUFBSSxFQUFFLGNBQVMsSUFBSSxFQUFFO0FBQ2pCLG1CQUFPLENBQUMsQ0FBQyx3Q0FBd0MsRUFBRSxDQUMvQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2QsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxFQUFFLFVBQVMsS0FBSyxFQUFFO0FBQ3hDLHVCQUFPLENBQUMsQ0FBQyxzQkFBc0IsRUFBRSxDQUM3QixDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxVQUFTLE1BQU0sRUFBRTtBQUMxQiwyQkFBTyxDQUFDLENBQUMseUVBQXlFLEVBQUUsQ0FDaEYsQ0FBQyxDQUFDLDBCQUEwQixHQUFHLE1BQU0sQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQzdDLENBQUMsQ0FBQywrQ0FBK0MsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxFQUN0RSxDQUFDLENBQUMsb0NBQW9DLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUN2RCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLHdDQUF3QyxFQUFFLFNBQVMsR0FBRyxNQUFNLENBQUMsMEJBQTBCLEdBQUcsV0FBVyxDQUFDLENBQzNHLENBQUMsQ0FBQztpQkFDTixDQUFDLENBQ0wsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEFBQUMsQ0FBQzs7O0FDMUN4QyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUU7QUFDekMsV0FBTztBQUNILGtCQUFVLEVBQUUsc0JBQVc7QUFDbkIsZ0JBQUksRUFBRSxHQUFHO0FBQ0wsMEJBQVUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzthQUN6QixDQUFDOztBQUVGLGtCQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFTLElBQUksRUFBRTtBQUMxQyxrQkFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN2QixDQUFDLENBQUM7O0FBRUgsbUJBQU87QUFDSCxrQkFBRSxFQUFFLEVBQUU7YUFDVCxDQUFDO1NBQ0w7O0FBRUQsWUFBSSxFQUFFLGNBQVMsSUFBSSxFQUFFO0FBQ2pCLG1CQUFPLENBQUMsQ0FBQyx3R0FBd0csRUFBRSxDQUMvRyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFTLFNBQVMsRUFBRTtBQUN6Qyx1QkFBTyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQ3JCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDUixDQUFDLENBQUMsZ0JBQWdCLENBQUMsRUFDbkIsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQ2hCLENBQUMsQ0FBQyxrQ0FBa0MsRUFDaEMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxZQUFZLEdBQUcsMEJBQTBCLEdBQUcsU0FBUyxDQUFDLFlBQVksR0FBRyxjQUFjLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQzFJLFdBQVcsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxHQUFHLDZLQUE2SyxDQUFDLEVBQ2pPLENBQUMsQ0FBQyxnREFBZ0QsRUFDOUMsbUNBQW1DLEdBQUcsQ0FBQyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsUUFBUSxHQUFHLFNBQVMsQ0FBQywwQkFBMEIsR0FBRyxZQUFZLENBQUMsQ0FDckosQ0FBQyxFQUNGLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUN0QixDQUFDLENBQ0wsQ0FBQyxDQUFDO2FBQ04sQ0FBQyxDQUNMLENBQUMsQ0FBQztTQUNOO0tBQ0osQ0FBQztDQUNMLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEFBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoQjFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFJLENBQUEsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUM3QixXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBQyxJQUFJLEVBQUs7QUFDbEIsZ0JBQUksWUFBWSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQztnQkFDakMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNmLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDaEIsT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixZQUFZLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBQyxDQUFDO2dCQUN4QyxPQUFPLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM1QixNQUFNLEdBQUcsU0FBVCxNQUFNLEdBQVM7QUFDWCx1QkFBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2pCLGlCQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDZCxDQUFDOztBQUVOLGdCQUFNLGlCQUFpQixHQUFHLFNBQXBCLGlCQUFpQixDQUFJLEVBQUUsRUFBRSxhQUFhLEVBQUs7QUFDN0Msb0JBQUksQ0FBQyxhQUFhLEVBQUM7QUFDZixnQ0FBWSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUN4QzthQUNKO2dCQUNHLFdBQVcsR0FBRyxTQUFkLFdBQVcsQ0FBSSxFQUFFLEVBQUUsYUFBYSxFQUFLO0FBQ2pDLG9CQUFJLENBQUMsYUFBYSxFQUFDO0FBQ2Ysd0JBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUM7QUFDM0Qsd0JBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFeEMsd0JBQUksTUFBTSxDQUFDLFVBQVUsR0FBSSxFQUFFLENBQUMsV0FBVyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQUFBQyxFQUFDOztBQUM5RSwwQkFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDeEMsNEJBQUksQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztxQkFDbkMsTUFBTSxJQUFJLEFBQUMsWUFBWSxFQUFFLENBQUMsSUFBSSxHQUFJLEVBQUUsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxBQUFDLElBQUssTUFBTSxDQUFDLFVBQVUsSUFBSSxBQUFDLFlBQVksRUFBRSxDQUFDLElBQUksR0FBSSxFQUFFLENBQUMsV0FBVyxHQUFHLENBQUMsQUFBQyxJQUFLLENBQUMsRUFBQztBQUM5SCxnQ0FBSSxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQzt5QkFDN0IsTUFBTSxJQUFJLEFBQUMsWUFBWSxFQUFFLENBQUMsSUFBSSxHQUFJLEVBQUUsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxBQUFDLEdBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtBQUN6RSxvQ0FBSSxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDOzZCQUN2RCxNQUFNLElBQUksQUFBQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLEdBQUksRUFBRSxDQUFDLFdBQVcsR0FBRyxDQUFDLEFBQUMsR0FBSSxDQUFDLEVBQUU7QUFDekQsd0NBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7aUNBQ3RDO0FBQ0QsdUJBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNmO2FBQ0osQ0FBQzs7QUFFTixtQkFBTztBQUNILHFCQUFLLEVBQUUsS0FBSztBQUNaLG1CQUFHLEVBQUUsR0FBRztBQUNSLG9CQUFJLEVBQUUsSUFBSTtBQUNWLHVCQUFPLEVBQUUsT0FBTztBQUNoQix1QkFBTyxFQUFFLE9BQU87QUFDaEIsc0JBQU0sRUFBRSxNQUFNO0FBQ2QsMkJBQVcsRUFBRSxXQUFXO0FBQ3hCLGlDQUFpQixFQUFFLGlCQUFpQjthQUN2QyxDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLGdCQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDekIsbUJBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUU7QUFDZCx1QkFBTyxFQUFFLElBQUksQ0FBQyxNQUFNO0FBQ3BCLHNCQUFNLEVBQUUsSUFBSSxDQUFDLGlCQUFpQjtBQUM5QixxQkFBSyxFQUFFLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFBQzthQUM3QixFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUNoQixDQUFDLGtDQUFnQyxLQUFLLGlCQUFZLElBQUksQ0FBQyxHQUFHLEVBQUUsa0JBQWEsSUFBSSxDQUFDLElBQUksRUFBRSxZQUFTO0FBQ3pGLHNCQUFNLEVBQUUsSUFBSSxDQUFDLFdBQVc7YUFDM0IsRUFBRSxDQUNDLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQ3JDLENBQUMsQ0FDTCxHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQ1g7S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7OztBQ3JGbkMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRTtBQUMzQyxXQUFPO0FBQ0gsa0JBQVUsRUFBRSxvQkFBUyxJQUFJLEVBQUU7QUFDdkIsZ0JBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJO2dCQUNYLFdBQVcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztBQUU3QixjQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7O0FBR25CLGtCQUFNLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7O0FBRXJFLG1CQUFPO0FBQ0gsMkJBQVcsRUFBRSxXQUFXO2FBQzNCLENBQUM7U0FDTDtBQUNELFlBQUksRUFBRSxjQUFTLElBQUksRUFBRTtBQUNqQixtQkFBTyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLFVBQVMsVUFBVSxFQUFFO0FBQ2xFLHVCQUFPLENBQUMsQ0FBQywrREFBK0QsRUFBRSxDQUN0RSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQ1IsQ0FBQyxDQUFDLHNEQUFzRCxFQUFFLENBQ3RELENBQUMsQ0FBQyx3REFBd0QsR0FBRyxVQUFVLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLENBQ3hHLENBQUMsRUFDRixDQUFDLENBQUMsMkNBQTJDLEVBQUUsQ0FDM0MsQ0FBQyxDQUFDLHlFQUF5RSxFQUFFLENBQ3pFLENBQUMsQ0FBQyw2QkFBNkIsR0FBRyxVQUFVLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQzNFLENBQUMsRUFDRixDQUFDLENBQUMsMERBQTBELEVBQUUsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUN0RixDQUFDLENBQUMsb0JBQW9CLEVBQUUsVUFBVSxDQUFDLHdCQUF3QixHQUFHLG1CQUFtQixDQUFDLEVBQ2xGLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLEdBQUcsVUFBVSxDQUFDLDBCQUEwQixHQUFHLFdBQVcsQ0FBQyxDQUMzRixDQUFDLENBQ0wsQ0FBQyxFQUNGLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxDQUMxQixDQUFDLENBQUMseURBQXlELEVBQUUsQ0FDeEQsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQzVDLENBQUMsQ0FBQyxzQ0FBc0MsR0FBRyxVQUFVLENBQUMsYUFBYSxHQUFHLHFCQUFxQixFQUFFLG9CQUFvQixDQUFDLENBQ3JILENBQUMsR0FBRyxFQUFFLEVBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FDekQsQ0FBQyxDQUFDLDBEQUEwRCxHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxxQkFBcUIsRUFBRSxtQkFBbUIsQ0FBQyxDQUMzSSxDQUFDLEdBQUcsRUFBRSxFQUNQLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxVQUFTLElBQUksRUFBRTtBQUNuQywyQkFBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQ1gsQ0FBQyxDQUFDLHNDQUFzQyxHQUFHLElBQUksR0FBRyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsQ0FDakYsQ0FBQyxDQUFDO2lCQUNOLENBQUMsQ0FDTCxDQUFDLENBQ0wsQ0FBQyxFQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLDRDQUE0QyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEdBQUcsdUNBQXVDLEVBQUUsaUJBQWlCLENBQUMsR0FBRyxFQUFFLENBQzNLLENBQUMsQ0FBQzthQUNOLENBQUMsQ0FBQyxDQUFDO1NBQ1A7S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FDdENwRCxNQUFNLENBQUMsQ0FBQyxDQUFDLGVBQWUsR0FBSSxDQUFBLFVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFLO0FBQzdDLFdBQU87QUFDSCxrQkFBVSxFQUFFLHNCQUFNO0FBQ2QsZ0JBQU0sWUFBWSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUUvQyxtQkFBTztBQUNILDRCQUFZLEVBQUUsWUFBWTthQUM3QixDQUFDO1NBQ0w7QUFDRCxZQUFJLEVBQUUsY0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFLO0FBQ2xCLG1CQUFPLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUMxQixDQUFDLENBQUMsbUhBQW1ILEVBQUUsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUMsQ0FBQyxFQUMzSixJQUFJLENBQUMsWUFBWSxFQUFFLEdBQ25CLENBQUMsQ0FBQywrQkFBK0IsRUFBRSxDQUMvQixDQUFDLENBQUMsdUJBQXVCLEVBQUUsQ0FDdkIsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLENBQ3JCLENBQUMsQ0FBQyxrQkFBa0IsRUFBRSxDQUNsQixDQUFDLENBQUMsbUJBQW1CLEVBQUUsQ0FDbkIsQ0FBQyxDQUFDLDBCQUEwQixFQUFFLENBQzFCLENBQUMsQ0FBQyx3S0FBd0ssQ0FBQyxFQUMzSyxDQUFDLHFSQUFtUixTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQywyS0FBd0ssQ0FDbGQsQ0FBQyxDQUNMLENBQUMsQ0FDTCxDQUFDLEVBQ0YsQ0FBQyxDQUFDLHFDQUFxQyxDQUFDLEVBQ3hDLENBQUMsQ0FBQyx5REFBeUQsQ0FBQyxFQUM1RCxDQUFDLENBQUMsMERBQTBELENBQUMsRUFDN0QsQ0FBQyxDQUFDLG9EQUFvRCxFQUFFLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFDLENBQUMsQ0FDL0YsQ0FBQyxFQUNGLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUN6QixDQUFDLENBQ0wsQ0FBQyxHQUFHLEVBQUUsQ0FDVixDQUFDLENBQUM7U0FDTjtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEFBQUMsQ0FBQzs7O0FDOUNwRCxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsR0FBSSxDQUFBLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxpQkFBaUIsRUFBRTtBQUNyRSxRQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztBQUN2Qix1QkFBZSxFQUFFLElBQUk7QUFDckIsYUFBSyxFQUFFLElBQUk7QUFDWCxlQUFPLEVBQUUsSUFBSTtBQUNiLGFBQUssRUFBRSxTQUFTO0FBQ2hCLGtCQUFVLEVBQUUsU0FBUztLQUN4QixDQUFDO1FBRUYsYUFBYSxHQUFHLFNBQWhCLGFBQWEsQ0FBWSxDQUFDLEVBQUU7QUFDeEIsZUFBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUEsQ0FBRSxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUN0QyxDQUFDOzs7QUFHTixNQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2IsTUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNmLE1BQUUsQ0FBQyxLQUFLLENBQUM7QUFDTCxVQUFFLEVBQUUsTUFBTTtLQUNiLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsWUFBVztBQUNwQyxZQUFJLE1BQU0sR0FBRyxhQUFhLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ2hELGVBQU8sTUFBTSxJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3ZFLENBQUM7O0FBRUYsTUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLFlBQVc7QUFDcEMsWUFBSSxNQUFNLEdBQUcsYUFBYSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUNoRCxlQUFPLE1BQU0sSUFBSSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDeEQsQ0FBQzs7QUFFRixNQUFFLENBQUMsZUFBZSxDQUFDLFFBQVEsR0FBRyxZQUFXO0FBQ3JDLFlBQUksTUFBTSxHQUFHLGFBQWEsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztBQUNqRCxlQUFPLE1BQU0sSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxTQUFTLENBQUM7S0FDM0QsQ0FBQzs7QUFFRixXQUFPLEVBQUUsQ0FBQztDQUNiLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxBQUFDLENBQUM7OztBQ3BDbkQsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxNQUFNLEVBQUU7QUFDckQsV0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLEVBQUMsUUFBUSxFQUFFLGFBQWEsRUFBQyxDQUFDLENBQUM7Q0FDcEcsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQUFBQyxDQUFDOzs7QUNGOUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUUsaUJBQWlCLEVBQUU7QUFDMUQsUUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7QUFDdkIsdUJBQWUsRUFBRSxJQUFJO0FBQ3JCLHNCQUFjLEVBQUUsU0FBUztLQUM1QixDQUFDO1FBRUYsYUFBYSxHQUFHLFNBQWhCLGFBQWEsQ0FBWSxDQUFDLEVBQUU7QUFDeEIsZUFBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUEsQ0FBRSxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUN0QyxDQUFDOzs7QUFHTixNQUFFLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUMxQixVQUFFLEVBQUUsTUFBTTtLQUNiLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsY0FBYyxDQUFDLFFBQVEsR0FBRyxZQUFXO0FBQ3BDLFlBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFDN0MsZUFBTyxNQUFNLENBQUM7S0FDakIsQ0FBQzs7QUFFRixNQUFFLENBQUMsZUFBZSxDQUFDLFFBQVEsR0FBRyxZQUFXO0FBQ3JDLFlBQUksTUFBTSxHQUFHLGFBQWEsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztBQUNqRCxlQUFPLE1BQU0sSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxTQUFTLENBQUM7S0FDM0QsQ0FBQzs7QUFFRixXQUFPLEVBQUUsQ0FBQztDQUNiLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxBQUFDLENBQUM7OztBQzFCdkMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFJLENBQUEsVUFBUyxDQUFDLEVBQUUsTUFBTSxFQUFFO0FBQzdDLFdBQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsRUFBQyxRQUFRLEVBQUUsYUFBYSxFQUFDLENBQUMsQ0FBQztDQUN0RixDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxBQUFDLENBQUM7OztBQ0Y5QixNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzlDLFFBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDcEIsV0FBTztBQUNILGtCQUFVLEVBQUUsc0JBQVc7QUFDbkIsZ0JBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxrQkFBa0I7Z0JBQ2pDLFFBQVEsR0FBRyxLQUFLLENBQUMsb0JBQW9CO2dCQUNyQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ2xCLGFBQWEsR0FBRyxDQUFDO0FBQ2IseUJBQVMsRUFBRSxZQUFZO0FBQ3ZCLG9CQUFJLEVBQUU7QUFDRixzQkFBRSxFQUFFLFFBQVEsQ0FBQyxlQUFlO0FBQzVCLCtCQUFXLEVBQUUseURBQXlEO2lCQUN6RTthQUNKLEVBQUU7QUFDQyx5QkFBUyxFQUFFLGdCQUFnQjtBQUMzQixvQkFBSSxFQUFFO0FBQ0YseUJBQUssRUFBRSxjQUFjO0FBQ3JCLHdCQUFJLEVBQUUsT0FBTztBQUNiLHNCQUFFLEVBQUUsUUFBUSxDQUFDLEtBQUs7QUFDbEIsMkJBQU8sRUFBRSxDQUFDO0FBQ04sNkJBQUssRUFBRSxFQUFFO0FBQ1QsOEJBQU0sRUFBRSxhQUFhO3FCQUN4QixFQUFFO0FBQ0MsNkJBQUssRUFBRSxNQUFNO0FBQ2IsOEJBQU0sRUFBRSxNQUFNO3FCQUNqQixFQUFFO0FBQ0MsNkJBQUssRUFBRSxTQUFTO0FBQ2hCLDhCQUFNLEVBQUUsU0FBUztxQkFDcEIsRUFBRTtBQUNDLDZCQUFLLEVBQUUsU0FBUztBQUNoQiw4QkFBTSxFQUFFLFNBQVM7cUJBQ3BCLEVBQUU7QUFDQyw2QkFBSyxFQUFFLGdCQUFnQjtBQUN2Qiw4QkFBTSxFQUFFLGdCQUFnQjtxQkFDM0IsRUFBRTtBQUNDLDZCQUFLLEVBQUUsVUFBVTtBQUNqQiw4QkFBTSxFQUFFLFVBQVU7cUJBQ3JCLEVBQUU7QUFDQyw2QkFBSyxFQUFFLFlBQVk7QUFDbkIsOEJBQU0sRUFBRSxZQUFZO3FCQUN2QixFQUFFO0FBQ0MsNkJBQUssRUFBRSxTQUFTO0FBQ2hCLDhCQUFNLEVBQUUsU0FBUztxQkFDcEIsQ0FBQztpQkFDTDthQUNKLEVBQUU7QUFDQyx5QkFBUyxFQUFFLGdCQUFnQjtBQUMzQixvQkFBSSxFQUFFO0FBQ0YseUJBQUssRUFBRSxTQUFTO0FBQ2hCLHdCQUFJLEVBQUUsU0FBUztBQUNmLHNCQUFFLEVBQUUsUUFBUSxDQUFDLE9BQU87QUFDcEIsMkJBQU8sRUFBRSxDQUFDO0FBQ04sNkJBQUssRUFBRSxFQUFFO0FBQ1QsOEJBQU0sRUFBRSxhQUFhO3FCQUN4QixFQUFFO0FBQ0MsNkJBQUssRUFBRSxTQUFTO0FBQ2hCLDhCQUFNLEVBQUUsU0FBUztxQkFDcEIsRUFBRTtBQUNDLDZCQUFLLEVBQUUsTUFBTTtBQUNiLDhCQUFNLEVBQUUsTUFBTTtxQkFDakIsRUFBRTtBQUNDLDZCQUFLLEVBQUUsUUFBUTtBQUNmLDhCQUFNLEVBQUUsUUFBUTtxQkFDbkIsRUFBRTtBQUNDLDZCQUFLLEVBQUUsU0FBUztBQUNoQiw4QkFBTSxFQUFFLFVBQVU7cUJBQ3JCLENBQUM7aUJBQ0w7YUFDSixFQUFFO0FBQ0MseUJBQVMsRUFBRSxtQkFBbUI7QUFDOUIsb0JBQUksRUFBRTtBQUNGLHlCQUFLLEVBQUUsZUFBZTtBQUN0Qix5QkFBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRztBQUN6Qix3QkFBSSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRztpQkFDM0I7YUFDSixFQUFFO0FBQ0MseUJBQVMsRUFBRSxpQkFBaUI7QUFDNUIsb0JBQUksRUFBRTtBQUNGLHlCQUFLLEVBQUUsa0JBQWtCO0FBQ3pCLHlCQUFLLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHO0FBQzlCLHdCQUFJLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHO2lCQUNoQzthQUNKLENBQUM7Z0JBQ0YsTUFBTSxHQUFHLFNBQVQsTUFBTSxHQUFjO0FBQ2hCLHFCQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDYixzQkFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVMsV0FBVyxFQUFFO0FBQ3JFLHlCQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUM5QixDQUFDLENBQUM7QUFDSCx1QkFBTyxLQUFLLENBQUM7YUFDaEIsQ0FBQzs7QUFFTixtQkFBTztBQUNILHdCQUFRLEVBQUUsUUFBUTtBQUNsQiw2QkFBYSxFQUFFLGFBQWE7QUFDNUIsc0JBQU0sRUFBRTtBQUNKLHdCQUFJLEVBQUUsTUFBTTtBQUNaLHlCQUFLLEVBQUUsS0FBSztpQkFDZjtBQUNELG9CQUFJLEVBQUU7QUFDRix5QkFBSyxFQUFFLFFBQVE7aUJBQ2xCO0FBQ0Qsc0JBQU0sRUFBRSxNQUFNO2FBQ2pCLENBQUM7U0FDTDs7QUFFRCxZQUFJLEVBQUUsY0FBUyxJQUFJLEVBQUU7QUFDakIsbUJBQU8sQ0FDSCxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUU7QUFDdkIsb0JBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWE7QUFDakMsNkJBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtBQUNqQyxzQkFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO2FBQ3RCLENBQUMsRUFDRixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUU7QUFDckIsa0JBQUUsRUFBRSxJQUFJLENBQUMsTUFBTTtBQUNmLHdCQUFRLEVBQUUsQ0FBQyxDQUFDLHFCQUFxQjtBQUNqQywwQkFBVSxFQUFFLENBQUMsQ0FBQyx1QkFBdUI7YUFDeEMsQ0FBQyxDQUNMLENBQUM7U0FDTDtLQUNKLENBQUM7Q0FDTCxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQUMsQ0FBQzs7O0FDeEhuQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3RDLFFBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDcEIsV0FBTztBQUNILGtCQUFVLEVBQUUsc0JBQVc7QUFDbkIsZ0JBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxVQUFVO2dCQUN6QixRQUFRLEdBQUcsS0FBSyxDQUFDLFlBQVk7Z0JBQzdCLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDbEIsV0FBVyxHQUFHLENBQUM7QUFDWCx5QkFBUyxFQUFFLFdBQVc7QUFDdEIsNEJBQVksRUFBRSxnQkFBZ0I7YUFDakMsQ0FBQztnQkFDRixhQUFhLEdBQUcsQ0FBQztBQUNiLHlCQUFTLEVBQUUsWUFBWTtBQUN2QixvQkFBSSxFQUFFO0FBQ0Ysc0JBQUUsRUFBRSxRQUFRLENBQUMsZUFBZTtBQUM1QiwrQkFBVyxFQUFFLDRDQUE0QztpQkFDNUQ7YUFDSixFQUFFO0FBQ0MseUJBQVMsRUFBRSxnQkFBZ0I7QUFDM0Isb0JBQUksRUFBRTtBQUNGLHlCQUFLLEVBQUUsY0FBYztBQUNyQix5QkFBSyxFQUFFLFFBQVE7QUFDZix3QkFBSSxFQUFFLGdCQUFnQjtBQUN0QixzQkFBRSxFQUFFLFFBQVEsQ0FBQyxjQUFjO0FBQzNCLDJCQUFPLEVBQUUsQ0FBQztBQUNOLDZCQUFLLEVBQUUsRUFBRTtBQUNULDhCQUFNLEVBQUUsYUFBYTtxQkFDeEIsRUFBRTtBQUNDLDZCQUFLLEVBQUUsSUFBSTtBQUNYLDhCQUFNLEVBQUUsT0FBTztxQkFDbEIsRUFBRTtBQUNDLDZCQUFLLEVBQUUsQ0FBQyxJQUFJO0FBQ1osOEJBQU0sRUFBRSxZQUFZO3FCQUN2QixDQUFDO2lCQUNMO2FBQ0osQ0FBQztnQkFDRixNQUFNLEdBQUcsU0FBVCxNQUFNLEdBQWM7QUFDaEIsc0JBQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFTLFdBQVcsRUFBRTtBQUNyRSx5QkFBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDOUIsQ0FBQyxDQUFDO0FBQ0gsdUJBQU8sS0FBSyxDQUFDO2FBQ2hCLENBQUM7O0FBRU4sbUJBQU87QUFDSCx3QkFBUSxFQUFFLFFBQVE7QUFDbEIsNkJBQWEsRUFBRSxhQUFhO0FBQzVCLHNCQUFNLEVBQUU7QUFDSix3QkFBSSxFQUFFLE1BQU07QUFDWix5QkFBSyxFQUFFLEtBQUs7aUJBQ2Y7QUFDRCxzQkFBTSxFQUFFLE1BQU07YUFDakIsQ0FBQztTQUNMOztBQUVELFlBQUksRUFBRSxjQUFTLElBQUksRUFBRTtBQUNqQixnQkFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDOztBQUV6QixtQkFBTyxDQUNILENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRTtBQUN2QixvQkFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYTtBQUNqQyw2QkFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO0FBQ2pDLHFCQUFLLEVBQUUsS0FBSztBQUNaLHNCQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07YUFDdEIsQ0FBQyxFQUNGLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRTtBQUNyQixrQkFBRSxFQUFFLElBQUksQ0FBQyxNQUFNO0FBQ2YscUJBQUssRUFBRSxLQUFLO0FBQ1osd0JBQVEsRUFBRSxDQUFDLENBQUMsYUFBYTtBQUN6QiwwQkFBVSxFQUFFLENBQUMsQ0FBQyxlQUFlO2FBQ2hDLENBQUMsQ0FDTCxDQUFDO1NBQ0w7S0FDSixDQUFDO0NBQ0wsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxBQUFDLENBQUMiLCJmaWxlIjoiY2F0YXJzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIndpbmRvdy5jID0gKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIG1vZGVsczoge30sXG4gICAgICAgIHJvb3Q6IHt9LFxuICAgICAgICBhZG1pbjoge30sXG4gICAgICAgIGg6IHt9XG4gICAgfTtcbn0oKSk7XG4iLCJ3aW5kb3cuYy5oID0gKChtLCBtb21lbnQsIEkxOG4pID0+IHtcbiAgICAvL0RhdGUgSGVscGVyc1xuXG4gICAgY29uc3QgaGFzaE1hdGNoID0gKHN0cikgPT4geyByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhhc2ggPT09IHN0cjsgfSxcbiAgICAgICAgcGFyYW1CeU5hbWUgPSAobmFtZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgbm9ybWFsTmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW10vLCAnXFxcXFsnKS5yZXBsYWNlKC9bXFxdXS8sICdcXFxcXScpLFxuICAgICAgICAgICAgICAgIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnW1xcXFw/Jl0nICsgbm9ybWFsTmFtZSArICc9KFteJiNdKiknKSxcbiAgICAgICAgICAgICAgICByZXN1bHRzID0gcmVnZXguZXhlYyhsb2NhdGlvbi5zZWFyY2gpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHMgPT09IG51bGwgPyAnJyA6IGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzFdLnJlcGxhY2UoL1xcKy9nLCAnICcpKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0TW9tZW50aWZ5TG9jYWxlID0gKCkgPT4ge1xuICAgICAgICAgICAgbW9tZW50LmxvY2FsZSgncHQnLCB7XG4gICAgICAgICAgICAgICAgICAgIG1vbnRoc1Nob3J0OiAnamFuX2Zldl9tYXJfYWJyX21haV9qdW5fanVsX2Fnb19zZXRfb3V0X25vdl9kZXonLnNwbGl0KCdfJylcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZXhpc3R5ID0gKHgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB4ICE9IG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW9tZW50aWZ5ID0gKGRhdGUsIGZvcm1hdCkgPT4ge1xuICAgICAgICAgICAgZm9ybWF0ID0gZm9ybWF0IHx8ICdERC9NTS9ZWVlZJztcbiAgICAgICAgICAgIHJldHVybiBkYXRlID8gbW9tZW50KGRhdGUpLmxvY2FsZSgncHQnKS5mb3JtYXQoZm9ybWF0KSA6ICdubyBkYXRlJztcbiAgICAgICAgfSxcblxuICAgICAgICBzdG9yZUFjdGlvbiA9IChhY3Rpb24pID0+IHtcbiAgICAgICAgICAgIGlmICghc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShhY3Rpb24pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oYWN0aW9uLCBhY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGNhbGxTdG9yZWRBY3Rpb24gPSAoYWN0aW9uLCBmdW5jKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShhY3Rpb24pKSB7XG4gICAgICAgICAgICAgICAgZnVuYy5jYWxsKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oYWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkaXNjdXNzID0gKHBhZ2UsIGlkZW50aWZpZXIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGQgPSBkb2N1bWVudCxcbiAgICAgICAgICAgICAgICBzID0gZC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgICAgIHdpbmRvdy5kaXNxdXNfY29uZmlnID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYWdlLnVybCA9IHBhZ2U7XG4gICAgICAgICAgICAgICAgdGhpcy5wYWdlLmlkZW50aWZpZXIgPSBpZGVudGlmaWVyO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHMuc3JjID0gJy8vY2F0YXJzZWZsZXguZGlzcXVzLmNvbS9lbWJlZC5qcyc7XG4gICAgICAgICAgICBzLnNldEF0dHJpYnV0ZSgnZGF0YS10aW1lc3RhbXAnLCArbmV3IERhdGUoKSk7XG4gICAgICAgICAgICAoZC5oZWFkIHx8IGQuYm9keSkuYXBwZW5kQ2hpbGQocyk7XG4gICAgICAgICAgICByZXR1cm4gbSgnJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW9tZW50RnJvbVN0cmluZyA9IChkYXRlLCBmb3JtYXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGV1cm9wZWFuID0gbW9tZW50KGRhdGUsIGZvcm1hdCB8fCAnREQvTU0vWVlZWScpO1xuICAgICAgICAgICAgcmV0dXJuIGV1cm9wZWFuLmlzVmFsaWQoKSA/IGV1cm9wZWFuIDogbW9tZW50KGRhdGUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRyYW5zbGF0ZWRUaW1lVW5pdHMgPSB7XG4gICAgICAgICAgICBkYXlzOiAnZGlhcycsXG4gICAgICAgICAgICBtaW51dGVzOiAnbWludXRvcycsXG4gICAgICAgICAgICBob3VyczogJ2hvcmFzJyxcbiAgICAgICAgICAgIHNlY29uZHM6ICdzZWd1bmRvcydcbiAgICAgICAgfSxcbiAgICAgICAgLy9PYmplY3QgbWFuaXB1bGF0aW9uIGhlbHBlcnNcbiAgICAgICAgdHJhbnNsYXRlZFRpbWUgPSAodGltZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRlZFRpbWUgPSB0cmFuc2xhdGVkVGltZVVuaXRzLFxuICAgICAgICAgICAgICAgIHVuaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb2pVbml0ID0gdHJhbnNsYXRlZFRpbWVbdGltZS51bml0IHx8ICdzZWNvbmRzJ107XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICh0aW1lLnRvdGFsIDw9IDEpID8gcHJvalVuaXQuc2xpY2UoMCwgLTEpIDogcHJvalVuaXQ7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1bml0OiB1bml0KCksXG4gICAgICAgICAgICAgICAgdG90YWw6IHRpbWUudG90YWxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy9OdW1iZXIgZm9ybWF0dGluZyBoZWxwZXJzXG4gICAgICAgIGdlbmVyYXRlRm9ybWF0TnVtYmVyID0gKHMsIGMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAobnVtYmVyLCBuLCB4KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFfLmlzTnVtYmVyKG51bWJlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgcmUgPSAnXFxcXGQoPz0oXFxcXGR7JyArICh4IHx8IDMpICsgJ30pKycgKyAobiA+IDAgPyAnXFxcXEQnIDogJyQnKSArICcpJyxcbiAgICAgICAgICAgICAgICAgICAgbnVtID0gbnVtYmVyLnRvRml4ZWQoTWF0aC5tYXgoMCwgfn5uKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChjID8gbnVtLnJlcGxhY2UoJy4nLCBjKSA6IG51bSkucmVwbGFjZShuZXcgUmVnRXhwKHJlLCAnZycpLCAnJCYnICsgKHMgfHwgJywnKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICBmb3JtYXROdW1iZXIgPSBnZW5lcmF0ZUZvcm1hdE51bWJlcignLicsICcsJyksXG5cbiAgICAgICAgdG9nZ2xlUHJvcCA9IChkZWZhdWx0U3RhdGUsIGFsdGVybmF0ZVN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwID0gbS5wcm9wKGRlZmF1bHRTdGF0ZSk7XG4gICAgICAgICAgICBwLnRvZ2dsZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcCgoKHAoKSA9PT0gYWx0ZXJuYXRlU3RhdGUpID8gZGVmYXVsdFN0YXRlIDogYWx0ZXJuYXRlU3RhdGUpKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlkVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgaWQ6ICdlcSdcbiAgICAgICAgfSksXG5cbiAgICAgICAgZ2V0VXNlciA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpLFxuICAgICAgICAgICAgICAgIGRhdGEgPSBfLmZpcnN0KGJvZHkpLmdldEF0dHJpYnV0ZSgnZGF0YS11c2VyJyk7XG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9jYXRpb25BY3Rpb25NYXRjaCA9IChhY3Rpb24pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFjdCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpLnNsaWNlKC0xKVswXTtcbiAgICAgICAgICAgIHJldHVybiBhY3Rpb24gPT09IGFjdDtcbiAgICAgICAgfSxcblxuICAgICAgICB1c2VBdmF0YXJPckRlZmF1bHQgPSAoYXZhdGFyUGF0aCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGF2YXRhclBhdGggfHwgJy9hc3NldHMvY2F0YXJzZV9ib290c3RyYXAvdXNlci5qcGcnO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vVGVtcGxhdGVzXG4gICAgICAgIGxvYWRlciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudS10ZXh0LWNlbnRlci51LW1hcmdpbnRvcC0zMCB1LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICBtKCdpbWdbYWx0PVwiTG9hZGVyXCJdW3NyYz1cImh0dHBzOi8vczMuYW1hem9uYXdzLmNvbS9jYXRhcnNlLmZpbGVzL2xvYWRlci5naWZcIl0nKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmV3RmVhdHVyZUJhZGdlID0gKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJ3NwYW4uYmFkZ2UuYmFkZ2Utc3VjY2Vzcy5tYXJnaW4tc2lkZS01JywgSTE4bi50KCdwcm9qZWN0cy5uZXdfZmVhdHVyZV9iYWRnZScpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmYlBhcnNlID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHJ5UGFyc2UgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LkZCLlhGQk1MLnBhcnNlKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gd2luZG93LnNldFRpbWVvdXQodHJ5UGFyc2UsIDUwMCk7IC8vdXNlIHRpbWVvdXQgdG8gd2FpdCBhc3luYyBvZiBmYWNlYm9va1xuICAgICAgICB9LFxuXG4gICAgICAgIHBsdXJhbGl6ZSA9IChjb3VudCwgcywgcCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChjb3VudCA+IDEgPyBjb3VudCArIHAgOiBjb3VudCArIHMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNpbXBsZUZvcm1hdCA9IChzdHIgPSAnJykgPT4ge1xuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoL1xcclxcbj8vLCAnXFxuJyk7XG4gICAgICAgICAgICBpZiAoc3RyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgvXFxuXFxuKy9nLCAnPC9wPjxwPicpO1xuICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9cXG4vZywgJzxiciAvPicpO1xuICAgICAgICAgICAgICAgIHN0ciA9ICc8cD4nICsgc3RyICsgJzwvcD4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgfSxcblxuICAgICAgICByZXdhcmRTb3VsZE91dCA9IChyZXdhcmQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAocmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyA+IDAgP1xuICAgICAgICAgICAgICAgIChyZXdhcmQucGFpZF9jb3VudCArIHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQgPj0gcmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucykgOiBmYWxzZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmV3YXJkUmVtYW5pbmcgPSAocmV3YXJkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyAtIChyZXdhcmQucGFpZF9jb3VudCArIHJld2FyZC53YWl0aW5nX3BheW1lbnRfY291bnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNlVXJsID0gKGhyZWYpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICBsLmhyZWYgPSBocmVmO1xuICAgICAgICAgICAgcmV0dXJuIGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWl4cGFuZWxUcmFjayA9ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LkNhdGFyc2VNaXhwYW5lbC5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgVUlIZWxwZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkICYmICQpIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LlVJSGVscGVyLnNldHVwUmVzcG9uc2l2ZUlmcmFtZXMoJChlbCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9BbmNob3IgPSAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKXtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cigxKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhhc2ggPT09IGVsLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gZWwuaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmFsaWRhdGVFbWFpbCA9IChlbWFpbCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmUgPSAvXigoW148PigpW1xcXVxcLiw7Olxcc0BcXFwiXSsoXFwuW148PigpW1xcXVxcLiw7Olxcc0BcXFwiXSspKil8KFxcXCIuK1xcXCIpKUAoKFtePD4oKVtcXF1cXC4sOzpcXHNAXFxcIl0rXFwuKStbXjw+KClbXFxdXFwuLDs6XFxzQFxcXCJdezIsfSkkL2k7XG4gICAgICAgICAgICByZXR1cm4gcmUudGVzdChlbWFpbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbmF2aWdhdGVUb0RldmlzZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9wdC9sb2dpbic7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3VtdWxhdGl2ZU9mZnNldCA9IChlbGVtZW50KSA9PiB7XG4gICAgICAgICAgICBsZXQgdG9wID0gMCwgbGVmdCA9IDA7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgdG9wICs9IGVsZW1lbnQub2Zmc2V0VG9wICB8fCAwO1xuICAgICAgICAgICAgICAgIGxlZnQgKz0gZWxlbWVudC5vZmZzZXRMZWZ0IHx8IDA7XG4gICAgICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQub2Zmc2V0UGFyZW50O1xuICAgICAgICAgICAgfSB3aGlsZSAoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgbGVmdDogbGVmdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBjbG9zZUZsYXNoID0gKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnaWNvbi1jbG9zZScpWzBdO1xuICAgICAgICAgICAgaWYgKF8uaXNFbGVtZW50KGVsKSl7XG4gICAgICAgICAgICAgICAgZWwub25jbGljayA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAgICAgICAgIGVsLnBhcmVudEVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgaTE4blNjb3BlID0gKHNjb3BlLCBvYmopID0+IHtcbiAgICAgICAgICAgIG9iaiA9IG9iaiB8fCB7fTtcbiAgICAgICAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgb2JqLCB7c2NvcGU6IHNjb3BlfSk7XG4gICAgICAgIH07XG5cbiAgICBzZXRNb21lbnRpZnlMb2NhbGUoKTtcbiAgICBjbG9zZUZsYXNoKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjdW11bGF0aXZlT2Zmc2V0OiBjdW11bGF0aXZlT2Zmc2V0LFxuICAgICAgICBkaXNjdXNzOiBkaXNjdXNzLFxuICAgICAgICBleGlzdHk6IGV4aXN0eSxcbiAgICAgICAgdmFsaWRhdGVFbWFpbDogdmFsaWRhdGVFbWFpbCxcbiAgICAgICAgbW9tZW50aWZ5OiBtb21lbnRpZnksXG4gICAgICAgIG1vbWVudEZyb21TdHJpbmc6IG1vbWVudEZyb21TdHJpbmcsXG4gICAgICAgIGZvcm1hdE51bWJlcjogZm9ybWF0TnVtYmVyLFxuICAgICAgICBpZFZNOiBpZFZNLFxuICAgICAgICBnZXRVc2VyOiBnZXRVc2VyLFxuICAgICAgICB0b2dnbGVQcm9wOiB0b2dnbGVQcm9wLFxuICAgICAgICBsb2FkZXI6IGxvYWRlcixcbiAgICAgICAgbmV3RmVhdHVyZUJhZGdlOiBuZXdGZWF0dXJlQmFkZ2UsXG4gICAgICAgIGZiUGFyc2U6IGZiUGFyc2UsXG4gICAgICAgIHBsdXJhbGl6ZTogcGx1cmFsaXplLFxuICAgICAgICBzaW1wbGVGb3JtYXQ6IHNpbXBsZUZvcm1hdCxcbiAgICAgICAgdHJhbnNsYXRlZFRpbWU6IHRyYW5zbGF0ZWRUaW1lLFxuICAgICAgICByZXdhcmRTb3VsZE91dDogcmV3YXJkU291bGRPdXQsXG4gICAgICAgIHJld2FyZFJlbWFuaW5nOiByZXdhcmRSZW1hbmluZyxcbiAgICAgICAgcGFyc2VVcmw6IHBhcnNlVXJsLFxuICAgICAgICBoYXNoTWF0Y2g6IGhhc2hNYXRjaCxcbiAgICAgICAgdXNlQXZhdGFyT3JEZWZhdWx0OiB1c2VBdmF0YXJPckRlZmF1bHQsXG4gICAgICAgIGxvY2F0aW9uQWN0aW9uTWF0Y2g6IGxvY2F0aW9uQWN0aW9uTWF0Y2gsXG4gICAgICAgIG1peHBhbmVsVHJhY2s6IG1peHBhbmVsVHJhY2ssXG4gICAgICAgIG5hdmlnYXRlVG9EZXZpc2U6IG5hdmlnYXRlVG9EZXZpc2UsXG4gICAgICAgIHN0b3JlQWN0aW9uOiBzdG9yZUFjdGlvbixcbiAgICAgICAgY2FsbFN0b3JlZEFjdGlvbjogY2FsbFN0b3JlZEFjdGlvbixcbiAgICAgICAgVUlIZWxwZXI6IFVJSGVscGVyLFxuICAgICAgICB0b0FuY2hvcjogdG9BbmNob3IsXG4gICAgICAgIHBhcmFtQnlOYW1lOiBwYXJhbUJ5TmFtZSxcbiAgICAgICAgaTE4blNjb3BlOiBpMThuU2NvcGVcbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Lm1vbWVudCwgd2luZG93LkkxOG4pKTtcbiIsIndpbmRvdy5jLm1vZGVscyA9IChmdW5jdGlvbihtKSB7XG4gICAgdmFyIGNvbnRyaWJ1dGlvbkRldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjb250cmlidXRpb25fZGV0YWlscycpLFxuICAgICAgICBwcm9qZWN0RGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfZGV0YWlscycpLFxuICAgICAgICB1c2VyRGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3VzZXJfZGV0YWlscycpLFxuICAgICAgICB1c2VyID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3VzZXJzJyksXG4gICAgICAgIHJld2FyZERldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdyZXdhcmRfZGV0YWlscycpLFxuICAgICAgICBwcm9qZWN0UmVtaW5kZXIgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9yZW1pbmRlcnMnKSxcbiAgICAgICAgY29udHJpYnV0aW9ucyA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjb250cmlidXRpb25zJyksXG4gICAgICAgIHRlYW1Ub3RhbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCd0ZWFtX3RvdGFscycpLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9ucycpLFxuICAgICAgICBwcm9qZWN0UG9zdERldGFpbCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X3Bvc3RzX2RldGFpbHMnKSxcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJEYXkgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zX3Blcl9kYXknKSxcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbiA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdwcm9qZWN0X2NvbnRyaWJ1dGlvbnNfcGVyX2xvY2F0aW9uJyksXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb25zUGVyUmVmID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9uc19wZXJfcmVmJyksXG4gICAgICAgIHByb2plY3QgPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdHMnKSxcbiAgICAgICAgcHJvamVjdFNlYXJjaCA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdycGMvcHJvamVjdF9zZWFyY2gnKSxcbiAgICAgICAgY2F0ZWdvcnkgPSBtLnBvc3RncmVzdC5tb2RlbCgnY2F0ZWdvcmllcycpLFxuICAgICAgICBjYXRlZ29yeVRvdGFscyA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjYXRlZ29yeV90b3RhbHMnKSxcbiAgICAgICAgY2F0ZWdvcnlGb2xsb3dlciA9IG0ucG9zdGdyZXN0Lm1vZGVsKCdjYXRlZ29yeV9mb2xsb3dlcnMnKSxcbiAgICAgICAgdGVhbU1lbWJlciA9IG0ucG9zdGdyZXN0Lm1vZGVsKCd0ZWFtX21lbWJlcnMnKSxcbiAgICAgICAgbm90aWZpY2F0aW9uID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ25vdGlmaWNhdGlvbnMnKSxcbiAgICAgICAgc3RhdGlzdGljID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3N0YXRpc3RpY3MnKTtcblxuICAgIHRlYW1NZW1iZXIucGFnZVNpemUoNDApO1xuICAgIHJld2FyZERldGFpbC5wYWdlU2l6ZShmYWxzZSk7XG4gICAgcHJvamVjdC5wYWdlU2l6ZSgzMCk7XG4gICAgY2F0ZWdvcnkucGFnZVNpemUoNTApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJpYnV0aW9uRGV0YWlsOiBjb250cmlidXRpb25EZXRhaWwsXG4gICAgICAgIHByb2plY3REZXRhaWw6IHByb2plY3REZXRhaWwsXG4gICAgICAgIHVzZXJEZXRhaWw6IHVzZXJEZXRhaWwsXG4gICAgICAgIHVzZXI6IHVzZXIsXG4gICAgICAgIHJld2FyZERldGFpbDogcmV3YXJkRGV0YWlsLFxuICAgICAgICBjb250cmlidXRpb25zOiBjb250cmlidXRpb25zLFxuICAgICAgICB0ZWFtVG90YWw6IHRlYW1Ub3RhbCxcbiAgICAgICAgdGVhbU1lbWJlcjogdGVhbU1lbWJlcixcbiAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgcHJvamVjdFNlYXJjaDogcHJvamVjdFNlYXJjaCxcbiAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5LFxuICAgICAgICBjYXRlZ29yeVRvdGFsczogY2F0ZWdvcnlUb3RhbHMsXG4gICAgICAgIGNhdGVnb3J5Rm9sbG93ZXI6IGNhdGVnb3J5Rm9sbG93ZXIsXG4gICAgICAgIHByb2plY3RDb250cmlidXRpb25zUGVyRGF5OiBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheSxcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbjogcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbixcbiAgICAgICAgcHJvamVjdENvbnRyaWJ1dGlvbnNQZXJSZWY6IHByb2plY3RDb250cmlidXRpb25zUGVyUmVmLFxuICAgICAgICBwcm9qZWN0Q29udHJpYnV0aW9uOiBwcm9qZWN0Q29udHJpYnV0aW9uLFxuICAgICAgICBwcm9qZWN0UG9zdERldGFpbDogcHJvamVjdFBvc3REZXRhaWwsXG4gICAgICAgIHByb2plY3RSZW1pbmRlcjogcHJvamVjdFJlbWluZGVyLFxuICAgICAgICBub3RpZmljYXRpb246IG5vdGlmaWNhdGlvbixcbiAgICAgICAgc3RhdGlzdGljOiBzdGF0aXN0aWNcbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMucm9vdC5GbGV4ID0gKGZ1bmN0aW9uKG0sIGMsIGgsIG1vZGVscykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIHByb2plY3RzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBsID0gbS5wcm9wKCksXG4gICAgICAgICAgICAgICAgc2FtcGxlMyA9IF8ucGFydGlhbChfLnNhbXBsZSwgXywgMyksXG4gICAgICAgICAgICAgICAgYnVpbGRlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgY3VzdG9tQWN0aW9uOiAnLy9jYXRhcnNlLnVzNS5saXN0LW1hbmFnZS5jb20vc3Vic2NyaWJlL3Bvc3Q/dT1lYmZjZDBkMTZkYmIwMDAxYTBiZWEzNjM5JmFtcDtpZD04YTRjMWEzM2NlJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgYWRkRGlzcXVzID0gKGVsLCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaC5kaXNjdXNzKCdodHRwczovL2NhdGFyc2UubWUvZmxleCcsICdmbGV4X3BhZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZmxleFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogJ2VxJyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBzdGF0c0xvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihtb2RlbHMuc3RhdGlzdGljLmdldFJvd09wdGlvbnMoKSk7XG5cbiAgICAgICAgICAgIGZsZXhWTS5tb2RlKCdmbGV4Jykuc3RhdGUoJ29ubGluZScpO1xuXG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0c0xvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcihtb2RlbHMucHJvamVjdC5nZXRQYWdlT3B0aW9ucyhmbGV4Vk0ucGFyYW1ldGVycygpKSwgbS5wb3N0Z3Jlc3QucmVxdWVzdCk7XG5cbiAgICAgICAgICAgIHN0YXRzTG9hZGVyLmxvYWQoKS50aGVuKHN0YXRzKTtcblxuICAgICAgICAgICAgcHJvamVjdHNMb2FkZXIubG9hZCgpLnRoZW4oXy5jb21wb3NlKHByb2plY3RzLCBzYW1wbGUzKSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYWRkRGlzcXVzOiBhZGREaXNxdXMsXG4gICAgICAgICAgICAgICAgYnVpbGRlcjogYnVpbGRlcixcbiAgICAgICAgICAgICAgICBzdGF0c0xvYWRlcjogc3RhdHNMb2FkZXIsXG4gICAgICAgICAgICAgICAgc3RhdHM6IHN0YXRzLFxuICAgICAgICAgICAgICAgIHByb2plY3RzTG9hZGVyOiBwcm9qZWN0c0xvYWRlcixcbiAgICAgICAgICAgICAgICBwcm9qZWN0czoge2NvbGxlY3Rpb246IHByb2plY3RzfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgbGV0IHN0YXRzID0gXy5maXJzdChjdHJsLnN0YXRzKCkpO1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLmhlcm8tZnVsbC5oZXJvLXplbG8nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLmxvZ28tZmxleC1ob21lW3NyYz1cXCcvYXNzZXRzL2xvZ28tZmxleC5wbmdcXCddW3dpZHRoPVxcJzM1OVxcJ10nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tNjAudy1jb2wtcHVzaC0yLnctY29sLTgnLCAnVmFtb3MgY29uc3RydWlyIHVtYSBub3ZhIG1vZGFsaWRhZGUgZGUgY3Jvd2RmdW5kaW5nIHBhcmEgbyBDYXRhcnNlISAgSnVudGUtc2UgYSBuw7NzLCBpbnNjcmV2YSBzZXUgZW1haWwhJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nU2lnbnVwLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkZXI6IGN0cmwuYnVpbGRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QudS1tYXJnaW50b3AtNDAudS10ZXh0LWNlbnRlcicsICdQcmEgcXVlbSBzZXLDoT8nKSwgbSgnLmZvbnRzaXplLWJhc2UudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS02MCcsICdJbmljaWFyZW1vcyBhIGZhc2UgZGUgdGVzdGVzIGNvbSBjYXRlZ29yaWFzIGRlIHByb2pldG9zIGVzcGVjw61maWNhcycpLCBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5M2EwMWI2NmUyNTBhY2E2N2NiX2ljb24temVsby1jb20ucG5nXFwnXVt3aWR0aD1cXCcyMTBcXCddJyksIG0oJy5mb250c2l6ZS1sYXJnZXN0LmxpbmVoZWlnaHQtbG9vc2UnLCAnQ2F1c2FzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgncC5mb250c2l6ZS1iYXNlJywgJ0ZsZXhpYmlsaWRhZGUgcGFyYSBjYXVzYXMgZGUgaW1wYWN0byEgRXN0YXJlbW9zIGFiZXJ0b3MgYSBjYW1wYW5oYXMgZGUgb3JnYW5pemHDp8O1ZXMgb3UgcGVzc29hcyBmw61zaWNhcyBwYXJhIGFycmVjYWRhw6fDo28gZGUgcmVjdXJzb3MgcGFyYSBjYXVzYXMgcGVzc29haXMsIHByb2pldG9zIGFzc2lzdGVuY2lhbGlzdGFzLCBzYcO6ZGUsIGFqdWRhcyBodW1hbml0w6FyaWFzLCBwcm90ZcOnw6NvIGFvcyBhbmltYWlzLCBlbXByZWVuZGVkb3Jpc21vIHNvY2lvYW1iaWVudGFsLCBhdGl2aXNtbyBvdSBxdWFscXVlciBjb2lzYSBxdWUgdW5hIGFzIHBlc3NvYXMgcGFyYSBmYXplciBvIGJlbS4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5MjlhMGRhZWEyMzBhNWYxMmNkX2ljb24temVsby1wZXNzb2FsLnBuZ1xcJ11bd2lkdGg9XFwnMjEwXFwnXScpLCBtKCcuZm9udHNpemUtbGFyZ2VzdC5saW5laGVpZ2h0LWxvb3NlJywgJ1ZhcXVpbmhhcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJ3AuZm9udHNpemUtYmFzZScsICdDYW1wYW5oYXMgc2ltcGxlcyBxdWUgcHJlY2lzYW0gZGUgZmxleGliaWxpZGFkZSBwYXJhIGFycmVjYWRhciBkaW5oZWlybyBjb20gcGVzc29hcyBwcsOzeGltYXMuIEVzdGFyZW1vcyBhYmVydG9zIGEgdW1hIHZhcmllZGFkZSBkZSBjYW1wYW5oYXMgcGVzc29haXMgcXVlIHBvZGVtIGlyIGRlc2RlIGNvYnJpciBjdXN0b3MgZGUgZXN0dWRvcyBhIGFqdWRhciBxdWVtIHByZWNpc2EgZGUgdHJhdGFtZW50byBtw6lkaWNvLiBEZSBqdW50YXIgYSBncmFuYSBwYXJhIGZhemVyIGFxdWVsYSBmZXN0YSBhIGNvbXByYXIgcHJlc2VudGVzIHBhcmEgYWxndcOpbSBjb20gYSBhanVkYSBkYSBnYWxlcmEuICcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctc2VjdGlvbi5zZWN0aW9uLmJnLWdyZWVubGltZS5mb250Y29sb3ItbmVnYXRpdmUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlc3QudS1tYXJnaW50b3AtNDAudS1tYXJnaW5ib3R0b20tNjAudS10ZXh0LWNlbnRlcicsICdDb21vIGZ1bmNpb25hcsOhPycpLCBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2MGUzOWM1NzhiMjg0NDkzZTJhNDI4YV96ZWxvLW1vbmV5LnBuZ1xcJ11bd2lkdGg9XFwnMTgwXFwnXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwLnUtdGV4dC1jZW50ZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsICdGaXF1ZSBjb20gcXVhbnRvIGFycmVjYWRhcicpLCBtKCdwLnUtdGV4dC1jZW50ZXIuZm9udHNpemUtYmFzZScsICdPIGZsZXggw6kgcGFyYSBpbXB1bHNpb25hciBjYW1wYW5oYXMgb25kZSB0b2RvIGRpbmhlaXJvIMOpIGJlbSB2aW5kbyEgVm9jw6ogZmljYSBjb20gdHVkbyBxdWUgY29uc2VndWlyIGFycmVjYWRhci4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWdbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTYwZTM5ZDM3YzAxM2Q0YTNlZTY4N2QyX2ljb24tcmV3YXJkLnBuZ1xcJ11bd2lkdGg9XFwnMTgwXFwnXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwLnUtdGV4dC1jZW50ZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsICdOw6NvIHByZWNpc2EgZGUgcmVjb21wZW5zYXMnKSwgbSgncC51LXRleHQtY2VudGVyLmZvbnRzaXplLWJhc2UnLCAnTm8gZmxleCBvZmVyZWNlciByZWNvbXBlbnNhcyDDqSBvcGNpb25hbC4gVm9jw6ogZXNjb2xoZSBzZSBvZmVyZWPDqi1sYXMgZmF6IHNlbnRpZG8gcGFyYSBvIHNldSBwcm9qZXRvIGUgY2FtcGFuaGEuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZ1tzcmM9XFwnaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NjBlMzlmYjAxYjY2ZTI1MGFjYTY3ZTNfaWNvbi1jdXJhZC5wbmdcXCddW3dpZHRoPVxcJzE4MFxcJ10nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC51LXRleHQtY2VudGVyLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnVm9jw6ogbWVzbW8gcHVibGljYSBzZXUgcHJvamV0bycpLCBtKCdwLnUtdGV4dC1jZW50ZXIuZm9udHNpemUtYmFzZScsICdUb2RvcyBvcyBwcm9qZXRvcyBpbnNjcml0b3Mgbm8gZmxleCBlbnRyYW0gbm8gYXIuIEFnaWxpZGFkZSBlIGZhY2lsaWRhZGUgcGFyYSB2b2PDqiBjYXB0YXIgcmVjdXJzb3MgYXRyYXbDqXMgZGEgaW50ZXJuZXQuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU2MGUzOWU3N2MwMTNkNGEzZWU2ODdkNF9pY29uLXRpbWUucG5nXFwnXVt3aWR0aD1cXCcxODBcXCddJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAudS10ZXh0LWNlbnRlci5mb250d2VpZ2h0LXNlbWlib2xkJywgJ0VuY2VycmUgYSBjYW1wYW5oYSBxdWFuZG8gcXVpc2VyJyksIG0oJ3AudS10ZXh0LWNlbnRlci5mb250c2l6ZS1iYXNlJywgJ07Do28gaMOhIGxpbWl0ZSBkZSB0ZW1wbyBkZSBjYXB0YcOnw6NvLiBWb2PDqiBlc2NvbGhlICBxdWFuZG8gZW5jZXJyYXIgc3VhIGNhbXBhbmhhIGUgcmVjZWJlciBvcyB2YWxvcmVzIGFycmVjYWRhZG9zLicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZWRpdGFibGUuZm9udHNpemUtbGFyZ2VyLnUtbWFyZ2ludG9wLTQwLnUtbWFyZ2luLWJvdHRvbS00MC51LXRleHQtY2VudGVyJywgJ0Nvbmhlw6dhIGFsZ3VucyBkb3MgcHJpbWVpcm9zIHByb2pldG9zIGZsZXgnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnByb2plY3RzTG9hZGVyKCkgPyBoLmxvYWRlcigpIDogbS5jb21wb25lbnQoYy5Qcm9qZWN0Um93LCB7Y29sbGVjdGlvbjogY3RybC5wcm9qZWN0cywgcmVmOiAnY3Ryc2VfZmxleCcsIHdyYXBwZXI6ICcudy1yb3cudS1tYXJnaW50b3AtNDAnfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLmRpdmlkZXInKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS02MC51LW1hcmdpbnRvcC00MCcsICdEw7p2aWRhcycpLCBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogJ1F1YWlzIHPDo28gYXMgdGF4YXMgZGEgbW9kYWxpZGFkZSBmbGV4w612ZWw/ICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiAnQ29tbyBubyBDYXRhcnNlLCBlbnZpYXIgdW0gcHJvamV0byBuw6NvIGN1c3RhIG5hZGEhIEVzdGFtb3MgZXN0dWRhbmRvIG9ww6fDtWVzIHBhcmEgZW50ZW5kZXIgcXVhbCBzZXLDoSBhIHRheGEgY29icmFkYSBubyBzZXJ2acOnbyBDYXRhcnNlIGZsZXguJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiAnRGUgb25kZSB2ZW0gbyBkaW5oZWlybyBkbyBtZXUgcHJvamV0bz8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogJ0ZhbcOtbGlhLCBhbWlnb3MsIGbDo3MgZSBtZW1icm9zIGRlIGNvbXVuaWRhZGVzIHF1ZSB2b2PDqiBmYXogcGFydGUgc8OjbyBzZXVzIG1haW9yZXMgY29sYWJvcmFkb3Jlcy4gU8OjbyBlbGVzIHF1ZSBpcsOjbyBkaXZ1bGdhciBzdWEgY2FtcGFuaGEgcGFyYSBhcyBwZXNzb2FzIHF1ZSBlbGVzIGNvbmhlY2VtLCBlIGFzc2ltIG8gY8OtcmN1bG8gZGUgYXBvaWFkb3JlcyB2YWkgYXVtZW50YW5kbyBlIGEgc3VhIGNhbXBhbmhhIGdhbmhhIGZvcsOnYS4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246ICdRdWFsIGEgZGlmZXJlbsOnYSBlbnRyZSBvIGZsZXjDrXZlbCBlIG8gXCJ0dWRvIG91IG5hZGFcIj8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogJ0F0dWFsbWVudGUgbyBDYXRhcnNlIHV0aWxpemEgYXBlbmFzIG8gbW9kZWxvIFwidHVkbyBvdSBuYWRhXCIsIG9uZGUgdm9jw6ogc8OzIGZpY2EgY29tIG8gZGluaGVpcm8gc2UgYmF0ZXIgYSBtZXRhIGRlIGFycmVjYWRhw6fDo28gZGVudHJvIGRvIHByYXpvIGRhIGNhbXBhbmhhLiBPIG1vZGVsbyBmbGV4w612ZWwgw6kgZGlmZXJlbnRlIHBvaXMgcGVybWl0ZSBxdWUgbyByZWFsaXphZG9yIGZpcXVlIGNvbSBvIHF1ZSBhcnJlY2FkYXIsIGluZGVwZW5kZW50ZSBkZSBhdGluZ2lyIG91IG7Do28gYSBtZXRhIGRvIHByb2pldG8gbm8gcHJhem8gZGEgY2FtcGFuaGEuIE7Do28gaGF2ZXLDoSBsaW1pdGUgZGUgdGVtcG8gcGFyYSBhcyBjYW1wYW5oYXMuIE5vc3NvIHNpc3RlbWEgZmxleMOtdmVsIHNlcsOhIGFsZ28gbm92byBlbSByZWxhw6fDo28gYW9zIG1vZGVsb3MgcXVlIGV4aXN0ZW0gYXR1YWxtZW50ZSBubyBtZXJjYWRvLidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctY29sLnctY29sLTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdRQSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiAnUG9zc28gaW5zY3JldmVyIHByb2pldG9zIHBhcmEgYSBtb2RhbGlkYWRlIGZsZXjDrXZlbCBqw6E/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdQb3IgZW5xdWFudG8gbsOjby4gQSBtb2RhbGlkYWRlIGZsZXggc2Vyw6EgdGVzdGFkYSBjb20gYWxndW5zIHByb2pldG9zIGVzcGVjw61maWNvcy4gSW5zY3JldmEgc2V1IGVtYWlsIGUgcGFydGljaXBlIGRhIGNvbnZlcnNhIG5lc3NhIHDDoWdpbmEgcGFyYSByZWNlYmVyIGluZm9ybWHDp8O1ZXMsIG1hdGVyaWFpcywgYWNvbXBhbmhhciBwcm9qZXRvcyBlbSB0ZXN0ZSBlIHNhYmVyIGNvbSBhbnRlY2Vkw6puY2lhIGEgZGF0YSBkZSBsYW7Dp2FtZW50byBkbyBmbGV4LidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogJ1BvciBxdcOqIHZvY8OqcyBxdWVyZW0gZmF6ZXIgbyBDYXRhcnNlIGZsZXg/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6ICdBY3JlZGl0YW1vcyBxdWUgbyBhbWJpZW50ZSBkbyBjcm93ZGZ1bmRpbmcgYnJhc2lsZWlybyBhaW5kYSB0ZW0gZXNwYcOnbyBwYXJhIG11aXRhcyBhw6fDtWVzLCB0ZXN0ZXMgZSBleHBlcmltZW50YcOnw7VlcyBwYXJhIGVudGVuZGVyIGRlIGZhdG8gbyBxdWUgYXMgcGVzc29hcyBwcmVjaXNhbS4gU29uaGFtb3MgY29tIHRvcm5hciBvIGZpbmFuY2lhbWVudG8gY29sZXRpdm8gdW0gaMOhYml0byBubyBCcmFzaWwuIE8gQ2F0YXJzZSBmbGV4IMOpIG1haXMgdW0gcGFzc28gbmVzc2EgZGlyZcOnw6NvLidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWVzdGlvbjogJ1F1YW5kbyB2b2PDqnMgaXLDo28gbGFuw6dhciBvIENhdGFyc2UgZmxleD8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogJ0FpbmRhIG7Do28gc2FiZW1vcyBxdWFuZG8gYWJyaXJlbW9zIG8gZmxleCBwYXJhIG8gcMO6YmxpY28uIElyZW1vcyBwcmltZWlyYW1lbnRlIHBhc3NhciBwb3IgdW0gcGVyw61vZG8gZGUgdGVzdGVzIGUgZGVwb2lzIGVzdGFiZWxlY2VyIHVtYSBkYXRhIGRlIGxhbsOnYW1lbnRvLiBTZSB2b2PDqiBkZXNlamEgYWNvbXBhbmhhciBlIHJlY2ViZXIgbm90w61jaWFzIHNvYnJlIGVzc2EgY2FtaW5oYWRhLCBpbnNjcmV2YSBzZXUgZW1haWwgbmVzc2EgcMOhZ2luYS4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLWxhcmdlLnUtdGV4dC1jZW50ZXIuYmctcHVycGxlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLmZvbnRjb2xvci1uZWdhdGl2ZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VzdCcsICdGaXF1ZSBwb3IgZGVudHJvIScpLCBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS02MCcsICdSZWNlYmEgbm90w61jaWFzIGUgYWNvbXBhbmhlIGEgZXZvbHXDp8OjbyBkbyBDYXRhcnNlIGZsZXgnKSwgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLmxhbmRpbmdTaWdudXAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkZXI6IGN0cmwuYnVpbGRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctc2VjdGlvbi5zZWN0aW9uLW9uZS1jb2x1bW4uYmctY2F0YXJzZS16ZWxvLnNlY3Rpb24tbGFyZ2Vbc3R5bGU9XCJtaW4taGVpZ2h0OiA1MHZoO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWVkaXRhYmxlLnUtbWFyZ2luYm90dG9tLTQwLmZvbnRzaXplLWxhcmdlci5saW5laGVpZ2h0LXRpZ2h0LmZvbnRjb2xvci1uZWdhdGl2ZScsICdPIGZsZXggw6kgdW0gZXhwZXJpbWVudG8gZSBpbmljaWF0aXZhIGRvIENhdGFyc2UsIG1haW9yIHBsYXRhZm9ybWEgZGUgY3Jvd2RmdW5kaW5nIGRvIEJyYXNpbC4nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS10ZXh0LWNlbnRlcicsIChjdHJsLnN0YXRzTG9hZGVyKCkpID8gaC5sb2FkZXIoKSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtanVtYm8udGV4dC1zdWNjZXNzLmxpbmVoZWlnaHQtbG9vc2UnLCBoLmZvcm1hdE51bWJlcihzdGF0cy50b3RhbF9jb250cmlidXRvcnMsIDAsIDMpKSwgbSgncC5zdGFydC1zdGF0cy5mb250c2l6ZS1iYXNlLmZvbnRjb2xvci1uZWdhdGl2ZScsICdQZXNzb2FzIGphIGFwb2lhcmFtIHBlbG8gbWVub3MgMDEgcHJvamV0byBubyBDYXRhcnNlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWp1bWJvLnRleHQtc3VjY2Vzcy5saW5laGVpZ2h0LWxvb3NlJywgaC5mb3JtYXROdW1iZXIoc3RhdHMudG90YWxfcHJvamVjdHNfc3VjY2VzcywgMCwgMykpLCBtKCdwLnN0YXJ0LXN0YXRzLmZvbnRzaXplLWJhc2UuZm9udGNvbG9yLW5lZ2F0aXZlJywgJ1Byb2pldG9zIGphIGZvcmFtIGZpbmFuY2lhZG9zIG5vwqBDYXRhcnNlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWp1bWJvLnRleHQtc3VjY2Vzcy5saW5laGVpZ2h0LWxvb3NlJywgc3RhdHMudG90YWxfY29udHJpYnV0ZWQudG9TdHJpbmcoKS5zbGljZSgwLCAyKSArICcgbWlsaMO1ZXMnKSwgbSgncC5zdGFydC1zdGF0cy5mb250c2l6ZS1iYXNlLmZvbnRjb2xvci1uZWdhdGl2ZScsICdGb3JhbSBpbnZlc3RpZG9zIGVtIGlkZWlhcyBwdWJsaWNhZGFzIG5vIENhdGFyc2UnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLmJnLWJsdWUtb25lLmZvbnRjb2xvci1uZWdhdGl2ZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdSZWNvbWVuZGUgbyBDYXRhcnNlIGZsZXggcGFyYSBhbWlnb3MhICcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYudy1zdWItY29sLW1pZGRsZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLmljb24tc2hhcmUtbW9iaWxlW3NyYz1cXCdodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzUzYTNmNjZlMDVlYjYxNDQxNzFkOGVkYl9mYWNlYm9vay14eGwucG5nXFwnXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS53LWJ1dHRvbi5idG4uYnRuLWxhcmdlLmJ0bi1mYltocmVmPVwiaHR0cDovL3d3dy5mYWNlYm9vay5jb20vc2hhcmVyL3NoYXJlci5waHA/dT1odHRwczovL3d3dy5jYXRhcnNlLm1lL2ZsZXg/cmVmPWZhY2Vib29rJnRpdGxlPScgKyBlbmNvZGVVUklDb21wb25lbnQoJ0Nvbmhlw6dhIG8gbm92byBDYXRhcnNlIEZsZXghJykgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdDb21wYXJ0aWxoYXInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02LnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcuaWNvbi1zaGFyZS1tb2JpbGVbc3JjPVxcJ2h0dHBzOi8vZGFrczJrM2E0aWIyei5jbG91ZGZyb250Lm5ldC81NGI0NDBiODU2MDhlM2Y0Mzg5ZGIzODcvNTNhM2Y2NTEwNWViNjE0NDE3MWQ4ZWRhX3R3aXR0ZXItMjU2LnBuZ1xcJ10nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Eudy1idXR0b24uYnRuLmJ0bi1sYXJnZS5idG4tdHdlZXRbaHJlZj1cImh0dHA6Ly90d2l0dGVyLmNvbS8/c3RhdHVzPScgKyBlbmNvZGVVUklDb21wb25lbnQoJ1ZhbW9zIGNvbnN0cnVpciB1bWEgbm92YSBtb2RhbGlkYWRlIGRlIGNyb3dkZnVuZGluZyBwYXJhIG8gQ2F0YXJzZSEgSnVudGUtc2UgYSBuw7NzLCBpbnNjcmV2YSBzZXUgZW1haWwhJykgKyAnaHR0cHM6Ly93d3cuY2F0YXJzZS5tZS9mbGV4P3JlZj10d2l0dGVyXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdUdWl0YXInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSwgbSgnLnctc2VjdGlvbi5zZWN0aW9uLWxhcmdlLmJnLWdyZWVubGltZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjcGFydGljaXBlLWRvLWRlYmF0ZS51LXRleHQtY2VudGVyJywge2NvbmZpZzogaC50b0FuY2hvcigpfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdoMS5mb250c2l6ZS1sYXJnZXN0LmZvbnRjb2xvci1uZWdhdGl2ZScsJ0NvbnN0cnVhIG8gZmxleCBjb25vc2NvJyksIG0oJy5mb250c2l6ZS1iYXNlLnUtbWFyZ2luYm90dG9tLTYwLmZvbnRjb2xvci1uZWdhdGl2ZScsICdJbmljaWUgdW1hIGNvbnZlcnNhLCBwZXJndW50ZSwgY29tZW50ZSwgY3JpdGlxdWUgZSBmYcOnYSBzdWdlc3TDtWVzIScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2Rpc3F1c190aHJlYWQuY2FyZC51LXJhZGl1c1tzdHlsZT1cIm1pbi1oZWlnaHQ6IDUwdmg7XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwuYWRkRGlzcXVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5yb290Lkluc2lnaHRzID0gKChtLCBjLCBoLCBtb2RlbHMsIF8sIEkxOG4pID0+IHtcbiAgICBjb25zdCBJMThuU2NvcGUgPSBfLnBhcnRpYWwoaC5pMThuU2NvcGUsICdwcm9qZWN0cy5pbnNpZ2h0cycpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBmaWx0ZXJzVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgaW5zaWdodHNWTSA9IGMuSW5zaWdodHNWTSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0RGV0YWlscyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckRheSA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBsb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW47XG5cbiAgICAgICAgICAgIGZpbHRlcnNWTS5wcm9qZWN0X2lkKGFyZ3Mucm9vdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGwgPSBsb2FkZXIobW9kZWxzLnByb2plY3REZXRhaWwuZ2V0Um93T3B0aW9ucyhmaWx0ZXJzVk0ucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICBsLmxvYWQoKS50aGVuKHByb2plY3REZXRhaWxzKTtcblxuICAgICAgICAgICAgY29uc3QgbENvbnRyaWJ1dGlvbnNQZXJEYXkgPSBsb2FkZXIobW9kZWxzLnByb2plY3RDb250cmlidXRpb25zUGVyRGF5LmdldFJvd09wdGlvbnMoZmlsdGVyc1ZNLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgbENvbnRyaWJ1dGlvbnNQZXJEYXkubG9hZCgpLnRoZW4oY29udHJpYnV0aW9uc1BlckRheSk7XG5cbiAgICAgICAgICAgIGxldCBjb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZSA9IFtbJ0VzdGFkbycsICdBcG9pb3MnLCAnUiQgYXBvaWFkb3MgKCUgZG8gdG90YWwpJ11dO1xuICAgICAgICAgICAgY29uc3QgYnVpbGRQZXJMb2NhdGlvblRhYmxlID0gKGNvbnRyaWJ1dGlvbnMpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKCFfLmlzRW1wdHkoY29udHJpYnV0aW9ucykpID8gXy5tYXAoXy5maXJzdChjb250cmlidXRpb25zKS5zb3VyY2UsIChjb250cmlidXRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbHVtbiA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKGNvbnRyaWJ1dGlvbi5zdGF0ZV9hY3JvbnltIHx8ICdPdXRyby9vdGhlcicpO1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW4ucHVzaChjb250cmlidXRpb24udG90YWxfY29udHJpYnV0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbi5wdXNoKFtjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWQsWy8vQWRkaW5nIHJvdyB3aXRoIGN1c3RvbSBjb21wYXJhdG9yID0+IHJlYWQgcHJvamVjdC1kYXRhLXRhYmxlIGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBtKGBpbnB1dFt0eXBlPVwiaGlkZGVuXCJdW3ZhbHVlPVwiJHtjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWR9XCJgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdSJCAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGVkLCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4udy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsICcgKCcgKyBjb250cmlidXRpb24udG90YWxfb25fcGVyY2VudGFnZS50b0ZpeGVkKDIpICsgJyUpJylcbiAgICAgICAgICAgICAgICAgICAgXV0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29udHJpYnV0aW9uc1BlckxvY2F0aW9uVGFibGUucHVzaChjb2x1bW4pO1xuICAgICAgICAgICAgICAgIH0pIDogW107XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBsQ29udHJpYnV0aW9uc1BlckxvY2F0aW9uID0gbG9hZGVyKG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uLmdldFJvd09wdGlvbnMoZmlsdGVyc1ZNLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgbENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbi5sb2FkKCkudGhlbihidWlsZFBlckxvY2F0aW9uVGFibGUpO1xuXG4gICAgICAgICAgICBsZXQgY29udHJpYnV0aW9uc1BlclJlZlRhYmxlID0gW1tcbiAgICAgICAgICAgICAgICBJMThuLnQoJ3JlZl90YWJsZS5oZWFkZXIub3JpZ2luJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgIEkxOG4udCgncmVmX3RhYmxlLmhlYWRlci5jb250cmlidXRpb25zJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgIEkxOG4udCgncmVmX3RhYmxlLmhlYWRlci5hbW91bnQnLCBJMThuU2NvcGUoKSlcbiAgICAgICAgICAgIF1dO1xuICAgICAgICAgICAgY29uc3QgYnVpbGRQZXJSZWZUYWJsZSA9IChjb250cmlidXRpb25zKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICghXy5pc0VtcHR5KGNvbnRyaWJ1dGlvbnMpKSA/IF8ubWFwKF8uZmlyc3QoY29udHJpYnV0aW9ucykuc291cmNlLCAoY29udHJpYnV0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlID0gLyhjdHJzZV9bYS16XSopLyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlc3QgPSByZS5leGVjKGNvbnRyaWJ1dGlvbi5yZWZlcnJhbF9saW5rKTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgY29sdW1uID0gW107XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRlc3Qpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uLnJlZmVycmFsX2xpbmsgPSB0ZXN0WzBdO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29sdW1uLnB1c2goY29udHJpYnV0aW9uLnJlZmVycmFsX2xpbmsgPyBJMThuLnQoJ3JlZmVycmFsLicgKyBjb250cmlidXRpb24ucmVmZXJyYWxfbGluaywgSTE4blNjb3BlKHtkZWZhdWx0VmFsdWU6IGNvbnRyaWJ1dGlvbi5yZWZlcnJhbF9saW5rfSkpIDogSTE4bi50KCdyZWZlcnJhbC5vdGhlcnMnLCBJMThuU2NvcGUoKSkpO1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW4ucHVzaChjb250cmlidXRpb24udG90YWwpO1xuICAgICAgICAgICAgICAgICAgICBjb2x1bW4ucHVzaChbY29udHJpYnV0aW9uLnRvdGFsX2Ftb3VudCxbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKGBpbnB1dFt0eXBlPVwiaGlkZGVuXCJdW3ZhbHVlPVwiJHtjb250cmlidXRpb24udG90YWxfY29udHJpYnV0ZWR9XCJgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdSJCAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLnRvdGFsX2Ftb3VudCwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCAnICgnICsgY29udHJpYnV0aW9uLnRvdGFsX29uX3BlcmNlbnRhZ2UudG9GaXhlZCgyKSArICclKScpXG4gICAgICAgICAgICAgICAgICAgIF1dKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRyaWJ1dGlvbnNQZXJSZWZUYWJsZS5wdXNoKGNvbHVtbik7XG4gICAgICAgICAgICAgICAgfSkgOiBbXTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGxDb250cmlidXRpb25zUGVyUmVmID0gbG9hZGVyKG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uc1BlclJlZi5nZXRSb3dPcHRpb25zKGZpbHRlcnNWTS5wYXJhbWV0ZXJzKCkpKTtcbiAgICAgICAgICAgIGxDb250cmlidXRpb25zUGVyUmVmLmxvYWQoKS50aGVuKGJ1aWxkUGVyUmVmVGFibGUpO1xuXG4gICAgICAgICAgICBjb25zdCBleHBsYW5hdGlvbk1vZGVDb21wb25lbnQgPSAocHJvamVjdE1vZGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtb2RlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgJ2Fvbic6IGMuQW9uQWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAnZmxleCc6IGMuRmxleEFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvblxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZXNbcHJvamVjdE1vZGVdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBsOiBsLFxuICAgICAgICAgICAgICAgIGxDb250cmlidXRpb25zUGVyUmVmOiBsQ29udHJpYnV0aW9uc1BlclJlZixcbiAgICAgICAgICAgICAgICBsQ29udHJpYnV0aW9uc1BlckxvY2F0aW9uOiBsQ29udHJpYnV0aW9uc1BlckxvY2F0aW9uLFxuICAgICAgICAgICAgICAgIGxDb250cmlidXRpb25zUGVyRGF5OiBsQ29udHJpYnV0aW9uc1BlckRheSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJzVk06IGZpbHRlcnNWTSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0RGV0YWlsczogcHJvamVjdERldGFpbHMsXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckRheTogY29udHJpYnV0aW9uc1BlckRheSxcbiAgICAgICAgICAgICAgICBjb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZTogY29udHJpYnV0aW9uc1BlckxvY2F0aW9uVGFibGUsXG4gICAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlclJlZlRhYmxlOiBjb250cmlidXRpb25zUGVyUmVmVGFibGUsXG4gICAgICAgICAgICAgICAgZXhwbGFuYXRpb25Nb2RlQ29tcG9uZW50OiBleHBsYW5hdGlvbk1vZGVDb21wb25lbnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gXy5maXJzdChjdHJsLnByb2plY3REZXRhaWxzKCkpLFxuICAgICAgICAgICAgICAgIHRvb2x0aXAgPSAoZWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuVG9vbHRpcCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWw6IGVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdJbmZvcm1hIGRlIG9uZGUgdmllcmFtIG9zIGFwb2lvcyBkZSBzZXUgcHJvamV0by4gU2FpYmEgY29tbyB1c2FyIGVzc2EgdGFiZWxhIGUgcGxhbmVqYXIgbWVsaG9yIHN1YXMgYcOnw7VlcyBkZSBjb211bmljYcOnw6NvICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYVtocmVmPVwiJHtJMThuLnQoJ3JlZl90YWJsZS5oZWxwX3VybCcsIEkxOG5TY29wZSgpKX1cIl1bdGFyZ2V0PSdfYmxhbmsnXWAsICdhcXVpLicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDM4MFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3QtaW5zaWdodHMnLCAhY3RybC5sKCkgPyBbXG4gICAgICAgICAgICAgICAgKHByb2plY3QuaXNfb3duZXJfb3JfYWRtaW4gPyBtLmNvbXBvbmVudChjLlByb2plY3REYXNoYm9hcmRNZW51LCB7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3RcbiAgICAgICAgICAgICAgICB9KSA6ICcnKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC5kYXNoYm9hcmQtaGVhZGVyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2VyLmxpbmVoZWlnaHQtbG9vc2VyLnUtbWFyZ2luYm90dG9tLTEwJywgSTE4bi50KCdjYW1wYWlnbl90aXRsZScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblByb2plY3REZXRhaWxzQ2FyZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGN0cmwuZXhwbGFuYXRpb25Nb2RlQ29tcG9uZW50KHByb2plY3QubW9kZSksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2U6IHByb2plY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCkgPyBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5kaXZpZGVyJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1vbmUtY29sdW1uLnNlY3Rpb24uYmctZ3JheS5iZWZvcmUtZm9vdGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtaW4taGVpZ2h0JzogJzMwMHB4J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhY3RybC5sQ29udHJpYnV0aW9uc1BlckRheSgpID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0RGF0YUNoYXJ0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogY3RybC5jb250cmlidXRpb25zUGVyRGF5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBJMThuLnQoJ2Ftb3VudF9wZXJfZGF5X2xhYmVsJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFLZXk6ICd0b3RhbF9hbW91bnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhBeGlzOiAoaXRlbSkgPT4gaC5tb21lbnRpZnkoaXRlbS5wYWlkX2F0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtaW4taGVpZ2h0JzogJzMwMHB4J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhY3RybC5sQ29udHJpYnV0aW9uc1BlckRheSgpID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0RGF0YUNoYXJ0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogY3RybC5jb250cmlidXRpb25zUGVyRGF5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBJMThuLnQoJ2NvbnRyaWJ1dGlvbnNfcGVyX2RheV9sYWJlbCcsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhS2V5OiAndG90YWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhBeGlzOiAoaXRlbSkgPT4gaC5tb21lbnRpZnkoaXRlbS5wYWlkX2F0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1jb250cmlidXRpb25zLXBlci1yZWYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtbGFyZ2UudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSTE4bi50KCdyZWZfb3JpZ2luX3RpdGxlJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLm5ld0ZlYXR1cmVCYWRnZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwKCdzcGFuLmZvbnRzaXplLXNtYWxsZXN0LnRvb2x0aXAtd3JhcHBlci5mYS5mYS1xdWVzdGlvbi1jaXJjbGUuZm9udGNvbG9yLXNlY29uZGFyeScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIWN0cmwubENvbnRyaWJ1dGlvbnNQZXJSZWYoKSA/IG0uY29tcG9uZW50KGMuUHJvamVjdERhdGFUYWJsZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJsZTogY3RybC5jb250cmlidXRpb25zUGVyUmVmVGFibGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRTb3J0SW5kZXg6IC0yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnByb2plY3QtY29udHJpYnV0aW9ucy1wZXItcmVmJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCBJMThuLnQoJ2xvY2F0aW9uX29yaWdpbl90aXRsZScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIWN0cmwubENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbigpID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0RGF0YVRhYmxlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhYmxlOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvblRhYmxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0U29ydEluZGV4OiAtMlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pIDogaC5sb2FkZXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFJlbWluZGVyQ291bnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZTogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSA6ICcnXG4gICAgICAgICAgICBdIDogaC5sb2FkZXIoKSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5jLm1vZGVscywgd2luZG93Ll8sIHdpbmRvdy5JMThuKSk7XG4iLCJ3aW5kb3cuYy5yb290LkxpdmVTdGF0aXN0aWNzID0gKChtLCBtb2RlbHMsIGgsIF8sIEpTT04pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncyA9IHt9KSA9PiB7XG4gICAgICAgICAgICBsZXQgcGFnZVN0YXRpc3RpY3MgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkRhdGEgPSBtLnByb3Aoe30pO1xuXG4gICAgICAgICAgICBtb2RlbHMuc3RhdGlzdGljLmdldFJvdygpLnRoZW4ocGFnZVN0YXRpc3RpY3MpO1xuICAgICAgICAgICAgLy8gYXJncy5zb2NrZXQgaXMgYSBzb2NrZXQgcHJvdmlkZWQgYnkgc29ja2V0LmlvXG4gICAgICAgICAgICAvLyBjYW4gc2VlIHRoZXJlIGh0dHBzOi8vZ2l0aHViLmNvbS9jYXRhcnNlL2NhdGFyc2UtbGl2ZS9ibG9iL21hc3Rlci9wdWJsaWMvaW5kZXguanMjTDhcbiAgICAgICAgICAgIGlmIChhcmdzLnNvY2tldCAmJiBfLmlzRnVuY3Rpb24oYXJncy5zb2NrZXQub24pKSB7XG4gICAgICAgICAgICAgICAgYXJncy5zb2NrZXQub24oJ25ld19wYWlkX2NvbnRyaWJ1dGlvbnMnLCAobXNnKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkRhdGEoSlNPTi5wYXJzZShtc2cucGF5bG9hZCkpO1xuICAgICAgICAgICAgICAgICAgICBtb2RlbHMuc3RhdGlzdGljLmdldFJvdygpLnRoZW4ocGFnZVN0YXRpc3RpY3MpO1xuICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHBhZ2VTdGF0aXN0aWNzOiBwYWdlU3RhdGlzdGljcyxcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25EYXRhOiBub3RpZmljYXRpb25EYXRhXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSBjdHJsLm5vdGlmaWNhdGlvbkRhdGEoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uYmctc3RhdHMuc2VjdGlvbi5taW4taGVpZ2h0LTEwMCcsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS10ZXh0LWNlbnRlcicsIF8ubWFwKGN0cmwucGFnZVN0YXRpc3RpY3MoKSwgKHN0YXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFttKCdpbWcudS1tYXJnaW5ib3R0b20tNjBbc3JjPVwiaHR0cHM6Ly9kYWtzMmszYTRpYjJ6LmNsb3VkZnJvbnQubmV0LzU0YjQ0MGI4NTYwOGUzZjQzODlkYjM4Ny81NWFkYTVkZDExYjM2YTUyNjE2ZDk3ZGZfc3ltYm9sLWNhdGFyc2UucG5nXCJdJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udHdlaWdodC1zZW1pYm9sZCcsICdSJCAnICsgaC5mb3JtYXROdW1iZXIoc3RhdC50b3RhbF9jb250cmlidXRlZCwgMiwgMykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZScsICdEb2Fkb3MgcGFyYSBwcm9qZXRvcyBwdWJsaWNhZG9zIHBvciBhcXVpJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1uZWdhdGl2ZS51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbWVnYWp1bWJvLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBzdGF0LnRvdGFsX2NvbnRyaWJ1dG9ycyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlJywgJ1Blc3NvYXMgasOhIGFwb2lhcmFtIHBlbG8gbWVub3MgMSBwcm9qZXRvIG5vIENhdGFyc2UnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICB9KSksICghXy5pc0VtcHR5KGRhdGEpID8gbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuY2FyZC51LXJhZGl1cy51LW1hcmdpbmJvdHRvbS02MC5tZWRpdW0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIudS1yb3VuZFtzcmM9XCInICsgaC51c2VBdmF0YXJPckRlZmF1bHQoZGF0YS51c2VyX2ltYWdlKSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctY29sLXNtYWxsLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgZGF0YS51c2VyX25hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC51LXRleHQtY2VudGVyLmZvbnRzaXplLWJhc2UudS1tYXJnaW50b3AtMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCAnYWNhYm91IGRlIGFwb2lhciBvJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi1wcm9qZWN0LnUtcmFkaXVzW3NyYz1cIicgKyBkYXRhLnByb2plY3RfaW1hZ2UgKyAnXCJdW3dpZHRoPVwiNzVcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctY29sLXNtYWxsLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgZGF0YS5wcm9qZWN0X25hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMTAuZm9udGNvbG9yLW5lZ2F0aXZlJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuLmZvbnRjb2xvci1uZWdhdGl2ZVtocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL2NhdGFyc2VcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1naXRodWInLCAnLicpLCAnIE9wZW4gU291cmNlIGNvbSBvcmd1bGhvISAnXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cuSlNPTikpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5yb290LlByb2plY3RzRXhwbG9yZSBjb21wb25lbnRcbiAqIEEgcm9vdCBjb21wb25lbnQgdG8gc2hvdyBwcm9qZWN0cyBhY2NvcmRpbmcgdG8gdXNlciBkZWZpbmVkIGZpbHRlcnNcbiAqXG4gKiBFeGFtcGxlOlxuICogVG8gbW91bnQgdGhpcyBjb21wb25lbnQganVzdCBjcmVhdGUgYSBET00gZWxlbWVudCBsaWtlOlxuICogPGRpdiBkYXRhLW1pdGhyaWw9XCJQcm9qZWN0c0V4cGxvcmVcIj5cbiAqL1xud2luZG93LmMucm9vdC5Qcm9qZWN0c0V4cGxvcmUgPSAoKG0sIGMsIGgsIF8sIG1vbWVudCkgPT4ge1xuICAgIHJldHVybiB7XG5cbiAgICAgICAgY29udHJvbGxlcjogKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmlsdGVycyA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSxcbiAgICAgICAgICAgICAgICAgIGZvbGxvdyA9IGMubW9kZWxzLmNhdGVnb3J5Rm9sbG93ZXIsXG4gICAgICAgICAgICAgICAgICBmaWx0ZXJzTWFwID0gYy5yb290LnByb2plY3RGaWx0ZXJzKCksXG4gICAgICAgICAgICAgICAgICBjYXRlZ29yeUNvbGxlY3Rpb24gPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgICAgLy8gRmFrZSBwcm9qZWN0cyBvYmplY3QgdG8gYmUgYWJsZSB0byByZW5kZXIgcGFnZSB3aGlsZSBsb2FkZGluZyAoaW4gY2FzZSBvZiBzZWFyY2gpXG4gICAgICAgICAgICAgICAgICBwcm9qZWN0cyA9IG0ucHJvcCh7Y29sbGVjdGlvbjogbS5wcm9wKFtdKSwgaXNMb2FkaW5nOiAoKSA9PiB7IHJldHVybiB0cnVlOyB9fSksXG4gICAgICAgICAgICAgICAgICB0aXRsZSA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgICAgY2F0ZWdvcnlJZCA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgICAgZmluZENhdGVnb3J5ID0gKGlkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uZmluZChjYXRlZ29yeUNvbGxlY3Rpb24oKSwgZnVuY3Rpb24oYyl7IHJldHVybiBjLmlkID09PSBwYXJzZUludChpZCk7IH0pO1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gXy5jb21wb3NlKGZpbmRDYXRlZ29yeSwgY2F0ZWdvcnlJZCksXG5cbiAgICAgICAgICAgICAgICAgIGxvYWRDYXRlZ29yaWVzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjLm1vZGVscy5jYXRlZ29yeS5nZXRQYWdlV2l0aFRva2VuKGZpbHRlcnMoe30pLm9yZGVyKHtuYW1lOiAnYXNjJ30pLnBhcmFtZXRlcnMoKSkudGhlbihjYXRlZ29yeUNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgZm9sbG93Q2F0ZWdvcnkgPSAoaWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xsb3cucG9zdFdpdGhUb2tlbih7Y2F0ZWdvcnlfaWQ6IGlkfSkudGhlbihsb2FkQ2F0ZWdvcmllcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHVuRm9sbG93Q2F0ZWdvcnkgPSAoaWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBmb2xsb3cuZGVsZXRlV2l0aFRva2VuKGZpbHRlcnMoe2NhdGVnb3J5X2lkOiAnZXEnfSkuY2F0ZWdvcnlfaWQoaWQpLnBhcmFtZXRlcnMoKSkudGhlbihsb2FkQ2F0ZWdvcmllcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgICAgbG9hZFJvdXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvdXRlID0gd2luZG93LmxvY2F0aW9uLmhhc2gubWF0Y2goL1xcIyhbXlxcL10qKVxcLz8oXFxkKyk/LyksXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXQgPSByb3V0ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZVsyXSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5kQ2F0ZWdvcnkocm91dGVbMl0pLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRnJvbVJvdXRlID0gICgpID0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBieUNhdGVnb3J5ID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZV9vcmRlcjogJ2d0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeV9pZDogJ2VxJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ubGluZV9kYXRlOiAnZ3QnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnN0YXRlX29yZGVyKCdwdWJsaXNoZWQnKS5vbmxpbmVfZGF0ZShtb21lbnQoKS5zdWJ0cmFjdCg2MCwgJ2RheXMnKS5mb3JtYXQoJ1lZWVktTU0tREQnKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvdXRlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZVsxXSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyc01hcFtyb3V0ZVsxXV0gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhdCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3RpdGxlOiBjYXQubmFtZSwgZmlsdGVyOiBieUNhdGVnb3J5LmNhdGVnb3J5X2lkKGNhdC5pZCl9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXIgPSBmaWx0ZXJGcm9tUm91dGUoKSB8fCBmaWx0ZXJzTWFwLnJlY29tbWVuZGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaCA9IGgucGFyYW1CeU5hbWUoJ3BnX3NlYXJjaCcpLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoUHJvamVjdHMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGwgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYy5tb2RlbHMucHJvamVjdFNlYXJjaC5wb3N0T3B0aW9ucyh7cXVlcnk6IHNlYXJjaH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZSA9IHsgLy8gV2UgYnVpbGQgYW4gb2JqZWN0IHdpdGggdGhlIHNhbWUgaW50ZXJmYWNlIGFzIHBhZ2luYXRpb25WTVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzTG9hZGluZzogbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRQYWdlOiAoKSA9PiB7IHJldHVybiBmYWxzZTsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKHBhZ2UuY29sbGVjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYWdlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkUHJvamVjdHMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhZ2VzID0gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKGMubW9kZWxzLnByb2plY3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlcy5maXJzdFBhZ2UoZmlsdGVyLmZpbHRlci5vcmRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGVuX2Zvcl9jb250cmlidXRpb25zOiAnZGVzYycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZV9vcmRlcjogJ2FzYycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZGVzYydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkucGFyYW1ldGVycygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhZ2VzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc1N0cmluZyhzZWFyY2gpICYmIHNlYXJjaC5sZW5ndGggPiAwICYmIHJvdXRlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlKCdCdXNjYSAnICsgc2VhcmNoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdHMoc2VhcmNoUHJvamVjdHMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUoZmlsdGVyLnRpdGxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdHMobG9hZFByb2plY3RzKCkpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeUlkKGNhdCAmJiBjYXQuaWQpO1xuICAgICAgICAgICAgICAgICAgICAgIHRvZ2dsZUNhdGVnb3JpZXMudG9nZ2xlKCk7XG4gICAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgICB0b2dnbGVDYXRlZ29yaWVzID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKTtcblxuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9hZFJvdXRlKCk7XG4gICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcblxuICAgICAgICAgICAgLy8gSW5pdGlhbCBsb2Fkc1xuICAgICAgICAgICAgYy5tb2RlbHMucHJvamVjdC5wYWdlU2l6ZSg5KTtcbiAgICAgICAgICAgIGxvYWRDYXRlZ29yaWVzKCkudGhlbihsb2FkUm91dGUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNhdGVnb3JpZXM6IGNhdGVnb3J5Q29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICBmb2xsb3dDYXRlZ29yeTogZm9sbG93Q2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgdW5Gb2xsb3dDYXRlZ29yeTogdW5Gb2xsb3dDYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBwcm9qZWN0czogcHJvamVjdHMsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5LFxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJzTWFwOiBmaWx0ZXJzTWFwLFxuICAgICAgICAgICAgICAgIHRvZ2dsZUNhdGVnb3JpZXM6IHRvZ2dsZUNhdGVnb3JpZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5oZXJvLXNlYXJjaCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNleHBsb3JlLW9wZW4ubGluay1oaWRkZW4td2hpdGUuZm9udHdlaWdodC1saWdodC5mb250c2l6ZS1sYXJnZXJbaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgpO1wiXScse29uY2xpY2s6ICgpID0+IGN0cmwudG9nZ2xlQ2F0ZWdvcmllcy50b2dnbGUoKX0sIFsnRXhwbG9yZSBwcm9qZXRvcyBpbmNyw612ZWlzICcsbShgc3BhbiNleHBsb3JlLWJ0bi5mYS5mYS1hbmdsZS1kb3duJHtjdHJsLnRvZ2dsZUNhdGVnb3JpZXMoKSA/ICcub3BlbmVkJyA6ICcnfWAsICcnKV0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oYCNjYXRlZ29yaWVzLmNhdGVnb3J5LXNsaWRlciR7Y3RybC50b2dnbGVDYXRlZ29yaWVzKCkgPyAnLm9wZW5lZCcgOiAnJ31gLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLmNhdGVnb3JpZXMoKSwgKGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5DYXRlZ29yeUJ1dHRvbiwge2NhdGVnb3J5OiBjYXRlZ29yeX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLmZpbHRlcnNNYXAsIChmaWx0ZXIsIGhyZWYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLkZpbHRlckJ1dHRvbiwge3RpdGxlOiBmaWx0ZXIudGl0bGUsIGhyZWY6IGhyZWZ9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNi53LWNvbC1zbWFsbC03LnctY29sLXRpbnktNycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlcicsIGN0cmwudGl0bGUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uaXNPYmplY3QoY3RybC5jYXRlZ29yeSgpKSA/IG0oJy53LWNvbC53LWNvbC02LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbGxvd2luZy5mb250c2l6ZS1zbWFsbC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtcmlnaHQnLCBgJHtjdHJsLmNhdGVnb3J5KCkuZm9sbG93ZXJzfSBzZWd1aWRvcmVzYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtMTIudy1jb2wtdGlueS0xMicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLmNhdGVnb3J5KCkuZm9sbG93aW5nID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnkudW5mb2xsb3ctYnRuW2hyZWY9XFwnI1xcJ10nLCB7b25jbGljazogY3RybC51bkZvbGxvd0NhdGVnb3J5KGN0cmwuY2F0ZWdvcnkoKS5pZCl9LCAnRGVpeGFyIGRlIHNlZ3VpcicpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5idG4uYnRuLW1lZGl1bS5mb2xsb3ctYnRuW2hyZWY9XFwnI1xcJ10nLCB7b25jbGljazogY3RybC5mb2xsb3dDYXRlZ29yeShjdHJsLmNhdGVnb3J5KCkuaWQpfSwgJ1NlZ3VpcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJydcblxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcblxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIF8ubWFwKGN0cmwucHJvamVjdHMoKS5jb2xsZWN0aW9uKCksIChwcm9qZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RDYXJkLCB7cHJvamVjdDogcHJvamVjdCwgcmVmOiAnY3Ryc2VfZXhwbG9yZSd9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5wcm9qZWN0cygpLmlzTG9hZGluZygpID8gaC5sb2FkZXIoKSA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYnRuLmJ0bi1tZWRpdW0uYnRuLXRlcmNpYXJ5W2hyZWY9XFwnI2xvYWRNb3JlXFwnXScsIHtvbmNsaWNrOiAoKSA9PiB7IGN0cmwucHJvamVjdHMoKS5uZXh0UGFnZSgpOyByZXR1cm4gZmFsc2U7IH19LCAnQ2FycmVnYXIgbWFpcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKV07XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cubW9tZW50KSk7XG4iLCJ3aW5kb3cuYy5yb290LlByb2plY3RzSG9tZSA9ICgoKG0sIGMsIG1vbWVudCwgaCwgXykgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3Byb2plY3RzLmhvbWUnKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGxldCBzYW1wbGUzID0gXy5wYXJ0aWFsKF8uc2FtcGxlLCBfLCAzKSxcbiAgICAgICAgICAgICAgICBsb2FkZXJXaXRoVG9rZW4gPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4sXG4gICAgICAgICAgICAgICAgbG9hZGVyID0gXy5wYXJ0aWFsKG0ucG9zdGdyZXN0LmxvYWRlciwgXywgbS5wb3N0Z3Jlc3QucmVxdWVzdCksXG4gICAgICAgICAgICAgICAgcHJvamVjdCA9IGMubW9kZWxzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgZmlsdGVycyA9IGMucm9vdC5wcm9qZWN0RmlsdGVycygpO1xuXG4gICAgICAgICAgICBjb25zdCBjb2xsZWN0aW9ucyA9IF8ubWFwKFsnbmVhcl9tZScsICdyZWNvbW1lbmRlZCcsICdleHBpcmluZycsICdyZWNlbnQnXSwgKG5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmID0gZmlsdGVyc1tuYW1lXSxcbiAgICAgICAgICAgICAgICAgICAgICBjTG9hZGVyID0gbG9hZGVyV2l0aFRva2VuKHByb2plY3QuZ2V0UGFnZU9wdGlvbnMoZi5maWx0ZXIucGFyYW1ldGVycygpKSksXG4gICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbiA9IG0ucHJvcChbXSk7XG5cbiAgICAgICAgICAgICAgICBjTG9hZGVyLmxvYWQoKS50aGVuKF8uY29tcG9zZShjb2xsZWN0aW9uLCBzYW1wbGUzKSk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZi50aXRsZSxcbiAgICAgICAgICAgICAgICAgICAgaGFzaDogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgbG9hZGVyOiBjTG9hZGVyXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25zOiBjb2xsZWN0aW9uc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLmhlcm8tZnVsbC5oZXJvLTIwMTYnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLW1lZ2FqdW1iby51LW1hcmdpbmJvdHRvbS02MC5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRjb2xvci1uZWdhdGl2ZScsIEkxOG4udCgndGl0bGUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtocmVmPVwiaHR0cDovLzIwMTUuY2F0YXJzZS5tZS9cIl0uYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC5idG4taW5saW5lJywgSTE4bi50KCdjdGEnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgXy5tYXAoY3RybC5jb2xsZWN0aW9ucywgKGNvbGxlY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuUHJvamVjdFJvdywge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogYGhvbWVfJHtjb2xsZWN0aW9uLmhhc2h9YFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgIH07XG59KSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5tb21lbnQsIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5yb290LlByb2plY3RzU2hvdyA9ICgobSwgYywgXywgbW9kZWxzLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIGlkVk0gPSBoLmlkVk0sXG4gICAgICAgICAgICAgICAgcHJvamVjdERldGFpbHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzID0gbS5wcm9wKFtdKTtcblxuICAgICAgICAgICAgdm0ucHJvamVjdF9pZChhcmdzLnByb2plY3RfaWQpO1xuICAgICAgICAgICAgaWRWTS5pZChhcmdzLnByb2plY3RfdXNlcl9pZCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGxQcm9qZWN0ID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKG1vZGVscy5wcm9qZWN0RGV0YWlsLmdldFJvd09wdGlvbnModm0ucGFyYW1ldGVycygpKSksXG4gICAgICAgICAgICAgICAgbFVzZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnVzZXJEZXRhaWwuZ2V0Um93T3B0aW9ucyhpZFZNLnBhcmFtZXRlcnMoKSkpLFxuICAgICAgICAgICAgICAgIGxSZXdhcmQgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4obW9kZWxzLnJld2FyZERldGFpbC5nZXRQYWdlT3B0aW9ucyh2bS5wYXJhbWV0ZXJzKCkpKTtcblxuICAgICAgICAgICAgbFByb2plY3QubG9hZCgpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBsVXNlci5sb2FkKCkudGhlbih1c2VyRGV0YWlscyk7XG4gICAgICAgICAgICAgICAgbFJld2FyZC5sb2FkKCkudGhlbihyZXdhcmREZXRhaWxzKTtcblxuICAgICAgICAgICAgICAgIHByb2plY3REZXRhaWxzKGRhdGEpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcHJvamVjdERldGFpbHM6IHByb2plY3REZXRhaWxzLFxuICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiB1c2VyRGV0YWlscyxcbiAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiByZXdhcmREZXRhaWxzLFxuICAgICAgICAgICAgICAgIGxQcm9qZWN0OiBsUHJvamVjdCxcbiAgICAgICAgICAgICAgICBsVXNlcjogbFVzZXIsXG4gICAgICAgICAgICAgICAgbFJld2FyZDogbFJld2FyZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICghKGN0cmwubFByb2plY3QoKSB8fCBjdHJsLmxVc2VyKCkgfHwgY3RybC5sUmV3YXJkKCkpKSA/IF8ubWFwKGN0cmwucHJvamVjdERldGFpbHMoKSwgKHByb2plY3QpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3Qtc2hvdycsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBoLm1peHBhbmVsVHJhY2soKVxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0SGVhZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgdXNlckRldGFpbHM6IGN0cmwudXNlckRldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFRhYnMsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBjdHJsLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdE1haW4sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBjdHJsLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChwcm9qZWN0LmlzX293bmVyX29yX2FkbWluID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0RGFzaGJvYXJkTWVudSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICB9KSA6ICcnKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuXywgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5yb290LnN0YXJ0Vk0gPSAoKF8pID0+IHtcbiAgICByZXR1cm4gKEkxOG4pID0+IHtcbiAgICAgICAgY29uc3QgaTE4blN0YXJ0ID0gSTE4bi50cmFuc2xhdGlvbnNbSTE4bi5jdXJyZW50TG9jYWxlKCldLnBhZ2VzLnN0YXJ0LFxuICAgICAgICAgICAgdGVzdGltb25pYWxzID0gaTE4blN0YXJ0LnRlc3RpbW9uaWFscyxcbiAgICAgICAgICAgIGNhdGVnb3J5UHJvamVjdHMgPSBpMThuU3RhcnQuY2F0ZWdvcnlQcm9qZWN0cyxcbiAgICAgICAgICAgIHBhbmVzID0gaTE4blN0YXJ0LnBhbmVzLFxuICAgICAgICAgICAgcWEgPSBpMThuU3RhcnQucWE7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRlc3RpbW9uaWFsczogXy5tYXAodGVzdGltb25pYWxzLCAodGVzdGltb25pYWwpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0aHVtYlVybDogdGVzdGltb25pYWwudGh1bWIsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHRlc3RpbW9uaWFsLmNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRlc3RpbW9uaWFsLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsczogdGVzdGltb25pYWwudG90YWxzXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgcGFuZXM6IF8ubWFwKHBhbmVzLCAocGFuZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiBwYW5lLmxhYmVsLFxuICAgICAgICAgICAgICAgICAgICBzcmM6IHBhbmUuc3JjXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgcXVlc3Rpb25zOiB7XG4gICAgICAgICAgICAgICAgY29sXzE6IF8ubWFwKHFhLmNvbF8xLCAocXVlc3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiBxdWVzdGlvbi5xdWVzdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogcXVlc3Rpb24uYW5zd2VyXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgY29sXzI6IF8ubWFwKHFhLmNvbF8yLCAocXVlc3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiBxdWVzdGlvbi5xdWVzdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuc3dlcjogcXVlc3Rpb24uYW5zd2VyXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjYXRlZ29yeVByb2plY3RzOiBfLm1hcChjYXRlZ29yeVByb2plY3RzLCAoY2F0ZWdvcnkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeUlkOiBjYXRlZ29yeS5jYXRlZ29yeV9pZCxcbiAgICAgICAgICAgICAgICAgICAgc2FtcGxlUHJvamVjdHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5LnNhbXBsZV9wcm9qZWN0X2lkcy5wcmltYXJ5LFxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnkuc2FtcGxlX3Byb2plY3RfaWRzLnNlY29uZGFyeVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH07XG4gICAgfTtcbn0od2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLnJvb3QuU3RhcnQgPSAoKG0sIGMsIGgsIG1vZGVscywgSTE4bikgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3BhZ2VzLnN0YXJ0Jyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgY2F0ZWdvcmllcyA9IG0ucHJvcChbXSksXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRQYW5lID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnkgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIGZlYXR1cmVkUHJvamVjdHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnlJZHggPSBtLnByb3AoLTEpLFxuICAgICAgICAgICAgICAgIHN0YXJ0dm0gPSBjLnBhZ2VzLnN0YXJ0Vk0oSTE4biksXG4gICAgICAgICAgICAgICAgZmlsdGVycyA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSxcbiAgICAgICAgICAgICAgICBwYW5lSW1hZ2VzID0gc3RhcnR2bS5wYW5lcyxcbiAgICAgICAgICAgICAgICBjYXRlZ29yeXZtID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5X2lkOiAnZXEnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgcHJvamVjdHZtID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICAgIHByb2plY3RfaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB1c2Vydm0gPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBsb2FkZXIgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4sXG4gICAgICAgICAgICAgICAgc3RhdHNMb2FkZXIgPSBsb2FkZXIobW9kZWxzLnN0YXRpc3RpYy5nZXRSb3dPcHRpb25zKCkpLFxuICAgICAgICAgICAgICAgIGxvYWRDYXRlZ29yaWVzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYy5tb2RlbHMuY2F0ZWdvcnkuZ2V0UGFnZVdpdGhUb2tlbihmaWx0ZXJzKHt9KS5vcmRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnYXNjJ1xuICAgICAgICAgICAgICAgICAgICB9KS5wYXJhbWV0ZXJzKCkpLnRoZW4oY2F0ZWdvcmllcyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZWxlY3RQYW5lID0gKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRQYW5lKGlkeCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsQ2F0ZWdvcnkgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2FkZXIobW9kZWxzLmNhdGVnb3J5VG90YWxzLmdldFJvd09wdGlvbnMoY2F0ZWdvcnl2bS5wYXJhbWV0ZXJzKCkpKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGxQcm9qZWN0ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9hZGVyKG1vZGVscy5wcm9qZWN0RGV0YWlsLmdldFJvd09wdGlvbnMocHJvamVjdHZtLnBhcmFtZXRlcnMoKSkpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbFVzZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2FkZXIobW9kZWxzLnVzZXJEZXRhaWwuZ2V0Um93T3B0aW9ucyh1c2Vydm0ucGFyYW1ldGVycygpKSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZWxlY3RDYXRlZ29yeSA9IChpZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeUlkeChpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeXZtLmNhdGVnb3J5X2lkKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnkoW10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxDYXRlZ29yeSgpLmxvYWQoKS50aGVuKGxvYWRDYXRlZ29yeVByb2plY3RzKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldFVzZXIgPSAodXNlciwgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZlYXR1cmVkUHJvamVjdHMoKVtpZHhdID0gXy5leHRlbmQoe30sIGZlYXR1cmVkUHJvamVjdHMoKVtpZHhdLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyVGh1bWI6ICBfLmZpcnN0KHVzZXIpLnByb2ZpbGVfaW1nX3RodW1ibmFpbFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldFByb2plY3QgPSAocHJvamVjdCwgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZlYXR1cmVkUHJvamVjdHMoKVtpZHhdID0gXy5maXJzdChwcm9qZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgdXNlcnZtLmlkKF8uZmlyc3QocHJvamVjdCkudXNlci5pZCk7XG4gICAgICAgICAgICAgICAgICAgIGxVc2VyKCkubG9hZCgpLnRoZW4oKHVzZXIpID0+IHNldFVzZXIodXNlciwgaWR4KSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBsb2FkQ2F0ZWdvcnlQcm9qZWN0cyA9IChjYXRlZ29yeSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZENhdGVnb3J5KGNhdGVnb3J5KTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNhdGVnb3J5UHJvamVjdHMgPSBfLmZpbmRXaGVyZShzdGFydHZtLmNhdGVnb3J5UHJvamVjdHMsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5SWQ6IF8uZmlyc3QoY2F0ZWdvcnkpLmNhdGVnb3J5X2lkXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBmZWF0dXJlZFByb2plY3RzKFtdKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKGNhdGVnb3J5UHJvamVjdHMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChjYXRlZ29yeVByb2plY3RzLnNhbXBsZVByb2plY3RzLCAocHJvamVjdF9pZCwgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKHByb2plY3RfaWQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3R2bS5wcm9qZWN0X2lkKHByb2plY3RfaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsUHJvamVjdCgpLmxvYWQoKS50aGVuKChwcm9qZWN0KSA9PiBzZXRQcm9qZWN0KHByb2plY3QsIGlkeCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc3RhdHNMb2FkZXIubG9hZCgpLnRoZW4oc3RhdHMpO1xuICAgICAgICAgICAgbG9hZENhdGVnb3JpZXMoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdGF0czogc3RhdHMsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcmllczogY2F0ZWdvcmllcyxcbiAgICAgICAgICAgICAgICBwYW5lSW1hZ2VzOiBwYW5lSW1hZ2VzLFxuICAgICAgICAgICAgICAgIHNlbGVjdENhdGVnb3J5OiBzZWxlY3RDYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZENhdGVnb3J5OiBzZWxlY3RlZENhdGVnb3J5LFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnlJZHg6IHNlbGVjdGVkQ2F0ZWdvcnlJZHgsXG4gICAgICAgICAgICAgICAgc2VsZWN0UGFuZTogc2VsZWN0UGFuZSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFBhbmU6IHNlbGVjdGVkUGFuZSxcbiAgICAgICAgICAgICAgICBmZWF0dXJlZFByb2plY3RzOiBmZWF0dXJlZFByb2plY3RzLFxuICAgICAgICAgICAgICAgIHRlc3RpbW9uaWFsczogc3RhcnR2bS50ZXN0aW1vbmlhbHMsXG4gICAgICAgICAgICAgICAgcXVlc3Rpb25zOiBzdGFydHZtLnF1ZXN0aW9uc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCBzdGF0cyA9IF8uZmlyc3QoY3RybC5zdGF0cygpKTtcbiAgICAgICAgICAgIGNvbnN0IHRlc3RpbW9uaWFscyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5tYXAoY3RybC50ZXN0aW1vbmlhbHMsICh0ZXN0aW1vbmlhbCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLmNhcmQudS1yYWRpdXMuY2FyZC1iaWcuY2FyZC10ZXJjaWFyeScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oYGltZy50aHVtYi10ZXN0aW1vbmlhbC51LXJvdW5kLnUtbWFyZ2luYm90dG9tLTIwW3NyYz1cIiR7dGVzdGltb25pYWwudGh1bWJVcmx9XCJdYClcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgncC5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsIGBcIiR7dGVzdGltb25pYWwuY29udGVudH1cImApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCB0ZXN0aW1vbmlhbC5uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsIHRlc3RpbW9uaWFsLnRvdGFscylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uaGVyby1mdWxsLmhlcm8tc3RhcnQnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLW1lZ2FqdW1iby5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTQwJywgSTE4bi50KCdzbG9nYW4nLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXB1c2gtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5idG4uYnRuLWxhcmdlLnUtbWFyZ2luYm90dG9tLTEwW2hyZWY9XFwnL3Byb2plY3RzL25ld1xcJ10nLCAgSTE4bi50KCdzdWJtaXQnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgXy5pc0VtcHR5KHN0YXRzKSA/ICcnIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VzdC5saW5laGVpZ2h0LWxvb3NlJywgaC5mb3JtYXROdW1iZXIoc3RhdHMudG90YWxfY29udHJpYnV0b3JzLCAwLCAzKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtc21hbGwuc3RhcnQtc3RhdHMnLCBJMThuLnQoJ2hlYWRlci5wZW9wbGUnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0LmxpbmVoZWlnaHQtbG9vc2UnLCBzdGF0cy50b3RhbF9jb250cmlidXRlZC50b1N0cmluZygpLnNsaWNlKDAsIDIpICsgJyBtaWxow7VlcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwLmZvbnRzaXplLXNtYWxsLnN0YXJ0LXN0YXRzJywgSTE4bi50KCdoZWFkZXIubW9uZXknLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXN0LmxpbmVoZWlnaHQtbG9vc2UnLCBoLmZvcm1hdE51bWJlcihzdGF0cy50b3RhbF9wcm9qZWN0c19zdWNjZXNzLCAwLCAzKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtc21hbGwuc3RhcnQtc3RhdHMnLCBJMThuLnQoJ2hlYWRlci5zdWNjZXNzJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMC53LWNvbC1wdXNoLTEudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci51LW1hcmdpbmJvdHRvbS0xMC5mb250d2VpZ2h0LXNlbWlib2xkJywgSTE4bi50KCdwYWdlLXRpdGxlJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsJywgSTE4bi50KCdwYWdlLXN1YnRpdGxlJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jbGVhcmZpeC5ob3ctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55Lmhvdy1jb2wtMDEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5pbmZvLWhvd3dvcmtzLWJhY2tlcnMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZScsIEkxOG4udCgnYmFubmVyLjEnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLCBJMThuLnQoJ2Jhbm5lci4yJywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmluZm8taG93d29ya3MtYmFja2VycycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlJywgSTE4bi50KCdiYW5uZXIuMycsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnYmFubmVyLjQnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmhvdy1jb2wtMDInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuaG93LWNvbC0wMycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UnLCBJMThuLnQoJ2Jhbm5lci41JywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLCBJMThuLnQoJ2Jhbm5lci42JywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UudS1tYXJnaW50b3AtMzAnLCBJMThuLnQoJ2Jhbm5lci43JywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLCBJMThuLnQoJ2Jhbm5lci44JywgSTE4blNjb3BlKCkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS5ob3ctY29sLTAxJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuaW5mby1ob3d3b3Jrcy1iYWNrZXJzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UnLCBJMThuLnQoJ2Jhbm5lci4xJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlJywgSTE4bi50KCdiYW5uZXIuMicsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5pbmZvLWhvd3dvcmtzLWJhY2tlcnMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZScsIEkxOG4udCgnYmFubmVyLjMnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLCAgSTE4bi50KCdiYW5uZXIuNCcsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5pbmZvLWhvd3dvcmtzLWJhY2tlcnMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZScsIEkxOG4udCgnYmFubmVyLjUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLCAgSTE4bi50KCdiYW5uZXIuNicsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5pbmZvLWhvd3dvcmtzLWJhY2tlcnMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZScsIEkxOG4udCgnYmFubmVyLjcnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLCAgSTE4bi50KCdiYW5uZXIuOCcsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLmRpdmlkZXInKSxcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24tbGFyZ2UnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lci51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHNpemUtbGFyZ2VzdC5mb250d2VpZ2h0LXNlbWlib2xkJywgSTE4bi50KCdmZWF0dXJlcy50aXRsZScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMjAnLCBJMThuLnQoJ2ZlYXR1cmVzLnN1YnRpdGxlJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS51LW1hcmdpbnRvcC0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMzAnLCBJMThuLnQoJ2ZlYXR1cmVzLmZlYXR1cmVfMScsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTMwJywgSTE4bi50KCdmZWF0dXJlcy5mZWF0dXJlXzInLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0zMCcsIEkxOG4udCgnZmVhdHVyZXMuZmVhdHVyZV8zJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMzAnLCBJMThuLnQoJ2ZlYXR1cmVzLmZlYXR1cmVfNCcsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTMwJywgSTE4bi50KCdmZWF0dXJlcy5mZWF0dXJlXzUnLCBJMThuU2NvcGUoKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctdGFicy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXRhYi1tZW51LnctY29sLnctY29sLTQnLCBfLm1hcChjdHJsLnBhbmVJbWFnZXMsIChwYW5lLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oYGEudy10YWItbGluay53LWlubGluZS1ibG9jay50YWItbGlzdC1pdGVtJHsoaWR4ID09PSBjdHJsLnNlbGVjdGVkUGFuZSgpKSA/ICcuc2VsZWN0ZWQnIDogJyd9YCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5zZWxlY3RQYW5lKGlkeClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgcGFuZS5sYWJlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXRhYi1jb250ZW50LnctY29sLnctY29sLTgnLCBfLm1hcChjdHJsLnBhbmVJbWFnZXMsIChwYW5lLCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXRhYi1wYW5lJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgaW1nW3NyYz1cIiR7cGFuZS5zcmN9XCJdLnBhbmUtaW1hZ2UkeyhpZHggPT09IGN0cmwuc2VsZWN0ZWRQYW5lKCkpID8gJy5zZWxlY3RlZCcgOiAnJ31gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctc2VjdGlvbi5zZWN0aW9uLWxhcmdlLmJnLWJsdWUtb25lJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC10aWdodC5mb250Y29sb3ItbmVnYXRpdmUudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSTE4bi50KCd2aWRlby50aXRsZScsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEkxOG4udCgndmlkZW8uc3VidGl0bGUnLCBJMThuU2NvcGUoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Zb3V0dWJlTGlnaHRib3gsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM6IEkxOG4udCgndmlkZW8uc3JjJywgSTE4blNjb3BlKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LnNlY3Rpb24tY2F0ZWdvcmllcycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtdGV4dC1jZW50ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAudy1jb2wtcHVzaC0xJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLnUtbWFyZ2luYm90dG9tLTQwLmZvbnRjb2xvci1uZWdhdGl2ZScsIEkxOG4udCgnY2F0ZWdvcmllcy50aXRsZScsIEkxOG5TY29wZSgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy10YWJzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXRhYi1tZW51LnUtdGV4dC1jZW50ZXInLCBfLm1hcChjdHJsLmNhdGVnb3JpZXMoKSwgKGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKGBhLnctdGFiLWxpbmsudy1pbmxpbmUtYmxvY2suYnRuLWNhdGVnb3J5LnNtYWxsLmJ0bi1pbmxpbmUkeyhjdHJsLnNlbGVjdGVkQ2F0ZWdvcnlJZHgoKSA9PT0gY2F0ZWdvcnkuaWQpID8gJy53LS1jdXJyZW50JyA6ICcnfWAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuc2VsZWN0Q2F0ZWdvcnkoY2F0ZWdvcnkuaWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIGNhdGVnb3J5Lm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy10YWItY29udGVudC51LW1hcmdpbnRvcC00MCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctdGFiLXBhbmUudy0tdGFiLWFjdGl2ZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsICghKF8uaXNFbXB0eShjdHJsLnNlbGVjdGVkQ2F0ZWdvcnkoKSkgJiYgY3RybC5zZWxlY3RlZENhdGVnb3J5SWR4KCkgIT09IC0xKSkgPyBfLm1hcChjdHJsLnNlbGVjdGVkQ2F0ZWdvcnkoKSwgKGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtanVtYm8udS1tYXJnaW5ib3R0b20tMjAnLCBjYXRlZ29yeS5uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Eudy1idXR0b24uYnRuLmJ0bi1tZWRpdW0uYnRuLWlubGluZS5idG4tZGFya1tocmVmPVwiL3Byb2plY3RzL25ld1wiXScsICdDb21lY2UgbyBzZXUgcHJvamV0bycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udGNvbG9yLW5lZ2F0aXZlJywgYFIkICR7aC5mb3JtYXROdW1iZXIoY2F0ZWdvcnkudG90YWxfc3VjY2Vzc2Z1bF92YWx1ZSwgMiwgMyl9YCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMjAnLCAnRG9hZG9zIHBhcmEgcHJvamV0b3MnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udGNvbG9yLW5lZ2F0aXZlJywgY2F0ZWdvcnkuc3VjY2Vzc2Z1bF9wcm9qZWN0cyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UudS1tYXJnaW5ib3R0b20tMzAnLCAnUHJvamV0b3MgZmluYW5jaWFkb3MnKSwgIV8uaXNFbXB0eShjdHJsLmZlYXR1cmVkUHJvamVjdHMoKSkgPyBfLm1hcChjdHJsLmZlYXR1cmVkUHJvamVjdHMoKSwgKHByb2plY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIV8uaXNVbmRlZmluZWQocHJvamVjdCkgPyBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgaW1nLnVzZXItYXZhdGFyW3NyYz1cIiR7cHJvamVjdC51c2VyVGh1bWJ9XCJdYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBwcm9qZWN0LnVzZXIubmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSTE4bi50KCdjYXRlZ29yaWVzLnBsZWRnZWQnLCBJMThuU2NvcGUoe3BsZWRnZWQ6IGguZm9ybWF0TnVtYmVyKHByb2plY3QucGxlZGdlZCksIGNvbnRyaWJ1dG9yczogcHJvamVjdC50b3RhbF9jb250cmlidXRvcnN9KSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYS5saW5rLWhpZGRlbltocmVmPVwiLyR7cHJvamVjdC5wZXJtYWxpbmt9XCJdYCwgcHJvamVjdC5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6IG0oJy5mb250c2l6ZS1iYXNlJywgSTE4bi50KCdjYXRlZ29yaWVzLmxvYWRpbmdfZmVhdHVyZWQnLCBJMThuU2NvcGUoKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiBtKCcuZm9udHNpemUtYmFzZScsIEkxOG4udCgnY2F0ZWdvcmllcy5ub19mZWF0dXJlZCcsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pIDogaC5sb2FkZXIoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlNsaWRlciwge1xuICAgICAgICAgICAgICAgICAgICBzbGlkZXM6IHRlc3RpbW9uaWFscygpLFxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogSTE4bi50KCd0ZXN0aW1vbmlhbHNfdGl0bGUnLCBJMThuU2NvcGUoKSlcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLmRpdmlkZXIudS1tYXJnaW50b3AtMzAnKSxcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIudS10ZXh0LWNlbnRlci51LW1hcmdpbmJvdHRvbS02MC51LW1hcmdpbnRvcC00MCcsIEkxOG4udCgncWFfdGl0bGUnLCBJMThuU2NvcGUoKSkpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tNjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNicsIF8ubWFwKGN0cmwucXVlc3Rpb25zLmNvbF8xLCAocXVlc3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcXVlc3Rpb246IHF1ZXN0aW9uLnF1ZXN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbnN3ZXI6IHF1ZXN0aW9uLmFuc3dlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTYnLCBfLm1hcChjdHJsLnF1ZXN0aW9ucy5jb2xfMiwgKHF1ZXN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMubGFuZGluZ1FBLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXN0aW9uOiBxdWVzdGlvbi5xdWVzdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5zd2VyOiBxdWVzdGlvbi5hbnN3ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1sYXJnZS51LXRleHQtY2VudGVyLmJnLXB1cnBsZS5iZWZvcmUtZm9vdGVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtanVtYm8uZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTYwJywgJ0NyaWUgbyBzZXUgcmFzY3VuaG8gZ3JhdHVpdGFtZW50ZSEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm1bYWN0aW9uPVwiL3Byb2plY3RzL25ld1wiXVttZXRob2Q9XCJHRVRcIl0udy1yb3cudy1mb3JtJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIuZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTEwJywgSTE4bi50KCdmb3JtLnRpdGxlJywgSTE4blNjb3BlKCkpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLm1lZGl1bS51LW1hcmdpbmJvdHRvbS0zMFtuYW1lPVxcJ25hbWVcXCddW3R5cGU9XFwndGV4dFxcJ10nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci5mb250Y29sb3ItbmVnYXRpdmUudS1tYXJnaW5ib3R0b20tMTAnLCAnbmEgY2F0ZWdvcmlhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NlbGVjdC53LXNlbGVjdC50ZXh0LWZpZWxkLm1lZGl1bS51LW1hcmdpbmJvdHRvbS00MFtuYW1lPVxcJ2NhdGVnb3J5X2lkXFwnXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ29wdGlvblt2YWx1ZT1cIlwiXScsIEkxOG4udCgnZm9ybS5zZWxlY3RfZGVmYXVsdCcsIEkxOG5TY29wZSgpKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLmNhdGVnb3JpZXMoKSwgKGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oYG9wdGlvblt2YWx1ZT1cIiR7Y2F0ZWdvcnkuaWR9XCJdYCwgY2F0ZWdvcnkubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTgwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1wdXNoLTQudS1tYXJnaW50b3AtNDAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBpbnB1dFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJHtJMThuLnQoJ2Zvcm0uc3VibWl0JywgSTE4blNjb3BlKCkpfVwiXS53LWJ1dHRvbi5idG4uYnRuLWxhcmdlYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuSTE4bikpO1xuIiwid2luZG93LmMucm9vdC5UZWFtID0gKGZ1bmN0aW9uKG0sIGMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjc3RhdGljLXRlYW0tYXBwJywgW1xuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuVGVhbVRvdGFsKSxcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLlRlYW1NZW1iZXJzKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLnJvb3QucHJvamVjdEZpbHRlcnMgPSAoKG0sIGgsIG1vbWVudCkgPT4ge1xuICAgIHJldHVybiAoKSA9PntcbiAgICAgICAgY29uc3QgZmlsdGVycyA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSxcblxuICAgICAgICAgICAgICBuZWFyTWUgPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgIG5lYXJfbWU6ICdlcScsXG4gICAgICAgICAgICAgICAgICBvcGVuX2Zvcl9jb250cmlidXRpb25zOiAnZXEnLFxuICAgICAgICAgICAgICAgICAgb25saW5lX2RhdGU6ICdndCdcbiAgICAgICAgICAgICAgfSkub3Blbl9mb3JfY29udHJpYnV0aW9ucygndHJ1ZScpLm5lYXJfbWUodHJ1ZSkub25saW5lX2RhdGUobW9tZW50KCkuc3VidHJhY3QoNjAsICdkYXlzJykuZm9ybWF0KCdZWVlZLU1NLUREJykpLFxuXG4gICAgICAgICAgICAgIGV4cGlyaW5nID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICBleHBpcmVzX2F0OiAnbHRlJyxcbiAgICAgICAgICAgICAgICAgIG9wZW5fZm9yX2NvbnRyaWJ1dGlvbnM6ICdlcSdcbiAgICAgICAgICAgICAgfSkub3Blbl9mb3JfY29udHJpYnV0aW9ucygndHJ1ZScpLmV4cGlyZXNfYXQobW9tZW50KCkuYWRkKDE0LCAnZGF5cycpLmZvcm1hdCgnWVlZWS1NTS1ERCcpKSxcblxuICAgICAgICAgICAgICByZWNlbnQgPSBmaWx0ZXJzKHtcbiAgICAgICAgICAgICAgICAgIG9ubGluZV9kYXRlOiAnZ3RlJyxcbiAgICAgICAgICAgICAgICAgIG9wZW5fZm9yX2NvbnRyaWJ1dGlvbnM6ICdlcSdcbiAgICAgICAgICAgICAgfSkub3Blbl9mb3JfY29udHJpYnV0aW9ucygndHJ1ZScpLm9ubGluZV9kYXRlKG1vbWVudCgpLnN1YnRyYWN0KDUsICdkYXlzJykuZm9ybWF0KCdZWVlZLU1NLUREJykpLFxuXG4gICAgICAgICAgICAgIHJlY29tbWVuZGVkID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICByZWNvbW1lbmRlZDogJ2VxJyxcbiAgICAgICAgICAgICAgICAgIG9wZW5fZm9yX2NvbnRyaWJ1dGlvbnM6ICdlcSdcbiAgICAgICAgICAgICAgfSkucmVjb21tZW5kZWQoJ3RydWUnKS5vcGVuX2Zvcl9jb250cmlidXRpb25zKCd0cnVlJyksXG5cbiAgICAgICAgICAgICAgb25saW5lID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICBvcGVuX2Zvcl9jb250cmlidXRpb25zOiAnZXEnXG4gICAgICAgICAgICAgIH0pLm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMoJ3RydWUnKSxcblxuICAgICAgICAgICAgICBzdWNjZXNzZnVsID0gZmlsdGVycyh7XG4gICAgICAgICAgICAgICAgICBzdGF0ZTogJ2VxJyxcbiAgICAgICAgICAgICAgICAgIGV4cGlyZXNfYXQ6ICdndCdcbiAgICAgICAgICAgICAgfSkuc3RhdGUoJ3N1Y2Nlc3NmdWwnKS5leHBpcmVzX2F0KG1vbWVudCgpLnN1YnRyYWN0KDMwLCAnZGF5cycpLmZvcm1hdCgnWVlZWS1NTS1ERCcpKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVjb21tZW5kZWQ6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1JlY29tZW5kYWRvcycsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiByZWNvbW1lbmRlZFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9ubGluZToge1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnTm8gYXInLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogb25saW5lXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXhwaXJpbmc6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1JldGEgZmluYWwnLFxuICAgICAgICAgICAgICAgIGZpbHRlcjogZXhwaXJpbmdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdWNjZXNzZnVsOiB7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdCZW0tc3VjZWRpZG9zJyxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IHN1Y2Nlc3NmdWxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZWNlbnQ6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1JlY2VudGVzJyxcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IHJlY2VudFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG5lYXJfbWU6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ1Byw7N4aW1vcyBhIG1pbScsXG4gICAgICAgICAgICAgICAgZmlsdGVyOiBuZWFyTWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Lm1vbWVudCkpO1xuIiwid2luZG93LmMuQWRtaW5Db250cmlidXRpb25EZXRhaWwgPSAoZnVuY3Rpb24obSwgXywgYywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBsO1xuICAgICAgICAgICAgY29uc3QgbG9hZFJld2FyZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtb2RlbCA9IGMubW9kZWxzLnJld2FyZERldGFpbCxcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkX2lkID0gYXJncy5pdGVtLnJld2FyZF9pZCxcbiAgICAgICAgICAgICAgICAgICAgb3B0cyA9IG1vZGVsLmdldFJvd09wdGlvbnMoaC5pZFZNLmlkKHJld2FyZF9pZCkucGFyYW1ldGVycygpKSxcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkID0gbS5wcm9wKHt9KTtcbiAgICAgICAgICAgICAgICBsID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKG9wdHMpO1xuICAgICAgICAgICAgICAgIGlmIChyZXdhcmRfaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbC5sb2FkKCkudGhlbihfLmNvbXBvc2UocmV3YXJkLCBfLmZpcnN0KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXdhcmQ7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgcmV3YXJkID0gbG9hZFJld2FyZCgpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZXdhcmQ6IHJld2FyZCxcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZmVyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ3VzZXJfaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnVHJhbnNmZXJpcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnSWQgZG8gbm92byBhcG9pYWRvcjonLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1RyYW5zZmVyaXIgQXBvaW8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdleDogMTI5OTA4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NNZXNzYWdlOiAnQXBvaW8gdHJhbnNmZXJpZG8gY29tIHN1Y2Vzc28hJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ08gYXBvaW8gbsOjbyBmb2kgdHJhbnNmZXJpZG8hJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiBjLm1vZGVscy5jb250cmlidXRpb25EZXRhaWxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmV3YXJkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRLZXk6ICdwcm9qZWN0X2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2NvbnRyaWJ1dGlvbl9pZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RLZXk6ICdyZXdhcmRfaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmFkaW9zOiAncmV3YXJkcycsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdBbHRlcmFyIFJlY29tcGVuc2EnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1JlY29tcGVuc2EnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0TW9kZWw6IGMubW9kZWxzLnJld2FyZERldGFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZU1vZGVsOiBjLm1vZGVscy5jb250cmlidXRpb25EZXRhaWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEl0ZW06IHJld2FyZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRlOiAocmV3YXJkcywgbmV3UmV3YXJkSUQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmV3YXJkID0gXy5maW5kV2hlcmUocmV3YXJkcywge2lkOiBuZXdSZXdhcmRJRH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoYXJncy5pdGVtLnZhbHVlID49IHJld2FyZC5taW5pbXVtX3ZhbHVlKSA/IHVuZGVmaW5lZCA6ICdWYWxvciBtw61uaW1vIGRhIHJlY29tcGVuc2Egw6kgbWFpb3IgZG8gcXVlIG8gdmFsb3IgZGEgY29udHJpYnVpw6fDo28uJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcmVmdW5kOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdpZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsVG9BY3Rpb246ICdSZWVtYm9sc28gZGlyZXRvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdUZW0gY2VydGV6YSBxdWUgZGVzZWphIHJlZW1ib2xzYXIgZXNzZSBhcG9pbz8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1JlZW1ib2xzYXIgQXBvaW8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZW1vdmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnc3RhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnQXBhZ2FyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdUZW0gY2VydGV6YSBxdWUgZGVzZWphIGFwYWdhciBlc3NlIGFwb2lvPycsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRlckxhYmVsOiAnQXBhZ2FyIEFwb2lvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcmNlVmFsdWU6ICdkZWxldGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NNZXNzYWdlOiAnQXBvaW8gcmVtb3ZpZG8gY29tIHN1Y2Vzc28hJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZTogJ08gYXBvaW8gbsOjbyBmb2kgcmVtb3ZpZG8hJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsOiBjLm1vZGVscy5jb250cmlidXRpb25EZXRhaWxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbDogbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgYWN0aW9ucyA9IGN0cmwuYWN0aW9ucyxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgIHJld2FyZCA9IGN0cmwucmV3YXJkO1xuXG4gICAgICAgICAgICBjb25zdCBhZGRPcHRpb25zID0gKGJ1aWxkZXIsIGlkKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBidWlsZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IChgL2FkbWluL2NvbnRyaWJ1dGlvbnMvJHtpZH0vZ2F0ZXdheV9yZWZ1bmRgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNhZG1pbi1jb250cmlidXRpb24tZGV0YWlsLWJveCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZGl2aWRlci51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0yMCcpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbklucHV0QWN0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBhY3Rpb25zLnRyYW5zZmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgKGN0cmwubCgpKSA/IGgubG9hZGVyIDpcbiAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblJhZGlvQWN0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBhY3Rpb25zLnJld2FyZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IHJld2FyZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldEtleVZhbHVlOiBpdGVtLnByb2plY3RfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVLZXlWYWx1ZTogaXRlbS5jb250cmlidXRpb25faWRcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5FeHRlcm5hbEFjdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogYWRkT3B0aW9ucyhhY3Rpb25zLnJlZnVuZCwgaXRlbS5pZCksXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluSW5wdXRBY3Rpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGFjdGlvbnMucmVtb3ZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdy5jYXJkLmNhcmQtdGVyY2lhcnkudS1yYWRpdXMnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5UcmFuc2FjdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uOiBpdGVtXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluVHJhbnNhY3Rpb25IaXN0b3J5LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb246IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIChjdHJsLmwoKSkgPyBoLmxvYWRlciA6XG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5SZXdhcmQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJld2FyZDogcmV3YXJkLFxuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBpdGVtLmtleVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluQ29udHJpYnV0aW9uSXRlbSA9IChmdW5jdGlvbihtLCBjLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGl0ZW1CdWlsZGVyOiBbe1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pbkNvbnRyaWJ1dGlvblVzZXInLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluUHJvamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Db250cmlidXRpb24nLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtMidcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ1BheW1lbnRTdGF0dXMnLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtMidcbiAgICAgICAgICAgICAgICB9XVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbShcbiAgICAgICAgICAgICAgICAnLnctcm93JyxcbiAgICAgICAgICAgICAgICBfLm1hcChjdHJsLml0ZW1CdWlsZGVyLCBmdW5jdGlvbihwYW5lbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbShwYW5lbC53cmFwcGVyQ2xhc3MsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGNbcGFuZWwuY29tcG9uZW50XSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW06IGFyZ3MuaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IGFyZ3Mua2V5XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvblVzZXIgY29tcG9uZW50XG4gKiBBbiBpdGVtYnVpbGRlciBjb21wb25lbnQgdGhhdCByZXR1cm5zIGFkZGl0aW9uYWwgZGF0YVxuICogdG8gYmUgaW5jbHVkZWQgaW4gQWRtaW5Vc2VyLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAqICAgICByZXR1cm4ge1xuICogICAgICAgICBpdGVtQnVpbGRlcjogW3tcbiAqICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluQ29udHJpYnV0aW9uVXNlcicsXG4gKiAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAqICAgICAgICAgfV1cbiAqICAgICB9XG4gKiB9XG4gKi9cbndpbmRvdy5jLkFkbWluQ29udHJpYnV0aW9uVXNlciA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgICAgICB1c2VyID0ge1xuICAgICAgICAgICAgICAgICAgICAgIHByb2ZpbGVfaW1nX3RodW1ibmFpbDogaXRlbS51c2VyX3Byb2ZpbGVfaW1nLFxuICAgICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLnVzZXJfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogaXRlbS51c2VyX25hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgZW1haWw6IGl0ZW0uZW1haWwsXG4gICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBhZGRpdGlvbmFsRGF0YSA9IG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0dhdGV3YXk6ICcgKyBpdGVtLnBheWVyX2VtYWlsKTtcbiAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLkFkbWluVXNlciwge2l0ZW06IHVzZXIsIGFkZGl0aW9uYWxfZGF0YTogYWRkaXRpb25hbERhdGF9KTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvbiA9IChmdW5jdGlvbihtLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IGFyZ3MuaXRlbTtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tY29udHJpYnV0aW9uJywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1zbWFsbCcsICdSJCcgKyBjb250cmlidXRpb24udmFsdWUpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgaC5tb21lbnRpZnkoY29udHJpYnV0aW9uLmNyZWF0ZWRfYXQsICdERC9NTS9ZWVlZIEhIOm1tW2hdJykpLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIFtcbiAgICAgICAgICAgICAgICAgICAgJ0lEIGRvIEdhdGV3YXk6ICcsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbdGFyZ2V0PVwiX2JsYW5rXCJdW2hyZWY9XCJodHRwczovL2Rhc2hib2FyZC5wYWdhci5tZS8jL3RyYW5zYWN0aW9ucy8nICsgY29udHJpYnV0aW9uLmdhdGV3YXlfaWQgKyAnXCJdJywgY29udHJpYnV0aW9uLmdhdGV3YXlfaWQpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuQWRtaW5FeHRlcm5hbEFjdGlvbiBjb21wb25lbnRcbiAqIE1ha2VzIGFyYml0cmFyeSBhamF4IHJlcXVlc3RzIGFuZCB1cGRhdGUgdW5kZXJseWluZ1xuICogZGF0YSBmcm9tIHNvdXJjZSBlbmRwb2ludC5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5BZG1pbkV4dGVybmFsQWN0aW9uLCB7XG4gKiAgICAgZGF0YToge30sXG4gKiAgICAgaXRlbTogcm93RnJvbURhdGFiYXNlXG4gKiB9KVxuICovXG53aW5kb3cuYy5BZG1pbkV4dGVybmFsQWN0aW9uID0gKChmdW5jdGlvbihtLCBoLCBjLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgbGV0IGJ1aWxkZXIgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgICAgICAgY29tcGxldGUgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBmYWlsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge30sXG4gICAgICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbTtcblxuICAgICAgICAgICAgYnVpbGRlci5yZXF1ZXN0T3B0aW9ucy5jb25maWcgPSAoeGhyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1DU1JGLVRva2VuJywgd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKVswXS5jb250ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCByZWxvYWQgPSBfLmNvbXBvc2UoYnVpbGRlci5tb2RlbC5nZXRSb3dXaXRoVG9rZW4sIGguaWRWTS5pZChpdGVtW2J1aWxkZXIudXBkYXRlS2V5XSkucGFyYW1ldGVycyksXG4gICAgICAgICAgICAgICAgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcihidWlsZGVyLnJlcXVlc3RPcHRpb25zLCBtLnJlcXVlc3QpO1xuXG4gICAgICAgICAgICBjb25zdCByZWxvYWRJdGVtID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICByZWxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgcmVxdWVzdEVycm9yID0gKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgIGVycm9yKHRydWUpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgdXBkYXRlSXRlbSA9IChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICBfLmV4dGVuZChpdGVtLCByZXNbMF0pO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHN1Ym1pdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKHJlbG9hZEl0ZW0sIHJlcXVlc3RFcnJvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgdW5sb2FkID0gKGVsLCBpc2luaXQsIGNvbnRleHQpID0+IHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBjb21wbGV0ZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgICAgICAgICAgbDogbCxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgICAgIHVubG9hZDogdW5sb2FkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBidG5WYWx1ZSA9IChjdHJsLmwoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLCBbXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSwgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC51bmxvYWRcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2Zvcm0udy1mb3JtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgICAgIH0sICghY3RybC5jb21wbGV0ZSgpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsJywgZGF0YS5pbm5lckxhYmVsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tc21hbGxbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIicgKyBidG5WYWx1ZSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICBdIDogKCFjdHJsLmVycm9yKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdSZXF1aXNpw6fDo28gZmVpdGEgY29tIHN1Y2Vzc28uJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdIb3V2ZSB1bSBwcm9ibGVtYSBuYSByZXF1aXNpw6fDo28uJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSkod2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5GaWx0ZXIgPSAoZnVuY3Rpb24oYywgbSwgXywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgdmFyIGZpbHRlckJ1aWxkZXIgPSBhcmdzLmZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBsYWJlbCA9IGFyZ3MubGFiZWwgfHwgJycsXG4gICAgICAgICAgICAgICAgbWFpbiA9IF8uZmluZFdoZXJlKGZpbHRlckJ1aWxkZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyTWFpbidcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNhZG1pbi1jb250cmlidXRpb25zLWZpbHRlci53LXNlY3Rpb24ucGFnZS1oZWFkZXInLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2VyLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tMzAnLCBsYWJlbCksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdmb3JtJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uc3VibWl0OiBhcmdzLnN1Ym1pdFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChfLmZpbmRXaGVyZShmaWx0ZXJCdWlsZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpID8gbS5jb21wb25lbnQoY1ttYWluLmNvbXBvbmVudF0sIG1haW4uZGF0YSkgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS1tYXJnaW5ib3R0b20tMjAudy1yb3cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24udy1jb2wudy1jb2wtMTIuZm9udHNpemUtc21hbGxlc3QubGluay1oaWRkZW4tbGlnaHRbc3R5bGU9XCJiYWNrZ3JvdW5kOiBub25lOyBib3JkZXI6IG5vbmU7IG91dGxpbmU6IG5vbmU7IHRleHQtYWxpZ246IGxlZnQ7XCJdW3R5cGU9XCJidXR0b25cIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZXIudG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdGaWx0cm9zIGF2YW7Dp2Fkb3MgwqA+JykpLCAoY3RybC50b2dnbGVyKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjYWR2YW5jZWQtc2VhcmNoLnctcm93LmFkbWluLWZpbHRlcnMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcChmaWx0ZXJCdWlsZGVyLCBmdW5jdGlvbihmKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChmLmNvbXBvbmVudCAhPT0gJ0ZpbHRlck1haW4nKSA/IG0uY29tcG9uZW50KGNbZi5jb21wb25lbnRdLCBmLmRhdGEpIDogJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cuYywgd2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbklucHV0QWN0aW9uID0gKGZ1bmN0aW9uKG0sIGgsIGMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIGRhdGEgPSB7fSxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgIGtleSA9IGJ1aWxkZXIucHJvcGVydHksXG4gICAgICAgICAgICAgICAgZm9yY2VWYWx1ZSA9IGJ1aWxkZXIuZm9yY2VWYWx1ZSB8fCBudWxsLFxuICAgICAgICAgICAgICAgIG5ld1ZhbHVlID0gbS5wcm9wKGZvcmNlVmFsdWUpO1xuXG4gICAgICAgICAgICBoLmlkVk0uaWQoaXRlbVtidWlsZGVyLnVwZGF0ZUtleV0pO1xuXG4gICAgICAgICAgICB2YXIgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLm1vZGVsLnBhdGNoT3B0aW9ucyhoLmlkVk0ucGFyYW1ldGVycygpLCBkYXRhKSk7XG5cbiAgICAgICAgICAgIHZhciB1cGRhdGVJdGVtID0gZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgXy5leHRlbmQoaXRlbSwgcmVzWzBdKTtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZGF0YVtrZXldID0gbmV3VmFsdWUoKTtcbiAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHVubG9hZCA9IGZ1bmN0aW9uKGVsLCBpc2luaXQsIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0Lm9udW5sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZShmb3JjZVZhbHVlKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogY29tcGxldGUsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIGw6IGwsXG4gICAgICAgICAgICAgICAgbmV3VmFsdWU6IG5ld1ZhbHVlLFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgdW5sb2FkOiB1bmxvYWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGJ0blZhbHVlID0gKGN0cmwubCgpKSA/ICdwb3IgZmF2b3IsIGFndWFyZGUuLi4nIDogZGF0YS5jYWxsVG9BY3Rpb247XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLCAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICAgICAgICBtKCcuZHJvcGRvd24tbGlzdC5jYXJkLnUtcmFkaXVzLmRyb3Bkb3duLWxpc3QtbWVkaXVtLnppbmRleC0xMCcsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnVubG9hZFxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWwnLCBkYXRhLmlubmVyTGFiZWwpLCAoZGF0YS5mb3JjZVZhbHVlID09PSB1bmRlZmluZWQpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZFt0eXBlPVwidGV4dFwiXVtwbGFjZWhvbGRlcj1cIicgKyBkYXRhLnBsYWNlaG9sZGVyICsgJ1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBjdHJsLm5ld1ZhbHVlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3RybC5uZXdWYWx1ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0gOiAoIWN0cmwuZXJyb3IoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgZGF0YS5zdWNjZXNzTWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdIb3V2ZSB1bSBwcm9ibGVtYSBuYSByZXF1aXNpw6fDo28uICcgKyBkYXRhLmVycm9yTWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluSXRlbSA9IChmdW5jdGlvbihtLCBfLCBoLCBjKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIGRpc3BsYXlEZXRhaWxCb3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlEZXRhaWxCb3g6IGRpc3BsYXlEZXRhaWxCb3hcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSBhcmdzLml0ZW07XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jbGVhcmZpeC5jYXJkLnUtcmFkaXVzLnUtbWFyZ2luYm90dG9tLTIwLnJlc3VsdHMtYWRtaW4taXRlbXMnLCBbXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYXJncy5saXN0SXRlbSwge1xuICAgICAgICAgICAgICAgICAgICBpdGVtOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICBrZXk6IGFyZ3Mua2V5XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLnctaW5saW5lLWJsb2NrLmFycm93LWFkbWluLmZhLmZhLWNoZXZyb24tZG93bi5mb250Y29sb3Itc2Vjb25kYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmRpc3BsYXlEZXRhaWxCb3gudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgY3RybC5kaXNwbGF5RGV0YWlsQm94KCkgPyBtLmNvbXBvbmVudChhcmdzLmxpc3REZXRhaWwsIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAga2V5OiBhcmdzLmtleVxuICAgICAgICAgICAgICAgIH0pIDogJydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5MaXN0ID0gKGZ1bmN0aW9uKG0sIGgsIGMpIHtcbiAgICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBsaXN0ID0gYXJncy52bS5saXN0O1xuICAgICAgICAgICAgaWYgKCFsaXN0LmNvbGxlY3Rpb24oKS5sZW5ndGggJiYgbGlzdC5maXJzdFBhZ2UpIHtcbiAgICAgICAgICAgICAgICBsaXN0LmZpcnN0UGFnZSgpLnRoZW4obnVsbCwgZnVuY3Rpb24oc2VydmVyRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncy52bS5lcnJvcihzZXJ2ZXJFcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgbGlzdCA9IGFyZ3Mudm0ubGlzdCxcbiAgICAgICAgICAgICAgICBlcnJvciA9IGFyZ3Mudm0uZXJyb3IsXG4gICAgICAgICAgICAgICAgbGFiZWwgPSBhcmdzLmxhYmVsIHx8ICcnO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcigpID9cbiAgICAgICAgICAgICAgICAgICAgbSgnLmNhcmQuY2FyZC1lcnJvci51LXJhZGl1cy5mb250d2VpZ2h0LWJvbGQnLCBlcnJvcigpKSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdC5pc0xvYWRpbmcoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgQ2FycmVnYW5kbyAke2xhYmVsLnRvTG93ZXJDYXNlKCl9Li4uYCA6IFttKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBsaXN0LnRvdGFsKCkpLCBgICR7bGFiZWwudG9Mb3dlckNhc2UoKX0gZW5jb250cmFkb3NgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2FkbWluLWNvbnRyaWJ1dGlvbnMtbGlzdC53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0LmNvbGxlY3Rpb24oKS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5BZG1pbkl0ZW0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtOiBhcmdzLmxpc3RJdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdERldGFpbDogYXJncy5saXN0RGV0YWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogaXRlbS5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1wdXNoLTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoLmxvYWRlcigpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBsaXN0Lm5leHRQYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdDYXJyZWdhciBtYWlzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5BZG1pbk5vdGlmaWNhdGlvbkhpc3RvcnkgY29tcG9uZW50XG4gKiBSZXR1cm4gbm90aWZpY2F0aW9ucyBsaXN0IGZyb20gYW4gVXNlciBvYmplY3QuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQWRtaW5Ob3RpZmljYXRpb25IaXN0b3J5LCB7XG4gKiAgICAgdXNlcjogdXNlclxuICogfSlcbiAqL1xuXG53aW5kb3cuYy5BZG1pbk5vdGlmaWNhdGlvbkhpc3RvcnkgPSAoKG0sIGgsIF8sIG1vZGVscykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub3RpZmljYXRpb25zID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICAgICAgICBnZXROb3RpZmljYXRpb25zID0gKHVzZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5vdGlmaWNhdGlvbiA9IG1vZGVscy5ub3RpZmljYXRpb247XG4gICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5nZXRQYWdlV2l0aFRva2VuKG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyX2lkOiAnZXEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VudF9hdDogJ2lzLm51bGwnXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC51c2VyX2lkKHVzZXIuaWQpXG4gICAgICAgICAgICAgICAgICAgIC5zZW50X2F0KCFudWxsKVxuICAgICAgICAgICAgICAgICAgICAub3JkZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VudF9hdDogJ2Rlc2MnXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5wYXJhbWV0ZXJzKCkpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKG5vdGlmaWNhdGlvbnMpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGdldE5vdGlmaWNhdGlvbnMoYXJncy51c2VyKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25zOiBub3RpZmljYXRpb25zXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnSGlzdMOzcmljbyBkZSBub3RpZmljYcOnw7VlcycpLFxuICAgICAgICAgICAgICAgIGN0cmwubm90aWZpY2F0aW9ucygpLm1hcCgoY0V2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXIuZGF0ZS1ldmVudCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeScsIGgubW9tZW50aWZ5KGNFdmVudC5zZW50X2F0LCAnREQvTU0vWVlZWSwgSEg6bW0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgLSAnLCBjRXZlbnQudGVtcGxhdGVfbmFtZSwgY0V2ZW50Lm9yaWdpbiA/ICcgLSAnICsgY0V2ZW50Lm9yaWdpbiA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXywgd2luZG93LmMubW9kZWxzKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFkbWluUHJvamVjdERldGFpbHNDYXJkIGNvbXBvbmVudFxuICogcmVuZGVyIGFuIGJveCB3aXRoIHNvbWUgcHJvamVjdCBzdGF0aXN0aWNzIGluZm9cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5BZG1pblByb2plY3REZXRhaWxzQ2FyZCwge1xuICogICAgIHJlc291cmNlOiBwcm9qZWN0RGV0YWlsIE9iamVjdCxcbiAqIH0pXG4gKi9cbndpbmRvdy5jLkFkbWluUHJvamVjdERldGFpbHNDYXJkID0gKChtLCBoLCBtb21lbnQpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHByb2plY3QgPSBhcmdzLnJlc291cmNlLFxuICAgICAgICAgICAgICAgIGdlbmVyYXRlU3RhdHVzVGV4dCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXR1c1RleHRPYmogPSBtLnByb3Aoe30pLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzVGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmxpbmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnTk8gQVInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzZnVsOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC1zdWNjZXNzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ0ZJTkFOQ0lBRE8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LWVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ07Dg08gRklOQU5DSUFETydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhaXRpbmdfZnVuZHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICd0ZXh0LXdhaXRpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnQUdVQVJEQU5ETydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdGVkOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAndGV4dC1lcnJvcicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdSRUNVU0FETydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYWZ0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ1JBU0NVTkhPJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5fYW5hbHlzaXM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3M6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnRU0gQU7DgUxJU0UnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ZlZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogJ3RleHQtc3VjY2VzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdBUFJPVkFETydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c1RleHRPYmooc3RhdHVzVGV4dFtwcm9qZWN0LnN0YXRlXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1c1RleHRPYmo7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpc0ZpbmFsTGFwID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBAVE9ETzogdXNlIDggZGF5cyBiZWNhdXNlIHRpbWV6b25lIG9uIGpzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAhXy5pc051bGwocHJvamVjdC5leHBpcmVzX2F0KSAmJiBtb21lbnQoKS5hZGQoOCwgJ2RheXMnKSA+PSBtb21lbnQocHJvamVjdC56b25lX2V4cGlyZXNfYXQpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgc3RhdHVzVGV4dE9iajogZ2VuZXJhdGVTdGF0dXNUZXh0KCksXG4gICAgICAgICAgICAgICAgcmVtYWluaW5nVGV4dE9iajogaC50cmFuc2xhdGVkVGltZShwcm9qZWN0LnJlbWFpbmluZ190aW1lKSxcbiAgICAgICAgICAgICAgICBlbGFwc2VkVGV4dE9iajogaC50cmFuc2xhdGVkVGltZShwcm9qZWN0LmVsYXBzZWRfdGltZSksXG4gICAgICAgICAgICAgICAgaXNGaW5hbExhcDogaXNGaW5hbExhcFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiAoY3RybCkgPT4ge1xuICAgICAgICAgICAgbGV0IHByb2plY3QgPSBjdHJsLnByb2plY3QsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MgPSBwcm9qZWN0LnByb2dyZXNzLnRvRml4ZWQoMiksXG4gICAgICAgICAgICAgICAgc3RhdHVzVGV4dE9iaiA9IGN0cmwuc3RhdHVzVGV4dE9iaigpLFxuICAgICAgICAgICAgICAgIHJlbWFpbmluZ1RleHRPYmogPSBjdHJsLnJlbWFpbmluZ1RleHRPYmosXG4gICAgICAgICAgICAgICAgZWxhcHNlZFRleHRPYmogPSBjdHJsLmVsYXBzZWRUZXh0T2JqO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnLnByb2plY3QtZGV0YWlscy1jYXJkLmNhcmQudS1yYWRpdXMuY2FyZC10ZXJjaWFyeS51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ1N0YXR1czonKSwgJ8KgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IHN0YXR1c1RleHRPYmouY3NzQ2xhc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIChjdHJsLmlzRmluYWxMYXAoKSAmJiBwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgPyAnUkVUQSBGSU5BTCcgOiBzdGF0dXNUZXh0T2JqLnRleHQpKSwgJ8KgJ1xuICAgICAgICAgICAgICAgICAgICBdKSwgKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5tZXRlci51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5tZXRlci1maWxsJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAocHJvZ3Jlc3MgPiAxMDAgPyAxMDAgOiBwcm9ncmVzcykgKyAnJSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ2ZpbmFuY2lhZG8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcHJvZ3Jlc3MgKyAnJScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsICdsZXZhbnRhZG9zJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1IkICcgKyBoLmZvcm1hdE51bWJlcihwcm9qZWN0LnBsZWRnZWQsIDIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCAnYXBvaW9zJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIHByb2plY3QudG90YWxfY29udHJpYnV0aW9ucylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKF8uaXNOdWxsKHByb2plY3QuZXhwaXJlc19hdCkgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbCcsICdpbmljaWFkbyBow6EnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIGVsYXBzZWRUZXh0T2JqLnRvdGFsICsgJyAnICsgZWxhcHNlZFRleHRPYmoudW5pdClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgJ3Jlc3RhbScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtbGFyZ2UubGluZWhlaWdodC10aWdodCcsIHJlbWFpbmluZ1RleHRPYmoudG90YWwgKyAnICcgKyByZW1haW5pbmdUZXh0T2JqLnVuaXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgICAgICAgICAgIH0oKSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Lm1vbWVudCkpO1xuIiwid2luZG93LmMuQWRtaW5Qcm9qZWN0ID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MuaXRlbTtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tcHJvamVjdCcsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWItcHJvamVjdC51LXJhZGl1c1tzcmM9JyArIHByb2plY3QucHJvamVjdF9pbWcgKyAnXVt3aWR0aD01MF0nKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC05LnctY29sLXNtYWxsLTknLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cIi8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdJywgcHJvamVjdC5wcm9qZWN0X25hbWUpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udHdlaWdodC1zZW1pYm9sZCcsIHByb2plY3QucHJvamVjdF9zdGF0ZSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgaC5tb21lbnRpZnkocHJvamVjdC5wcm9qZWN0X29ubGluZV9kYXRlKSArICcgYSAnICsgaC5tb21lbnRpZnkocHJvamVjdC5wcm9qZWN0X2V4cGlyZXNfYXQpKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblJhZGlvQWN0aW9uID0gKGZ1bmN0aW9uKG0sIGgsIGMsIF8pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgICAgICB2YXIgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZGF0YSA9IHt9LFxuICAgICAgICAgICAgICAgIC8vVE9ETzogSW1wbGVtZW50IGEgZGVzY3JpcHRvciB0byBhYnN0cmFjdCB0aGUgaW5pdGlhbCBkZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBmYWlsID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtKCksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBtLnByb3AoaXRlbS5kZXNjcmlwdGlvbiB8fCAnJyksXG4gICAgICAgICAgICAgICAga2V5ID0gYnVpbGRlci5nZXRLZXksXG4gICAgICAgICAgICAgICAgbmV3SUQgPSBtLnByb3AoJycpLFxuICAgICAgICAgICAgICAgIGdldEZpbHRlciA9IHt9LFxuICAgICAgICAgICAgICAgIHNldEZpbHRlciA9IHt9LFxuICAgICAgICAgICAgICAgIHJhZGlvcyA9IG0ucHJvcCgpLFxuICAgICAgICAgICAgICAgIGdldEF0dHIgPSBidWlsZGVyLnJhZGlvcyxcbiAgICAgICAgICAgICAgICBnZXRLZXkgPSBidWlsZGVyLmdldEtleSxcbiAgICAgICAgICAgICAgICBnZXRLZXlWYWx1ZSA9IGFyZ3MuZ2V0S2V5VmFsdWUsXG4gICAgICAgICAgICAgICAgdXBkYXRlS2V5ID0gYnVpbGRlci51cGRhdGVLZXksXG4gICAgICAgICAgICAgICAgdXBkYXRlS2V5VmFsdWUgPSBhcmdzLnVwZGF0ZUtleVZhbHVlLFxuICAgICAgICAgICAgICAgIHZhbGlkYXRlID0gYnVpbGRlci52YWxpZGF0ZSxcbiAgICAgICAgICAgICAgICBzZWxlY3RlZEl0ZW0gPSBidWlsZGVyLnNlbGVjdGVkSXRlbSB8fCBtLnByb3AoKTtcblxuICAgICAgICAgICAgc2V0RmlsdGVyW3VwZGF0ZUtleV0gPSAnZXEnO1xuICAgICAgICAgICAgdmFyIHNldFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHNldEZpbHRlcik7XG4gICAgICAgICAgICBzZXRWTVt1cGRhdGVLZXldKHVwZGF0ZUtleVZhbHVlKTtcblxuICAgICAgICAgICAgZ2V0RmlsdGVyW2dldEtleV0gPSAnZXEnO1xuICAgICAgICAgICAgdmFyIGdldFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKGdldEZpbHRlcik7XG4gICAgICAgICAgICBnZXRWTVtnZXRLZXldKGdldEtleVZhbHVlKTtcblxuICAgICAgICAgICAgdmFyIGdldExvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLmdldE1vZGVsLmdldFBhZ2VPcHRpb25zKGdldFZNLnBhcmFtZXRlcnMoKSkpO1xuXG4gICAgICAgICAgICB2YXIgc2V0TG9hZGVyID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGJ1aWxkZXIudXBkYXRlTW9kZWwucGF0Y2hPcHRpb25zKHNldFZNLnBhcmFtZXRlcnMoKSwgZGF0YSkpO1xuXG4gICAgICAgICAgICB2YXIgdXBkYXRlSXRlbSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0l0ZW0gPSBfLmZpbmRXaGVyZShyYWRpb3MoKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGFbMF1bYnVpbGRlci5zZWxlY3RLZXldXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEl0ZW0obmV3SXRlbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3Ioe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ05lbmh1bSBpdGVtIGF0dWFsaXphZG8nXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb21wbGV0ZSh0cnVlKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGZldGNoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZ2V0TG9hZGVyLmxvYWQoKS50aGVuKHJhZGlvcywgZXJyb3IpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChuZXdJRCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB2YWxpZGF0aW9uID0gdmFsaWRhdGUocmFkaW9zKCksIG5ld0lEKCkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc1VuZGVmaW5lZCh2YWxpZGF0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtidWlsZGVyLnNlbGVjdEtleV0gPSBuZXdJRCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0TG9hZGVyLmxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0sIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3Ioe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHZhbGlkYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciB1bmxvYWQgPSBmdW5jdGlvbihlbCwgaXNpbml0LCBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5vbnVubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgbmV3SUQoJycpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc2V0RGVzY3JpcHRpb24gPSBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb24odGV4dCk7XG4gICAgICAgICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZldGNoKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29tcGxldGU6IGNvbXBsZXRlLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICBzZXREZXNjcmlwdGlvbjogc2V0RGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgICAgIHNldExvYWRlcjogc2V0TG9hZGVyLFxuICAgICAgICAgICAgICAgIGdldExvYWRlcjogZ2V0TG9hZGVyLFxuICAgICAgICAgICAgICAgIG5ld0lEOiBuZXdJRCxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpLFxuICAgICAgICAgICAgICAgIHVubG9hZDogdW5sb2FkLFxuICAgICAgICAgICAgICAgIHJhZGlvczogcmFkaW9zXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICBsZXQgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICAgICAgICBpdGVtID0gYXJncy5pdGVtKCksXG4gICAgICAgICAgICAgICAgYnRuVmFsdWUgPSAoY3RybC5zZXRMb2FkZXIoKSB8fCBjdHJsLmdldExvYWRlcigpKSA/ICdwb3IgZmF2b3IsIGFndWFyZGUuLi4nIDogZGF0YS5jYWxsVG9BY3Rpb247XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLCAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICAgICAgICBtKCcuZHJvcGRvd24tbGlzdC5jYXJkLnUtcmFkaXVzLmRyb3Bkb3duLWxpc3QtbWVkaXVtLnppbmRleC0xMCcsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnVubG9hZFxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgKGN0cmwucmFkaW9zKCkpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGN0cmwucmFkaW9zKCksIGZ1bmN0aW9uKHJhZGlvLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5uZXdJRChyYWRpby5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuc2V0RGVzY3JpcHRpb24ocmFkaW8uZGVzY3JpcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdGVkID0gKHJhZGlvLmlkID09PSAoaXRlbVtkYXRhLnNlbGVjdEtleV0gfHwgaXRlbS5pZCkpID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJhZGlvJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dCNyLScgKyBpbmRleCArICcudy1yYWRpby1pbnB1dFt0eXBlPXJhZGlvXVtuYW1lPVwiYWRtaW4tcmFkaW9cIl1bdmFsdWU9XCInICsgcmFkaW8uaWQgKyAnXCJdJyArICgoc2VsZWN0ZWQpID8gJ1tjaGVja2VkXScgOiAnJyksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IHNldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWwudy1mb3JtLWxhYmVsW2Zvcj1cInItJyArIGluZGV4ICsgJ1wiXScsICdSJCcgKyByYWRpby5taW5pbXVtX3ZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkgOiBoLmxvYWRlcigpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Ryb25nJywgJ0Rlc2NyacOnw6NvJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgY3RybC5kZXNjcmlwdGlvbigpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tc21hbGxbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIicgKyBidG5WYWx1ZSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICBdIDogKCFjdHJsLmVycm9yKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdSZWNvbXBlbnNhIGFsdGVyYWRhIGNvbSBzdWNlc3NvIScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1lcnJvcltzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCBjdHJsLmVycm9yKCkubWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMsIHdpbmRvdy5fKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFkbWluUmVzZXRQYXNzd29yZCBjb21wb25lbnRcbiAqIE1ha2VzIGFqYXggcmVxdWVzdCB0byB1cGRhdGUgVXNlciBwYXNzd29yZC5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5BZG1pblJlc2V0UGFzc3dvcmQsIHtcbiAqICAgICBkYXRhOiB7fSxcbiAqICAgICBpdGVtOiByb3dGcm9tRGF0YWJhc2VcbiAqIH0pXG4gKi9cbndpbmRvdy5jLkFkbWluUmVzZXRQYXNzd29yZCA9ICgoZnVuY3Rpb24obSwgaCwgYywgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIGxldCBidWlsZGVyID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBlcnJvciA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgZmFpbCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAga2V5ID0gYnVpbGRlci5wcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICBkYXRhID0ge30sXG4gICAgICAgICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbTtcblxuICAgICAgICAgICAgYnVpbGRlci5yZXF1ZXN0T3B0aW9ucy5jb25maWcgPSAoeGhyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdtZXRhW25hbWU9XCJjc3JmLXRva2VuXCJdJykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1DU1JGLVRva2VuJywgd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ21ldGFbbmFtZT1cImNzcmYtdG9rZW5cIl0nKVswXS5jb250ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBsID0gbS5wb3N0Z3Jlc3QubG9hZGVyKF8uZXh0ZW5kKHt9LCB7ZGF0YTogZGF0YX0sIGJ1aWxkZXIucmVxdWVzdE9wdGlvbnMpLCBtLnJlcXVlc3QpLFxuICAgICAgICAgICAgICAgIG5ld1Bhc3N3b3JkID0gbS5wcm9wKCcnKSxcbiAgICAgICAgICAgICAgICBlcnJvcl9tZXNzYWdlID0gbS5wcm9wKCcnKTtcblxuICAgICAgICAgICAgY29uc3QgcmVxdWVzdEVycm9yID0gKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGVycm9yX21lc3NhZ2UoZXJyLmVycm9yc1swXSk7XG4gICAgICAgICAgICAgICAgY29tcGxldGUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgZXJyb3IodHJ1ZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgdXBkYXRlSXRlbSA9IChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICBfLmV4dGVuZChpdGVtLCByZXNbMF0pO1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHN1Ym1pdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBkYXRhW2tleV0gPSBuZXdQYXNzd29yZCgpO1xuICAgICAgICAgICAgICAgIGwubG9hZCgpLnRoZW4odXBkYXRlSXRlbSwgcmVxdWVzdEVycm9yKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCB1bmxvYWQgPSAoZWwsIGlzaW5pdCwgY29udGV4dCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnRleHQub251bmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29tcGxldGU6IGNvbXBsZXRlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvcixcbiAgICAgICAgICAgICAgICBlcnJvcl9tZXNzYWdlOiBlcnJvcl9tZXNzYWdlLFxuICAgICAgICAgICAgICAgIGw6IGwsXG4gICAgICAgICAgICAgICAgbmV3UGFzc3dvcmQ6IG5ld1Bhc3N3b3JkLFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0LFxuICAgICAgICAgICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgdW5sb2FkOiB1bmxvYWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gYXJncy5kYXRhLFxuICAgICAgICAgICAgICAgIGJ0blZhbHVlID0gKGN0cmwubCgpKSA/ICdwb3IgZmF2b3IsIGFndWFyZGUuLi4nIDogZGF0YS5jYWxsVG9BY3Rpb247XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsIFtcbiAgICAgICAgICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLCAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICAgICAgICBtKCcuZHJvcGRvd24tbGlzdC5jYXJkLnUtcmFkaXVzLmRyb3Bkb3duLWxpc3QtbWVkaXVtLnppbmRleC0xMCcsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLnVubG9hZFxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbnN1Ym1pdDogY3RybC5zdWJtaXRcbiAgICAgICAgICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWwnLCBkYXRhLmlubmVyTGFiZWwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkW3R5cGU9XCJ0ZXh0XCJdW25hbWU9XCInICsgZGF0YS5wcm9wZXJ0eSArICdcIl1bcGxhY2Vob2xkZXI9XCInICsgZGF0YS5wbGFjZWhvbGRlciArICdcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgY3RybC5uZXdQYXNzd29yZCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGN0cmwubmV3UGFzc3dvcmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWJ1dHRvbi5idG4uYnRuLXNtYWxsW3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCInICsgYnRuVmFsdWUgKyAnXCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSA6ICghY3RybC5lcnJvcigpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWZvcm0tZG9uZVtzdHlsZT1cImRpc3BsYXk6YmxvY2s7XCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AnLCAnU2VuaGEgYWx0ZXJhZGEgY29tIHN1Y2Vzc28uJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgncCcsIGN0cmwuZXJyb3JfbWVzc2FnZSgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblJld2FyZCA9IChmdW5jdGlvbihtLCBjLCBoLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJld2FyZCA9IGFyZ3MucmV3YXJkKCksXG4gICAgICAgICAgICAgICAgYXZhaWxhYmxlID0gcGFyc2VJbnQocmV3YXJkLnBhaWRfY291bnQpICsgcGFyc2VJbnQocmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCk7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdSZWNvbXBlbnNhJyksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyJywgcmV3YXJkLmlkID8gW1xuICAgICAgICAgICAgICAgICAgICAnSUQ6ICcgKyByZXdhcmQuaWQsXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdWYWxvciBtw61uaW1vOiBSJCcgKyBoLmZvcm1hdE51bWJlcihyZXdhcmQubWluaW11bV92YWx1ZSwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJ0Rpc3BvbsOtdmVpczogJyArIGF2YWlsYWJsZSArICcgLyAnICsgKHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgfHwgJyZpbmZpbjsnKSksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdBZ3VhcmRhbmRvIGNvbmZpcm1hw6fDo286ICcgKyByZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50LFxuICAgICAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgICAgICAnRGVzY3Jpw6fDo286ICcgKyByZXdhcmQuZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICBdIDogJ0Fwb2lvIHNlbSByZWNvbXBlbnNhJylcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuQWRtaW5UcmFuc2FjdGlvbkhpc3RvcnkgPSAoZnVuY3Rpb24obSwgaCwgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjb250cmlidXRpb24gPSBhcmdzLmNvbnRyaWJ1dGlvbixcbiAgICAgICAgICAgICAgICBtYXBFdmVudHMgPSBfLnJlZHVjZShbe1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24ucGFpZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0Fwb2lvIGNvbmZpcm1hZG8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24ucGVuZGluZ19yZWZ1bmRfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdSZWVtYm9sc28gc29saWNpdGFkbydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5yZWZ1bmRlZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0VzdG9ybm8gcmVhbGl6YWRvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLmNyZWF0ZWRfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBcG9pbyBjcmlhZG8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBkYXRlOiBjb250cmlidXRpb24ucmVmdXNlZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0Fwb2lvIGNhbmNlbGFkbydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGU6IGNvbnRyaWJ1dGlvbi5kZWxldGVkX2F0LFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQXBvaW8gZXhjbHXDrWRvJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZTogY29udHJpYnV0aW9uLmNoYXJnZWJhY2tfYXQsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdDaGFyZ2ViYWNrJ1xuICAgICAgICAgICAgICAgIH1dLCBmdW5jdGlvbihtZW1vLCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLmRhdGUgIT09IG51bGwgJiYgaXRlbS5kYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0ub3JpZ2luYWxEYXRlID0gaXRlbS5kYXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5kYXRlID0gaC5tb21lbnRpZnkoaXRlbS5kYXRlLCAnREQvTU0vWVlZWSwgSEg6bW0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtZW1vLmNvbmNhdChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtZW1vO1xuICAgICAgICAgICAgICAgIH0sIFtdKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcmRlcmVkRXZlbnRzOiBfLnNvcnRCeShtYXBFdmVudHMsICdvcmlnaW5hbERhdGUnKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnSGlzdMOzcmljbyBkYSB0cmFuc2HDp8OjbycpLFxuICAgICAgICAgICAgICAgIGN0cmwub3JkZXJlZEV2ZW50cy5tYXAoZnVuY3Rpb24oY0V2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXIuZGF0ZS1ldmVudCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5JywgY0V2ZW50LmRhdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIGNFdmVudC5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblRyYW5zYWN0aW9uID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgY29udHJpYnV0aW9uID0gYXJncy5jb250cmlidXRpb247XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMjAnLCAnRGV0YWxoZXMgZG8gYXBvaW8nKSxcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICdWYWxvcjogUiQnICsgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLnZhbHVlLCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ1RheGE6IFIkJyArIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi5nYXRld2F5X2ZlZSwgMiwgMyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdBZ3VhcmRhbmRvIENvbmZpcm1hw6fDo286ICcgKyAoY29udHJpYnV0aW9uLndhaXRpbmdfcGF5bWVudCA/ICdTaW0nIDogJ07Do28nKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0Fuw7RuaW1vOiAnICsgKGNvbnRyaWJ1dGlvbi5hbm9ueW1vdXMgPyAnU2ltJyA6ICdOw6NvJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAgICAgICAgICdJZCBwYWdhbWVudG86ICcgKyBjb250cmlidXRpb24uZ2F0ZXdheV9pZCxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0Fwb2lvOiAnICsgY29udHJpYnV0aW9uLmNvbnRyaWJ1dGlvbl9pZCxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ0NoYXZlOsKgXFxuJyxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uLmtleSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ01laW86ICcgKyBjb250cmlidXRpb24uZ2F0ZXdheSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgJ09wZXJhZG9yYTogJyArIChjb250cmlidXRpb24uZ2F0ZXdheV9kYXRhICYmIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2RhdGEuYWNxdWlyZXJfbmFtZSksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2JyJyksIChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250cmlidXRpb24uaXNfc2Vjb25kX3NsaXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW20oJ2EubGluay1oaWRkZW5baHJlZj1cIiNcIl0nLCAnQm9sZXRvIGJhbmPDoXJpbycpLCAnICcsIG0oJ3NwYW4uYmFkZ2UnLCAnMmEgdmlhJyldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KCkpLFxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkFkbWluVXNlckRldGFpbCBjb21wb25lbnRcbiAqIFJldHVybiBhY3Rpb24gaW5wdXRzIHRvIGJlIHVzZWQgaW5zaWRlIEFkbWluTGlzdCBjb21wb25lbnQuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQWRtaW5MaXN0LCB7XG4gKiAgICAgZGF0YToge30sXG4gKiAgICAgbGlzdERldGFpbDogYy5BZG1pblVzZXJEZXRhaWxcbiAqIH0pXG4gKi9cbndpbmRvdy5jLkFkbWluVXNlckRldGFpbCA9IChmdW5jdGlvbihtLCBfLCBjKXtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc2V0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ3Bhc3N3b3JkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ1JlZGVmaW5pcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnTm92YSBzZW5oYSBkZSBVc3XDoXJpbzonLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1JlZGVmaW5pciBzZW5oYScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ2V4OiAxMjNtdWRAcicsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMudXNlclxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICByZWFjdGl2YXRlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2RlYWN0aXZhdGVkX2F0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ1JlYXRpdmFyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdUZW0gY2VydGV6YSBxdWUgZGVzZWphIHJlYXRpdmFyIGVzc2UgdXN1w6FyaW8/JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NNZXNzYWdlOiAnVXN1w6FyaW8gcmVhdGl2YWRvIGNvbSBzdWNlc3NvIScsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdPIHVzdcOhcmlvIG7Do28gcMO0ZGUgc2VyIHJlYXRpdmFkbyEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1JlYXRpdmFyIHVzdcOhcmlvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcmNlVmFsdWU6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMudXNlclxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgICAgICAgIHZhciBhY3Rpb25zID0gY3RybC5hY3Rpb25zLFxuICAgICAgICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0sXG4gICAgICAgICAgICAgICAgZGV0YWlscyA9IGFyZ3MuZGV0YWlscztcblxuICAgICAgICAgICAgY29uc3QgYWRkT3B0aW9ucyA9IChidWlsZGVyLCBpZCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLmV4dGVuZCh7fSwgYnVpbGRlciwge1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0T3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiAoYC91c2Vycy8ke2lkfS9uZXdfcGFzc3dvcmRgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjYWRtaW4tY29udHJpYnV0aW9uLWRldGFpbC1ib3gnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmRpdmlkZXIudS1tYXJnaW50b3AtMjAudS1tYXJnaW5ib3R0b20tMjAnKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5SZXNldFBhc3N3b3JkLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBhZGRPcHRpb25zKGFjdGlvbnMucmVzZXQsIGl0ZW0uaWQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgKGl0ZW0uZGVhY3RpdmF0ZWRfYXQpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5JbnB1dEFjdGlvbiwge2RhdGE6IGFjdGlvbnMucmVhY3RpdmF0ZSwgaXRlbTogaXRlbX0pIDogJydcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cuY2FyZC5jYXJkLXRlcmNpYXJ5LnUtcmFkaXVzJywgW1xuICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluTm90aWZpY2F0aW9uSGlzdG9yeSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcjogaXRlbVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5Vc2VySXRlbSA9IChmdW5jdGlvbihtLCBjLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oXG4gICAgICAgICAgICAgICAgJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluVXNlciwgYXJncylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblVzZXIgPSAoZnVuY3Rpb24obSwgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciB1c2VyID0gYXJncy5pdGVtO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5hZG1pbi11c2VyJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2ltZy51c2VyLWF2YXRhcltzcmM9XCInICsgaC51c2VBdmF0YXJPckRlZmF1bHQodXNlci5wcm9maWxlX2ltZ190aHVtYm5haWwpICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTkudy1jb2wtc21hbGwtOScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiL3VzZXJzLycgKyB1c2VyLmlkICsgJy9lZGl0XCJdJywgdXNlci5uYW1lIHx8IHVzZXIuZW1haWwpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCAnVXN1w6FyaW86ICcgKyB1c2VyLmlkKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCAnRW1haWw6ICcgKyB1c2VyLmVtYWlsKSxcbiAgICAgICAgICAgICAgICAgICAgYXJncy5hZGRpdGlvbmFsX2RhdGFcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Bb25BZG1pblByb2plY3REZXRhaWxzRXhwbGFuYXRpb24gY29tcG9uZW50XG4gKiByZW5kZXIgYW4gZXhwbGFuYXRpb24gYWJvdXQgcHJvamVjdCBhbGwgb3Igbm90aGluZyBwcm9qZWN0IG1kZS5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5Bb25BZG1pblByb2plY3REZXRhaWxzRXhwbGFuYXRpb24sIHtcbiAqICAgICBwcm9qZWN0OiBwcm9qZWN0RGV0YWlsIE9iamVjdCxcbiAqIH0pXG4gKi9cbndpbmRvdy5jLkFvbkFkbWluUHJvamVjdERldGFpbHNFeHBsYW5hdGlvbiA9IChmdW5jdGlvbihtLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIGV4cGxhbmF0aW9uID0gZnVuY3Rpb24ocmVzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGVUZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICBvbmxpbmU6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCAnVm9jw6ogcG9kZSByZWNlYmVyIGFwb2lvcyBhdMOpIDIzaHM1OW1pbjU5cyBkbyBkaWEgJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnpvbmVfZXhwaXJlc19hdCkgKyAnLiBMZW1icmUtc2UsIMOpIHR1ZG8tb3UtbmFkYSBlIHZvY8OqIHPDsyBsZXZhcsOhIG9zIHJlY3Vyc29zIGNhcHRhZG9zIHNlIGJhdGVyIGEgbWV0YSBkZW50cm8gZGVzc2UgcHJhem8uJylcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgY29tZW1vcmUgcXVlIHZvY8OqIG1lcmVjZSEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgU2V1IHByb2pldG8gZm9pIGJlbSBzdWNlZGlkbyBlIGFnb3JhIMOpIGEgaG9yYSBkZSBpbmljaWFyIG8gdHJhYmFsaG8gZGUgcmVsYWNpb25hbWVudG8gY29tIHNldXMgYXBvaWFkb3JlcyEgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdBdGVuw6fDo28gZXNwZWNpYWwgw6AgZW50cmVnYSBkZSByZWNvbXBlbnNhcy4gUHJvbWV0ZXU/IEVudHJlZ3VlISBOw6NvIGRlaXhlIGRlIG9saGFyIGEgc2XDp8OjbyBkZSBww7NzLXByb2pldG8gZG8gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi9ndWlkZXNcIl0nLCAnR3VpYSBkb3MgUmVhbGl6YWRvcmVzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqBlIGRlIGluZm9ybWFyLXNlIHNvYnJlwqAnLCBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ2NvbW8gbyByZXBhc3NlIGRvIGRpbmhlaXJvIHNlcsOhIGZlaXRvLicpXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHdhaXRpbmdfZnVuZHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGVzdGFtb3MgcHJvY2Vzc2FuZG8gb3Mgw7psdGltb3MgcGFnYW1lbnRvcyEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcgU2V1IHByb2pldG8gZm9pIGZpbmFsaXphZG8gZW0gJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnpvbmVfZXhwaXJlc19hdCkgKyAnIGUgZXN0w6EgYWd1YXJkYW5kbyBjb25maXJtYcOnw6NvIGRlIGJvbGV0b3MgZSBwYWdhbWVudG9zLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0RldmlkbyDDoCBkYXRhIGRlIHZlbmNpbWVudG8gZGUgYm9sZXRvcywgcHJvamV0b3MgcXVlIHRpdmVyYW0gYXBvaW9zIGRlIMO6bHRpbWEgaG9yYSBmaWNhbSBwb3IgYXTDqSA0IGRpYXMgw7p0ZWlzIG5lc3NlIHN0YXR1cywgY29udGFkb3MgYSBwYXJ0aXIgZGEgZGF0YSBkZSBmaW5hbGl6YcOnw6NvIGRvIHByb2pldG8uwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdFbnRlbmRhIGNvbW8gbyByZXBhc3NlIGRlIGRpbmhlaXJvIMOpIGZlaXRvIHBhcmEgcHJvamV0b3MgYmVtIHN1Y2VkaWRvcy4nKVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBmYWlsZWQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIG7Do28gZGVzYW5pbWUhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnIFNldSBwcm9qZXRvIG7Do28gYmF0ZXUgYSBtZXRhIGUgc2FiZW1vcyBxdWUgaXNzbyBuw6NvIMOpIGEgbWVsaG9yIGRhcyBzZW5zYcOnw7Vlcy4gTWFzIG7Do28gZGVzYW5pbWUuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnRW5jYXJlIG8gcHJvY2Vzc28gY29tbyB1bSBhcHJlbmRpemFkbyBlIG7Do28gZGVpeGUgZGUgY29naXRhciB1bWEgc2VndW5kYSB0ZW50YXRpdmEuIE7Do28gc2UgcHJlb2N1cGUsIHRvZG9zIG9zIHNldXMgYXBvaWFkb3JlcyByZWNlYmVyw6NvIG8gZGluaGVpcm8gZGUgdm9sdGEuwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIzNjU1MDctUmVncmFzLWUtZnVuY2lvbmFtZW50by1kb3MtcmVlbWJvbHNvcy1lc3Rvcm5vc1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnRW50ZW5kYSBjb21vIGZhemVtb3MgZXN0b3Jub3MgZSByZWVtYm9sc29zLicpXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdGVkOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBpbmZlbGl6bWVudGUgbsOjbyBmb2kgZGVzdGEgdmV6LicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyBWb2PDqiBlbnZpb3Ugc2V1IHByb2pldG8gcGFyYSBhbsOhbGlzZSBkbyBDYXRhcnNlIGUgZW50ZW5kZW1vcyBxdWUgZWxlIG7Do28gZXN0w6EgZGUgYWNvcmRvIGNvbSBvIHBlcmZpbCBkbyBzaXRlLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ1RlciB1bSBwcm9qZXRvIHJlY3VzYWRvIG7Do28gaW1wZWRlIHF1ZSB2b2PDqiBlbnZpZSBub3ZvcyBwcm9qZXRvcyBwYXJhIGF2YWxpYcOnw6NvIG91IHJlZm9ybXVsZSBzZXUgcHJvamV0byBhdHVhbC4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb252ZXJzZSBjb20gbm9zc28gYXRlbmRpbWVudG8hIFJlY29tZW5kYW1vcyBxdWUgdm9jw6ogZMOqIHVtYSBib2Egb2xoYWRhIG5vc8KgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMzg3NjM4LURpcmV0cml6ZXMtcGFyYS1jcmlhJUMzJUE3JUMzJUEzby1kZS1wcm9qZXRvc1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnY3JpdMOpcmlvcyBkYSBwbGF0YWZvcm1hJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqBlIG5vwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL2d1aWRlc1wiXScsICdndWlhIGRvcyByZWFsaXphZG9yZXMnKSwgJy4nXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIGRyYWZ0OiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBjb25zdHJ1YSBvIHNldSBwcm9qZXRvIScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgUXVhbnRvIG1haXMgY3VpZGFkb3NvIGUgYmVtIGZvcm1hdGFkbyBmb3IgdW0gcHJvamV0bywgbWFpb3JlcyBhcyBjaGFuY2VzIGRlIGVsZSBzZXIgYmVtIHN1Y2VkaWRvIG5hIHN1YSBjYW1wYW5oYSBkZSBjYXB0YcOnw6NvLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0FudGVzIGRlIGVudmlhciBzZXUgcHJvamV0byBwYXJhIGEgbm9zc2EgYW7DoWxpc2UsIHByZWVuY2hhIHRvZGFzIGFzIGFiYXMgYW8gbGFkbyBjb20gY2FyaW5oby4gVm9jw6ogcG9kZSBzYWx2YXIgYXMgYWx0ZXJhw6fDtWVzIGUgdm9sdGFyIGFvIHJhc2N1bmhvIGRlIHByb2pldG8gcXVhbnRhcyB2ZXplcyBxdWlzZXIuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnUXVhbmRvIHR1ZG8gZXN0aXZlciBwcm9udG8sIGNsaXF1ZSBubyBib3TDo28gRU5WSUFSIGUgZW50cmFyZW1vcyBlbSBjb250YXRvIHBhcmEgYXZhbGlhciBvIHNldSBwcm9qZXRvLidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgaW5fYW5hbHlzaXM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIHZvY8OqIGVudmlvdSBzZXUgcHJvamV0byBwYXJhIGFuw6FsaXNlIGVtICcgKyBoLm1vbWVudGlmeShyZXNvdXJjZS5zZW50X3RvX2FuYWx5c2lzX2F0KSArICcgZSByZWNlYmVyw6Egbm9zc2EgYXZhbGlhw6fDo28gZW0gYXTDqSA0IGRpYXMgw7p0ZWlzIGFww7NzIG8gZW52aW8hJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqBFbnF1YW50byBlc3BlcmEgYSBzdWEgcmVzcG9zdGEsIHZvY8OqIHBvZGUgY29udGludWFyIGVkaXRhbmRvIG8gc2V1IHByb2pldG8uICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnUmVjb21lbmRhbW9zIHRhbWLDqW0gcXVlIHZvY8OqIHbDoSBjb2xldGFuZG8gZmVlZGJhY2sgY29tIGFzIHBlc3NvYXMgcHLDs3hpbWFzIGUgcGxhbmVqYW5kbyBjb21vIHNlcsOhIGEgc3VhIGNhbXBhbmhhLidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgYXBwcm92ZWQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIHNldSBwcm9qZXRvIGZvaSBhcHJvdmFkbyEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoFBhcmEgY29sb2NhciBvIHNldSBwcm9qZXRvIG5vIGFyIMOpIHByZWNpc28gYXBlbmFzIHF1ZSB2b2PDqiBwcmVlbmNoYSBvcyBkYWRvcyBuZWNlc3PDoXJpb3MgbmEgYWJhwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiI3VzZXJfc2V0dGluZ3NcIl0nLCAnQ29udGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICcuIMOJIGltcG9ydGFudGUgc2FiZXIgcXVlIGNvYnJhbW9zIGEgdGF4YSBkZSAxMyUgZG8gdmFsb3IgdG90YWwgYXJyZWNhZGFkbyBhcGVuYXMgcG9yIHByb2pldG9zIGJlbSBzdWNlZGlkb3MuIEVudGVuZGHCoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ2NvbW8gZmF6ZW1vcyBvIHJlcGFzc2UgZG8gZGluaGVpcm8uJylcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlVGV4dFtyZXNvdXJjZS5zdGF0ZV07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGV4cGxhbmF0aW9uOiBleHBsYW5hdGlvbihhcmdzLnJlc291cmNlKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oJ3AuJyArIGFyZ3MucmVzb3VyY2Uuc3RhdGUgKyAnLXByb2plY3QtdGV4dC5mb250c2l6ZS1zbWFsbC5saW5laGVpZ2h0LWxvb3NlJywgY3RybC5leHBsYW5hdGlvbik7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5DYXRlZ29yeUJ1dHRvbiBjb21wb25lbnRcbiAqIFJldHVybiBhIGxpbmsgd2l0aCBhIGJ0bi1jYXRlZ29yeSBjbGFzcy5cbiAqIEl0IHVzZXMgYSBjYXRlZ29yeSBwYXJhbWV0ZXIuXG4gKlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuQ2F0ZWdvcnlCdXR0b24sIHtcbiAqICAgICBjYXRlZ29yeToge1xuICogICAgICAgICBpZDogMSxcbiAqICAgICAgICAgbmFtZTogJ1ZpZGVvJyxcbiAqICAgICAgICAgb25saW5lX3Byb2plY3RzOiAxXG4gKiAgICAgfVxuICogfSlcbiAqL1xud2luZG93LmMuQ2F0ZWdvcnlCdXR0b24gPSAoKG0sIGMpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBhcmdzLmNhdGVnb3J5O1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgIG0oYGEudy1pbmxpbmUtYmxvY2suYnRuLWNhdGVnb3J5JHtjYXRlZ29yeS5uYW1lLmxlbmd0aCA+IDEzID8gJy5kb3VibGUtbGluZScgOiAnJ31baHJlZj0nI2J5X2NhdGVnb3J5X2lkLyR7Y2F0ZWdvcnkuaWR9J11gLFxuICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnkubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZS5leHBsb3JlJywgY2F0ZWdvcnkub25saW5lX3Byb2plY3RzKVxuICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMpKTtcbiIsIi8qKlxuICogd2luZG93LmMuRmlsdGVyQnV0dG9uIGNvbXBvbmVudFxuICogUmV0dXJuIGEgbGluayB3aXRoIGEgZmlsdGVycyBjbGFzcy5cbiAqIEl0IHVzZXMgYSBocmVmIGFuZCBhIHRpdGxlIHBhcmFtZXRlci5cbiAqXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5GaWx0ZXJCdXR0b24sIHtcbiAqICAgICB0aXRsZTogJ0ZpbHRlciBieSBjYXRlZ29yeScsXG4gKiAgICAgaHJlZjogJ2ZpbHRlcl9ieV9jYXRlZ29yeSdcbiAqIH0pXG4gKi9cbndpbmRvdy5jLkZpbHRlckJ1dHRvbiA9ICgobSwgYykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aXRsZSA9IGFyZ3MudGl0bGUsXG4gICAgICAgICAgICAgICAgICBocmVmID0gYXJncy5ocmVmO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgIG0oYGEudy1pbmxpbmUtYmxvY2suYnRuLWNhdGVnb3J5LmZpbHRlcnMke3RpdGxlLmxlbmd0aCA+IDEzID8gJy5kb3VibGUtbGluZScgOiAnJ31baHJlZj0nIyR7aHJlZn0nXWAsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGVcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkZpbHRlckRhdGVSYW5nZSA9IChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTYnLCBbXG4gICAgICAgICAgICAgICAgbSgnbGFiZWwuZm9udHNpemUtc21hbGxlcltmb3I9XCInICsgYXJncy5pbmRleCArICdcIl0nLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW2lkPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MuZmlyc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmZpcnN0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC0yLnctY29sLXRpbnktMicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtdGV4dC1jZW50ZXIubGluZWhlaWdodC1sb29zZXInLCAnZScpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmxhc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmxhc3QoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSkpO1xuIiwid2luZG93LmMuRmlsdGVyRHJvcGRvd24gPSAoZnVuY3Rpb24obSwgXykge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICAgICAgICAgIG0oJ2xhYmVsLmZvbnRzaXplLXNtYWxsZXJbZm9yPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywgYXJncy5sYWJlbCksXG4gICAgICAgICAgICAgICAgbSgnc2VsZWN0Lnctc2VsZWN0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3Mudm0pLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYXJncy52bSgpXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBfLm1hcChhcmdzLm9wdGlvbnMsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCdvcHRpb25bdmFsdWU9XCInICsgZGF0YS52YWx1ZSArICdcIl0nLCBkYXRhLm9wdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJNYWluID0gKGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlLm1lZGl1bVtwbGFjZWhvbGRlcj1cIicgKyBhcmdzLnBsYWNlaG9sZGVyICsgJ1wiXVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3Mudm0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3Mudm0oKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dCNmaWx0ZXItYnRuLmJ0bi5idG4tbGFyZ2UudS1tYXJnaW5ib3R0b20tMTBbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIkJ1c2NhclwiXScpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLkZpbHRlck51bWJlclJhbmdlID0gKGZ1bmN0aW9uKG0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtNicsIFtcbiAgICAgICAgICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl1bdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5maXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MuZmlyc3QoKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTIudy1jb2wtdGlueS0yJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS10ZXh0LWNlbnRlci5saW5laGVpZ2h0LWxvb3NlcicsICdlJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MubGFzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MubGFzdCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLkZsZXhBZG1pblByb2plY3REZXRhaWxzRXhwbGFuYXRpb24gY29tcG9uZW50XG4gKiByZW5kZXIgYW4gZXhwbGFuYXRpb24gYWJvdXQgcHJvamVjdCBmbGV4IHByb2plY3QgbWRlLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLkZsZXhBZG1pblByb2plY3REZXRhaWxzRXhwbGFuYXRpb24sIHtcbiAqICAgICBwcm9qZWN0OiBwcm9qZWN0RGV0YWlsIE9iamVjdCxcbiAqIH0pXG4gKi9cbndpbmRvdy5jLkZsZXhBZG1pblByb2plY3REZXRhaWxzRXhwbGFuYXRpb24gPSAoKG0sIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IGV4cGxhbmF0aW9uID0gKHJlc291cmNlKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHN0YXRlVGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgb25saW5lOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAoXy5pc051bGwocmVzb3VyY2UuZXhwaXJlc19hdCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi9wcm9qZWN0cy8nICsgcmVzb3VyY2UuaWQgKyAnL2VkaXQjYW5ub3VuY2VfZXhwaXJhdGlvblwiXScsICdRdWVybyBpbmljaWFyJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgYSByZXRhIGZpbmFsIGRlIDcgZGlhcydcbiAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgIDogbSgnc3BhbicsIGBWb2PDqiByZWNlYmUgdHVkbyBxdWUgYXJyZWNhZGFyIGF0w6kgYXMgJHtoLm1vbWVudGlmeShyZXNvdXJjZS56b25lX2V4cGlyZXNfYXQsICdISDptbTpzcycpfSBkZSAke2gubW9tZW50aWZ5KHJlc291cmNlLnpvbmVfZXhwaXJlc19hdCl9YCkpXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NmdWw6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGNvbWVtb3JlIHF1ZSB2b2PDqiBtZXJlY2UhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnIFNldSBwcm9qZXRvIGZvaSBiZW0gc3VjZWRpZG8gZSBhZ29yYSDDqSBhIGhvcmEgZGUgaW5pY2lhciBvIHRyYWJhbGhvIGRlIHJlbGFjaW9uYW1lbnRvIGNvbSBzZXVzIGFwb2lhZG9yZXMhICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQXRlbsOnw6NvIGVzcGVjaWFsIMOgIGVudHJlZ2EgZGUgcmVjb21wZW5zYXMuIFByb21ldGV1PyBFbnRyZWd1ZSEgTsOjbyBkZWl4ZSBkZSBvbGhhciBhIHNlw6fDo28gZGUgcMOzcy1wcm9qZXRvIGRvICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIvZ3VpZGVzXCJdJywgJ0d1aWEgZG9zIFJlYWxpemFkb3JlcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ8KgZSBkZSBpbmZvcm1hci1zZSBzb2JyZcKgJywgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjb21vIG8gcmVwYXNzZSBkbyBkaW5oZWlybyBzZXLDoSBmZWl0by4nKVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICB3YWl0aW5nX2Z1bmRzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBlc3RhbW9zIHByb2Nlc3NhbmRvIG9zIMO6bHRpbW9zIHBhZ2FtZW50b3MhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnIFNldSBwcm9qZXRvIGZvaSBmaW5hbGl6YWRvIGVtICcgKyBoLm1vbWVudGlmeShyZXNvdXJjZS56b25lX2V4cGlyZXNfYXQpICsgJyBlIGVzdMOhIGFndWFyZGFuZG8gY29uZmlybWHDp8OjbyBkZSBib2xldG9zIGUgcGFnYW1lbnRvcy4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdEZXZpZG8gw6AgZGF0YSBkZSB2ZW5jaW1lbnRvIGRlIGJvbGV0b3MsIHByb2pldG9zIHF1ZSB0aXZlcmFtIGFwb2lvcyBkZSDDumx0aW1hIGhvcmEgZmljYW0gcG9yIGF0w6kgNCBkaWFzIMO6dGVpcyBuZXNzZSBzdGF0dXMsIGNvbnRhZG9zIGEgcGFydGlyIGRhIGRhdGEgZGUgZmluYWxpemHDp8OjbyBkbyBwcm9qZXRvLsKgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cImh0dHA6Ly9zdXBvcnRlLmNhdGFyc2UubWUvaGMvcHQtYnIvYXJ0aWNsZXMvMjAyMDM3NDkzLUZJTkFOQ0lBRE8tQ29tby1zZXIlQzMlQTEtZmVpdG8tby1yZXBhc3NlLWRvLWRpbmhlaXJvLVwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnRW50ZW5kYSBjb21vIG8gcmVwYXNzZSBkZSBkaW5oZWlybyDDqSBmZWl0byBwYXJhIHByb2pldG9zIGJlbSBzdWNlZGlkb3MuJylcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0ZWQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGluZmVsaXptZW50ZSBuw6NvIGZvaSBkZXN0YSB2ZXouJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnIFZvY8OqIGVudmlvdSBzZXUgcHJvamV0byBwYXJhIGFuw6FsaXNlIGRvIENhdGFyc2UgZSBlbnRlbmRlbW9zIHF1ZSBlbGUgbsOjbyBlc3TDoSBkZSBhY29yZG8gY29tIG8gcGVyZmlsIGRvIHNpdGUuICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnVGVyIHVtIHByb2pldG8gcmVjdXNhZG8gbsOjbyBpbXBlZGUgcXVlIHZvY8OqIGVudmllIG5vdm9zIHByb2pldG9zIHBhcmEgYXZhbGlhw6fDo28gb3UgcmVmb3JtdWxlIHNldSBwcm9qZXRvIGF0dWFsLiAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbnZlcnNlIGNvbSBub3NzbyBhdGVuZGltZW50byEgUmVjb21lbmRhbW9zIHF1ZSB2b2PDqiBkw6ogdW1hIGJvYSBvbGhhZGEgbm9zwqAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIzODc2MzgtRGlyZXRyaXplcy1wYXJhLWNyaWElQzMlQTclQzMlQTNvLWRlLXByb2pldG9zXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjcml0w6lyaW9zIGRhIHBsYXRhZm9ybWEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICfCoGUgbm/CoCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCIvZ3VpZGVzXCJdJywgJ2d1aWEgZG9zIHJlYWxpemFkb3JlcycpLCAnLidcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgZHJhZnQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIGNvbnN0cnVhIG8gc2V1IHByb2pldG8hJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAnwqBRdWFudG8gbWFpcyBjdWlkYWRvc28gZSBiZW0gZm9ybWF0YWRvIGZvciB1bSBwcm9qZXRvLCBtYWlvcmVzIGFzIGNoYW5jZXMgZGUgZWxlIHNlciBiZW0gc3VjZWRpZG8gbmEgc3VhIGNhbXBhbmhhIGRlIGNhcHRhw6fDo28uICcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnQW50ZXMgZGUgZW52aWFyIHNldSBwcm9qZXRvIHBhcmEgYSBub3NzYSBhbsOhbGlzZSwgcHJlZW5jaGEgdG9kYXMgYXMgYWJhcyBhbyBsYWRvIGNvbSBjYXJpbmhvLiBWb2PDqiBwb2RlIHNhbHZhciBhcyBhbHRlcmHDp8O1ZXMgZSB2b2x0YXIgYW8gcmFzY3VuaG8gZGUgcHJvamV0byBxdWFudGFzIHZlemVzIHF1aXNlci4gJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdRdWFuZG8gdHVkbyBlc3RpdmVyIHByb250bywgY2xpcXVlIG5vIGJvdMOjbyBQVUJMSUNBUi4nXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZVRleHRbcmVzb3VyY2Uuc3RhdGVdO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBleHBsYW5hdGlvbjogZXhwbGFuYXRpb24oYXJncy5yZXNvdXJjZSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgncC4nICsgYXJncy5yZXNvdXJjZS5zdGF0ZSArICctcHJvamVjdC10ZXh0LmZvbnRzaXplLXNtYWxsLmxpbmVoZWlnaHQtbG9vc2UnLCBjdHJsLmV4cGxhbmF0aW9uKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5sYW5kaW5nUUEgY29tcG9uZW50XG4gKiBBIHZpc3VhbCBjb21wb25lbnQgdGhhdCBkaXNwbGF5cyBhIHF1ZXN0aW9uL2Fuc3dlciBib3ggd2l0aCB0b2dnbGVcbiAqXG4gKiBFeGFtcGxlOlxuICogdmlldzogKCkgPT4ge1xuICogICAgICAuLi5cbiAqICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nUUEsIHtcbiAqICAgICAgICAgIHF1ZXN0aW9uOiAnV2hhdHMgeW91ciBuYW1lPycsXG4gKiAgICAgICAgICBhbnN3ZXI6ICdEYXJ0aCBWYWRlci4nXG4gKiAgICAgIH0pXG4gKiAgICAgIC4uLlxuICogIH1cbiAqL1xud2luZG93LmMubGFuZGluZ1FBID0gKGZ1bmN0aW9uKG0sIGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzaG93QW5zd2VyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy5jYXJkLnFhLWNhcmQudS1tYXJnaW5ib3R0b20tMjAudS1yYWRpdXMuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgIG9uY2xpY2s6IGN0cmwuc2hvd0Fuc3dlci50b2dnbGVcbiAgICAgICAgICAgIH0sW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlJywgYXJncy5xdWVzdGlvbiksXG4gICAgICAgICAgICAgICAgY3RybC5zaG93QW5zd2VyKCkgPyBtKCdwLnUtbWFyZ2ludG9wLTIwLmZvbnRzaXplLXNtYWxsJywgYXJncy5hbnN3ZXIpIDogJydcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMubGFuZGluZ1NpZ251cCBjb21wb25lbnRcbiAqIEEgdmlzdWFsIGNvbXBvbmVudCB0aGF0IGRpc3BsYXlzIHNpZ251cCBlbWFpbCB0eXBpY2FsbHkgdXNlZCBvbiBsYW5kaW5nIHBhZ2VzLlxuICogSXQgYWNjZXB0cyBhIGN1c3RvbSBmb3JtIGFjdGlvbiB0byBhdHRhY2ggdG8gdGhpcmQtcGFydHkgc2VydmljZXMgbGlrZSBNYWlsY2hpbXBcbiAqXG4gKiBFeGFtcGxlOlxuICogdmlldzogKCkgPT4ge1xuICogICAgICAuLi5cbiAqICAgICAgbS5jb21wb25lbnQoYy5sYW5kaW5nU2lnbnVwLCB7XG4gKiAgICAgICAgICBidWlsZGVyOiB7XG4gKiAgICAgICAgICAgICAgY3VzdG9tQWN0aW9uOiAnaHR0cDovL2Zvcm1lbmRwb2ludC5jb20nXG4gKiAgICAgICAgICB9XG4gKiAgICAgIH0pXG4gKiAgICAgIC4uLlxuICogIH1cbiAqL1xud2luZG93LmMubGFuZGluZ1NpZ251cCA9IChmdW5jdGlvbihtLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJ1aWxkZXIgPSBhcmdzLmJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgZW1haWwgPSBtLnByb3AoJycpLFxuICAgICAgICAgICAgICAgIGVycm9yID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICAgICAgICBzdWJtaXQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChoLnZhbGlkYXRlRW1haWwoZW1haWwoKSkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcih0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICAgICAgICBzdWJtaXQ6IHN1Ym1pdCxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgZXJyb3JDbGFzc2VzID0gKCFjdHJsLmVycm9yKSA/ICcucG9zaXRpdmUuZXJyb3InIDogJyc7XG4gICAgICAgICAgICByZXR1cm4gbSgnZm9ybS53LWZvcm1baWQ9XCJlbWFpbC1mb3JtXCJdW21ldGhvZD1cInBvc3RcIl1bYWN0aW9uPVwiJyArIGFyZ3MuYnVpbGRlci5jdXN0b21BY3Rpb24gKyAnXCJdJyx7XG4gICAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICB9LFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgbShgaW5wdXQke2Vycm9yQ2xhc3Nlc30udy1pbnB1dC50ZXh0LWZpZWxkLm1lZGl1bVtuYW1lPVwiRU1BSUxcIl1bcGxhY2Vob2xkZXI9XCJEaWdpdGUgc2V1IGVtYWlsXCJdW3R5cGU9XCJ0ZXh0XCJdYCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgY3RybC5lbWFpbCksXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3RybC5lbWFpbCgpXG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAoY3RybC5lcnJvcigpID8gbSgnc3Bhbi5mb250c2l6ZS1zbWFsbGVyLnRleHQtZXJyb3InLCAnRS1tYWlsIGludsOhbGlkbycpIDogJycpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctYnV0dG9uLmJ0bi5idG4tbGFyZ2VbdHlwZT1cInN1Ym1pdFwiXVt2YWx1ZT1cIkNhZGFzdHJhclwiXScpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlBheW1lbnRTdGF0dXMgPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwYXltZW50ID0gYXJncy5pdGVtLFxuICAgICAgICAgICAgICAgIGNhcmQgPSBudWxsLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kLCBwYXltZW50TWV0aG9kQ2xhc3MsIHN0YXRlQ2xhc3M7XG5cbiAgICAgICAgICAgIGNhcmQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAocGF5bWVudC5nYXRld2F5X2RhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChwYXltZW50LmdhdGV3YXkudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbW9pcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fYmluLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FydGFvX2ZpbmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmFuZDogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FydGFvX2JhbmRlaXJhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3BhZ2FybWUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FyZF9maXJzdF9kaWdpdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJkX2xhc3RfZGlnaXRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmFuZDogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FyZF9icmFuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBkaXNwbGF5UGF5bWVudE1ldGhvZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAocGF5bWVudC5wYXltZW50X21ldGhvZC50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvbGV0b2JhbmNhcmlvJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCdzcGFuI2JvbGV0by1kZXRhaWwnLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NhcnRhb2RlY3JlZGl0byc6XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2FyZERhdGEgPSBjYXJkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FyZERhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnI2NyZWRpdGNhcmQtZGV0YWlsLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZERhdGEuZmlyc3RfZGlnaXRzICsgJyoqKioqKicgKyBjYXJkRGF0YS5sYXN0X2RpZ2l0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FyZERhdGEuYnJhbmQgKyAnICcgKyBwYXltZW50Lmluc3RhbGxtZW50cyArICd4J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHBheW1lbnRNZXRob2RDbGFzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAocGF5bWVudC5wYXltZW50X21ldGhvZC50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2JvbGV0b2JhbmNhcmlvJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLmZhLWJhcmNvZGUnO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdjYXJ0YW9kZWNyZWRpdG8nOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcuZmEtY3JlZGl0LWNhcmQnO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcuZmEtcXVlc3Rpb24nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHN0YXRlQ2xhc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHBheW1lbnQuc3RhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncGFpZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy50ZXh0LXN1Y2Nlc3MnO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdyZWZ1bmRlZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy50ZXh0LXJlZnVuZGVkJztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAncGVuZGluZyc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3BlbmRpbmdfcmVmdW5kJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnLnRleHQtd2FpdGluZyc7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJy50ZXh0LWVycm9yJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlQYXltZW50TWV0aG9kOiBkaXNwbGF5UGF5bWVudE1ldGhvZCxcbiAgICAgICAgICAgICAgICBwYXltZW50TWV0aG9kQ2xhc3M6IHBheW1lbnRNZXRob2RDbGFzcyxcbiAgICAgICAgICAgICAgICBzdGF0ZUNsYXNzOiBzdGF0ZUNsYXNzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwYXltZW50ID0gYXJncy5pdGVtO1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy5wYXltZW50LXN0YXR1cycsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1jaXJjbGUnICsgY3RybC5zdGF0ZUNsYXNzKCkpLCAnwqAnICsgcGF5bWVudC5zdGF0ZVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhJyArIGN0cmwucGF5bWVudE1ldGhvZENsYXNzKCkpLCAnICcsIG0oJ2EubGluay1oaWRkZW5baHJlZj1cIiNcIl0nLCBwYXltZW50LnBheW1lbnRfbWV0aG9kKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHQnLCBbXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuZGlzcGxheVBheW1lbnRNZXRob2QoKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5Qb3BOb3RpZmljYXRpb24gPSAoKG0sIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgZGlzcGxheU5vdGlmaWNhdGlvbiA9IGgudG9nZ2xlUHJvcCh0cnVlLCBmYWxzZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheU5vdGlmaWNhdGlvbjogZGlzcGxheU5vdGlmaWNhdGlvblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoY3RybC5kaXNwbGF5Tm90aWZpY2F0aW9uKCkgPyBtKCcuZmxhc2gudy1jbGVhcmZpeC5jYXJkLmNhcmQtbm90aWZpY2F0aW9uLnUtcmFkaXVzLnppbmRleC0yMCcsIFtcbiAgICAgICAgICAgICAgICBtKCdpbWcuaWNvbi1jbG9zZVtzcmM9XCIvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL3gucG5nXCJdW3dpZHRoPVwiMTJcIl1bYWx0PVwiZmVjaGFyXCJdJywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmRpc3BsYXlOb3RpZmljYXRpb24udG9nZ2xlXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsJywgYXJncy5tZXNzYWdlKVxuICAgICAgICAgICAgXSkgOiBtKCdzcGFuJykpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RBYm91dCA9ICgobSwgYywgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIG9ubGluZURheXMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBkaWZmID0gbW9tZW50KHByb2plY3Quem9uZV9vbmxpbmVfZGF0ZSkuZGlmZihtb21lbnQocHJvamVjdC56b25lX2V4cGlyZXNfYXQpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uID0gbW9tZW50LmR1cmF0aW9uKGRpZmYpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtTWF0aC5jZWlsKGR1cmF0aW9uLmFzRGF5cygpKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGV0IGZ1bmRpbmdQZXJpb2QgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCAmJiBoLmV4aXN0eShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCkpID8gbSgnLmZ1bmRpbmctcGVyaW9kJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCAnUGVyw61vZG8gZGUgY2FtcGFuaGEnKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsIGAke2gubW9tZW50aWZ5KHByb2plY3Quem9uZV9vbmxpbmVfZGF0ZSl9IC0gJHtoLm1vbWVudGlmeShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCl9ICgke29ubGluZURheXMoKX0gZGlhcylgKVxuICAgICAgICAgICAgICAgIF0pIDogJyc7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3QtYWJvdXQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnByb2plY3QtYWJvdXQudy1jb2wudy1jb2wtOCcsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBoLlVJSGVscGVyKClcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtYmFzZScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3N0cm9uZycsICdPIHByb2pldG8nKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlW2l0ZW1wcm9wPVwiYWJvdXRcIl0nLCBtLnRydXN0KHByb2plY3QuYWJvdXRfaHRtbCkpLFxuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LmJ1ZGdldCA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkJywgJ09yw6dhbWVudG8nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3AuZm9udHNpemUtYmFzZScsIG0udHJ1c3QocHJvamVjdC5idWRnZXQpKVxuICAgICAgICAgICAgICAgICAgICBdIDogJycsXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsICFfLmlzRW1wdHkoYXJncy5yZXdhcmREZXRhaWxzKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTMwJywgJ1JlY29tcGVuc2FzJyksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFJld2FyZExpc3QsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXdhcmREZXRhaWxzOiBhcmdzLnJld2FyZERldGFpbHNcbiAgICAgICAgICAgICAgICAgICAgfSksIGZ1bmRpbmdQZXJpb2QoKVxuICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMzAnLCAnU3VnZXN0w7Vlc8KgZGXCoGFwb2lvJyksXG4gICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFN1Z2dlc3RlZENvbnRyaWJ1dGlvbnMsIHtwcm9qZWN0OiBwcm9qZWN0fSksXG4gICAgICAgICAgICAgICAgICAgIGZ1bmRpbmdQZXJpb2QoKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdENhcmQgPSAoKG0sIGgsIG1vZGVscywgSTE4bikgPT4ge1xuICAgIGNvbnN0IEkxOG5TY29wZSA9IF8ucGFydGlhbChoLmkxOG5TY29wZSwgJ3Byb2plY3RzLmNhcmQnKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIHByb2dyZXNzID0gcHJvamVjdC5wcm9ncmVzcy50b0ZpeGVkKDIpLFxuICAgICAgICAgICAgICAgIHJlbWFpbmluZ1RleHRPYmogPSBoLnRyYW5zbGF0ZWRUaW1lKHByb2plY3QucmVtYWluaW5nX3RpbWUpLFxuICAgICAgICAgICAgICAgIGxpbmsgPSAnLycgKyBwcm9qZWN0LnBlcm1hbGluayArIChhcmdzLnJlZiA/ICc/cmVmPScgKyBhcmdzLnJlZiA6ICcnKTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgIG0oJy5jYXJkLXByb2plY3QuY2FyZC51LXJhZGl1cycsIFtcbiAgICAgICAgICAgICAgICAgICAgbShgYS5jYXJkLXByb2plY3QtdGh1bWJbaHJlZj1cIiR7bGlua31cIl1gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kLWltYWdlJzogYHVybCgke3Byb2plY3QucHJvamVjdF9pbWd9KWAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Rpc3BsYXknOiAnYmxvY2snXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuY2FyZC1wcm9qZWN0LWRlc2NyaXB0aW9uLmFsdCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtdGV4dC1jZW50ZXItc21hbGwtb25seS5saW5laGVpZ2h0LXRpZ2h0LnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWJhc2UnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYS5saW5rLWhpZGRlbltocmVmPVwiJHtsaW5rfVwiXWAsIHByb2plY3QucHJvamVjdF9uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtbWFyZ2luYm90dG9tLTIwJywgYCR7STE4bi50KCdieScsIEkxOG5TY29wZSgpKX0gJHtwcm9qZWN0Lm93bmVyX25hbWV9YCksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5mb250Y29sb3Itc2Vjb25kYXJ5LmZvbnRzaXplLXNtYWxsZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYS5saW5rLWhpZGRlbltocmVmPVwiJHtsaW5rfVwiXWAsIHByb2plY3QuaGVhZGxpbmUpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuY2FyZC1wcm9qZWN0LWF1dGhvci5hbHR0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnknLCBbbSgnc3Bhbi5mYS5mYS1tYXAtbWFya2VyLmZhLTEnLCAnICcpLCBgICR7cHJvamVjdC5jaXR5X25hbWUgPyBwcm9qZWN0LmNpdHlfbmFtZSA6ICcnfSwgJHtwcm9qZWN0LnN0YXRlX2Fjcm9ueW0gPyBwcm9qZWN0LnN0YXRlX2Fjcm9ueW0gOiAnJ31gXSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oYC5jYXJkLXByb2plY3QtbWV0ZXIuJHtwcm9qZWN0LnN0YXRlfWAsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIChfLmNvbnRhaW5zKFsnc3VjY2Vzc2Z1bCcsICdmYWlsZWQnLCAnd2FpdGluZ19mdW5kcyddLCBwcm9qZWN0LnN0YXRlKSkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIEkxOG4udCgnZGlzcGxheV9zdGF0dXMuJyArIHByb2plY3Quc3RhdGUsIEkxOG5TY29wZSgpKSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5tZXRlci1maWxsJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGAkeyhwcm9ncmVzcyA+IDEwMCA/IDEwMCA6IHByb2dyZXNzKX0lYFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcuY2FyZC1wcm9qZWN0LXN0YXRzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS5mb250d2VpZ2h0LXNlbWlib2xkJywgYCR7TWF0aC5jZWlsKHByb2plY3QucHJvZ3Jlc3MpfSVgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIGBSJCAke2guZm9ybWF0TnVtYmVyKHByb2plY3QucGxlZGdlZCl9YCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LXRpZ2h0ZXN0JywgJ0xldmFudGFkb3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnUtdGV4dC1yaWdodCcsIHByb2plY3QuZXhwaXJlc19hdCA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIGAke3JlbWFpbmluZ1RleHRPYmoudG90YWx9ICR7cmVtYWluaW5nVGV4dE9iai51bml0fWApLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC10aWdodGVzdCcsIChyZW1haW5pbmdUZXh0T2JqLnRvdGFsID4gMSkgPyAnUmVzdGFudGVzJyA6ICdSZXN0YW50ZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtdGlnaHQnLCBbJ1ByYXpvIGVtJyxtKCdicicpLCdhYmVydG8nXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93Ll8sIHdpbmRvdy5JMThuKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q29tbWVudHMgPSAoZnVuY3Rpb24obSwgYywgaCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRDb21tZW50cyA9IChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtyZXR1cm47fVxuICAgICAgICAgICAgICAgICAgICBoLmZiUGFyc2UoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtsb2FkQ29tbWVudHM6IGxvYWRDb21tZW50c307XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICAgICAgICByZXR1cm4gbSgnLmZiLWNvbW1lbnRzW2RhdGEtaHJlZj1cImh0dHA6Ly93d3cuY2F0YXJzZS5tZS8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdW2RhdGEtbnVtLXBvc3RzPTUwXVtkYXRhLXdpZHRoPVwiNjEwXCJdJywge2NvbmZpZzogY3RybC5sb2FkQ29tbWVudHMoKX0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0Q29udHJpYnV0aW9ucyA9ICgobSwgbW9kZWxzLCBoLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RWTSA9IG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShtb2RlbHMucHJvamVjdENvbnRyaWJ1dGlvbiksXG4gICAgICAgICAgICAgICAgZmlsdGVyVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnLFxuICAgICAgICAgICAgICAgICAgICB3YWl0aW5nX3BheW1lbnQ6ICdlcSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB0b2dnbGVXYWl0aW5nID0gKHdhaXRpbmcgPSBmYWxzZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyVk0ud2FpdGluZ19wYXltZW50KHdhaXRpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZpbHRlclZNLnByb2plY3RfaWQoYXJncy5wcm9qZWN0LmlkKS53YWl0aW5nX3BheW1lbnQoZmFsc2UpO1xuXG4gICAgICAgICAgICBpZiAoIWxpc3RWTS5jb2xsZWN0aW9uKCkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGxpc3RWTTogbGlzdFZNLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNOiBmaWx0ZXJWTSxcbiAgICAgICAgICAgICAgICB0b2dnbGVXYWl0aW5nOiB0b2dnbGVXYWl0aW5nXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGN0cmwubGlzdFZNO1xuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0X2NvbnRyaWJ1dGlvbnMuY29udGVudC53LWNvbC53LWNvbC0xMicsIFtcbiAgICAgICAgICAgICAgICAoYXJncy5wcm9qZWN0LmlzX293bmVyX29yX2FkbWluID9cbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXRbY2hlY2tlZD1cImNoZWNrZWRcIl1baWQ9XCJjb250cmlidXRpb25fc3RhdGVfYXZhaWxhYmxlX3RvX2NvdW50XCJdW25hbWU9XCJ3YWl0aW5nX3BheW1lbnRcIl1bdHlwZT1cInJhZGlvXCJdW3ZhbHVlPVwiYXZhaWxhYmxlX3RvX2NvdW50XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZVdhaXRpbmcoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2xhYmVsW2Zvcj1cImNvbnRyaWJ1dGlvbl9zdGF0ZV9hdmFpbGFibGVfdG9fY291bnRcIl0nLCAnQ29uZmlybWFkb3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dFtpZD1cImNvbnRyaWJ1dGlvbl9zdGF0ZV93YWl0aW5nX2NvbmZpcm1hdGlvblwiXVt0eXBlPVwicmFkaW9cIl1bbmFtZT1cIndhaXRpbmdfcGF5bWVudFwiXVt2YWx1ZT1cIndhaXRpbmdfY29uZmlybWF0aW9uXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZVdhaXRpbmcodHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdsYWJlbFtmb3I9XCJjb250cmlidXRpb25fc3RhdGVfd2FpdGluZ19jb25maXJtYXRpb25cIl0nLCAnUGVuZGVudGVzJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LWNvbnRyaWJ1dGlvbnMnLCBfLm1hcChsaXN0LmNvbGxlY3Rpb24oKSwgKGNvbnRyaWJ1dGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMjAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2FbaHJlZj1cIi91c2Vycy8nICsgY29udHJpYnV0aW9uLnVzZXJfaWQgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnRodW1iLnUtbGVmdC51LXJvdW5kW3N0eWxlPVwiYmFja2dyb3VuZC1pbWFnZTogdXJsKCcgKyAoIV8uaXNFbXB0eShjb250cmlidXRpb24ucHJvZmlsZV9pbWdfdGh1bWJuYWlsKSA/IGNvbnRyaWJ1dGlvbi5wcm9maWxlX2ltZ190aHVtYm5haWwgOiAnL2Fzc2V0cy9jYXRhcnNlX2Jvb3RzdHJhcC91c2VyLmpwZycpICsgJyk7IGJhY2tncm91bmQtc2l6ZTogY29udGFpbjtcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW4tZGFya1tocmVmPVwiL3VzZXJzLycgKyBjb250cmlidXRpb24udXNlcl9pZCArICdcIl0nLCBjb250cmlidXRpb24udXNlcl9uYW1lKSwgKGNvbnRyaWJ1dGlvbi5pc19vd25lcl9vcl9hZG1pbiA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdSJCAnICsgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLnZhbHVlLCAyLCAzKSwgKGNvbnRyaWJ1dGlvbi5hbm9ueW1vdXMgPyBbbS50cnVzdCgnJm5ic3A7LSZuYnNwOycpLCBtKCdzdHJvbmcnLCAnQXBvaWFkb3IgYW7DtG5pbW8nKV0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgaC5tb21lbnRpZnkoY29udHJpYnV0aW9uLmNyZWF0ZWRfYXQsICdERC9NTS9ZWVlZLCBISDptbScpICsgJ2gnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyJywgKGNvbnRyaWJ1dGlvbi50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyA+IDEgPyAnQXBvaW91IGVzdGUgZSBtYWlzIG91dHJvcyAnICsgY29udHJpYnV0aW9uLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcycgOiAnQXBvaW91IHNvbWVudGUgZXN0ZSBwcm9qZXRvIGF0w6kgYWdvcmEnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZGl2aWRlci51LW1hcmdpbmJvdHRvbS0yMCcpXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXB1c2gtNScsIFshbGlzdC5pc0xvYWRpbmcoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAobGlzdC5pc0xhc3RQYWdlKCkgPyAnJyA6IG0oJ2J1dHRvbiNsb2FkLW1vcmUuYnRuLmJ0bi1tZWRpdW0uYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGxpc3QubmV4dFBhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sICdDYXJyZWdhciBtYWlzJykpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGgubG9hZGVyKCksXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIi8qKlxuICogd2luZG93LmMuUHJvamVjdERhc2hib2FyZE1lbnUgY29tcG9uZW50XG4gKiBidWlsZCBkYXNoYm9hcmQgcHJvamVjdCBtZW51IGZvciBwcm9qZWN0IG93bmVyc1xuICogYW5kIGFkbWluLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBtLmNvbXBvbmVudChjLlByb2plY3REYXNoYm9hcmRNZW51LCB7XG4gKiAgICAgcHJvamVjdDogcHJvamVjdERldGFpbCBPYmplY3QsXG4gKiB9KVxuICovXG53aW5kb3cuYy5Qcm9qZWN0RGFzaGJvYXJkTWVudSA9ICgobSwgXywgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF0sXG4gICAgICAgICAgICAgICAgZWRpdExpbmtzVG9nZ2xlID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKSxcbiAgICAgICAgICAgICAgICBib2R5VG9nZ2xlRm9yTmF2ID0gaC50b2dnbGVQcm9wKCdib2R5LXByb2plY3Qgb3BlbicsICdib2R5LXByb2plY3QgY2xvc2VkJyk7XG5cbiAgICAgICAgICAgIGlmICghYXJncy5wcm9qZWN0LmlzX3B1Ymxpc2hlZCkge1xuICAgICAgICAgICAgICAgIGVkaXRMaW5rc1RvZ2dsZS50b2dnbGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBib2R5OiBib2R5LFxuICAgICAgICAgICAgICAgIGVkaXRMaW5rc1RvZ2dsZTogZWRpdExpbmtzVG9nZ2xlLFxuICAgICAgICAgICAgICAgIGJvZHlUb2dnbGVGb3JOYXY6IGJvZHlUb2dnbGVGb3JOYXZcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgcHJvamVjdFJvdXRlID0gJy9wcm9qZWN0cy8nICsgcHJvamVjdC5pZCxcbiAgICAgICAgICAgICAgICAgIGVkaXRSb3V0ZSA9IHByb2plY3RSb3V0ZSArICcvZWRpdCcsXG4gICAgICAgICAgICAgICAgICBlZGl0TGlua0NsYXNzID0gJ2Rhc2hib2FyZC1uYXYtbGluay1sZWZ0ICcgKyAocHJvamVjdC5pc19wdWJsaXNoZWQgPyAnaW5kZW50JyA6ICcnKTtcbiAgICAgICAgICAgIGxldCBvcHRpb25hbE9wdCA9IChwcm9qZWN0Lm1vZGUgPT09ICdmbGV4JyA/IG0oJ3NwYW4uZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICcgKG9wY2lvbmFsKScpIDogJycpO1xuXG4gICAgICAgICAgICBjdHJsLmJvZHkuY2xhc3NOYW1lID0gY3RybC5ib2R5VG9nZ2xlRm9yTmF2KCk7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1uYXYnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnByb2plY3QtbmF2LXdyYXBwZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ25hdi53LXNlY3Rpb24uZGFzaGJvYXJkLW5hdi5zaWRlJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcHJldmlld19saW5rLnctaW5saW5lLWJsb2NrLmRhc2hib2FyZC1wcm9qZWN0LW5hbWVbaHJlZj1cIicgKyAocHJvamVjdC5pc19wdWJsaXNoZWQgPyAnLycgKyBwcm9qZWN0LnBlcm1hbGluayA6IGVkaXRSb3V0ZSArICcjcHJldmlldycpICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWItcHJvamVjdC1kYXNoYm9hcmRbc3JjPVwiJyArIChfLmlzTnVsbChwcm9qZWN0LmxhcmdlX2ltYWdlKSA/ICcvYXNzZXRzL3RodW1iLXByb2plY3QucG5nJyA6IHByb2plY3QubGFyZ2VfaW1hZ2UpICsgJ1wiXVt3aWR0aD1cIjExNFwiXScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3ItbmVnYXRpdmUubGluZWhlaWdodC10aWdodC5mb250c2l6ZS1zbWFsbCcsIHByb2plY3QubmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgaW1nLnUtbWFyZ2ludG9wLTEwW3NyYz1cIi9hc3NldHMvY2F0YXJzZV9ib290c3RyYXAvYmFkZ2UtJHtwcm9qZWN0Lm1vZGV9LWgucG5nXCJdW3dpZHRoPTgwXWApXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnI2luZm8tbGlua3MnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfaG9tZV9saW5rW2NsYXNzPVwiZGFzaGJvYXJkLW5hdi1saW5rLWxlZnQgJyArIChoLmxvY2F0aW9uQWN0aW9uTWF0Y2goJ2luc2lnaHRzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiJyArIHByb2plY3RSb3V0ZSArICcvaW5zaWdodHNcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtYmFyLWNoYXJ0LmZhLWxnLmZhLWZ3JyksICcgTWluaGEgQ2FtcGFuaGEnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcmVwb3J0c19saW5rLmRhc2hib2FyZC1uYXYtbGluay1sZWZ0W2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNyZXBvcnRzJyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLmZhLXRhYmxlLmZhLWxnLmZhLWZ3JyksICcgUmVsYXTDs3Jpb3MgZGUgYXBvaW9zJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcmVwb3J0c19saW5rLmRhc2hib2FyZC1uYXYtbGluay1sZWZ0LnUtbWFyZ2luYm90dG9tLTMwW2hyZWY9XCInICsgZWRpdFJvdXRlICsgJyNwb3N0cycgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mYS5mYS1idWxsaG9ybi5mYS1mdy5mYS1sZycpLCAnIE5vdmlkYWRlcyAnLCBtKCdzcGFuLmJhZGdlJywgcHJvamVjdC5wb3N0c19jb3VudClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5lZGl0LXByb2plY3QtZGl2JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICghcHJvamVjdC5pc19wdWJsaXNoZWQgPyAnJyA6IG0oJ2J1dHRvbiN0b2dnbGUtZWRpdC1tZW51LmRhc2hib2FyZC1uYXYtbGluay1sZWZ0Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmVkaXRMaW5rc1RvZ2dsZS50b2dnbGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtcGVuY2lsLmZhLWZ3LmZhLWxnJyksICcgRWRpdGFyIHByb2pldG8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkpLCAoY3RybC5lZGl0TGlua3NUb2dnbGUoKSA/IG0oJyNlZGl0LW1lbnUtaXRlbXMnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJyNkYXNoYm9hcmQtbGlua3MnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKCFwcm9qZWN0LmlzX3B1Ymxpc2hlZCB8fCBwcm9qZWN0LmlzX2FkbWluX3JvbGUpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjYmFzaWNzX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI2Jhc2ljcycgKyAnXCJdJywgJ0LDoXNpY28nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2dvYWxfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjZ29hbCcgKyAnXCJdJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwcm9qZWN0Lm1vZGUgPT09ICdhb24nID8gJ01ldGEgZSBwcmF6bycgOiAnRmluYW5jaWFtZW50bycpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2Rlc2NyaXB0aW9uX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI2Rlc2NyaXB0aW9uJyArICdcIl0nLCAnRGVzY3Jpw6fDo28nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjdmlkZW9fbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjdmlkZW8nICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnVsOtZGVvJywgb3B0aW9uYWxPcHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNidWRnZXRfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjYnVkZ2V0JyArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ09yw6dhbWVudG8nLCBvcHRpb25hbE9wdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhI2NhcmRfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjY2FyZCcgKyAnXCJdJywgJ0NhcmQgZG8gcHJvamV0bycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYSNkYXNoYm9hcmRfcmV3YXJkX2xpbmtbY2xhc3M9XCInICsgZWRpdExpbmtDbGFzcyArICdcIl1baHJlZj1cIicgKyBlZGl0Um91dGUgKyAnI3Jld2FyZCcgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdSZWNvbXBlbnNhcycsIG9wdGlvbmFsT3B0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3VzZXJfYWJvdXRfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjdXNlcl9hYm91dCcgKyAnXCJdJywgJ1NvYnJlIHZvY8OqJyksICgocHJvamVjdC5pc19wdWJsaXNoZWQgfHwgcHJvamVjdC5zdGF0ZSA9PT0gJ2FwcHJvdmVkJykgfHwgcHJvamVjdC5pc19hZG1pbl9yb2xlID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3VzZXJfc2V0dGluZ3NfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjdXNlcl9zZXR0aW5ncycgKyAnXCJdJywgJ0NvbnRhJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpLCAoIXByb2plY3QuaXNfcHVibGlzaGVkID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EjZGFzaGJvYXJkX3ByZXZpZXdfbGlua1tjbGFzcz1cIicgKyBlZGl0TGlua0NsYXNzICsgJ1wiXVtocmVmPVwiJyArIGVkaXRSb3V0ZSArICcjcHJldmlldycgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWZ3LmZhLWV5ZS5mYS1sZycpLCAnIFByZXZpZXcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFwcm9qZWN0LmlzX3B1Ymxpc2hlZCA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmJ0bi1zZW5kLWRyYWZ0LWZpeGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5tb2RlID09PSAnYW9uJyA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHByb2plY3Quc3RhdGUgPT09ICdkcmFmdCcgPyBtKCdhLmJ0bi5idG4tbWVkaXVtW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL3NlbmRfdG9fYW5hbHlzaXNcIl0nLCAnRW52aWFyJykgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwcm9qZWN0LnN0YXRlID09PSAnYXBwcm92ZWQnID8gbSgnYS5idG4uYnRuLW1lZGl1bVtocmVmPVwiL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkICsgJy9wdWJsaXNoXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1B1YmxpY2FyJywgbS50cnVzdCgnJm5ic3A7Jm5ic3A7JyksIG0oJ3NwYW4uZmEuZmEtY2hldnJvbi1yaWdodCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHByb2plY3Quc3RhdGUgPT09ICdkcmFmdCcgPyBtKCdhLmJ0bi5idG4tbWVkaXVtW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL2VkaXQjcHJldmlld1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQdWJsaWNhcicsIG0udHJ1c3QoJyZuYnNwOyZuYnNwOycpLCBtKCdzcGFuLmZhLmZhLWNoZXZyb24tcmlnaHQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHByb2plY3QubW9kZSA9PT0gJ2ZsZXgnID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmJ0bi1zZW5kLWRyYWZ0LWZpeGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKF8uaXNOdWxsKHByb2plY3QuZXhwaXJlc19hdCkgPyBtKCdhLnctYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXNlY29uZGFyeS1kYXJrW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL2VkaXQjYW5ub3VuY2VfZXhwaXJhdGlvblwiXScsICdJbmljaWFyIHJldGEgZmluYWwnKSA6ICcnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnYS5idG4tZGFzaGJvYXJkIGhyZWY9XCJqczp2b2lkKDApO1wiJywge1xuICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLmJvZHlUb2dnbGVGb3JOYXYudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWJhcnMuZmEtbGcnKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMuaCkpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0RGF0YUNoYXJ0IGNvbXBvbmVudFxuICogQSBncmFwaCBidWlsZGVyIGludGVyZmFjZSB0byBiZSB1c2VkIG9uIHByb2plY3QgcmVsYXRlZCBkYXNoYm9hcmRzLlxuICogRXhhbXBsZTpcbiAqIG0uY29tcG9uZW50KGMuUHJvamVjdERhdGFDaGFydCwge1xuICogICAgIGNvbGxlY3Rpb246IGN0cmwuY29udHJpYnV0aW9uc1BlckRheSxcbiAqICAgICBsYWJlbDogJ1IkIGFycmVjYWRhZG9zIHBvciBkaWEnLFxuICogICAgIGRhdGFLZXk6ICd0b3RhbF9hbW91bnQnXG4gKiB9KVxuICovXG53aW5kb3cuYy5Qcm9qZWN0RGF0YUNoYXJ0ID0gKChtLCBDaGFydCwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXNvdXJjZSA9IF8uZmlyc3QoYXJncy5jb2xsZWN0aW9uKCkpLFxuICAgICAgICAgICAgICAgICAgc291cmNlID0gKCFfLmlzVW5kZWZpbmVkKHJlc291cmNlKSA/IHJlc291cmNlLnNvdXJjZSA6IFtdKSxcblxuICAgICAgICAgICAgICAgIG1vdW50RGF0YXNldCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMC4yKScsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwb2ludENvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50U3Ryb2tlQ29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0RmlsbDogJyNmZmYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRTdHJva2U6ICdyZ2JhKDIyMCwyMjAsMjIwLDEpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IF8ubWFwKHNvdXJjZSwgKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbVthcmdzLmRhdGFLZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfV07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByZW5kZXJDaGFydCA9IChlbGVtZW50LCBpc0luaXRpYWxpemVkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY3R4ID0gZWxlbWVudC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgQ2hhcnQoY3R4KS5MaW5lKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbHM6IF8ubWFwKHNvdXJjZSwgKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFyZ3MueEF4aXMoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YXNldHM6IG1vdW50RGF0YXNldCgpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByZW5kZXJDaGFydDogcmVuZGVyQ2hhcnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLmNhcmQudS1yYWRpdXMubWVkaXVtLnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCBhcmdzLmxhYmVsKSxcbiAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi5vdmVyZmxvdy1hdXRvJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnY2FudmFzW2lkPVwiY2hhcnRcIl1bd2lkdGg9XCI4NjBcIl1baGVpZ2h0PVwiMzAwXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZzogY3RybC5yZW5kZXJDaGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5DaGFydCwgd2luZG93Ll8pKTtcbiIsIi8qKlxuICogd2luZG93LmMuUHJvamVjdERhdGFUYWJsZSBjb21wb25lbnRcbiAqIEEgdGFibGUgaW50ZXJmYWNlIGNvbnN0cnVjdG9yIHRoYXQgc2hvdWxkIGJlIHVzZWQgb24gcHJvamVjdCByZWxhdGVkIGRhc2hib2FyZHMuXG4gKiBJdCB0YWtlcyBhbiBhcnJheSBhbmQgYSBsYWJsZSBhcyBpdCdzIHNvdXJjZXMuXG4gKiBUaGUgZmlyc3QgaXRlbSBpbiB0aGUgYXJyYXkgaXMgdGhlIGhlYWRlciBkZXNjcmlwdG9yIGFuZCB0aGUgcmVzdCBvZiB0aGVtIGFyZSByb3cgZGF0YS5cbiAqIFJvd3MgbWF5IHJldHVybiBhIHN0cmluZyBvciBhbiBhcnJheSBhbmQgdGhpcyB2YWx1ZSB3aWxsIGJlIHVzZWQgYXMgYSByb3cgb3V0cHV0LlxuICogQWxsIHRhYmxlIHJvd3MgYXJlIHNvcnRhYmxlIGJ5IGRlZmF1bHQuIElmIHlvdSB3YW50IHRvIHVzZSBhIGN1c3RvbSB2YWx1ZSBhcyBzb3J0IHBhcmFtZXRlclxuICogeW91IG1heSBzZXQgYSAyRCBhcnJheSBhcyByb3cuIEluIHRoaXMgY2FzZSwgdGhlIGZpcnN0IGFycmF5IHZhbHVlIHdpbGwgYmUgdGhlIGN1c3RvbSB2YWx1ZVxuICogd2hpbGUgdGhlIG90aGVyIHdpbGwgYmUgdGhlIGFjdHVhbCBvdXRwdXQuXG4gKiBFeGFtcGxlOlxuICogbS5jb21wb25lbnQoYy5Qcm9qZWN0RGF0YVRhYmxlLCB7XG4gKiAgICAgIGxhYmVsOiAnVGFibGUgbGFiZWwnLFxuICogICAgICB0YWJsZTogW1xuICogICAgICAgICAgWydjb2wgaGVhZGVyIDEnLCAnY29sIGhlYWRlciAyJ10sXG4gKiAgICAgICAgICBbJ3ZhbHVlIDF4MScsIFszLCAndmFsdWUgMXgyJ11dLFxuICogICAgICAgICAgWyd2YWx1ZSAyeDEnLCBbMSwgJ3ZhbHVlIDJ4MiddXSAvL1dlIGFyZSB1c2luZyBhIGN1c3RvbSBjb21wYXJhdG9yIHR3byBjb2wgMiB2YWx1ZXNcbiAqICAgICAgXSxcbiAqICAgICAgLy9BbGxvd3MgeW91IHRvIHNldCBhIHNwZWNpZmljIGNvbHVtbiB0byBiZSBvcmRlcmVkIGJ5IGRlZmF1bHQuXG4gKiAgICAgIC8vSWYgbm8gdmFsdWUgaXMgc2V0LCB0aGUgZmlyc3Qgcm93IHdpbGwgYmUgdGhlIGRlZmF1bHQgb25lIHRvIGJlIG9yZGVyZWQuXG4gKiAgICAgIC8vTmVnYXRpdmUgdmFsdWVzIG1lYW4gdGhhdCB0aGUgb3JkZXIgc2hvdWxkIGJlIHJldmVydGVkXG4gKiAgICAgIGRlZmF1bHRTb3J0SW5kZXg6IC0zXG4gKiAgfSlcbiAqL1xud2luZG93LmMuUHJvamVjdERhdGFUYWJsZSA9ICgobSwgbW9kZWxzLCBoLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCB0YWJsZSA9IG0ucHJvcChhcmdzLnRhYmxlKSxcbiAgICAgICAgICAgICAgICBzb3J0SW5kZXggPSBtLnByb3AoLTEpO1xuXG4gICAgICAgICAgICBjb25zdCBjb21wYXJhdG9yID0gKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgaWR4ID0gc29ydEluZGV4KCksXG4gICAgICAgICAgICAgICAgICAgIC8vQ2hlY2sgaWYgYSBjdXN0b20gY29tcGFyYXRvciBpcyB1c2VkID0+IFJlYWQgY29tcG9uZW50IGRlc2NyaXB0aW9uXG4gICAgICAgICAgICAgICAgICAgIHggPSAoXy5pc0FycmF5KGFbaWR4XSkgJiYgYVtpZHhdLmxlbmd0aCA+IDEpID8gYVtpZHhdWzBdIDogYVtpZHhdLFxuICAgICAgICAgICAgICAgICAgICB5ID0gKF8uaXNBcnJheShiW2lkeF0pICYmIGJbaWR4XS5sZW5ndGggPiAxKSA/IGJbaWR4XVswXSA6IGJbaWR4XTtcblxuICAgICAgICAgICAgICAgIGlmICh4IDwgeSl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHkgPCB4KXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3Qgc29ydFRhYmxlID0gKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBoZWFkZXIgPSBfLmZpcnN0KHRhYmxlKCkpLFxuICAgICAgICAgICAgICAgICAgICBib2R5O1xuICAgICAgICAgICAgICAgIGlmIChzb3J0SW5kZXgoKSA9PT0gaWR4KXtcbiAgICAgICAgICAgICAgICAgICAgYm9keSA9IF8ucmVzdCh0YWJsZSgpKS5yZXZlcnNlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc29ydEluZGV4KGlkeCk7XG4gICAgICAgICAgICAgICAgICAgIGJvZHkgPSBfLnJlc3QodGFibGUoKSkuc29ydChjb21wYXJhdG9yKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0YWJsZShfLnVuaW9uKFtoZWFkZXJdLGJvZHkpKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNvcnRUYWJsZShNYXRoLmFicyhhcmdzLmRlZmF1bHRTb3J0SW5kZXgpIHx8IDApO1xuXG4gICAgICAgICAgICBpZiAoYXJncy5kZWZhdWx0U29ydEluZGV4IDwgMCl7XG4gICAgICAgICAgICAgICAgc29ydFRhYmxlKE1hdGguYWJzKGFyZ3MuZGVmYXVsdFNvcnRJbmRleCkgfHwgMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGFibGU6IHRhYmxlLFxuICAgICAgICAgICAgICAgIHNvcnRUYWJsZTogc29ydFRhYmxlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IGhlYWRlciA9IF8uZmlyc3QoY3RybC50YWJsZSgpKSxcbiAgICAgICAgICAgICAgICBib2R5ID0gXy5yZXN0KGN0cmwudGFibGUoKSk7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnRhYmxlLW91dGVyLnUtbWFyZ2luYm90dG9tLTYwJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LXJvdy50YWJsZS1yb3cuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmhlYWRlcicsXG4gICAgICAgICAgICAgICAgICAgIF8ubWFwKGhlYWRlciwgKGhlYWRpbmcsIGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNvcnQgPSAoKSA9PiBjdHJsLnNvcnRUYWJsZShpZHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnRhYmxlLWNvbCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBzb3J0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtoZWFkaW5nfSBgLCBtKCdzcGFuLmZhLmZhLXNvcnQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICApLCBtKCcudGFibGUtaW5uZXIuZm9udHNpemUtc21hbGwnLFxuICAgICAgICAgICAgICAgICAgICBfLm1hcChib2R5LCAocm93RGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy50YWJsZS1yb3cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKHJvd0RhdGEsIChyb3cpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9DaGVjayBpZiBhIGN1c3RvbSBjb21wYXJhdG9yIGlzIHVzZWQgPT4gUmVhZCBjb21wb25lbnQgZGVzY3JpcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93ID0gKF8uaXNBcnJheShyb3cpICYmIHJvdy5sZW5ndGggPiAxKSA/IHJvd1sxXSA6IHJvdztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00LnRhYmxlLWNvbCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2RpdicsIHJvdylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdEhlYWRlciA9IChmdW5jdGlvbihtLCBjKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgICAgICAgdmFyIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3QtaGVhZGVyJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1wcm9kdWN0LicgKyBwcm9qZWN0Lm1vZGUpLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24ucGFnZS1oZWFkZXIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaDEuZm9udHNpemUtbGFyZ2VyLmZvbnR3ZWlnaHQtc2VtaWJvbGQucHJvamVjdC1uYW1lW2l0ZW1wcm9wPVwibmFtZVwiXScsIHByb2plY3QubmFtZSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdoMi5mb250c2l6ZS1iYXNlLmxpbmVoZWlnaHQtbG9vc2VyW2l0ZW1wcm9wPVwiYXV0aG9yXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdwb3IgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0LnVzZXIubmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBtKCcudy1zZWN0aW9uLnByb2plY3QtbWFpbicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93LnByb2plY3QtbWFpbicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC5wcm9qZWN0LWhpZ2hsaWdodCcsIG0uY29tcG9uZW50KGMuUHJvamVjdEhpZ2hsaWdodCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgbS5jb21wb25lbnQoYy5Qcm9qZWN0U2lkZWJhciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyRGV0YWlsczogYXJncy51c2VyRGV0YWlsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLlByb2plY3RIaWdobGlnaHQgPSAoKG0sIF8sIGgsIGMpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICB2YXIgZGlzcGxheVNoYXJlQm94ID0gaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5U2hhcmVCb3g6IGRpc3BsYXlTaGFyZUJveFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0O1xuICAgICAgICAgICAgcmV0dXJuIG0oJyNwcm9qZWN0LWhpZ2hsaWdodCcsIFtcbiAgICAgICAgICAgICAgICAocHJvamVjdC52aWRlb19lbWJlZF91cmwgPyBtKCcudy1lbWJlZC53LXZpZGVvLnByb2plY3QtdmlkZW8nLCB7XG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnbWluLWhlaWdodDogMjQwcHg7J1xuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaWZyYW1lLmVtYmVkbHktZW1iZWRbaXRlbXByb3A9XCJ2aWRlb1wiXVtzcmM9XCInICsgcHJvamVjdC52aWRlb19lbWJlZF91cmwgKyAnXCJdW2ZyYW1lYm9yZGVyPVwiMFwiXVthbGxvd0Z1bGxTY3JlZW5dJylcbiAgICAgICAgICAgICAgICBdKSA6IG0oJy5wcm9qZWN0LWltYWdlJywge1xuICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2JhY2tncm91bmQtaW1hZ2U6dXJsKCcgKyBwcm9qZWN0Lm9yaWdpbmFsX2ltYWdlICsgJyk7J1xuICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1ibHVyYicsIHByb2plY3QuaGVhZGxpbmUpLFxuICAgICAgICAgICAgICAgIG0oJy51LXRleHQtY2VudGVyLXNtYWxsLW9ubHkudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgICAgICghXy5pc051bGwocHJvamVjdC5hZGRyZXNzKSA/XG4gICAgICAgICAgICAgICAgICAgICBtKGBhLmJ0bi5idG4taW5saW5lLmJ0bi1zbWFsbC5idG4tdHJhbnNwYXJlbnQubGluay1oaWRkZW4tbGlnaHQudS1tYXJnaW5ib3R0b20tMTBbaHJlZj1cIi9wdC9leHBsb3JlP3BnX3NlYXJjaD0ke3Byb2plY3QuYWRkcmVzcy5zdGF0ZV9hY3JvbnltfVwiXWAsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLW1hcC1tYXJrZXInKSwgYCAke3Byb2plY3QuYWRkcmVzcy5jaXR5fSwgJHtwcm9qZWN0LmFkZHJlc3Muc3RhdGVfYWNyb255bX1gXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgIG0oYGEuYnRuLmJ0bi1pbmxpbmUuYnRuLXNtYWxsLmJ0bi10cmFuc3BhcmVudC5saW5rLWhpZGRlbi1saWdodFtocmVmPVwiL3B0L2V4cGxvcmUjYnlfY2F0ZWdvcnlfaWQvJHtwcm9qZWN0LmNhdGVnb3J5X2lkfVwiXWAsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtdGFnJyksICcgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuY2F0ZWdvcnlfbmFtZVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnYnV0dG9uI3NoYXJlLWJveC5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeS5idG4taW5saW5lJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5kaXNwbGF5U2hhcmVCb3gudG9nZ2xlXG4gICAgICAgICAgICAgICAgICAgIH0sICdDb21wYXJ0aWxoYXInKSwgKGN0cmwuZGlzcGxheVNoYXJlQm94KCkgPyBtLmNvbXBvbmVudChjLlByb2plY3RTaGFyZUJveCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlTaGFyZUJveDogY3RybC5kaXNwbGF5U2hhcmVCb3hcbiAgICAgICAgICAgICAgICAgICAgfSkgOiAnJylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0TWFpbiA9ICgobSwgYywgXywgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIGRpc3BsYXlUYWJDb250ZW50ID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2gsXG4gICAgICAgICAgICAgICAgICAgICAgICBjX29wdHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogcHJvamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhYnMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNyZXdhcmRzJzogbSgnLnctY29sLnctY29sLTEyJywgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmV3YXJkTGlzdCwgXy5leHRlbmQoe30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogYXJncy5yZXdhcmREZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgY19vcHRzKSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjY29udHJpYnV0aW9uX3N1Z2dlc3Rpb25zJzogbS5jb21wb25lbnQoYy5Qcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucywgY19vcHRzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnI2NvbnRyaWJ1dGlvbnMnOiBtLmNvbXBvbmVudChjLlByb2plY3RDb250cmlidXRpb25zLCBjX29wdHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjYWJvdXQnOiBtLmNvbXBvbmVudChjLlByb2plY3RBYm91dCwgXy5leHRlbmQoe30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV3YXJkRGV0YWlsczogYXJncy5yZXdhcmREZXRhaWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgY19vcHRzKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyNjb21tZW50cyc6IG0uY29tcG9uZW50KGMuUHJvamVjdENvbW1lbnRzLCBjX29wdHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcjcG9zdHMnOiBtLmNvbXBvbmVudChjLlByb2plY3RQb3N0cywgY19vcHRzKVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc0VtcHR5KGhhc2gpIHx8IGhhc2ggPT09ICcjXz1fJyB8fCBoYXNoID09PSAnI3ByZXZpZXcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFic1snI2Fib3V0J107XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFic1toYXNoXTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIG0ucmVkcmF3LCBmYWxzZSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZGlzcGxheVRhYkNvbnRlbnQ6IGRpc3BsYXlUYWJDb250ZW50XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbSgnc2VjdGlvbi5zZWN0aW9uW2l0ZW10eXBlPVwiaHR0cDovL3NjaGVtYS5vcmcvQ3JlYXRpdmVXb3JrXCJdJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgY3RybC5kaXNwbGF5VGFiQ29udGVudCgpKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIi8qKlxuICogd2luZG93LmMuUHJvamVjdE1vZGUgY29tcG9uZW50XG4gKiBBIHNpbXBsZSBjb21wb25lbnQgdGhhdCBkaXNwbGF5cyBhIGJhZGdlIHdpdGggdGhlIGN1cnJlbnQgcHJvamVjdCBtb2RlXG4gKiB0b2dldGhlciB3aXRoIGEgZGVzY3JpcHRpb24gb2YgdGhlIG1vZGUsIHNob3duIGluc2lkZSBhIHRvb2x0aXAuXG4gKiBJdCByZWNlaXZlcyBhIHByb2plY3QgYXMgcmVzb3VyY2VcbiAqXG4gKiBFeGFtcGxlOlxuICogIHZpZXc6IHtcbiAqICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuUHJvamVjdE1vZGUsIHtwcm9qZWN0OiBwcm9qZWN0fSlcbiAqICB9XG4gKi9cbndpbmRvdy5jLlByb2plY3RNb2RlID0gKChtLCBjLCBoLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgbW9kZSA9IHByb2plY3QubW9kZSxcbiAgICAgICAgICAgICAgICB0b29sdGlwVGV4dCA9IChtb2RlID09PSAnYW9uJykgPyBgU29tZW50ZSByZWNlYmVyw6Egb3MgcmVjdXJzb3Mgc2UgYXRpbmdpciBvdSB1bHRyYXBhc3NhciBhIG1ldGEgYXTDqSBvIGRpYSAke2gubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0LCAnREQvTU0vWVlZWScpfS5gIDogJ08gcmVhbGl6YWRvciByZWNlYmVyw6EgdG9kb3Mgb3MgcmVjdXJzb3MgcXVhbmRvIGVuY2VycmFyIGEgY2FtcGFuaGEsIG1lc21vIHF1ZSBuw6NvIHRlbmhhIGF0aW5naWRvIGVzdGEgbWV0YS4nO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1vZGU6IG1vZGUsXG4gICAgICAgICAgICAgICAgdG9vbHRpcFRleHQ6IHRvb2x0aXBUZXh0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IG1vZGUgPSBjdHJsLm1vZGUsXG4gICAgICAgICAgICAgICAgbW9kZUltZ1NyYyA9IChtb2RlID09PSAnYW9uJykgPyAnL2Fzc2V0cy9hb24tYmFkZ2UucG5nJyA6ICcvYXNzZXRzL2ZsZXgtYmFkZ2UucG5nJyxcbiAgICAgICAgICAgICAgICBtb2RlVGl0bGUgPSAobW9kZSA9PT0gJ2FvbicpID8gJ0NhbXBhbmhhIFR1ZG8tb3UtbmFkYSAnIDogJ0NhbXBhbmhhIEZsZXjDrXZlbCAnLFxuICAgICAgICAgICAgICAgIGdvYWwgPSAoXy5pc051bGwoYXJncy5wcm9qZWN0LmdvYWwpID8gJ27Do28gZGVmaW5pZGEnIDogaC5mb3JtYXROdW1iZXIoYXJncy5wcm9qZWN0LmdvYWwpKSxcbiAgICAgICAgICAgICAgICB0b29sdGlwID0gKGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlRvb2x0aXAsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsOiBlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IGN0cmwudG9vbHRpcFRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogMjgwXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBtKGAjJHttb2RlfS53LXJvd2AsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC0yLnctY29sLXRpbnktMicsIFtcbiAgICAgICAgICAgICAgICAgICAgbShgaW1nW3NyYz1cIiR7bW9kZUltZ1NyY31cIl1bd2lkdGg9JzMwJ11gKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMC53LWNvbC1zbWFsbC0xMC53LWNvbC10aW55LTEwJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgJ01ldGEgUiQgJyArIGdvYWwpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1pbmxpbmUtYmxvY2suZm9udHNpemUtc21hbGxlc3QuX3ctaW5saW5lLWJsb2NrJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9kZVRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcCgnc3Bhbi53LWlubGluZS1ibG9jay50b29sdGlwLXdyYXBwZXIuZmEuZmEtcXVlc3Rpb24tY2lyY2xlLmZvbnRjb2xvci1zZWNvbmRhcnknKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlByb2plY3RQb3N0cyA9ICgobSwgbW9kZWxzLCBoLCBfKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogKGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpc3RWTSA9IG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShtb2RlbHMucHJvamVjdFBvc3REZXRhaWwpLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtcbiAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogJ2VxJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmaWx0ZXJWTS5wcm9qZWN0X2lkKGFyZ3MucHJvamVjdC5pZCk7XG5cbiAgICAgICAgICAgIGlmICghbGlzdFZNLmNvbGxlY3Rpb24oKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbGlzdFZNOiBsaXN0Vk0sXG4gICAgICAgICAgICAgICAgZmlsdGVyVk06IGZpbHRlclZNXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgbGlzdCA9IGN0cmwubGlzdFZNLFxuICAgICAgICAgICAgICAgIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG5cbiAgICAgICAgICAgIHJldHVybiBtKCcucHJvamVjdC1wb3N0cy53LXNlY3Rpb24nLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyLnUtbWFyZ2ludG9wLTIwJywgW1xuICAgICAgICAgICAgICAgICAgICAocHJvamVjdC5pc19vd25lcl9vcl9hZG1pbiA/IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICghbGlzdC5pc0xvYWRpbmcoKSkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgKF8uaXNFbXB0eShsaXN0LmNvbGxlY3Rpb24oKSkgPyBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS0zMC51LW1hcmdpbnRvcC0yMCcsICdUb2RhIG5vdmlkYWRlIHB1YmxpY2FkYSBubyBDYXRhcnNlIMOpIGVudmlhZGEgZGlyZXRhbWVudGUgcGFyYSBvIGVtYWlsIGRlIHF1ZW0gasOhIGFwb2lvdSBzZXUgcHJvamV0byBlIHRhbWLDqW0gZmljYSBkaXNwb27DrXZlbCBwYXJhIHZpc3VhbGl6YcOnw6NvIG5vIHNpdGUuIFZvY8OqIHBvZGUgb3B0YXIgcG9yIGRlaXjDoS1sYSBww7pibGljYSwgb3Ugdmlzw612ZWwgc29tZW50ZSBwYXJhIHNldXMgYXBvaWFkb3JlcyBhcXVpIG5lc3RhIGFiYS4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJykgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKGBhLmJ0bi5idG4tZWRpdC5idG4tc21hbGxbaHJlZj0nL3B0L3Byb2plY3RzLyR7cHJvamVjdC5pZH0vZWRpdCNwb3N0cyddYCwgJ0VzY3JldmVyIG5vdmlkYWRlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSA6ICcnKSwgKF8ubWFwKGxpc3QuY29sbGVjdGlvbigpLCAocG9zdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnBvc3QnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudS1tYXJnaW5ib3R0b20tNjAgLnctY2xlYXJmaXgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnRjb2xvci1zZWNvbmRhcnkudS10ZXh0LWNlbnRlcicsIGgubW9tZW50aWZ5KHBvc3QuY3JlYXRlZF9hdCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlci51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTMwJywgcG9zdC50aXRsZSksICghXy5pc0VtcHR5KHBvc3QuY29tbWVudF9odG1sKSA/IG0oJy5mb250c2l6ZS1iYXNlJywgbS50cnVzdChwb3N0LmNvbW1lbnRfaHRtbCkpIDogbSgnLmZvbnRzaXplLWJhc2UnLCAnUG9zdCBleGNsdXNpdm8gcGFyYSBhcG9pYWRvcmVzLicpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZGl2aWRlci51LW1hcmdpbmJvdHRvbS02MCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgIH0pKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtcHVzaC01JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICghbGlzdC5pc0xvYWRpbmcoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChsaXN0LmlzTGFzdFBhZ2UoKSA/ICcnIDogbSgnYnV0dG9uI2xvYWQtbW9yZS5idG4uYnRuLW1lZGl1bS5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBsaXN0Lm5leHRQYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdDYXJyZWdhciBtYWlzJykpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaC5sb2FkZXIoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdFJlbWluZGVyQ291bnQgPSAoZnVuY3Rpb24obSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5yZXNvdXJjZTtcbiAgICAgICAgICAgIHJldHVybiBtKCcjcHJvamVjdC1yZW1pbmRlci1jb3VudC5jYXJkLnUtcmFkaXVzLnUtdGV4dC1jZW50ZXIubWVkaXVtLnUtbWFyZ2luYm90dG9tLTgwJywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1RvdGFsIGRlIHBlc3NvYXMgcXVlIGNsaWNhcmFtIG5vIGJvdMOjbyBMZW1icmFyLW1lJyksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS1tYXJnaW5ib3R0b20tMzAnLCAnVW0gbGVtYnJldGUgcG9yIGVtYWlsIMOpIGVudmlhZG8gNDggaG9yYXMgYW50ZXMgZG8gdMOpcm1pbm8gZGEgc3VhIGNhbXBhbmhhJyksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWp1bWJvJywgcHJvamVjdC5yZW1pbmRlcl9jb3VudClcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0pKTtcbiIsIi8qKlxuICogd2luZG93LmMuUHJvamVjdFJlbWluZGVyIGNvbXBvbmVudFxuICogQSBjb21wb25lbnQgdGhhdCBkaXNwbGF5cyBhIGNsaWNrYWJsZSBwcm9qZWN0IHJlbWluZGVyIGVsZW1lbnQuXG4gKiBUaGUgY29tcG9uZW50IGNhbiBiZSBvZiB0d28gdHlwZXM6IGEgJ2xpbmsnIG9yIGEgJ2J1dHRvbidcbiAqXG4gKiBFeGFtcGxlOlxuICogIHZpZXc6IHtcbiAqICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuUHJvamVjdFJlbWluZGVyLCB7cHJvamVjdDogcHJvamVjdCwgdHlwZTogJ2J1dHRvbid9KVxuICogIH1cbiAqL1xud2luZG93LmMuUHJvamVjdFJlbWluZGVyID0gKChtLCBtb2RlbHMsIGgsIGMpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHByb2plY3QgPSBhcmdzLnByb2plY3QsXG4gICAgICAgICAgICAgICAgZmlsdGVyVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe1xuICAgICAgICAgICAgICAgICAgICBwcm9qZWN0X2lkOiAnZXEnXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgc3RvcmVSZW1pbmRlck5hbWUgPSAncmVtaW5kXycgKyBwcm9qZWN0LmlkLFxuICAgICAgICAgICAgICAgIGwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgICAgICAgIHBvcE5vdGlmaWNhdGlvbiA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgc3VibWl0UmVtaW5kZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaC5nZXRVc2VyKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGguc3RvcmVBY3Rpb24oc3RvcmVSZW1pbmRlck5hbWUsIHN1Ym1pdFJlbWluZGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoLm5hdmlnYXRlVG9EZXZpc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsZXQgbG9hZGVyT3B0cyA9IHByb2plY3QuaW5fcmVtaW5kZXIgPyBtb2RlbHMucHJvamVjdFJlbWluZGVyLmRlbGV0ZU9wdGlvbnMoZmlsdGVyVk0ucGFyYW1ldGVycygpKSA6IG1vZGVscy5wcm9qZWN0UmVtaW5kZXIucG9zdE9wdGlvbnMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdF9pZDogcHJvamVjdC5pZFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgbCA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihsb2FkZXJPcHRzKTtcblxuICAgICAgICAgICAgICAgICAgICBsLmxvYWQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3QuaW5fcmVtaW5kZXIgPSAhcHJvamVjdC5pbl9yZW1pbmRlcjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2plY3QuaW5fcmVtaW5kZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3BOb3RpZmljYXRpb24odHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcE5vdGlmaWNhdGlvbihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvcE5vdGlmaWNhdGlvbihmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGguY2FsbFN0b3JlZEFjdGlvbihzdG9yZVJlbWluZGVyTmFtZSwgc3VibWl0UmVtaW5kZXIpO1xuICAgICAgICAgICAgZmlsdGVyVk0ucHJvamVjdF9pZChwcm9qZWN0LmlkKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBsOiBsLFxuICAgICAgICAgICAgICAgIHN1Ym1pdFJlbWluZGVyOiBzdWJtaXRSZW1pbmRlcixcbiAgICAgICAgICAgICAgICBwb3BOb3RpZmljYXRpb246IHBvcE5vdGlmaWNhdGlvblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1haW5DbGFzcyA9IChhcmdzLnR5cGUgPT09ICdidXR0b24nKSA/ICcnIDogJy51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTMwJyxcbiAgICAgICAgICAgICAgICBidXR0b25DbGFzcyA9IChhcmdzLnR5cGUgPT09ICdidXR0b24nKSA/ICd3LWJ1dHRvbiBidG4gYnRuLXRlcmNpYXJ5IGJ0bi1uby1ib3JkZXInIDogJ2J0bi1saW5rIGxpbmstaGlkZGVuIGZvbnRzaXplLXNtYWxsJyxcbiAgICAgICAgICAgICAgICBoaWRlVGV4dE9uTW9iaWxlID0gYXJncy5oaWRlVGV4dE9uTW9iaWxlIHx8IGZhbHNlLFxuICAgICAgICAgICAgICAgIHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG5cbiAgICAgICAgICAgIHJldHVybiBtKGAjcHJvamVjdC1yZW1pbmRlciR7bWFpbkNsYXNzfWAsIFtcbiAgICAgICAgICAgICAgICBtKGBidXR0b25bY2xhc3M9XCIke2J1dHRvbkNsYXNzfSAkeyhwcm9qZWN0LmluX3JlbWluZGVyID8gJ2xpbmstaGlkZGVuLXN1Y2Nlc3MnIDogJ2ZvbnRjb2xvci1zZWNvbmRhcnknKX0gZm9udHdlaWdodC1zZW1pYm9sZFwiXWAsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5zdWJtaXRSZW1pbmRlclxuICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgKGN0cmwubCgpID8gJ2FndWFyZGUgLi4uJyA6IG0oJ3NwYW4uZmEuZmEtY2xvY2stbycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oYHNwYW4ke2hpZGVUZXh0T25Nb2JpbGUgPyAnLnctaGlkZGVuLW1lZGl1bScgOiAnJ31gLCBwcm9qZWN0LmluX3JlbWluZGVyID8gJyBMZW1icmV0ZSBhdGl2bycgOiAnIExlbWJyYXItbWUnKVxuICAgICAgICAgICAgICAgICAgICBdKSlcbiAgICAgICAgICAgICAgICBdKSwgKGN0cmwucG9wTm90aWZpY2F0aW9uKCkgPyBtLmNvbXBvbmVudChjLlBvcE5vdGlmaWNhdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnT2shIFZhbW9zIHRlIG1hbmRhciB1bSBsZW1icmV0ZSBwb3IgZS1tYWlsIDQ4IGhvcmFzIGFudGVzIGRvIGZpbSBkYSBjYW1wYW5oYSdcbiAgICAgICAgICAgICAgICB9KSA6ICcnKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuUHJvamVjdFJld2FyZExpc3QgPSAoKG0sIGgsIF8pID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgLy9GSVhNRTogTUlTU0lORyBBREpVU1RTXG4gICAgICAgICAgICAvLyAtIGFkZCBkcmFmdCBhZG1pbiBtb2RpZmljYXRpb25zXG4gICAgICAgICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucHJvamVjdDtcbiAgICAgICAgICAgIHJldHVybiBtKCcjcmV3YXJkcy51LW1hcmdpbmJvdHRvbS0zMCcsIF8ubWFwKGFyZ3MucmV3YXJkRGV0YWlscygpLCAocmV3YXJkKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRyaWJ1dGlvblVybFdpdGhSZXdhcmQgPSAnL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkICsgJy9jb250cmlidXRpb25zL25ldz9yZXdhcmRfaWQ9JyArIHJld2FyZC5pZDtcblxuICAgICAgICAgICAgICAgIHJldHVybiBtKCdhW2NsYXNzPVwiJyArIChoLnJld2FyZFNvdWxkT3V0KHJld2FyZCkgPyAnY2FyZC1nb25lJyA6ICdjYXJkLXJld2FyZCAnICsgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/ICdjbGlja2FibGUnIDogJycpKSArICcgY2FyZCBjYXJkLXNlY29uZGFyeSB1LW1hcmdpbmJvdHRvbS0xMFwiXVtocmVmPVwiJyArIChwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgJiYgIWgucmV3YXJkU291bGRPdXQocmV3YXJkKSA/IGNvbnRyaWJ1dGlvblVybFdpdGhSZXdhcmQgOiAnanM6dm9pZCgwKTsnKSArICdcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCAnUGFyYSBSJCAnICsgaC5mb3JtYXROdW1iZXIocmV3YXJkLm1pbmltdW1fdmFsdWUpICsgJyBvdSBtYWlzJyksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci5mb250d2VpZ2h0LXNlbWlib2xkJywgaC5wbHVyYWxpemUocmV3YXJkLnBhaWRfY291bnQsICcgYXBvaW8nLCAnIGFwb2lvcycpKSwgKHJld2FyZC5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMgPiAwID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChyZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50ID4gMCA/IG0oJy5tYXhpbXVtX2NvbnRyaWJ1dGlvbnMuaW5fdGltZV90b19jb25maXJtLmNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcucGVuZGluZy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgaC5wbHVyYWxpemUocmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCwgJyBhcG9pbyBlbSBwcmF6byBkZSBjb25maXJtYcOnw6NvJywgJyBhcG9pb3MgZW0gcHJhem8gZGUgY29uZmlybWHDp8Ojby4nKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSwgKGgucmV3YXJkU291bGRPdXQocmV3YXJkKSA/IG0oJy51LW1hcmdpbnRvcC0xMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZS5iYWRnZS1nb25lLmZvbnRzaXplLXNtYWxsZXInLCAnRXNnb3RhZGEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogbSgnLnUtbWFyZ2ludG9wLTEwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmJhZGdlLmJhZGdlLWF0dGVudGlvbi5mb250c2l6ZS1zbWFsbGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LWJvbGQnLCAnTGltaXRhZGEnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgKCcgKyBoLnJld2FyZFJlbWFuaW5nKHJld2FyZCkgKyAnIGRlICcgKyByZXdhcmQubWF4aW11bV9jb250cmlidXRpb25zICsgJyBkaXNwb27DrXZlaXMpJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVyLnUtbWFyZ2ludG9wLTIwJywgbS50cnVzdChoLnNpbXBsZUZvcm1hdChyZXdhcmQuZGVzY3JpcHRpb24pKSksICghXy5pc0VtcHR5KHJld2FyZC5kZWxpdmVyX2F0KSA/XG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdiJywgJ0VzdGltYXRpdmEgZGUgRW50cmVnYTogJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaC5tb21lbnRpZnkocmV3YXJkLmRlbGl2ZXJfYXQsICdNTU0vWVlZWScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSwgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyAmJiAhaC5yZXdhcmRTb3VsZE91dChyZXdhcmQpID9cbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5wcm9qZWN0LXJld2FyZC1ib3gtaG92ZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnByb2plY3QtcmV3YXJkLWJveC1zZWxlY3QtdGV4dC51LXRleHQtY2VudGVyJywgJ1NlbGVjaW9uZSBlc3NhIHJlY29tcGVuc2EnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSkgOiAnJylcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuUHJvamVjdFJvdyA9ICgobSwgXywgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb2xsZWN0aW9uID0gYXJncy5jb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgIHJlZiA9IGFyZ3MucmVmLFxuICAgICAgICAgICAgICAgIHdyYXBwZXIgPSBhcmdzLndyYXBwZXIgfHwgJy53LXNlY3Rpb24uc2VjdGlvbi51LW1hcmdpbmJvdHRvbS00MCc7XG4gICAgICAgICAgICByZXR1cm4gbSh3cmFwcGVyLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgICAgICAgICAoIV8uaXNVbmRlZmluZWQoY29sbGVjdGlvbi50aXRsZSkgfHwgIV8uaXNVbmRlZmluZWQoY29sbGVjdGlvbi5oYXNoKSkgPyBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtbG9vc2VyJywgY29sbGVjdGlvbi50aXRsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgYS5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeVtocmVmPVwiL3B0L2V4cGxvcmU/cmVmPSR7cmVmfSMke2NvbGxlY3Rpb24uaGFzaH1cIl1gLCAnVmVyIHRvZG9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pIDogJycsXG4gICAgICAgICAgICAgICAgICAgIChjb2xsZWN0aW9uLmNvbGxlY3Rpb24oKS5sZW5ndGgpID8gbSgnLnctcm93JywgXy5tYXAoY29sbGVjdGlvbi5jb2xsZWN0aW9uKCksIChwcm9qZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Qcm9qZWN0Q2FyZCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiByZWZcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KSkgOiBoLmxvYWRlcigpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0U2hhcmVCb3ggPSAoKG0sIGgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlFbWJlZDogaC50b2dnbGVQcm9wKGZhbHNlLCB0cnVlKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcucG9wLXNoYXJlJywge1xuICAgICAgICAgICAgICAgIHN0eWxlOiAnZGlzcGxheTogYmxvY2s7J1xuICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgIG0oJy53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdhLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5LmJ0bi1pbmxpbmUudS1yaWdodCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uY2xpY2s6IGFyZ3MuZGlzcGxheVNoYXJlQm94LnRvZ2dsZVxuICAgICAgICAgICAgICAgICAgICB9LCAnRmVjaGFyJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTMwJywgJ0NvbXBhcnRpbGhlIGVzdGUgcHJvamV0bycpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctd2lkZ2V0Lnctd2lkZ2V0LWZhY2Vib29rLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnkuc2hhcmUtYmxvY2snLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJ2lmcmFtZVthbGxvd3RyYW5zcGFyZW5jeT1cInRydWVcIl1bd2lkdGg9XCIxNTBweFwiXVtoZWlnaHQ9XCIyMnB4XCJdW2ZyYW1lYm9yZGVyPVwiMFwiXVtzY3JvbGxpbmc9XCJub1wiXVtzcmM9XCJodHRwczovL3d3dy5mYWNlYm9vay5jb20vdjIuMC9wbHVnaW5zL3NoYXJlX2J1dHRvbi5waHA/YXBwX2lkPTE3Mzc0NzA0MjY2MTQ5MSZjaGFubmVsPWh0dHBzJTNBJTJGJTJGcy1zdGF0aWMuYWsuZmFjZWJvb2suY29tJTJGY29ubmVjdCUyRnhkX2FyYml0ZXIlMkY0NE93Szc0dTBJZS5qcyUzRnZlcnNpb24lM0Q0MSUyM2NiJTNEZjdkOWI5MDBjJTI2ZG9tYWluJTNEd3d3LmNhdGFyc2UubWUlMjZvcmlnaW4lM0RodHRwcyUyNTNBJTI1MkYlMjUyRnd3dy5jYXRhcnNlLm1lJTI1MkZmNGIzYWQwYzglMjZyZWxhdGlvbiUzRHBhcmVudC5wYXJlbnQmY29udGFpbmVyX3dpZHRoPTAmaHJlZj1odHRwcyUzQSUyRiUyRnd3dy5jYXRhcnNlLm1lJTJGcHQlMkYnICsgYXJncy5wcm9qZWN0LnBlcm1hbGluayArICclM0ZyZWYlM0RmYWNlYm9vayZsYXlvdXQ9YnV0dG9uX2NvdW50JmxvY2FsZT1wdF9CUiZzZGs9am9leVwiXScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctd2lkZ2V0Lnctd2lkZ2V0LXR3aXR0ZXIudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5zaGFyZS1ibG9jaycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaWZyYW1lW2FsbG93dHJhbnNwYXJlbmN5PVwidHJ1ZVwiXVt3aWR0aD1cIjEyMHB4XCJdW2hlaWdodD1cIjIycHhcIl1bZnJhbWVib3JkZXI9XCIwXCJdW3Njcm9sbGluZz1cIm5vXCJdW3NyYz1cIi8vcGxhdGZvcm0udHdpdHRlci5jb20vd2lkZ2V0cy90d2VldF9idXR0b24uOGQwMDdkZGZjMTg0ZTY3NzZiZTc2ZmU5ZTVlNTJkNjkuZW4uaHRtbCNfPTE0NDI0MjU5ODQ5MzYmY291bnQ9aG9yaXpvbnRhbCZkbnQ9ZmFsc2UmaWQ9dHdpdHRlci13aWRnZXQtMSZsYW5nPWVuJm9yaWdpbmFsX3JlZmVyZXI9aHR0cHMlM0ElMkYlMkZ3d3cuY2F0YXJzZS5tZSUyRnB0JTJGJyArIGFyZ3MucHJvamVjdC5wZXJtYWxpbmsgKyAnJnNpemU9bSZ0ZXh0PUNvbmZpcmElMjBvJTIwcHJvamV0byUyMCcgKyBhcmdzLnByb2plY3QubmFtZSArICclMjBubyUyMCU0MGNhdGFyc2UmdHlwZT1zaGFyZSZ1cmw9aHR0cHMlM0ElMkYlMkZ3d3cuY2F0YXJzZS5tZSUyRnB0JTJGJyArIGFyZ3MucHJvamVjdC5wZXJtYWxpbmsgKyAnJTNGcmVmJTNEdHdpdHRlciZ2aWE9Y2F0YXJzZVwiXScpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnYS53LWhpZGRlbi1zbWFsbC53aWRnZXQtZW1iZWQudy1oaWRkZW4tdGlueS5mb250c2l6ZS1zbWFsbC5saW5rLWhpZGRlbi5mb250Y29sb3Itc2Vjb25kYXJ5W2hyZWY9XCJqczp2b2lkKDApO1wiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC5kaXNwbGF5RW1iZWQudG9nZ2xlXG4gICAgICAgICAgICAgICAgfSwgJzwgZW1iZWQgPicpLCAoY3RybC5kaXNwbGF5RW1iZWQoKSA/IG0oJy5lbWJlZC1leHBhbmRlZC51LW1hcmdpbnRvcC0zMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS1tYXJnaW5ib3R0b20tMjAnLCAnSW5zaXJhIHVtIHdpZGdldCBlbSBzZXUgc2l0ZScpLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dFt0eXBlPVwidGV4dFwiXVt2YWx1ZT1cIjxpZnJhbWUgZnJhbWVib3JkZXI9XCIwXCIgaGVpZ2h0PVwiMzE0cHhcIiBzcmM9XCJodHRwczovL3d3dy5jYXRhcnNlLm1lL3B0L3Byb2plY3RzLycgKyBhcmdzLnByb2plY3QuaWQgKyAnL2VtYmVkXCIgd2lkdGg9XCIzMDBweFwiIHNjcm9sbGluZz1cIm5vXCI+PC9pZnJhbWU+XCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5jYXJkLWVtYmVkJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnaWZyYW1lW2ZyYW1lYm9yZGVyPVwiMFwiXVtoZWlnaHQ9XCIzNTBweFwiXVtzcmM9XCIvcHJvamVjdHMvJyArIGFyZ3MucHJvamVjdC5pZCArICcvZW1iZWRcIl1bd2lkdGg9XCIzMDBweFwiXVtzY3JvbGxpbmc9XCJub1wiXScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJyksXG4gICAgICAgICAgICAgICAgbSgnYS53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS5idG4uYnRuLW1lZGl1bS5idG4tZmIudS1tYXJnaW5ib3R0b20tMjBbaHJlZj1cImh0dHA6Ly93d3cuZmFjZWJvb2suY29tL3NoYXJlci9zaGFyZXIucGhwP3U9aHR0cHM6Ly93d3cuY2F0YXJzZS5tZS8nICsgYXJncy5wcm9qZWN0LnBlcm1hbGluayArICc/cmVmPWZhY2Vib29rJnRpdGxlPScgKyBhcmdzLnByb2plY3QubmFtZSArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLWZhY2Vib29rJyksICcgQ29tcGFydGlsaGUnXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnYS53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bS5idG4uYnRuLW1lZGl1bS5idG4tdHdlZXQudS1tYXJnaW5ib3R0b20tMjBbaHJlZj1cImh0dHA6Ly90d2l0dGVyLmNvbS8/c3RhdHVzPUFjYWJlaSBkZSBhcG9pYXIgbyBwcm9qZXRvICcgKyBhcmdzLnByb2plY3QubmFtZSArICcgaHR0czovL3d3dy5jYXRhcnNlLm1lLycgKyBhcmdzLnByb2plY3QucGVybWFsaW5rICsgJz9yZWY9dHdpdHRlcnJcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLmZhLmZhLXR3aXR0ZXInKSwgJyBUd2VldCdcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RTaWRlYmFyID0gKChtLCBoLCBjLCBfLCBJMThuKSA9PiB7XG4gICAgY29uc3QgSTE4blNjb3BlID0gXy5wYXJ0aWFsKGguaTE4blNjb3BlLCAncHJvamVjdHMucHJvamVjdF9zaWRlYmFyJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICBhbmltYXRlUHJvZ3Jlc3MgPSAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgYW5pbWF0aW9uLCBwcm9ncmVzcyA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxlZGdlZCA9IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0b3JzID0gMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGVkZ2VkSW5jcmVtZW50ID0gcHJvamVjdC5wbGVkZ2VkIC8gcHJvamVjdC5wcm9ncmVzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRvcnNJbmNyZW1lbnQgPSBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dG9ycyAvIHByb2plY3QucHJvZ3Jlc3M7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzQmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb2dyZXNzQmFyJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxlZGdlZEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsZWRnZWQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRvcnNFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250cmlidXRvcnMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb24gPSBzZXRJbnRlcnZhbChpbmNyZW1lbnRQcm9ncmVzcywgMjgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5jcmVtZW50UHJvZ3Jlc3MgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9ncmVzcyA8PSBwYXJzZUludChwcm9qZWN0LnByb2dyZXNzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBgJHtwcm9ncmVzc30lYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsZWRnZWRFbC5pbm5lclRleHQgPSBgUiQgJHtoLmZvcm1hdE51bWJlcihwbGVkZ2VkKX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0b3JzRWwuaW5uZXJUZXh0ID0gYCR7cGFyc2VJbnQoY29udHJpYnV0b3JzKX0gcGVzc29hc2A7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5pbm5lclRleHQgPSBgJHtwcm9ncmVzc30lYDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsZWRnZWQgPSBwbGVkZ2VkICsgcGxlZGdlZEluY3JlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dG9ycyA9IGNvbnRyaWJ1dG9ycyArIGNvbnRyaWJ1dG9yc0luY3JlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzID0gcHJvZ3Jlc3MgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChhbmltYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMTgwMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc3BsYXlDYXJkQ2xhc3MgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICd3YWl0aW5nX2Z1bmRzJzogJ2NhcmQtd2FpdGluZycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3VjY2Vzc2Z1bCc6ICdjYXJkLXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2ZhaWxlZCc6ICdjYXJkLWVycm9yJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdkcmFmdCc6ICdjYXJkLWRhcmsnLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2luX2FuYWx5c2lzJzogJ2NhcmQtZGFyaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnYXBwcm92ZWQnOiAnY2FyZC1kYXJrJ1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoc3RhdGVzW3Byb2plY3Quc3RhdGVdID8gJ2NhcmQgdS1yYWRpdXMgemluZGV4LTEwICcgKyBzdGF0ZXNbcHJvamVjdC5zdGF0ZV0gOiAnJyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkaXNwbGF5U3RhdHVzVGV4dCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdGVzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2FwcHJvdmVkJzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5hcHByb3ZlZCcsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdvbmxpbmUnOiBoLmV4aXN0eShwcm9qZWN0LnpvbmVfZXhwaXJlc19hdCkgPyBJMThuLnQoJ2Rpc3BsYXlfc3RhdHVzLm9ubGluZScsIEkxOG5TY29wZSh7ZGF0ZTogaC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpfSkpIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAnZmFpbGVkJzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5mYWlsZWQnLCBJMThuU2NvcGUoe2RhdGU6IGgubW9tZW50aWZ5KHByb2plY3Quem9uZV9leHBpcmVzX2F0KSwgZ29hbDogcHJvamVjdC5nb2FsfSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3JlamVjdGVkJzogSTE4bi50KCdkaXNwbGF5X3N0YXR1cy5yZWplY3RlZCcsIEkxOG5TY29wZSgpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdpbl9hbmFseXNpcyc6IEkxOG4udCgnZGlzcGxheV9zdGF0dXMuaW5fYW5hbHlzaXMnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3VjY2Vzc2Z1bCc6IEkxOG4udCgnZGlzcGxheV9zdGF0dXMuc3VjY2Vzc2Z1bCcsIEkxOG5TY29wZSh7ZGF0ZTogaC5tb21lbnRpZnkocHJvamVjdC56b25lX2V4cGlyZXNfYXQpfSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3dhaXRpbmdfZnVuZHMnOiBJMThuLnQoJ2Rpc3BsYXlfc3RhdHVzLndhaXRpbmdfZnVuZHMnLCBJMThuU2NvcGUoKSksXG4gICAgICAgICAgICAgICAgICAgICAgICAnZHJhZnQnOiBJMThuLnQoJ2Rpc3BsYXlfc3RhdHVzLmRyYWZ0JywgSTE4blNjb3BlKCkpXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlc1twcm9qZWN0LnN0YXRlXTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGFuaW1hdGVQcm9ncmVzczogYW5pbWF0ZVByb2dyZXNzLFxuICAgICAgICAgICAgICAgIGRpc3BsYXlDYXJkQ2xhc3M6IGRpc3BsYXlDYXJkQ2xhc3MsXG4gICAgICAgICAgICAgICAgZGlzcGxheVN0YXR1c1RleHQ6IGRpc3BsYXlTdGF0dXNUZXh0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgICAgICAgIGVsYXBzZWQgPSBwcm9qZWN0LmVsYXBzZWRfdGltZSxcbiAgICAgICAgICAgICAgICByZW1haW5pbmcgPSBwcm9qZWN0LnJlbWFpbmluZ190aW1lO1xuXG4gICAgICAgICAgICByZXR1cm4gbSgnI3Byb2plY3Qtc2lkZWJhci5hc2lkZScsIFtcbiAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1zdGF0cycsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnByb2plY3Qtc3RhdHMtaW5uZXInLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcucHJvamVjdC1zdGF0cy1pbmZvJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnI3BsZWRnZWQuZm9udHNpemUtbGFyZ2VzdC5mb250d2VpZ2h0LXNlbWlib2xkLnUtdGV4dC1jZW50ZXItc21hbGwtb25seScsIGBSJCAke2guZm9ybWF0TnVtYmVyKHByb2plY3QucGxlZGdlZCl9YCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJMThuLnQoJ2NvbnRyaWJ1dG9yc19jYWxsJywgSTE4blNjb3BlKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3BhbiNjb250cmlidXRvcnMuZm9udHdlaWdodC1zZW1pYm9sZCcsIEkxOG4udCgnY29udHJpYnV0b3JzX2NvdW50JywgSTE4blNjb3BlKHtjb3VudDogcHJvamVjdC50b3RhbF9jb250cmlidXRvcnN9KSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFwcm9qZWN0LmV4cGlyZXNfYXQpID8gJyBlbSAnICsgSTE4bi50KCdkYXRldGltZS5kaXN0YW5jZV9pbl93b3Jkcy54XycgKyBlbGFwc2VkLnVuaXQsIHtjb3VudDogZWxhcHNlZC50b3RhbH0sIEkxOG5TY29wZSgpKSA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLm1ldGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcjcHJvZ3Jlc3NCYXIubWV0ZXItZmlsbCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGAke3Byb2plY3QucHJvZ3Jlc3N9JWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW50b3AtMTAnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsLmZvbnR3ZWlnaHQtc2VtaWJvbGQubGluZWhlaWdodC10aWdodGVyJywgYCR7cGFyc2VJbnQocHJvamVjdC5wcm9ncmVzcyl9JWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNy53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNi53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnUtcmlnaHQuZm9udHNpemUtc21hbGwubGluZWhlaWdodC10aWdodGVyJywgcmVtYWluaW5nLnRvdGFsID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlbWFpbmluZy50b3RhbCksIEkxOG4udCgncmVtYWluaW5nX3RpbWUuJyArIHJlbWFpbmluZy51bml0LCBJMThuU2NvcGUoe2NvdW50OiByZW1haW5pbmcudG90YWx9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0TW9kZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0OiBwcm9qZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICwgKHByb2plY3Qub3Blbl9mb3JfY29udHJpYnV0aW9ucyA/IG0oJ2EjY29udHJpYnV0ZV9wcm9qZWN0X2Zvcm0uYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0yMFtocmVmPVwiL3Byb2plY3RzLycgKyBwcm9qZWN0LmlkICsgJy9jb250cmlidXRpb25zL25ld1wiXScsIEkxOG4udCgnc3VibWl0JywgSTE4blNjb3BlKCkpKSA6ICcnKSwgKChwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMpID8gbS5jb21wb25lbnQoYy5Qcm9qZWN0UmVtaW5kZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbGluaydcbiAgICAgICAgICAgICAgICAgICAgfSkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgIG0oJ2RpdltjbGFzcz1cImZvbnRzaXplLXNtYWxsZXIgdS1tYXJnaW5ib3R0b20tMzAgJyArIChjdHJsLmRpc3BsYXlDYXJkQ2xhc3MoKSkgKyAnXCJdJywgY3RybC5kaXNwbGF5U3RhdHVzVGV4dCgpKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy51c2VyLWMnLCBtLmNvbXBvbmVudChjLlByb2plY3RVc2VyQ2FyZCwge1xuICAgICAgICAgICAgICAgICAgICB1c2VyRGV0YWlsczogYXJncy51c2VyRGV0YWlsc1xuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMsIHdpbmRvdy5fLCB3aW5kb3cuSTE4bikpO1xuIiwiLyoqXG4gKiB3aW5kb3cuYy5Qcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucyBjb21wb25lbnRcbiAqIEEgUHJvamVjdC1zaG93IHBhZ2UgaGVscGVyIHRvIHNob3cgc3VnZ2VzdGVkIGFtb3VudHMgb2YgY29udHJpYnV0aW9uc1xuICpcbiAqIEV4YW1wbGUgb2YgdXNlOlxuICogdmlldzogKCkgPT4ge1xuICogICAuLi5cbiAqICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucywge3Byb2plY3Q6IHByb2plY3R9KVxuICogICAuLi5cbiAqIH1cbiAqL1xuXG53aW5kb3cuYy5Qcm9qZWN0U3VnZ2VzdGVkQ29udHJpYnV0aW9ucyA9IChmdW5jdGlvbihtLCBjLCBfKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3QgPSBhcmdzLnByb2plY3Q7XG4gICAgICAgICAgICBsZXQgc3VnZ2VzdGlvblVybCA9IChhbW91bnQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYC9wcm9qZWN0cy8ke3Byb2plY3QucHJvamVjdF9pZH0vY29udHJpYnV0aW9ucy9uZXc/YW1vdW50PSR7YW1vdW50fWA7XG4gICAgICAgICAgICB9LCBzdWdnZXN0ZWRWYWx1ZXMgPSBbMTAsIDI1LCA1MCwgMTAwXTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oJyNzdWdnZXN0aW9ucycsIF8ubWFwKHN1Z2dlc3RlZFZhbHVlcywgKGFtb3VudCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKGBhW2hyZWY9XCIke3N1Z2dlc3Rpb25VcmwoYW1vdW50KX1cIl0uY2FyZC1yZXdhcmQuY2FyZC1iaWcuY2FyZC1zZWNvbmRhcnkudS1tYXJnaW5ib3R0b20tMjBgLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXInLCBgUiTCoCR7YW1vdW50fWApXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5Qcm9qZWN0VGFicyA9ICgobSwgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgaXNGaXhlZCA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbiA9IG0ucHJvcCgtMSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGZpeE9uU2Nyb2xsID0gKGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHZpZXdwb3J0T2Zmc2V0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5zY3JvbGxZIDw9IG9yaWdpbmFsUG9zaXRpb24oKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbigtMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc0ZpeGVkKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAodmlld3BvcnRPZmZzZXQudG9wIDwgMCB8fCAod2luZG93LnNjcm9sbFkgPiBvcmlnaW5hbFBvc2l0aW9uKCkgJiYgb3JpZ2luYWxQb3NpdGlvbigpID4gMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNGaXhlZCgpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFBvc2l0aW9uKHdpbmRvdy5zY3JvbGxZKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0ZpeGVkKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgbmF2RGlzcGxheSA9IChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaXhOYXZCYXIgPSBmaXhPblNjcm9sbChlbCk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBmaXhOYXZCYXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbmF2RGlzcGxheTogbmF2RGlzcGxheSxcbiAgICAgICAgICAgICAgICBpc0ZpeGVkOiBpc0ZpeGVkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvamVjdCA9IGFyZ3MucHJvamVjdCxcbiAgICAgICAgICAgICAgICByZXdhcmRzID0gYXJncy5yZXdhcmREZXRhaWxzO1xuXG4gICAgICAgICAgICBsZXQgbWFpbkNsYXNzID0gKCFjdHJsLmlzRml4ZWQoKSB8fCBwcm9qZWN0LmlzX293bmVyX29yX2FkbWluKSA/ICcudy1zZWN0aW9uLnByb2plY3QtbmF2JyA6ICcudy1zZWN0aW9uLnByb2plY3QtbmF2LnByb2plY3QtbmF2LWZpeGVkJztcblxuICAgICAgICAgICAgcmV0dXJuIG0oJ25hdi13cmFwcGVyJyxbXG4gICAgICAgICAgICAgICAgbShtYWluQ2xhc3MsIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLm5hdkRpc3BsYXlcbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFshXy5pc0VtcHR5KHJld2FyZHMoKSkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwicmV3YXJkcy1saW5rXCJdW2NsYXNzPVwidy1oaWRkZW4tbWFpbiB3LWhpZGRlbi1tZWRpdW0gZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNyZXdhcmRzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI3Jld2FyZHNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJ1JlY29tcGVuc2FzJykgOiBtKCdhW2lkPVwicmV3YXJkcy1saW5rXCJdW2NsYXNzPVwidy1oaWRkZW4tbWFpbiB3LWhpZGRlbi1tZWRpdW0gZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNjb250cmlidXRpb25fc3VnZ2VzdGlvbnMnKSA/ICdzZWxlY3RlZCcgOiAnJykgKyAnXCJdW2hyZWY9XCIjY29udHJpYnV0aW9uX3N1Z2dlc3Rpb25zXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICdWYWxvcmVzIFN1Z2VyaWRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhW2lkPVwiYWJvdXQtbGlua1wiXVtjbGFzcz1cImRhc2hib2FyZC1uYXYtbGluayBtZiAnICsgKGguaGFzaE1hdGNoKCcjYWJvdXQnKSB8fCBoLmhhc2hNYXRjaCgnJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJyBcIl1baHJlZj1cIiNhYm91dFwiXScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiAnZmxvYXQ6IGxlZnQ7J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnU29icmUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtpZD1cInBvc3RzLWxpbmtcIl1bY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI3Bvc3RzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI3Bvc3RzXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdOb3ZpZGFkZXMgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3NwYW4uYmFkZ2UnLCBwcm9qZWN0LnBvc3RzX2NvdW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtpZD1cImNvbnRyaWJ1dGlvbnMtbGlua1wiXVtjbGFzcz1cInctaGlkZGVuLXNtYWxsIHctaGlkZGVuLXRpbnkgZGFzaGJvYXJkLW5hdi1saW5rIG1mICcgKyAoaC5oYXNoTWF0Y2goJyNjb250cmlidXRpb25zJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI2NvbnRyaWJ1dGlvbnNcIl0nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogJ2Zsb2F0OiBsZWZ0OydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0Fwb2lvcyAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnc3Bhbi5iYWRnZS53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55JywgcHJvamVjdC50b3RhbF9jb250cmlidXRpb25zKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYVtpZD1cImNvbW1lbnRzLWxpbmtcIl1bY2xhc3M9XCJkYXNoYm9hcmQtbmF2LWxpbmsgbWYgJyArIChoLmhhc2hNYXRjaCgnI2NvbW1lbnRzJykgPyAnc2VsZWN0ZWQnIDogJycpICsgJ1wiXVtocmVmPVwiI2NvbW1lbnRzXCJdJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6ICdmbG9hdDogbGVmdDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdDb21lbnTDoXJpb3MgJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ZiOmNvbW1lbnRzLWNvdW50W2hyZWY9XCJodHRwOi8vd3d3LmNhdGFyc2UubWUvJyArIHByb2plY3QucGVybWFsaW5rICsgJ1wiXVtjbGFzcz1cImJhZGdlIHByb2plY3QtZmItY29tbWVudCB3LWhpZGRlbi1zbWFsbCB3LWhpZGRlbi10aW55XCJdW3N0eWxlPVwiZGlzcGxheTogaW5saW5lXCJdJywgbS50cnVzdCgnJm5ic3A7JykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCBwcm9qZWN0Lm9wZW5fZm9yX2NvbnRyaWJ1dGlvbnMgPyBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdy5wcm9qZWN0LW5hdi1iYWNrLWJ1dHRvbicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02LnctY29sLW1lZGl1bS04JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2Eudy1idXR0b24uYnRuW2hyZWY9XCIvcHJvamVjdHMvJyArIHByb2plY3QuaWQgKyAnL2NvbnRyaWJ1dGlvbnMvbmV3XCJdJywgJ0Fwb2lhcsKg4oCNZXN0ZcKgcHJvamV0bycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02LnctY29sLW1lZGl1bS00JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdFJlbWluZGVyLCB7cHJvamVjdDogcHJvamVjdCwgdHlwZTogJ2J1dHRvbicsIGhpZGVUZXh0T25Nb2JpbGU6IHRydWV9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIDogJycpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIChjdHJsLmlzRml4ZWQoKSAmJiAhcHJvamVjdC5pc19vd25lcl9vcl9hZG1pbikgPyBtKCcudy1zZWN0aW9uLnByb2plY3QtbmF2JykgOiAnJ1xuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuUHJvamVjdFVzZXJDYXJkID0gKChtLCBfLCBoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjdXNlci1jYXJkJywgXy5tYXAoYXJncy51c2VyRGV0YWlscygpLCAodXNlckRldGFpbCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcudS1tYXJnaW5ib3R0b20tMzAudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdpbWcudGh1bWIudS1tYXJnaW5ib3R0b20tMzAudS1yb3VuZFt3aWR0aD1cIjEwMFwiXVtpdGVtcHJvcD1cImltYWdlXCJdW3NyYz1cIicgKyB1c2VyRGV0YWlsLnByb2ZpbGVfaW1nX3RodW1ibmFpbCArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGwubGluay1oaWRkZW4uZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5saW5laGVpZ2h0LXRpZ2h0W2l0ZW1wcm9wPVwibmFtZVwiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltocmVmPVwiL3VzZXJzLycgKyB1c2VyRGV0YWlsLmlkICsgJ1wiXScsIHVzZXJEZXRhaWwubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgucGx1cmFsaXplKHVzZXJEZXRhaWwudG90YWxfcHVibGlzaGVkX3Byb2plY3RzLCAnIGNyaWFkbycsICcgY3JpYWRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCcmbmJzcDsmbmJzcDt8Jm5ic3A7Jm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgucGx1cmFsaXplKHVzZXJEZXRhaWwudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMsICcgYXBvaWFkbycsICcgYXBvaWFkb3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ3VsLnctaGlkZGVuLXRpbnkudy1oaWRkZW4tc21hbGwudy1saXN0LXVuc3R5bGVkLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFfLmlzRW1wdHkodXNlckRldGFpbC5mYWNlYm9va19saW5rKSA/IG0oJ2xpJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5saW5rLWhpZGRlbltpdGVtcHJvcD1cInVybFwiXVtocmVmPVwiJyArIHVzZXJEZXRhaWwuZmFjZWJvb2tfbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBGYWNlYm9vaycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLCAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLnR3aXR0ZXJfdXNlcm5hbWUpID8gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCJodHRwczovL3R3aXR0ZXIuY29tLycgKyB1c2VyRGV0YWlsLnR3aXR0ZXJfdXNlcm5hbWUgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdQZXJmaWwgbm8gVHdpdHRlcicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcCh1c2VyRGV0YWlsLmxpbmtzLCAobGluaykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcnNlZExpbmsgPSBoLnBhcnNlVXJsKGxpbmspO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKCFfLmlzRW1wdHkocGFyc2VkTGluay5ob3N0bmFtZSkgPyBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2l0ZW1wcm9wPVwidXJsXCJdW2hyZWY9XCInICsgbGluayArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgcGFyc2VkTGluay5ob3N0bmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLCAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLmVtYWlsKSA/IG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRzaXplLXNtYWxsZXN0LmFsdC1saW5rLmZvbnR3ZWlnaHQtc2VtaWJvbGRbaXRlbXByb3A9XCJlbWFpbFwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCB1c2VyRGV0YWlsLmVtYWlsKSA6ICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlNsaWRlciBjb21wb25lbnRcbiAqIEJ1aWxkIGEgc2xpZGVyIGZyb20gYW55IGFycmF5IG9mIG1pdGhyaWwgZWxlbWVudHNcbiAqXG4gKiBFeGFtcGxlIG9mIHVzZTpcbiAqIHZpZXc6ICgpID0+IHtcbiAqICAgICAuLi5cbiAqICAgICBtLmNvbXBvbmVudChjLlNsaWRlciwge1xuICogICAgICAgICBzbGlkZXM6IFttKCdzbGlkZTEnKSwgbSgnc2xpZGUyJyksIG0oJ3NsaWRlMycpXSxcbiAqICAgICAgICAgdGl0bGU6ICdPIHF1ZSBlc3TDo28gZGl6ZW5kbyBwb3IgYcOtLi4uJ1xuICogICAgIH0pXG4gKiAgICAgLi4uXG4gKiB9XG4gKi9cbndpbmRvdy5jLlNsaWRlciA9ICgobSwgXykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFNsaWRlSWR4ID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgICAgIHRyYW5zbGF0aW9uU2l6ZSA9IG0ucHJvcCgxNjAwKSxcbiAgICAgICAgICAgICAgICBkZWNyZW1lbnRTbGlkZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkU2xpZGVJZHgoKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkU2xpZGVJZHgoc2VsZWN0ZWRTbGlkZUlkeCgpIC0gMSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFNsaWRlSWR4KGFyZ3Muc2xpZGVzLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbmNyZW1lbnRTbGlkZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkU2xpZGVJZHgoKSA8IChhcmdzLnNsaWRlcy5sZW5ndGggLSAxKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRTbGlkZUlkeChzZWxlY3RlZFNsaWRlSWR4KCkgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkU2xpZGVJZHgoMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNoYW5nZVNsaWRlVGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGluY3JlbWVudFNsaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgfSwgNjUwMCksXG4gICAgICAgICAgICAgICAgY29uZmlnID0gKGVsLCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblNpemUoTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLCB3aW5kb3cuaW5uZXJXaWR0aCB8fCAwKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQub251bmxvYWQgPSAoKSA9PiBjbGVhckludGVydmFsKGNoYW5nZVNsaWRlVGltZXIpO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRTbGlkZUlkeDogc2VsZWN0ZWRTbGlkZUlkeCxcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGlvblNpemU6IHRyYW5zbGF0aW9uU2l6ZSxcbiAgICAgICAgICAgICAgICBkZWNyZW1lbnRTbGlkZTogZGVjcmVtZW50U2xpZGUsXG4gICAgICAgICAgICAgICAgaW5jcmVtZW50U2xpZGU6IGluY3JlbWVudFNsaWRlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJy53LXNsaWRlci5zbGlkZS10ZXN0aW1vbmlhbHMnLCB7XG4gICAgICAgICAgICAgICAgY29uZmlnOiBjdHJsLmNvbmZpZ1xuICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXInLCBhcmdzLnRpdGxlKSxcbiAgICAgICAgICAgICAgICBtKCcudy1zbGlkZXItbWFzaycsIFtcbiAgICAgICAgICAgICAgICAgICAgXy5tYXAoYXJncy5zbGlkZXMsIChzbGlkZSwgaWR4KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdHJhbnNsYXRlVmFsdWUgPSAoaWR4IC0gY3RybC5zZWxlY3RlZFNsaWRlSWR4KCkpICogY3RybC50cmFuc2xhdGlvblNpemUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGVTdHIgPSBgdHJhbnNsYXRlM2QoJHt0cmFuc2xhdGVWYWx1ZX1weCwgMCwgMClgO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnNsaWRlLnctc2xpZGUuc2xpZGUtdGVzdGltb25pYWxzLWNvbnRlbnQnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IGB0cmFuc2Zvcm06ICR7dHJhbnNsYXRlU3RyfTsgLXdlYmtpdC10cmFuc2Zvcm06ICR7dHJhbnNsYXRlU3RyfTsgLW1zLXRyYW5zZm9ybToke3RyYW5zbGF0ZVN0cn07YFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTgudy1jb2wtcHVzaC0yJywgc2xpZGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgbSgnI3NsaWRlLXByZXYudy1zbGlkZXItYXJyb3ctbGVmdC53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogKCkgPT4gY3RybC5kZWNyZW1lbnRTbGlkZSgpXG4gICAgICAgICAgICAgICAgICAgIH0sW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctaWNvbi1zbGlkZXItbGVmdC5mYS5mYS1jaGV2cm9uLWxlZnQuZm9udGNvbG9yLXRlcmNpYXJ5JylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJyNzbGlkZS1uZXh0Lnctc2xpZGVyLWFycm93LXJpZ2h0LnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiAoKSA9PiBjdHJsLmluY3JlbWVudFNsaWRlKClcbiAgICAgICAgICAgICAgICAgICAgfSxbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1pY29uLXNsaWRlci1yaWdodC5mYS5mYS1jaGV2cm9uLXJpZ2h0LmZvbnRjb2xvci10ZXJjaWFyeScpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1zbGlkZXItbmF2Lnctc2xpZGVyLW5hdi1pbnZlcnQudy1yb3VuZC5zbGlkZS1uYXYnLCBfKGFyZ3Muc2xpZGVzLmxlbmd0aCkudGltZXMoKGlkeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oYC5zbGlkZS1idWxsZXQudy1zbGlkZXItZG90JHtjdHJsLnNlbGVjdGVkU2xpZGVJZHgoKSA9PT0gaWR4ID8gJy53LWFjdGl2ZScgOiAnJ31gLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25jbGljazogKCkgPT4gY3RybC5zZWxlY3RlZFNsaWRlSWR4KGlkeClcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlRlYW1NZW1iZXJzID0gKGZ1bmN0aW9uKF8sIG0sIG1vZGVscykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHZtID0ge1xuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uOiBtLnByb3AoW10pXG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIGdyb3VwQ29sbGVjdGlvbiA9IGZ1bmN0aW9uKGNvbGxlY3Rpb24sIGdyb3VwVG90YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8ubWFwKF8ucmFuZ2UoTWF0aC5jZWlsKGNvbGxlY3Rpb24ubGVuZ3RoIC8gZ3JvdXBUb3RhbCkpLCBmdW5jdGlvbihpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbi5zbGljZShpICogZ3JvdXBUb3RhbCwgKGkgKyAxKSAqIGdyb3VwVG90YWwpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBtb2RlbHMudGVhbU1lbWJlci5nZXRQYWdlKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgdm0uY29sbGVjdGlvbihncm91cENvbGxlY3Rpb24oZGF0YSwgNCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdm06IHZtXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIHJldHVybiBtKCcjdGVhbS1tZW1iZXJzLXN0YXRpYy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgICAgICAgICAgIF8ubWFwKGN0cmwudm0uY29sbGVjdGlvbigpLCBmdW5jdGlvbihncm91cCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LXJvdy51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ubWFwKGdyb3VwLCBmdW5jdGlvbihtZW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy50ZWFtLW1lbWJlci53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02LnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL3VzZXJzLycgKyBtZW1iZXIuaWQgKyAnXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi5iaWcudS1yb3VuZC51LW1hcmdpbmJvdHRvbS0xMFtzcmM9XCInICsgbWVtYmVyLmltZyArICdcIl0nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1iYXNlJywgbWVtYmVyLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0Fwb2lvdSAnICsgbWVtYmVyLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cuXywgd2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMuVGVhbVRvdGFsID0gKGZ1bmN0aW9uKG0sIGgsIG1vZGVscykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHZtID0ge1xuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IG0ucHJvcChbXSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIG1vZGVscy50ZWFtVG90YWwuZ2V0Um93KCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgdm0uY29sbGVjdGlvbihkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHZtOiB2bVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnI3RlYW0tdG90YWwtc3RhdGljLnctc2VjdGlvbi5zZWN0aW9uLW9uZS1jb2x1bW4uc2VjdGlvbi51LW1hcmdpbnRvcC00MC51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgIGN0cmwudm0uY29sbGVjdGlvbigpLm1hcChmdW5jdGlvbih0ZWFtVG90YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS0zMCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSG9qZSBzb21vcyAnICsgdGVhbVRvdGFsLm1lbWJlcl9jb3VudCArICcgcGVzc29hcyBlc3BhbGhhZGFzIHBvciAnICsgdGVhbVRvdGFsLnRvdGFsX2NpdGllcyArICcgY2lkYWRlcyBlbSAnICsgdGVhbVRvdGFsLmNvdW50cmllcy5sZW5ndGggK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyBwYcOtc2VzICgnICsgdGVhbVRvdGFsLmNvdW50cmllcy50b1N0cmluZygpICsgJykhIE8gQ2F0YXJzZSDDqSBpbmRlcGVuZGVudGUsIHNlbSBpbnZlc3RpZG9yZXMsIGRlIGPDs2RpZ28gYWJlcnRvIGUgY29uc3RydcOtZG8gY29tIGFtb3IuIE5vc3NhIHBhaXjDo28gw6kgY29uc3RydWlyIHVtIGFtYmllbnRlIG9uZGUgY2FkYSB2ZXogbWFpcyBwcm9qZXRvcyBwb3NzYW0gZ2FuaGFyIHZpZGEuJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC10aWdodC50ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ05vc3NhIGVxdWlwZSwganVudGEsIGrDoSBhcG9pb3UgUiQnICsgaC5mb3JtYXROdW1iZXIodGVhbVRvdGFsLnRvdGFsX2Ftb3VudCkgKyAnIHBhcmEgJyArIHRlYW1Ub3RhbC50b3RhbF9jb250cmlidXRlZF9wcm9qZWN0cyArICcgcHJvamV0b3MhJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLlRvb2x0aXAgY29tcG9uZW50XG4gKiBBIGNvbXBvbmVudCB0aGF0IGFsbG93cyB5b3UgdG8gc2hvdyBhIHRvb2x0aXAgb25cbiAqIGEgc3BlY2lmaWVkIGVsZW1lbnQgaG92ZXIuIEl0IHJlY2VpdmVzIHRoZSBlbGVtZW50IHlvdSB3YW50XG4gKiB0byB0cmlnZ2VyIHRoZSB0b29sdGlwIGFuZCBhbHNvIHRoZSB0ZXh0IHRvIGRpc3BsYXkgYXMgdG9vbHRpcC5cbiAqXG4gKiBFeGFtcGxlIG9mIHVzZTpcbiAqIHZpZXc6ICgpID0+IHtcbiAqICAgICBsZXQgdG9vbHRpcCA9IChlbCkgPT4ge1xuICogICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuVG9vbHRpcCwge1xuICogICAgICAgICAgICAgIGVsOiBlbCxcbiAqICAgICAgICAgICAgICB0ZXh0OiAndGV4dCB0byB0b29sdGlwJyxcbiAqICAgICAgICAgICAgICB3aWR0aDogMzAwXG4gKiAgICAgICAgICB9KVxuICogICAgIH1cbiAqXG4gKiAgICAgcmV0dXJuIHRvb2x0aXAoJ2EjbGluay13dGgtdG9vbHRpcFtocmVmPVwiI1wiXScpO1xuICpcbiAqIH1cbiAqL1xud2luZG93LmMuVG9vbHRpcCA9ICgobSwgYywgaCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRyb2xsZXI6IChhcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgcGFyZW50SGVpZ2h0ID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgICAgIHdpZHRoID0gbS5wcm9wKGFyZ3Mud2lkdGggfHwgMjgwKSxcbiAgICAgICAgICAgICAgICB0b3AgPSBtLnByb3AoMCksXG4gICAgICAgICAgICAgICAgbGVmdCA9IG0ucHJvcCgwKSxcbiAgICAgICAgICAgICAgICBvcGFjaXR5ID0gbS5wcm9wKDApLFxuICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldCA9IG0ucHJvcCh7dG9wOiAwLCBsZWZ0OiAwfSksXG4gICAgICAgICAgICAgICAgdG9vbHRpcCA9IGgudG9nZ2xlUHJvcCgwLCAxKSxcbiAgICAgICAgICAgICAgICB0b2dnbGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRvb2x0aXAudG9nZ2xlKCk7XG4gICAgICAgICAgICAgICAgICAgIG0ucmVkcmF3KCk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3Qgc2V0UGFyZW50UG9zaXRpb24gPSAoZWwsIGlzSW5pdGlhbGl6ZWQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXQoaC5jdW11bGF0aXZlT2Zmc2V0KGVsKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXRQb3NpdGlvbiA9IChlbCwgaXNJbml0aWFsaXplZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVsVG9wID0gZWwub2Zmc2V0SGVpZ2h0ICsgZWwub2Zmc2V0UGFyZW50Lm9mZnNldEhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDwgKGVsLm9mZnNldFdpZHRoICsgMiAqIHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ0xlZnQpICsgMzApKXsgLy8zMCBoZXJlIGlzIGEgc2FmZSBtYXJnaW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gMzA7IC8vQWRkaW5nIHRoZSBzYWZlIG1hcmdpblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQoLXBhcmVudE9mZnNldCgpLmxlZnQgKyAxNSk7IC8vcG9zaXRpb25pbmcgY2VudGVyIG9mIHdpbmRvdywgY29uc2lkZXJpbmcgbWFyZ2luXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKChwYXJlbnRPZmZzZXQoKS5sZWZ0ICsgKGVsLm9mZnNldFdpZHRoIC8gMikpIDw9IHdpbmRvdy5pbm5lcldpZHRoICYmIChwYXJlbnRPZmZzZXQoKS5sZWZ0IC0gKGVsLm9mZnNldFdpZHRoIC8gMikpID49IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQoLWVsLm9mZnNldFdpZHRoIC8gMik7IC8vUG9zaXRpb25pbmcgdG8gdGhlIGNlbnRlclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICgocGFyZW50T2Zmc2V0KCkubGVmdCArIChlbC5vZmZzZXRXaWR0aCAvIDIpKSA+IHdpbmRvdy5pbm5lcldpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVmdCgtZWwub2Zmc2V0V2lkdGggKyBlbC5vZmZzZXRQYXJlbnQub2Zmc2V0V2lkdGgpOyAvL1Bvc2l0aW9uaW5nIHRvIHRoZSBsZWZ0XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKChwYXJlbnRPZmZzZXQoKS5sZWZ0IC0gKGVsLm9mZnNldFdpZHRoIC8gMikpIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQoLWVsLm9mZnNldFBhcmVudC5vZmZzZXRXaWR0aCk7IC8vUG9zaXRpb25pbmcgdG8gdGhlIHJpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3AoLWVsVG9wKTsgLy9TZXR0aW5nIHRvcCBwb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiBvcGFjaXR5LFxuICAgICAgICAgICAgICAgIHRvb2x0aXA6IHRvb2x0aXAsXG4gICAgICAgICAgICAgICAgdG9nZ2xlOiB0b2dnbGUsXG4gICAgICAgICAgICAgICAgc2V0UG9zaXRpb246IHNldFBvc2l0aW9uLFxuICAgICAgICAgICAgICAgIHNldFBhcmVudFBvc2l0aW9uOiBzZXRQYXJlbnRQb3NpdGlvblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogKGN0cmwsIGFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCB3aWR0aCA9IGN0cmwud2lkdGgoKTtcbiAgICAgICAgICAgIHJldHVybiBtKGFyZ3MuZWwsIHtcbiAgICAgICAgICAgICAgICBvbmNsaWNrOiBjdHJsLnRvZ2dsZSxcbiAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwuc2V0UGFyZW50UG9zaXRpb24sXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJ31cbiAgICAgICAgICAgIH0sIGN0cmwudG9vbHRpcCgpID8gW1xuICAgICAgICAgICAgICAgIG0oYC50b29sdGlwLmRhcmtbc3R5bGU9XCJ3aWR0aDogJHt3aWR0aH1weDsgdG9wOiAke2N0cmwudG9wKCl9cHg7IGxlZnQ6ICR7Y3RybC5sZWZ0KCl9cHg7XCJdYCwge1xuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGN0cmwuc2V0UG9zaXRpb25cbiAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIGFyZ3MudGV4dClcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSA6ICcnKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuVXNlckNhcmQgPSAoZnVuY3Rpb24obSwgXywgbW9kZWxzLCBoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgdmFyIHZtID0gaC5pZFZNLFxuICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzID0gbS5wcm9wKFtdKTtcblxuICAgICAgICAgICAgdm0uaWQoYXJncy51c2VySWQpO1xuXG4gICAgICAgICAgICAvL0ZJWE1FOiBjYW4gY2FsbCBhbm9uIHJlcXVlc3RzIHdoZW4gdG9rZW4gZmFpbHMgKHJlcXVlc3RNYXliZVdpdGhUb2tlbilcbiAgICAgICAgICAgIG1vZGVscy51c2VyRGV0YWlsLmdldFJvd1dpdGhUb2tlbih2bS5wYXJhbWV0ZXJzKCkpLnRoZW4odXNlckRldGFpbHMpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVzZXJEZXRhaWxzOiB1c2VyRGV0YWlsc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgcmV0dXJuIG0oJyN1c2VyLWNhcmQnLCBfLm1hcChjdHJsLnVzZXJEZXRhaWxzKCksIGZ1bmN0aW9uKHVzZXJEZXRhaWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnLmNhcmQuY2FyZC11c2VyLnUtcmFkaXVzLnUtbWFyZ2luYm90dG9tLTMwW2l0ZW1wcm9wPVwiYXV0aG9yXCJdJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LmNvbC1zbWFsbC00LnctY29sLXRpbnktNC53LWNsZWFyZml4JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2ltZy50aHVtYi51LXJvdW5kW3dpZHRoPVwiMTAwXCJdW2l0ZW1wcm9wPVwiaW1hZ2VcIl1bc3JjPVwiJyArIHVzZXJEZXRhaWwucHJvZmlsZV9pbWdfdGh1bWJuYWlsICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctY29sLXNtYWxsLTgudy1jb2wtdGlueS04JywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLmxpbmVoZWlnaHQtdGlnaHRlcltpdGVtcHJvcD1cIm5hbWVcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baHJlZj1cIi91c2Vycy8nICsgdXNlckRldGFpbC5pZCArICdcIl0nLCB1c2VyRGV0YWlsLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyW2l0ZW1wcm9wPVwiYWRkcmVzc1wiXScsIHVzZXJEZXRhaWwuYWRkcmVzc19jaXR5KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCB1c2VyRGV0YWlsLnRvdGFsX3B1Ymxpc2hlZF9wcm9qZWN0cyArICcgcHJvamV0b3MgY3JpYWRvcycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsICdhcG9pb3UgJyArIHVzZXJEZXRhaWwudG90YWxfY29udHJpYnV0ZWRfcHJvamVjdHMgKyAnIHByb2pldG9zJylcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnByb2plY3QtYXV0aG9yLWNvbnRhY3RzJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbSgndWwudy1saXN0LXVuc3R5bGVkLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLmZhY2Vib29rX2xpbmspID8gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyB1c2VyRGV0YWlsLmZhY2Vib29rX2xpbmsgKyAnXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdQZXJmaWwgbm8gRmFjZWJvb2snKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pIDogJycpLCAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLnR3aXR0ZXJfdXNlcm5hbWUpID8gbSgnbGknLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vJyArIHVzZXJEZXRhaWwudHdpdHRlcl91c2VybmFtZSArICdcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ1BlcmZpbCBubyBUd2l0dGVyJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm1hcCh1c2VyRGV0YWlsLmxpbmtzLCBmdW5jdGlvbihsaW5rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtKCdsaScsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJ2EubGluay1oaWRkZW5baXRlbXByb3A9XCJ1cmxcIl1baHJlZj1cIicgKyBsaW5rICsgJ1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCBsaW5rKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIF0pLCAoIV8uaXNFbXB0eSh1c2VyRGV0YWlsLmVtYWlsKSA/IG0oJ2EuYnRuLmJ0bi1tZWRpdW0uYnRuLW1lc3NhZ2VbaHJlZj1cIm1haWx0bzonICsgdXNlckRldGFpbC5lbWFpbCArICdcIl1baXRlbXByb3A9XCJlbWFpbFwiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnRW52aWFyIG1lbnNhZ2VtJykgOiAnJylcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMubW9kZWxzLCB3aW5kb3cuYy5oKSk7XG4iLCIvKipcbiAqIHdpbmRvdy5jLnlvdXR1YmVMaWdodGJveCBjb21wb25lbnRcbiAqIEEgdmlzdWFsIGNvbXBvbmVudCB0aGF0IGRpc3BsYXlzIGEgbGlnaHRib3ggd2l0aCBhIHlvdXR1YmUgdmlkZW9cbiAqXG4gKiBFeGFtcGxlOlxuICogdmlldzogKCkgPT4ge1xuICogICAgICAuLi5cbiAqICAgICAgbS5jb21wb25lbnQoYy55b3V0dWJlTGlnaHRib3gsIHtzcmM6ICdodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PUZsRlRjRFNLbkxNJ30pXG4gKiAgICAgIC4uLlxuICogIH1cbiAqL1xud2luZG93LmMuWW91dHViZUxpZ2h0Ym94ID0gKChtLCBjLCBoLCBtb2RlbHMpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb250cm9sbGVyOiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzaG93TGlnaHRib3ggPSBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpO1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHNob3dMaWdodGJveDogc2hvd0xpZ2h0Ym94XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiAoY3RybCwgYXJncykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oJyN5b3V0dWJlLWxpZ2h0Ym94JywgW1xuICAgICAgICAgICAgICAgIG0oJ2EjeW91dHViZS1wbGF5LnctbGlnaHRib3gudy1pbmxpbmUtYmxvY2suZmEuZmEtcGxheS1jaXJjbGUuZm9udGNvbG9yLW5lZ2F0aXZlLmZhLTV4W2hyZWY9XFwnamF2YXNjcmlwdDp2b2lkKDApO1xcJ10nLCB7b25jbGljazogY3RybC5zaG93TGlnaHRib3gudG9nZ2xlfSksXG4gICAgICAgICAgICAgICAgY3RybC5zaG93TGlnaHRib3goKSA/XG4gICAgICAgICAgICAgICAgbSgnI2xpZ2h0Ym94LnctbGlnaHRib3gtYmFja2Ryb3AnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWxpZ2h0Ym94LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWxpZ2h0Ym94LWNvbnRlbnQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctbGlnaHRib3gtdmlldycsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnLnctbGlnaHRib3gtZnJhbWUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdmaWd1cmUudy1saWdodGJveC1maWd1cmUnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnctbGlnaHRib3gtaW1nLnctbGlnaHRib3gtaW1hZ2Vbc3JjPVxcJ2RhdGE6aW1hZ2Uvc3ZnK3htbDtjaGFyc2V0PXV0Zi04LCUzQ3N2ZyUyMHhtbG5zPSUyMmh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJTIyJTIwd2lkdGg9JTIyOTQwJTIyJTIwaGVpZ2h0PSUyMjUyOCUyMi8lM0VcXCddJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbShgaWZyYW1lI3ZpZGVvLWxpZ2h0Ym94LmVtYmVkbHktZW1iZWQudy1saWdodGJveC1lbWJlZFthbGxvd2Z1bGxzY3JlZW49XFwnXFwnXVtmcmFtZWJvcmRlcj1cXCcwXFwnXVtoZWlnaHQ9XFwnNTI4XFwnXVtzY3JvbGxpbmc9XFwnbm9cXCddW3NyYz1cXCdodHRwczovL2Nkbi5lbWJlZGx5LmNvbS93aWRnZXRzL21lZGlhLmh0bWw/c3JjPWh0dHBzJTNBJTJGJTJGd3d3LnlvdXR1YmUuY29tJTJGZW1iZWQlMkZGbEZUY0RTS25MTSUzRmF1dG9wbGF5JTNEMSUyNmZlYXR1cmUlM0RvZW1iZWQmdXJsPSR7ZW5jb2RlVVJJKGFyZ3Muc3JjKX0maW1hZ2U9aHR0cHMlM0ElMkYlMkZpLnl0aW1nLmNvbSUyRnZpJTJGRmxGVGNEU0tuTE0lMkZocWRlZmF1bHQuanBnJmtleT1jNGU1NGRlY2NmNGQ0ZWM5OTdhNjQ5MDJlOWEzMDMwMCZhdXRvcGxheT0xJnR5cGU9dGV4dCUyRmh0bWwmc2NoZW1hPXlvdXR1YmVcXCddW3dpZHRoPVxcJzk0MFxcJ11gKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1zcGlubmVyLnctbGlnaHRib3gtaGlkZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWxpZ2h0Ym94LWNvbnRyb2wudy1saWdodGJveC1sZWZ0LnctbGlnaHRib3gtaW5hY3RpdmUnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKCcudy1saWdodGJveC1jb250cm9sLnctbGlnaHRib3gtcmlnaHQudy1saWdodGJveC1pbmFjdGl2ZScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oJyN5b3V0dWJlLWNsb3NlLnctbGlnaHRib3gtY29udHJvbC53LWxpZ2h0Ym94LWNsb3NlJywge29uY2xpY2s6IGN0cmwuc2hvd0xpZ2h0Ym94LnRvZ2dsZX0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWxpZ2h0Ym94LXN0cmlwJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKSA6ICcnXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5jb250cmlidXRpb25GaWx0ZXJWTSA9IChmdW5jdGlvbihtLCBoLCByZXBsYWNlRGlhY3JpdGljcykge1xuICAgIHZhciB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICBmdWxsX3RleHRfaW5kZXg6ICdAQCcsXG4gICAgICAgICAgICBzdGF0ZTogJ2VxJyxcbiAgICAgICAgICAgIGdhdGV3YXk6ICdlcScsXG4gICAgICAgICAgICB2YWx1ZTogJ2JldHdlZW4nLFxuICAgICAgICAgICAgY3JlYXRlZF9hdDogJ2JldHdlZW4nXG4gICAgICAgIH0pLFxuXG4gICAgICAgIHBhcmFtVG9TdHJpbmcgPSBmdW5jdGlvbihwKSB7XG4gICAgICAgICAgICByZXR1cm4gKHAgfHwgJycpLnRvU3RyaW5nKCkudHJpbSgpO1xuICAgICAgICB9O1xuXG4gICAgLy8gU2V0IGRlZmF1bHQgdmFsdWVzXG4gICAgdm0uc3RhdGUoJycpO1xuICAgIHZtLmdhdGV3YXkoJycpO1xuICAgIHZtLm9yZGVyKHtcbiAgICAgICAgaWQ6ICdkZXNjJ1xuICAgIH0pO1xuXG4gICAgdm0uY3JlYXRlZF9hdC5sdGUudG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uY3JlYXRlZF9hdC5sdGUoKSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXIgJiYgaC5tb21lbnRGcm9tU3RyaW5nKGZpbHRlcikuZW5kT2YoJ2RheScpLmZvcm1hdCgnJyk7XG4gICAgfTtcblxuICAgIHZtLmNyZWF0ZWRfYXQuZ3RlLnRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmNyZWF0ZWRfYXQuZ3RlKCkpO1xuICAgICAgICByZXR1cm4gZmlsdGVyICYmIGgubW9tZW50RnJvbVN0cmluZyhmaWx0ZXIpLmZvcm1hdCgpO1xuICAgIH07XG5cbiAgICB2bS5mdWxsX3RleHRfaW5kZXgudG9GaWx0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGZpbHRlciA9IHBhcmFtVG9TdHJpbmcodm0uZnVsbF90ZXh0X2luZGV4KCkpO1xuICAgICAgICByZXR1cm4gZmlsdGVyICYmIHJlcGxhY2VEaWFjcml0aWNzKGZpbHRlcikgfHwgdW5kZWZpbmVkO1xuICAgIH07XG5cbiAgICByZXR1cm4gdm07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cucmVwbGFjZURpYWNyaXRpY3MpKTtcbiIsIndpbmRvdy5jLmFkbWluLmNvbnRyaWJ1dGlvbkxpc3RWTSA9IChmdW5jdGlvbihtLCBtb2RlbHMpIHtcbiAgICByZXR1cm4gbS5wb3N0Z3Jlc3QucGFnaW5hdGlvblZNKG1vZGVscy5jb250cmlidXRpb25EZXRhaWwsICdpZC5kZXNjJywgeydQcmVmZXInOiAnY291bnQ9ZXhhY3QnfSk7XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLmFkbWluLnVzZXJGaWx0ZXJWTSA9IChmdW5jdGlvbihtLCByZXBsYWNlRGlhY3JpdGljcykge1xuICAgIHZhciB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgICAgICAgICBmdWxsX3RleHRfaW5kZXg6ICdAQCcsXG4gICAgICAgICAgICBkZWFjdGl2YXRlZF9hdDogJ2lzLm51bGwnXG4gICAgICAgIH0pLFxuXG4gICAgICAgIHBhcmFtVG9TdHJpbmcgPSBmdW5jdGlvbihwKSB7XG4gICAgICAgICAgICByZXR1cm4gKHAgfHwgJycpLnRvU3RyaW5nKCkudHJpbSgpO1xuICAgICAgICB9O1xuXG4gICAgLy8gU2V0IGRlZmF1bHQgdmFsdWVzXG4gICAgdm0uZGVhY3RpdmF0ZWRfYXQobnVsbCkub3JkZXIoe1xuICAgICAgICBpZDogJ2Rlc2MnXG4gICAgfSk7XG5cbiAgICB2bS5kZWFjdGl2YXRlZF9hdC50b0ZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZmlsdGVyID0gSlNPTi5wYXJzZSh2bS5kZWFjdGl2YXRlZF9hdCgpKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlcjtcbiAgICB9O1xuXG4gICAgdm0uZnVsbF90ZXh0X2luZGV4LnRvRmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmZ1bGxfdGV4dF9pbmRleCgpKTtcbiAgICAgICAgcmV0dXJuIGZpbHRlciAmJiByZXBsYWNlRGlhY3JpdGljcyhmaWx0ZXIpIHx8IHVuZGVmaW5lZDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHZtO1xufSh3aW5kb3cubSwgd2luZG93LnJlcGxhY2VEaWFjcml0aWNzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi51c2VyTGlzdFZNID0gKGZ1bmN0aW9uKG0sIG1vZGVscykge1xuICAgIHJldHVybiBtLnBvc3RncmVzdC5wYWdpbmF0aW9uVk0obW9kZWxzLnVzZXIsICdpZC5kZXNjJywgeydQcmVmZXInOiAnY291bnQ9ZXhhY3QnfSk7XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMpKTtcbiIsIndpbmRvdy5jLmFkbWluLkNvbnRyaWJ1dGlvbnMgPSAoZnVuY3Rpb24obSwgYywgaCkge1xuICAgIHZhciBhZG1pbiA9IGMuYWRtaW47XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbGlzdFZNID0gYWRtaW4uY29udHJpYnV0aW9uTGlzdFZNLFxuICAgICAgICAgICAgICAgIGZpbHRlclZNID0gYWRtaW4uY29udHJpYnV0aW9uRmlsdGVyVk0sXG4gICAgICAgICAgICAgICAgZXJyb3IgPSBtLnByb3AoJycpLFxuICAgICAgICAgICAgICAgIGZpbHRlckJ1aWxkZXIgPSBbeyAvL2Z1bGxfdGV4dF9pbmRleFxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJNYWluJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmZ1bGxfdGV4dF9pbmRleCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnQnVzcXVlIHBvciBwcm9qZXRvLCBlbWFpbCwgSWRzIGRvIHVzdcOhcmlvIGUgZG8gYXBvaW8uLi4nXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB7IC8vc3RhdGVcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyRHJvcGRvd24nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0NvbSBvIGVzdGFkbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnc3RhdGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLnN0YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnUXVhbHF1ZXIgdW0nXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdwYWlkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdwYWlkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAncmVmdXNlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAncmVmdXNlZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ3BlbmRpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ3BlbmRpbmcnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdwZW5kaW5nX3JlZnVuZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAncGVuZGluZ19yZWZ1bmQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdyZWZ1bmRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAncmVmdW5kZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdjaGFyZ2ViYWNrJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdjaGFyZ2ViYWNrJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnZGVsZXRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnZGVsZXRlZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB7IC8vZ2F0ZXdheVxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEcm9wZG93bicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnZ2F0ZXdheScsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZ2F0ZXdheScsXG4gICAgICAgICAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uZ2F0ZXdheSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ1F1YWxxdWVyIHVtJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnUGFnYXJtZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uOiAnUGFnYXJtZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ01vSVAnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ01vSVAnXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdQYXlQYWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ1BheVBhbCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ0NyZWRpdHMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ0Nyw6lkaXRvcydcbiAgICAgICAgICAgICAgICAgICAgICAgIH1dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB7IC8vdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyTnVtYmVyUmFuZ2UnLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ1ZhbG9yZXMgZW50cmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3Q6IGZpbHRlclZNLnZhbHVlLmd0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Q6IGZpbHRlclZNLnZhbHVlLmx0ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgeyAvL2NyZWF0ZWRfYXRcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50OiAnRmlsdGVyRGF0ZVJhbmdlJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdQZXLDrW9kbyBkbyBhcG9pbycsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdDogZmlsdGVyVk0uY3JlYXRlZF9hdC5ndGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0OiBmaWx0ZXJWTS5jcmVhdGVkX2F0Lmx0ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgbGlzdFZNLmZpcnN0UGFnZShmaWx0ZXJWTS5wYXJhbWV0ZXJzKCkpLnRoZW4obnVsbCwgZnVuY3Rpb24oc2VydmVyRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKHNlcnZlckVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZmlsdGVyVk06IGZpbHRlclZNLFxuICAgICAgICAgICAgICAgIGZpbHRlckJ1aWxkZXI6IGZpbHRlckJ1aWxkZXIsXG4gICAgICAgICAgICAgICAgbGlzdFZNOiB7XG4gICAgICAgICAgICAgICAgICAgIGxpc3Q6IGxpc3RWTSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQXBvaW9zJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3VibWl0OiBzdWJtaXRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluRmlsdGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm06IGN0cmwuZmlsdGVyVk0uZm9ybURlc2NyaWJlcixcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlcjogY3RybC5maWx0ZXJCdWlsZGVyLFxuICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbkxpc3QsIHtcbiAgICAgICAgICAgICAgICAgICAgdm06IGN0cmwubGlzdFZNLFxuICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbTogYy5BZG1pbkNvbnRyaWJ1dGlvbkl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIGxpc3REZXRhaWw6IGMuQWRtaW5Db250cmlidXRpb25EZXRhaWxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfVxuICAgIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYywgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuYWRtaW4uVXNlcnMgPSAoZnVuY3Rpb24obSwgYywgaCkge1xuICAgIHZhciBhZG1pbiA9IGMuYWRtaW47XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbGlzdFZNID0gYWRtaW4udXNlckxpc3RWTSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTSA9IGFkbWluLnVzZXJGaWx0ZXJWTSxcbiAgICAgICAgICAgICAgICBlcnJvciA9IG0ucHJvcCgnJyksXG4gICAgICAgICAgICAgICAgaXRlbUJ1aWxkZXIgPSBbe1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pblVzZXInLFxuICAgICAgICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICBmaWx0ZXJCdWlsZGVyID0gW3sgLy9uYW1lXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uZnVsbF90ZXh0X2luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdCdXNxdWUgcG9yIG5vbWUsIGUtbWFpbCwgSWRzIGRvIHVzdcOhcmlvLi4uJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LCB7IC8vc3RhdHVzXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlckRyb3Bkb3duJyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdDb20gbyBlc3RhZG8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXg6ICdzdGF0dXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2RlYWN0aXZhdGVkX2F0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5kZWFjdGl2YXRlZF9hdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ1F1YWxxdWVyIHVtJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbjogJ2F0aXZvJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAhbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb246ICdkZXNhdGl2YWRvJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfV1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgIHN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkudGhlbihudWxsLCBmdW5jdGlvbihzZXJ2ZXJFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3Ioc2VydmVyRXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJWTTogZmlsdGVyVk0sXG4gICAgICAgICAgICAgICAgZmlsdGVyQnVpbGRlcjogZmlsdGVyQnVpbGRlcixcbiAgICAgICAgICAgICAgICBsaXN0Vk06IHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdDogbGlzdFZNLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3JcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHN1Ym1pdDogc3VibWl0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgICAgICAgIGNvbnN0IGxhYmVsID0gJ1VzdcOhcmlvcyc7XG5cbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbkZpbHRlciwge1xuICAgICAgICAgICAgICAgICAgICBmb3JtOiBjdHJsLmZpbHRlclZNLmZvcm1EZXNjcmliZXIsXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlckJ1aWxkZXI6IGN0cmwuZmlsdGVyQnVpbGRlcixcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICAgICAgICAgICAgICBzdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pbkxpc3QsIHtcbiAgICAgICAgICAgICAgICAgICAgdm06IGN0cmwubGlzdFZNLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgIGxpc3RJdGVtOiBjLkFkbWluVXNlckl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIGxpc3REZXRhaWw6IGMuQWRtaW5Vc2VyRGV0YWlsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cbiAgICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
