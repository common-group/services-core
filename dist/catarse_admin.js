/*
    A Mithril.js plugin to authenticate requests against PostgREST
    Copyright (c) 2007 - 2015 Diogo Biazus
    Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
    Version: 1.0.0
*/
var adminApp = window.adminApp = {
    models: {}
}, momentify = function(date, format) {
    return format = format || "DD/MM/YYYY", date ? moment(date).format(format) : "no date";
}, momentFromString = function(date, format) {
    var european = moment(date, format || "DD/MM/YYYY");
    return european.isValid() ? european : moment(date);
}, generateFormatNumber = function(s, c) {
    return function(number, n, x) {
        if (null == number || void 0 == number) return null;
        var re = "\\d(?=(\\d{" + (x || 3) + "})+" + (n > 0 ? "\\D" : "$") + ")", num = number.toFixed(Math.max(0, ~~n));
        return (c ? num.replace(".", c) : num).replace(new RegExp(re, "g"), "$&" + (s || ","));
    };
}, formatNumber = generateFormatNumber(".", ","), toggleProp = function(defaultState, alternateState) {
    var p = m.prop(defaultState);
    return p.toggle = function() {
        p(p() === alternateState ? defaultState : alternateState);
    }, p;
}, ContributionDetail = m.postgrest.model("contribution_details", [ "id", "contribution_id", "user_id", "project_id", "reward_id", "payment_id", "permalink", "project_name", "project_img", "user_name", "user_profile_img", "email", "key", "value", "installments", "installment_value", "state", "anonymous", "payer_email", "gateway", "gateway_id", "gateway_fee", "gateway_data", "payment_method", "project_state", "has_rewards", "pending_at", "paid_at", "refused_at", "reward_minimum_value", "pending_refund_at", "refunded_at", "created_at", "is_second_slip" ]);

adminApp.models.ContributionDetail = ContributionDetail, adminApp.AdminDetail = {
    controller: function(args) {
        this.displayRequestRefundDropDown = adminApp.ToggleDiv.toggler(), this.displayRefundDropDown = adminApp.ToggleDiv.toggler(), 
        this.displayTransferContributionDropDown = adminApp.ToggleDiv.toggler(), this.displayChangeRewardDropDown = adminApp.ToggleDiv.toggler(), 
        this.displatAnonDropDown = adminApp.ToggleDiv.toggler();
    },
    view: function(ctrl, args) {
        var contribution = args.contribution;
        return m("#admin-contribution-detail-box", [ m(".divider.u-margintop-20.u-marginbottom-20"), m(".w-row.u-marginbottom-30.w-hidden", [ m(".w-col.w-col-2", [ m("button.btn.btn-small.btn-terciary", {
            onclick: ctrl.displayRequestRefundDropDown.toggle
        }, "Pedir reembolso"), m.component(adminApp.ToggleDiv, {
            display: ctrl.displayRequestRefundDropDown,
            content: m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10[data-ix='display-none-on-load'][id='transfer']", [ m(".fontsize-smaller.fontweight-semibold.u-text-center.u-marginbottom-20", "Quer efetuar o reembolso?"), m("a.btn.btn-small[href='#']", "Solicitar reembolso") ])
        }) ]), m(".w-col.w-col-2", [ m("button.btn.btn-small.btn-terciary", {
            onclick: ctrl.displayRefundDropDown.toggle
        }, "Estornar"), m.component(adminApp.ToggleDiv, {
            display: ctrl.displayRefundDropDown,
            content: m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10", [ m(".fontsize-smaller.fontweight-semibold.u-text-center.u-marginbottom-20", "Quer efetuar o estorno?"), m("a.btn.btn-small[href='#']", "Solicitar estorno") ])
        }) ]), m(".w-col.w-col-2", [ m("button.btn.btn-small.btn-terciary.btn-desactivated[href='#']", "2a via") ]), m(".w-col.w-col-2", [ m("button.btn.btn-small.btn-terciary", {
            onclick: ctrl.displayTransferContributionDropDown.toggle
        }, "Transferir apoio"), m.component(adminApp.ToggleDiv, {
            display: ctrl.displayTransferContributionDropDown,
            content: m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10", [ m(".w-form", [ m("form[data-name='Email Form 4'][id='email-form-4'][name='email-form-4']", [ m("label[for='name-2']", "Id do novo apoiador:"), m("input.w-input.text-field[data-name='Name 2'][id='name-2'][name='name'][placeholder='ex: 129908'][type='text']"), m("input.w-button.btn.btn-small[data-wait='Please wait...'][type='submit'][value='Transferir']") ]) ]) ])
        }) ]), m(".w-col.w-col-2", [ m("button.btn.btn-small.btn-terciary", {
            onclick: ctrl.displayChangeRewardDropDown.toggle
        }, "Trocar recompensa"), m.component(adminApp.ToggleDiv, {
            display: ctrl.displayChangeRewardDropDown,
            content: m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10[data-ix='display-none-on-load'][id='transfer']", {
                style: {
                    display: " none"
                }
            }, [ m(".w-form", [ m("form[data-name='Email Form 4'][id='email-form-4'][name='email-form-4']", [ m(".w-radio", [ m("input.w-radio-input[data-name='Radio'][id='radio'][name='radio'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "R$ 10") ]) ]) ]) ])
        }) ]), m(".w-col.w-col-2", [ m("button.btn.btn-small.btn-terciary", {
            onclick: ctrl.displatAnonDropDown.toggle
        }, "Anonimato"), m.component(adminApp.ToggleDiv, {
            display: ctrl.displatAnonDropDown,
            content: m(".dropdown-list.card.u-radius.dropdown-list-medium.zindex-10", [ m(".w-form", [ m("form[data-name='Email Form 4'][id='email-form-4'][name='email-form-4']", [ m(".w-radio", [ m("input.w-radio-input[data-name='Radio'][id='radio'][name='radio'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "Anônimo") ]), m(".w-radio", [ m("input.w-radio-input[data-name='Radio 2'][id='radio'][name='radio-2'][type='radio'][value='Radio']"), m("label.w-form-label[for='radio']", "Público") ]) ]) ]) ])
        }) ]) ]), m(".w-row.card.card-terciary.u-radius", [ m.component(adminApp.AdminContributionsListPaymentDetailBoxDetailed, {
            contribution: contribution
        }), m.component(adminApp.AdminContributionsListPaymentDetailBoxHistory, {
            contribution: contribution
        }), m(".w-col.w-col-4") ]) ]);
    }
}, adminApp.AdminFilter = {
    controller: function(args) {
        var vm = this.vm = adminApp.AdminFilter.VM, filter = this.filter = function() {
            return args.onFilter(vm.parameters()), !1;
        };
        this.displayFilters = adminApp.ToggleDiv.toggler(), setTimeout(function() {
            filter();
        });
    },
    view: function(ctrl, args) {
        return m("#admin-contributions-filter.w-section.page-header", [ m(".w-container", [ m(".fontsize-larger.u-text-center.u-marginbottom-30", "Apoios"), m(".w-form", [ m("form[data-name='Email Form'][id='email-form'][name='email-form']", {
            onsubmit: ctrl.filter
        }, [ m(".w-row.u-marginbottom-20", [ m(".w-col.w-col-10", [ m("input.w-input.text-field.positive.medium[id='field'][name='field'][placeholder='Busque por projeto, email, Ids do usuário e do apoio...'][type='text']", {
            onchange: m.withAttr("value", ctrl.vm.full_text_index),
            value: ctrl.vm.full_text_index()
        }), m("a.fontsize-smallest.link-hidden-light[data-ix='admin-filter'][href='#']", {
            onclick: ctrl.displayFilters.toggle
        }, "Filtros avançados  >") ]), m(".w-col.w-col-2", [ m("input#filter-btn.btn.btn-large.u-marginbottom-10[type='submit'][href='#'][value='Buscar']") ]) ]), m.component(adminApp.ToggleDiv, {
            display: ctrl.displayFilters,
            content: m("#advanced-search.w-row.admin-filters", [ m(".w-col.w-col-3.w-col-small-6", [ m("label.fontsize-smaller[for='field-3']", "Com o estado"), m("select.w-select.text-field.positive[id='field-3'][name='field-3']", {
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
            }) ]) ]) ]) ])
        }) ]) ]) ]) ]);
    }
};

var vm = adminApp.AdminFilter.VM = m.postgrest.filtersVM({
    full_text_index: "@@",
    state: "eq",
    gateway: "eq",
    value: "between",
    created_at: "between"
});

vm.state(""), vm.gateway("Pagarme"), vm.created_at.lte.toFilter = function() {
    return momentFromString(this()).endOf("day").format();
}, vm.created_at.gte.toFilter = function() {
    return momentFromString(this()).format();
}, adminApp.AdminContributionsListDetail = {
    controller: function(args) {
        this.contribution = args.contribution, this.contribution.user_profile_img = this.contribution.user_profile_img || "/assets/catarse_bootstrap/user.jpg", 
        this.CSSsuccess = ".text-success", this.CSSwaiting = ".text-waiting", this.CSSerror = ".text-error", 
        this.paymentDetails = function() {
            if (this.contribution.gateway = this.contribution.gateway.toLowerCase(), !this.contribution.gateway_data) return !1;
            switch (this.contribution.gateway) {
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
        }, this.displayDetailBox = adminApp.ToggleDiv.toggler();
    },
    view: function(ctrl, args) {
        var contribution = ctrl.contribution;
        return m(".w-clearfix.card.u-radius.u-marginbottom-20.results-admin-contributions", [ m(".w-row", [ m(".w-col.w-col-4", [ m(".w-row", [ m(".w-col.w-col-3.w-col-small-3.u-marginbottom-10", [ m("img.user-avatar[src='" + contribution.user_profile_img + "']") ]), m(".w-col.w-col-9.w-col-small-9", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10", [ m("a.alt-link[target='_blank'][href='/users/" + contribution.user_id + "']", contribution.user_name) ]), m(".fontsize-smallest", "Usuário: " + contribution.user_id), m(".fontsize-smallest.fontcolor-secondary", "Catarse: " + contribution.email), m(".fontsize-smallest.fontcolor-secondary", "Gateway: " + contribution.payer_email) ]) ]) ]), m(".w-col.w-col-4", [ m(".w-row", [ m(".w-col.w-col-3.w-col-small-3.u-marginbottom-10", [ m("img.thumb-project.u-radius[src=" + contribution.project_img + "][width=50]") ]), m(".w-col.w-col-9.w-col-small-9", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10", [ m("a.alt-link[target='_blank'][href='/" + contribution.permalink + "']", contribution.project_name) ]), m(".fontsize-smallest.fontweight-semibold", contribution.project_state), m(".fontsize-smallest.fontcolor-secondary", momentify(contribution.project_online_date) + " a " + momentify(contribution.project_expires_at)) ]) ]) ]), m(".w-col.w-col-2", [ m(".fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small", "R$" + contribution.value), m(".fontsize-smallest.fontcolor-secondary", momentify(contribution.paid_at, "DD/MM/YYYY hh:mm[h]")), m(".fontsize-smallest", [ "ID do Gateway: ", m("a.alt-link[target='_blank'][href='https://dashboard.pagar.me/#/transactions/" + contribution.gateway_id + "']", contribution.gateway_id) ]) ]), m(".w-col.w-col-2", [ m(".fontsize-smallest.lineheight-looser.fontweight-semibold", [ m("span.fa.fa-circle" + ctrl.stateClass()), " " + contribution.state ]), m(".fontsize-smallest.fontweight-semibold", [ m("span.fa" + ctrl.paymentMethodClass()), " ", m("a.link-hidden[href='#']", contribution.payment_method) ]), ctrl.paymentDetails() ? m.component(adminApp.AdminContributionsListPaymentDetail, {
            contribution: contribution
        }) : "" ]) ]), m("a.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary[data-ix='show-admin-cont-result'][href='javascript:void(0);']", {
            onclick: ctrl.displayDetailBox.toggle
        }), m.component(adminApp.ToggleDiv, {
            display: ctrl.displayDetailBox,
            content: m.component(adminApp.AdminDetail, {
                contribution: contribution
            })
        }) ]);
    }
}, adminApp.AdminContributionsList = {
    view: function(ctrl, args) {
        return m("#admin-contributions-list.w-container", [ args.contributions().map(function(contribution) {
            return m.component(adminApp.AdminContributionsListDetail, {
                contribution: contribution,
                key: contribution
            });
        }) ]);
    }
}, adminApp.AdminContributions = {
    controller: function() {
        var vm = this.vm = adminApp.AdminContributions.VM;
        error = this.error = m.prop(), this.filterContributions = function(filters) {
            vm.filter(filters).then(null, function(serverError) {
                error(serverError.message);
            });
        };
    },
    view: function(ctrl) {
        return [ m.component(adminApp.AdminFilter, {
            onFilter: ctrl.filterContributions
        }), m(".w-section.section", [ m(".w-container", [ m(".w-row.u-marginbottom-20", [ m(".w-col.w-col-9", [ m(".fontsize-base", [ m("span.fontweight-semibold", ctrl.vm.total()), " apoios encontrados" ]) ]) ]), ctrl.error() ? m(".card.card-error.u-radius.fontweight-bold", ctrl.error()) : m.component(adminApp.AdminContributionsList, {
            contributions: ctrl.vm.collection
        }) ]) ]), m(".w-section.section", [ m(".w-container", [ m(".w-row", [ m(".w-col.w-col-5"), m(".w-col.w-col-2", [ ctrl.vm.isLoading() ? m("img[alt='Loader'][src='/assets/catarse_bootstrap/loader-eff2ad1eeb09a19c9afb5b143e1dd62b.gif']") : m("button#load-more.btn.btn-medium.btn-terciary", {
            onclick: ctrl.vm.nextPage
        }, "Carregar mais") ]), m(".w-col.w-col-5") ]) ]) ]) ];
    }
}, adminApp.AdminContributions.VM = m.postgrest.paginationVM(adminApp.models.ContributionDetail.getPageWithToken), 
adminApp.AdminContributionsListPaymentDetail = {
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
}, adminApp.ToggleDiv = {
    toggler: function() {
        return toggleProp("none", "block");
    },
    controller: function(args) {
        this.vm = {
            display: args.display
        };
    },
    view: function(ctrl, args) {
        return m(".toggleDiv", {
            style: {
                transition: "all .1s ease-out",
                overflow: "hidden",
                display: ctrl.vm.display()
            }
        }, [ args.content ]);
    }
}, adminApp.AdminContributionsListPaymentDetailBoxDetailed = {
    view: function(ctrl, args) {
        var contribution = args.contribution;
        return m(".w-col.w-col-4", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Detalhes do apoio"), m(".fontsize-smallest.lineheight-looser", [ "Valor: R$" + formatNumber(contribution.value, 2, 3), m("br"), "Taxa: R$" + formatNumber(contribution.gateway_fee, 2, 3), m("br"), "Recompensa: " + formatNumber(contribution.reward_minimum_value, 2, 3), m("br"), "Anônimo: " + (contribution.anonymous ? "Sim" : "Não"), m("br"), "Id pagamento: " + contribution.gateway_id, m("br"), "Apoio: " + contribution.contribution_id, m("br"), "Chave: \n", m("br"), contribution.key, m("br"), "Meio: " + contribution.gateway, m("br"), "Operadora: " + (contribution.gateway_data && contribution.gateway_data.acquirer_name), m("br"), function() {
            return contribution.is_second_slip ? [ m("a.link-hidden[href='#']", "Boleto bancário"), " ", m("span.badge", "2a via") ] : void 0;
        }() ]) ]);
    }
}, adminApp.AdminContributionsListPaymentDetailBoxHistory = {
    controller: function(args) {
        var contribution = args.contribution, mapEvents = _.reduce([ {
            date: contribution.paid_at,
            name: "Apoio confirmado"
        }, {
            date: contribution.pending_refund_at,
            name: "Reembolso solicitado"
        }, {
            date: contribution.refunded_at,
            name: "Estorno realizado"
        }, {
            date: contribution.created_at,
            name: "Apoio criado"
        }, {
            date: contribution.refused_at,
            name: "Apoio cancelado"
        } ], function(memo, item) {
            return null != item.date && void 0 != item.date ? (item.originalDate = item.date, 
            item.date = momentify(item.date, "DD/MM/YYYY, HH:mm"), memo.concat(item)) : memo;
        }, []);
        this.orderedEvents = _.sortBy(mapEvents, "originalDate");
    },
    view: function(ctrl, args) {
        args.contribution;
        return m(".w-col.w-col-4", [ m(".fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20", "Histórico da transação"), ctrl.orderedEvents.map(function(cEvent) {
            return m(".w-row.fontsize-smallest.lineheight-looser.date-event", [ m(".w-col.w-col-6", [ m(".fontcolor-secondary", cEvent.date) ]), m(".w-col.w-col-6", [ m("div", cEvent.name) ]) ]);
        }) ]);
    }
};