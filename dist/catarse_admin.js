/*
    A Mithril.js plugin to authenticate requests against PostgREST
    Copyright (c) 2007 - 2015 Diogo Biazus
    Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
    Version: 1.0.0
*/
var adminApp = window.adminApp = {};

adminApp.models = {}, adminApp.submodule = function(module, args) {
    return module.view.bind(this, new module.controller(args));
};

var ContributionDetail = function(data) {
    data = data || {}, this.id = m.prop(data.id), this.contribution_id = m.prop(data.contribution_id), 
    this.user_id = m.prop(data.user_id), this.project_id = m.prop(data.project_id), 
    this.reward_id = m.prop(data.reward_id), this.payment_id = m.prop(data.payment_id), 
    this.permalink = m.prop(data.permalink), this.project_name = m.prop(data.project_name), 
    this.user_name = m.prop(data.user_name), this.email = m.prop(data.email), this.uploaded_image = m.prop(data.uploaded_image), 
    this.key = m.prop(data.key), this.value = m.prop(data.value), this.installments = m.prop(data.installments), 
    this.installment_value = m.prop(data.installment_value), this.state = m.prop(data.state), 
    this.anonymous = m.prop(data.anonymous), this.payer_email = m.prop(data.payer_email), 
    this.gateway = m.prop(data.gateway), this.gateway_id = m.prop(data.gateway_id), 
    this.gateway_fee = m.prop(data.gateway_fee), this.gateway_data = m.prop(data.gateway_data), 
    this.payment_method = m.prop(data.payment_method), this.project_state = m.prop(data.project_state), 
    this.has_rewards = m.prop(data.has_rewards), this.pending_at = m.prop(data.pending_at), 
    this.paid_at = m.prop(data.paid_at), this.refused_at = m.prop(data.refused_at), 
    this.pending_refund_at = m.prop(data.pending_refund_at), this.refunded_at = m.prop(data.refunded_at), 
    this.created_at = m.prop(data.created_at);
};

ContributionDetail.get = function(filters, page) {
    var toRange = function() {
        var pageSize = 10;
        return page * pageSize + "-" + (page * pageSize + pageSize);
    }, xhrConfig = function(xhr) {
        xhr.setRequestHeader("Range-unit", "items"), xhr.setRequestHeader("Range", toRange());
    };
    return filters = filters || {}, m.postgrest.requestWithToken({
        method: "GET",
        url: "/contribution_details",
        config: xhrConfig
    });
}, adminApp.models.ContributionDetail = ContributionDetail, adminApp.AdminContributions = {
    controller: function() {
        var vm = this.vm = adminApp.AdminContributions.VM;
        this.filterContributions = function(filters) {
            vm.filter(filters);
        }, vm.fetch();
    },
    view: function(ctrl) {
        return [ m.component(adminApp.AdminContributionsFilter, {
            onFilter: ctrl.filterContributions
        }), m(".w-section.section", [ m.component(adminApp.AdminContributionsList, {
            contributions: ctrl.vm.contributions
        }) ]), m(".w-section.section", [ m(".w-container", [ m(".w-row", [ m(".w-col.w-col-5"), m(".w-col.w-col-2", [ ctrl.vm.isLoading() ? m("img[alt='Loader'][src='/assets/catarse_bootstrap/loader-eff2ad1eeb09a19c9afb5b143e1dd62b.gif']") : m("button#load-more.btn.btn-medium.btn-terciary", {
            onclick: ctrl.vm.nextPage
        }, "Carregar mais") ]), m(".w-col.w-col-5") ]) ]) ]) ];
    }
}, adminApp.AdminContributionsFilter = {
    controller: function(args) {
        var vm = this.vm = adminApp.AdminContributionsFilter.VM;
        this.filter = function() {
            args.onFilter(vm.filter());
        };
    },
    view: function(ctrl, args) {
        return m("#admin-contributions-filter.w-section.page-header", [ m(".w-container", [ m(".fontsize-larger.u-text-center.u-marginbottom-30", "Apoios"), m(".w-form", [ m("form[data-name='Email Form'][id='email-form'][name='email-form']", [ m(".w-row.u-marginbottom-20", [ m(".w-col.w-col-2", [ m("label.fontsize-small[for='permalink']", "Permalink"), m("input.w-input.text-field.positive[id='permalink'][name='permalink'][placeholder='permalink do projeto'][required='required'][type='text']", {
            onchange: m.withAttr("value", ctrl.vm.permalink),
            value: ctrl.vm.permalink()
        }) ]), m(".w-col.w-col-4", [ m("label.fontsize-small[for='expiration']", "Expiram entre"), m("input.w-input.text-field.positive[data-name='Field 2'][id='expiration'][name='expiration'][placeholder='Expiram entre'][required='required'][type='text']") ]), m(".w-col.w-col-2", [ m("label.fontsize-small[for='progress']", "Por progresso %"), m("input.w-input.text-field.positive[data-name='Field 2'][id='progress'][name='progress'][placeholder='Progresso em %'][required='required'][type='text']") ]), m(".w-col.w-col-2", [ m("label.fontsize-small[for='field-3']", "Com o estado"), m("select.w-select.text-field.positive[id='field-3'][name='field-3']", [ m("option[value='']", "Select one..."), "\n", m("option[value='First']", "First Choice"), "\n", m("option[value='Second']", "Second Choice"), "\n", m("option[value='Third']", "Third Choice") ]) ]), m(".w-col.w-col-2", [ m("label.fontsize-small[for='field-3']", "Meio de pag."), m("select.w-select.text-field.positive[id='field-3'][name='field-3']", [ m("option[value='']", "Select one..."), "\n", m("option[value='First']", "First Choice"), "\n", m("option[value='Second']", "Second Choice"), "\n", m("option[value='Third']", "Third Choice") ]) ]) ]) ]), m(".w-form-done", [ m("p", "Thank you! Your submission has been received!") ]), m(".w-form-fail", [ m("p", "Oops! Something went wrong while submitting the form :(") ]) ]), m(".w-row", [ m(".w-col.w-col-4"), m(".w-col.w-col-4", [ m("button#filter-btn.btn.btn-small", {
            onclick: ctrl.filter
        }, "Filtrar") ]), m(".w-col.w-col-4") ]) ]) ]);
    }
}, adminApp.AdminContributionsFilter.VM = function() {
    function filter() {
        var filter = {
            permalink: permalink()
        };
        return filter;
    }
    var permalink = m.prop("");
    return {
        permalink: permalink,
        filter: filter
    };
}(), adminApp.AdminContributionsList = {
    view: function(ctrl, args) {
        return m("#admin-contributions-list.w-container", [ m(".u-marginbottom-30.fontsize-base", [ m("span.fontweight-semibold", "125"), " apoios encontrados, totalizando ", m("span.fontweight-semibold", [ "R$27.090.655,00     ", m("a.fa.fa-download.fontcolor-dashboard[href='#']", ".") ]) ]), args.contributions().map(function(contribution) {
            return m.component(adminApp.AdminContributionsListDetail, {
                contribution: contribution,
                key: contribution
            });
        }) ]);
    }
}, adminApp.AdminContributionsListDetail = {
    controller: function(args) {
        this.contribution = args.contribution;
    },
    view: function(ctrl, args) {
        var contrib = ctrl.contribution;
        return m(".w-clearfix.card.u-radius.u-marginbottom-20.results-admin-contributions", [ m(".w-row", [ m(".w-col.w-col-4", [ m(".w-row", [ m(".w-col.w-col-3.w-col-small-3.u-marginbottom-10", [ m("img.user-avatar[src='https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/5409e86a50c3bd3f1b90aec7_user-avatar.jpeg']") ]), m(".w-col.w-col-9.w-col-small-9", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10", contrib.user_name), m(".fontsize-smallest", "Usuário: " + contrib.user_id), m(".fontsize-smallest.fontcolor-secondary", contrib.email), m(".fontsize-smallest.fontcolor-secondary", contrib.payer_email) ]) ]) ]), m(".w-col.w-col-4", [ m(".w-row", [ m(".w-col.w-col-3.w-col-small-3.u-marginbottom-10", [ m("img.thumb-project.u-radius[src='https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/5485dfa838fa8324238733f7_project_thumb_10304019_328175090684874_7563008857993874086_n.png'][width='50']") ]), m(".w-col.w-col-9.w-col-small-9", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10", contrib.project_name), m(".fontsize-smallest.fontweight-semibold", contrib.project_state), m(".fontsize-smallest.fontcolor-secondary", "13/01/2015 a 13/05/2015") ]) ]) ]), m(".w-col.w-col-2", [ m(".fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small", "R$" + contrib.value), m(".fontsize-smallest.fontcolor-secondary", contrib.paid_at), m(".fontsize-smallest", "Id: " + contrib.payment_id), m(".fontsize-smallest", "Apoio: " + contrib.key) ]), m(".w-col.w-col-2", [ m(".fontsize-smallest.lineheight-looser.fontweight-semibold", [ m("span.fa.fa-circle.text-success", "."), " " + contrib.state ]), m(".fontsize-smallest.fontweight-semibold", [ m("span.fa.fa-barcode", "."), " ", m("a.link-hidden[href='#']", contrib.payment_method) ]), m(".fontsize-smallest.fontcolor-secondary.lineheight-tight", [ "      ", m("span.badge", "2a via") ]) ]) ]), m("a.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary[data-ix='show-admin-cont-result'][href='#']"), m(".divider.u-margintop-20.u-marginbottom-20"), m(".w-row.u-marginbottom-30", [ m(".w-col.w-col-2", [ m("a.btn.btn-small.btn-terciary[data-ix='show-dropdown'][href='#']", {
            style: {
                transition: " all 0.5s ease 0s",
                " -webkit-transition": " all 0.5s ease 0s"
            }
        }, "Pedir reembolso"), m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10[data-ix='display-none-on-load'][id='transfer']", {
            style: {
                display: " none"
            }
        }, [ m(".fontsize-smaller.fontweight-semibold.u-text-center.u-marginbottom-20", "Quer efetuar o reembolso?"), m("a.btn.btn-small[href='#']", "Solicitar reembolso") ]) ]), m(".w-col.w-col-2", [ m("a.btn.btn-small.btn-terciary[data-ix='show-dropdown'][href='#']", {
            style: {
                transition: " all 0.5s ease 0s",
                " -webkit-transition": " all 0.5s ease 0s"
            }
        }, "Estornar"), m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10[data-ix='display-none-on-load'][id='transfer']", {
            style: {
                display: " none"
            }
        }, [ m(".fontsize-smaller.fontweight-semibold.u-text-center.u-marginbottom-20", "Quer efetuar o estorno?"), m("a.btn.btn-small[href='#']", "Solicitar estorno") ]) ]), m(".w-col.w-col-2", [ m("a.btn.btn-small.btn-terciary.btn-desactivated[href='#']", "2a via") ]), m(".w-col.w-col-2", [ m("a.btn.btn-small.btn-terciary[data-ix='show-dropdown'][href='#']", {
            style: {
                transition: " all 0.5s ease 0s",
                " -webkit-transition": " all 0.5s ease 0s"
            }
        }, "Transferir apoio"), m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10[data-ix='display-none-on-load'][id='transfer']", {
            style: {
                display: " none"
            }
        }, [ m(".w-form", [ m("form[data-name='Email Form 4'][id='email-form-4'][name='email-form-4']", [ m("label[for='name-2']", "Id do novo apoiador:"), m("input.w-input.text-field[data-name='Name 2'][id='name-2'][name='name'][placeholder='ex: 129908'][type='text']"), m("input.w-button.btn.btn-small[data-wait='Please wait...'][type='submit'][value='Transferir']") ]), m(".w-form-done", [ m("p", "Thank you! Your submission has been received!") ]), m(".w-form-fail", [ m("p", "Oops! Something went wrong while submitting the form") ]) ]) ]) ]), m(".w-col.w-col-2", [ m("a.btn.btn-small.btn-terciary[data-ix='show-dropdown'][href='#']", {
            style: {
                transition: " all 0.5s ease 0s",
                " -webkit-transition": " all 0.5s ease 0s"
            }
        }, "Trocar recompensa"), m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10[data-ix='display-none-on-load'][id='transfer']", {
            style: {
                display: " none"
            }
        }, [ m(".w-form", [ m("form[data-name='Email Form 4'][id='email-form-4'][name='email-form-4']", [ m(".w-radio", [ m("input.w-radio-input[data-name='Radio'][id='radio'][name='radio'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]) ]), m(".w-form-done", [ m("p", "Thank you! Your submission has been received!") ]), m(".w-form-fail", [ m("p", "Oops! Something went wrong while submitting the form") ]) ]) ]) ]), m(".w-col.w-col-2", [ m("a.btn.btn-small.btn-terciary[data-ix='show-dropdown'][href='#']", {
            style: {
                transition: " all 0.5s ease 0s",
                " -webkit-transition": " all 0.5s ease 0s"
            }
        }, "Anonimato"), m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10[data-ix='display-none-on-load'][id='transfer']", {
            style: {
                display: " none"
            }
        }, [ m(".w-form", [ m("form[data-name='Email Form 4'][id='email-form-4'][name='email-form-4']", [ m(".w-radio", [ m("input.w-radio-input[data-name='Radio'][id='radio'][name='radio'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "Anônimo") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "Público") ]) ]), m(".w-form-done", [ m("p", "Thank you! Your submission has been received!") ]), m(".w-form-fail", [ m("p", "Oops! Something went wrong while submitting the form") ]) ]) ]) ]) ]), m(".w-row.card.card-terciary.u-radius", [ m(".w-col.w-col-4", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Detalhes do apoio"), m(".fontsize-smallest.lineheight-looser", [ "Valor: R$80\n", m("br"), "Taxa: R$3,35\n", m("br"), "Recompensa: R$80\n", m("br"), "Anônimo: Não\n", m("br"), "Id pagamento: 638912", m("br"), "Apoio: 54545454", m("br"), "Chave: \n", m("br"), "7809d09d-6325-442e-876e-b9a0846c526f\n", m("br"), "Meio: Pagarme\n", m("br"), "Operadora: STONE", m("br"), m("a.link-hidden[href='#']", "Boleto bancário"), " ", m("span.badge", "2a via") ]) ]), m(".w-col.w-col-4", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Histórico da transação"), m(".w-row.fontsize-smallest.lineheight-looser", [ m(".w-col.w-col-6", [ m(".fontcolor-secondary", "19/05/2015, 01:20 h") ]), m(".w-col.w-col-6", [ m("div", "Apoio criado") ]) ]), m(".w-row.fontsize-smallest.lineheight-looser", [ m(".w-col.w-col-6", [ m(".fontcolor-secondary", "19/05/2015, 01:20 h") ]), m(".w-col.w-col-6", [ m("div", "Apoio criado") ]) ]), m(".w-row.fontsize-smallest.lineheight-looser", [ m(".w-col.w-col-6", [ m(".fontcolor-secondary", "19/05/2015, 01:20 h") ]), m(".w-col.w-col-6", [ m("div", [ m("span.badge.badge-attention.fontsize-smallest", "Estorno realizado") ]) ]) ]), m(".w-row.fontsize-smallest.lineheight-looser", [ m(".w-col.w-col-6", [ m(".fontcolor-secondary", "19/05/2015, 01:20 h") ]), m(".w-col.w-col-6", [ m("div", "Apoio criado") ]) ]), m(".w-row.fontsize-smallest.lineheight-looser", [ m(".w-col.w-col-6", [ m(".fontcolor-secondary", "19/05/2015, 01:20 h") ]), m(".w-col.w-col-6", [ m("div", "Apoio criado") ]) ]), m(".w-row.fontsize-smallest.lineheight-looser", [ m(".w-col.w-col-6", [ m(".fontcolor-secondary", "19/05/2015, 01:20 h") ]), m(".w-col.w-col-6", [ m("div", "Apoio criado"), m(".fontsize-smallest.lineheight-tighter", [ m("span.badge", "Luis Otavio Ribeiro") ]) ]) ]) ]), m(".w-col.w-col-4") ]) ]);
    }
}, adminApp.AdminContributions.VM = function() {
    var contributions = m.prop({}), filters = m.prop({}), isLoading = m.prop(!1), page = m.prop(1), fetch = function() {
        var d = m.deferred();
        return isLoading(!0), m.redraw(), adminApp.models.ContributionDetail.get(filters(), page()).then(function(data) {
            contributions(_.union(contributions(), data)), isLoading(!1), d.resolve(contributions()), 
            m.redraw();
        }), d.promise;
    }, filter = function(input) {
        return filters(input), page(1), fetch();
    }, nextPage = function() {
        return page(page() + 1), fetch();
    };
    return {
        contributions: contributions,
        fetch: fetch,
        filter: filter,
        isLoading: isLoading,
        nextPage: nextPage
    };
}();