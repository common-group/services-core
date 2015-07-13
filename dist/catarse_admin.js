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

var momentify = function(date, format) {
    return format = format || "DD/MM/YYYY", date ? moment(new Date(date)).format(format) : "no date";
}, ContributionDetail = m.postgrest.model("contribution_details", [ "id", "contribution_id", "user_id", "project_id", "reward_id", "payment_id", "permalink", "project_name", "project_img", "user_name", "user_profile_img", "email", "key", "value", "installments", "installment_value", "state", "anonymous", "payer_email", "gateway", "gateway_id", "gateway_fee", "gateway_data", "payment_method", "project_state", "has_rewards", "pending_at", "paid_at", "refused_at", "pending_refund_at", "refunded_at", "created_at" ]);

adminApp.models.ContributionDetail = ContributionDetail, adminApp.AdminContributions = {
    controller: function() {
        var vm = this.vm = adminApp.AdminContributions.VM;
        this.filterContributions = function(filters) {
            vm.filter(filters);
        };
    },
    view: function(ctrl) {
        return [ m.component(adminApp.AdminContributionsFilter, {
            onFilter: ctrl.filterContributions
        }), m(".w-section.section", [ m(".w-container", [ m(".w-row.u-marginbottom-20", [ m(".w-col.w-col-9", [ m(".fontsize-base", [ m("span.fontweight-semibold", ctrl.vm.total()), " apoios encontrados" ]) ]) ]), m.component(adminApp.AdminContributionsList, {
            contributions: ctrl.vm.collection
        }) ]) ]), m(".w-section.section", [ m(".w-container", [ m(".w-row", [ m(".w-col.w-col-5"), m(".w-col.w-col-2", [ ctrl.vm.isLoading() ? m("img[alt='Loader'][src='/assets/catarse_bootstrap/loader-eff2ad1eeb09a19c9afb5b143e1dd62b.gif']") : m("button#load-more.btn.btn-medium.btn-terciary", {
            onclick: ctrl.vm.nextPage
        }, "Carregar mais") ]), m(".w-col.w-col-5") ]) ]) ]) ];
    }
}, adminApp.AdminContributionsFilter = {
    controller: function(args) {
        var vm = this.vm = adminApp.AdminContributionsFilter.VM;
        this.filter = function() {
            return args.onFilter(vm.parameters()), !1;
        }, this.toggleSearch = function() {
            var advancedSearch = document.getElementById("advanced-search");
            "70px" == advancedSearch.style.height ? advancedSearch.style.height = "0px" : advancedSearch.style.height = "70px";
        }, args && this.filter();
    },
    view: function(ctrl, args) {
        return m("#admin-contributions-filter.w-section.page-header", [ m(".w-container", [ m(".fontsize-larger.u-text-center.u-marginbottom-30", "Apoios"), m(".w-form", [ m("form[data-name='Email Form'][id='email-form'][name='email-form']", {
            onsubmit: ctrl.filter
        }, [ m(".w-row.u-marginbottom-20", [ m(".w-col.w-col-10", [ m("input.w-input.text-field.positive.medium[id='field'][name='field'][placeholder='Busque por projeto, email, Ids do usuário e do apoio...'][type='text']", {
            onchange: m.withAttr("value", ctrl.vm.full_text_index),
            value: ctrl.vm.full_text_index()
        }), m("a.fontsize-smallest.link-hidden-light[data-ix='admin-filter'][href='#']", {
            onclick: ctrl.toggleSearch
        }, "Filtros avançados  >") ]), m(".w-col.w-col-2", [ m("input#filter-btn.btn.btn-large.u-marginbottom-10[type='submit'][href='#'][value='Buscar']") ]) ]), m("#advanced-search.w-row.admin-filters", {
            style: {
                transition: "height .1s ease-out",
                overflow: "hidden",
                height: " 0px"
            }
        }, [ m(".w-col.w-col-3.w-col-small-6", [ m("label.fontsize-smaller[for='field-3']", "Com o estado"), m("select.w-select.text-field.positive[id='field-3'][name='field-3']", {
            onchange: m.withAttr("value", ctrl.vm.state),
            value: ctrl.vm.state()
        }, [ m("option[value='']", "Qualquer um"), m("option[value='pending']", "pending"), m("option[value='refused']", "refused"), m("option[value='paid']", "paid"), m("option[value='pending_refund']", "pending_refund"), m("option[value='refunded']", "refunded"), m("option[value='chargeback']", "chargeback"), m("option[value='deleted']", "deleted") ]) ]), m(".w-col.w-col-3.w-col-small-6", [ m("label.fontsize-smaller[for='field-8']", "Gateway"), m("select.w-select.text-field.positive[data-name='Field 8'][id='field-8'][name='field-8']", {
            onchange: m.withAttr("value", ctrl.vm.gateway),
            value: ctrl.vm.gateway()
        }, [ m("option[value='']", "Qualquer um"), m("option[value='Pagarme']", "Pagarme"), m("option[value='MoIP']", "MoIP"), m("option[value='PayPal']", "PayPal"), m("option[value='Credits']", "Créditos") ]) ]), m(".w-col.w-col-3.w-col-small-6", [ m("label.fontsize-smaller[for='field-6']", "Valores entre"), m(".w-row", [ m(".w-col.w-col-5.w-col-small-5.w-col-tiny-5", [ m("input.w-input.text-field.positive[data-name='Field 5'][id='field-5'][name='field-5'][type='text']", {
            onchange: m.withAttr("value", ctrl.vm.value.gte),
            value: ctrl.vm.value.gte()
        }) ]), m(".w-col.w-col-2.w-col-small-2.w-col-tiny-2", [ m(".fontsize-smaller.u-text-center.lineheight-looser", "e") ]), m(".w-col.w-col-5.w-col-small-5.w-col-tiny-5", [ m("input.w-input.text-field.positive[data-name='Field 5'][id='field-5'][name='field-5'][type='text']", {
            onchange: m.withAttr("value", ctrl.vm.value.lte),
            value: ctrl.vm.value.lte()
        }) ]) ]) ]), m(".w-col.w-col-3.w-col-small-6", [ m("label.fontsize-smaller[for='field-7']", "Período do apoio"), m(".w-row", [ m(".w-col.w-col-5.w-col-small-5.w-col-tiny-5", [ m("input.w-input.text-field.positive[data-name='Field 5'][id='field-5'][name='field-5'][type='text']", {
            onchange: m.withAttr("value", ctrl.vm.created_at.gte),
            value: ctrl.vm.created_at.gte()
        }) ]), m(".w-col.w-col-2.w-col-small-2.w-col-tiny-2", [ m(".fontsize-smaller.u-text-center.lineheight-looser", "e") ]), m(".w-col.w-col-5.w-col-small-5.w-col-tiny-5", [ m("input.w-input.text-field.positive[data-name='Field 5'][id='field-5'][name='field-5'][type='text']", {
            onchange: m.withAttr("value", ctrl.vm.created_at.lte),
            value: ctrl.vm.created_at.lte()
        }) ]) ]) ]) ]) ]) ]) ]) ]);
    }
};

var vm = adminApp.AdminContributionsFilter.VM = m.postgrest.filtersVM({
    full_text_index: "@@",
    state: "eq",
    gateway: "eq",
    value: "between",
    created_at: "between"
});

vm.state(""), vm.gateway("Pagarme"), adminApp.AdminContributionsList = {
    view: function(ctrl, args) {
        return m("#admin-contributions-list.w-container", [ args.contributions().map(function(contribution) {
            return m.component(adminApp.AdminContributionsListDetail, {
                contribution: contribution,
                key: contribution
            });
        }) ]);
    }
}, adminApp.AdminContributionsListDetail = {
    controller: function(args) {
        this.contribution = args.contribution, this.contribution.user_profile_img = this.contribution.user_profile_img || "/assets/catarse_bootstrap/user.jpg", 
        this.CSSsuccess = ".text-success", this.CSSwaiting = ".text-waiting", this.CSSerror = ".text-error", 
        this.paymentDetails = function() {
            switch (this.contribution.gateway = this.contribution.gateway.toLowerCase(), this.contribution.gateway) {
              case "moip":
                return this.contribution.card_first_digits = this.contribution.gateway_data.cartao_bin, 
                this.contribution.card_last_digits = this.contribution.gateway_data.cartao_final, 
                this.contribution.card_brand = this.contribution.gateway_data.cartao_bandeira, this.contribution.installments = this.contribution.gateway_data.parcelas, 
                !0;

              case "pagarme":
                return this.contribution.card_first_digits = this.contribution.gateway_data.card_first_digits, 
                this.contribution.card_last_digits = this.contribution.gateway_data.card_last_digits, 
                this.contribution.card_brand = this.contribution.gateway_data.card_brand, this.contribution.installments = this.contribution.gateway_data.installments, 
                !0;

              default:
                return !1;
            }
        }, this.stateClass = function() {
            switch (this.contribution.state) {
              case "paid":
                return this.CSSsuccess;

              case "refunded":
                return this.CSSsuccess;

              case "pending":
                return this.CSSwaiting;

              default:
                return this.CSSerror;
            }
        }, this.paymentMethodClass = function() {
            switch (this.contribution.payment_method) {
              case "BoletoBancario":
                return ".fa-barcode";

              case "CartaoDeCredito":
                return ".fa-credit-card";

              default:
                return ".fa-question";
            }
        };
    },
    view: function(ctrl, args) {
        var contribution = ctrl.contribution;
        return m(".w-clearfix.card.u-radius.u-marginbottom-20.results-admin-contributions", [ m(".w-row", [ m(".w-col.w-col-4", [ m(".w-row", [ m(".w-col.w-col-3.w-col-small-3.u-marginbottom-10", [ m("img.user-avatar[src='" + contribution.user_profile_img + "']") ]), m(".w-col.w-col-9.w-col-small-9", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10", contribution.user_name), m(".fontsize-smallest", "Usuário: " + contribution.user_id), m(".fontsize-smallest.fontcolor-secondary", contribution.email), m(".fontsize-smallest.fontcolor-secondary", contribution.payer_email) ]) ]) ]), m(".w-col.w-col-4", [ m(".w-row", [ m(".w-col.w-col-3.w-col-small-3.u-marginbottom-10", [ m("img.thumb-project.u-radius[src=" + contribution.project_img + "][width=50]") ]), m(".w-col.w-col-9.w-col-small-9", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10", contribution.project_name), m(".fontsize-smallest.fontweight-semibold", contribution.project_state), m(".fontsize-smallest.fontcolor-secondary", momentify(contribution.project_starts_at) + " a " + momentify(contribution.project_ends_at)) ]) ]) ]), m(".w-col.w-col-2", [ m(".fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small", "R$" + contribution.value), m(".fontsize-smallest.fontcolor-secondary", momentify(contribution.paid_at, "DD/MM/YYYY hh:mm[h]")), m(".fontsize-smallest", "Id: " + contribution.payment_id) ]), m(".w-col.w-col-2", [ m(".fontsize-smallest.lineheight-looser.fontweight-semibold", [ m("span.fa.fa-circle" + ctrl.stateClass()), " " + contribution.state ]), m(".fontsize-smallest.fontweight-semibold", [ m("span.fa" + ctrl.paymentMethodClass()), " ", m("a.link-hidden[href='#']", contribution.payment_method) ]), ctrl.paymentDetails() ? m.component(adminApp.AdminContributionsListPaymentDetail, {
            contribution: contribution
        }) : "" ]) ]), m(".divider.u-margintop-20.u-marginbottom-20"), m(".w-row.u-marginbottom-30", [ m(".w-col.w-col-2", [ m("a.btn.btn-small.btn-terciary[data-ix='show-dropdown'][href='#']", {
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
        }, [ m(".w-form", [ m("form[data-name='Email Form 4'][id='email-form-4'][name='email-form-4']", [ m("label[for='name-2']", "Id do novo apoiador:"), m("input.w-input.text-field[data-name='Name 2'][id='name-2'][name='name'][placeholder='ex: 129908'][type='text']"), m("input.w-button.btn.btn-small[data-wait='Please wait...'][type='submit'][value='Transferir']") ]) ]) ]) ]), m(".w-col.w-col-2", [ m("a.btn.btn-small.btn-terciary[data-ix='show-dropdown'][href='#']", {
            style: {
                transition: " all 0.5s ease 0s",
                " -webkit-transition": " all 0.5s ease 0s"
            }
        }, "Trocar recompensa"), m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10[data-ix='display-none-on-load'][id='transfer']", {
            style: {
                display: " none"
            }
        }, [ m(".w-form", [ m("form[data-name='Email Form 4'][id='email-form-4'][name='email-form-4']", [ m(".w-radio", [ m("input.w-radio-input[data-name='Radio'][id='radio'][name='radio'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]) ]) ]) ]) ]), m(".w-col.w-col-2", [ m("a.btn.btn-small.btn-terciary[data-ix='show-dropdown'][href='#']", {
            style: {
                transition: " all 0.5s ease 0s",
                " -webkit-transition": " all 0.5s ease 0s"
            }
        }, "Anonimato"), m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10[data-ix='display-none-on-load'][id='transfer']", {
            style: {
                display: " none"
            }
        }, [ m(".w-form", [ m("form[data-name='Email Form 4'][id='email-form-4'][name='email-form-4']", [ m(".w-radio", [ m("input.w-radio-input[data-name='Radio'][id='radio'][name='radio'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "Anônimo") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "Público") ]) ]) ]) ]) ]) ]), m(".w-row.card.card-terciary.u-radius", [ m(".w-col.w-col-4", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Detalhes do apoio"), m(".fontsize-smallest.lineheight-looser", [ "Valor: R$80\n", m("br"), "Taxa: R$3,35\n", m("br"), "Recompensa: R$80\n", m("br"), "Anônimo: Não\n", m("br"), "Id pagamento: 638912", m("br"), "Apoio: 54545454", m("br"), "Chave: \n", m("br"), "7809d09d-6325-442e-876e-b9a0846c526f\n", m("br"), "Meio: Pagarme\n", m("br"), "Operadora: STONE", m("br"), m("a.link-hidden[href='#']", "Boleto bancário"), " ", m("span.badge", "2a via") ]) ]), m(".w-col.w-col-4", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Histórico da transação"), m(".w-row.fontsize-smallest.lineheight-looser", [ m(".w-col.w-col-6", [ m(".fontcolor-secondary", "19/05/2015, 01:20 h") ]), m(".w-col.w-col-6", [ m("div", "Apoio criado") ]) ]), m(".w-row.fontsize-smallest.lineheight-looser", [ m(".w-col.w-col-6", [ m(".fontcolor-secondary", "19/05/2015, 01:20 h") ]), m(".w-col.w-col-6", [ m("div", "Apoio criado") ]) ]), m(".w-row.fontsize-smallest.lineheight-looser", [ m(".w-col.w-col-6", [ m(".fontcolor-secondary", "19/05/2015, 01:20 h") ]), m(".w-col.w-col-6", [ m("div", [ m("span.badge.badge-attention.fontsize-smallest", "Estorno realizado") ]) ]) ]), m(".w-row.fontsize-smallest.lineheight-looser", [ m(".w-col.w-col-6", [ m(".fontcolor-secondary", "19/05/2015, 01:20 h") ]), m(".w-col.w-col-6", [ m("div", "Apoio criado") ]) ]), m(".w-row.fontsize-smallest.lineheight-looser", [ m(".w-col.w-col-6", [ m(".fontcolor-secondary", "19/05/2015, 01:20 h") ]), m(".w-col.w-col-6", [ m("div", "Apoio criado") ]) ]), m(".w-row.fontsize-smallest.lineheight-looser", [ m(".w-col.w-col-6", [ m(".fontcolor-secondary", "19/05/2015, 01:20 h") ]), m(".w-col.w-col-6", [ m("div", "Apoio criado"), m(".fontsize-smallest.lineheight-tighter", [ m("span.badge", "Luis Otavio Ribeiro") ]) ]) ]) ]), m(".w-col.w-col-4") ]) ]);
    }
}, adminApp.AdminContributionsListPaymentDetail = {
    view: function(ctrl, args) {
        var contribution = args.contribution;
        return m(".fontsize-smallest.fontcolor-secondary.lineheight-tight", [ function() {
            switch (contribution.payment_method.toLowerCase()) {
              case "boletobancario":
                return m("span#boleto-detail", "");

              case "cartaodecredito":
                return m("#creditcard-detail.fontsize-smallest.fontcolor-secondary.lineheight-tight", [ contribution.card_first_digits + "******" + contribution.card_last_digits, m("br"), contribution.card_brand + " " + contribution.installments + "x" ]);
            }
        }() ]);
    }
}, adminApp.AdminContributions.VM = m.postgrest.paginationVM(adminApp.models.ContributionDetail.getPageWithToken);